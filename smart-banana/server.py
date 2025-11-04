from flask import Flask, request, jsonify
import numpy as np
from PIL import Image
from flask_cors import CORS
from enhanced_inference import BananaLeafClassifier
import traceback
from flasgger import Swagger, swag_from
import os
import requests
from io import BytesIO

app = Flask(__name__)
CORS(app)
swagger = Swagger(app)

# ----------------------------
# Model Configuration
# ----------------------------
BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, "banana_disease_classification_model1.keras")

# ✅ DROPBOX DIRECT DOWNLOAD LINK (Fixed!)
MODEL_URL = "https://www.dropbox.com/scl/fi/yh3vawmk52yiytjiwu0ri/banana_disease_classification_model.keras?rlkey=nyan5smd637utv3e658rdvlwf&st=gup4s50k&dl=1"
#                                                                                                                                                              ^^^
#                                                                                                                                                         Changed 0 to 1

classifier = None


def download_model():
    """Download model from Dropbox if not exists"""
    if os.path.exists(MODEL_PATH):
        file_size = os.path.getsize(MODEL_PATH) / (1024 * 1024)
        if file_size > 100:  # Valid model should be >100MB
            print(f"✅ Model already exists ({file_size:.2f} MB)")
            return True
        else:
            print(f"⚠️ Model file too small ({file_size:.2f} MB), re-downloading...")
            os.remove(MODEL_PATH)
    
    print("📥 Downloading model from Dropbox...")
    print(f"URL: {MODEL_URL}")
    
    try:
        # Download with streaming
        response = requests.get(MODEL_URL, stream=True, timeout=300)
        response.raise_for_status()
        
        total_size = int(response.headers.get('content-length', 0))
        print(f"📦 File size: {total_size / (1024*1024):.2f} MB")
        
        downloaded = 0
        with open(MODEL_PATH, 'wb') as f:
            for chunk in response.iter_content(chunk_size=1024*1024):  # 1MB chunks
                if chunk:
                    f.write(chunk)
                    downloaded += len(chunk)
                    if total_size > 0:
                        progress = (downloaded / total_size) * 100
                        print(f"⏳ Progress: {progress:.1f}%", end='\r')
        
        print("\n✅ Model downloaded successfully!")
        
        # Verify file size
        actual_size = os.path.getsize(MODEL_PATH) / (1024 * 1024)
        print(f"✅ Verified file size: {actual_size:.2f} MB")
        
        if actual_size < 100:
            print(f"❌ ERROR: Downloaded file too small: {actual_size:.2f} MB")
            print("Expected ~127 MB. Download may have failed.")
            os.remove(MODEL_PATH)
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ Download failed: {e}")
        if os.path.exists(MODEL_PATH):
            os.remove(MODEL_PATH)
        return False


def load_classifier():
    """Load the classifier after downloading model"""
    if not download_model():
        raise Exception("Failed to download model from Dropbox")
    
    print("🔄 Loading classifier...")
    clf = BananaLeafClassifier(MODEL_PATH)
    print("✅ Classifier loaded successfully!")
    return clf


# Initialize classifier on startup
try:
    print("🚀 Initializing Banana Disease Classifier...")
    classifier = load_classifier()
    print("🎉 Server ready!")
except Exception as e:
    print(f"❌ Error loading classifier: {e}")
    import traceback
    traceback.print_exc()
    classifier = None


@app.route("/")
def home():
    return jsonify({
        "message": "Enhanced Banana Disease Classification API",
        "version": "3.0 - Dropbox Edition",
        "model_source": "Dropbox",
        "features": [
            "Disease classification",
            "Non-banana leaf rejection",
            "Confidence assessment",
            "Uncertainty detection"
        ],
        "diseases": ["cordana", "healthy", "pestalotiopsis", "sigatoka"],
        "status": "ready" if classifier else "model not loaded"
    })


@swag_from({
    'tags': ['System'],
    'summary': 'Health check endpoint',
    'description': 'Returns server health and model status.',
    'responses': {
        200: {
            'description': 'System health info',
            'examples': {
                'application/json': {
                    "status": "healthy",
                    "model_loaded": True
                }
            }
        }
    }
})
@app.route("/health")
def health_check():
    return jsonify({
        "status": "healthy" if classifier else "unhealthy",
        "model_loaded": classifier is not None,
        "model_exists": os.path.exists(MODEL_PATH)
    })


@swag_from({
    'tags': ['Prediction'],
    'summary': 'Predict banana leaf disease',
    'description': 'Uploads an image and returns predicted disease or rejection reason.',
    'consumes': ['multipart/form-data'],
    'parameters': [
        {
            'name': 'file',
            'in': 'formData',
            'type': 'file',
            'required': True,
            'description': 'Image file of a banana leaf.'
        }
    ],
    'responses': {
        200: {
            'description': 'Prediction results',
            'examples': {
                'application/json': {
                    "success": True,
                    "predicted_disease": "sigatoka",
                    "confidence": "98.23%",
                    "certainty_score": 0.94
                }
            }
        },
        400: {'description': 'Invalid request (e.g. no file uploaded)'},
        500: {'description': 'Model not loaded or internal error'}
    }
})
@app.route("/predict", methods=["POST"])
def predict():
    if classifier is None:
        return jsonify({"error": "Model not loaded"}), 500

    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    try:
        # Load and validate image
        image = Image.open(file.stream)
        
        # CRITICAL: Fully load the image to ensure it's not lazy-loaded
        image.load()
        
        # Debug: Log image properties
        print(f"📸 Image loaded: mode={image.mode}, size={image.size}, format={image.format}")
        
        # Ensure image is properly loaded and in RGB
        if image.mode != "RGB":
            print(f"⚠️ Converting image from {image.mode} to RGB")
            if image.mode == 'RGBA':
                background = Image.new('RGB', image.size, (255, 255, 255))
                background.paste(image, mask=image.split()[3])
                image = background
            else:
                image = image.convert("RGB")
        
        # Verify image is valid
        if image.size[0] == 0 or image.size[1] == 0:
            raise ValueError("Invalid image dimensions")
        
        result = classifier.predict_with_rejection(image)

        response = {
            "success": True,
            "is_rejected": bool(result["is_rejected"]),
            "message": str(result["message"])
        }

        if result["is_rejected"]:
            response.update({
                "rejection_reasons": [str(r) for r in result["rejection_reasons"]],
                "technical_details": {
                    "confidence": float(result["confidence"]),
                    "entropy": float(result["entropy"]),
                    "is_leaf_like": bool(result["is_leaf_like"]),
                    "predicted_class": str(result["predicted_class"]),
                    "all_probabilities": {str(k): float(v) for k, v in result["all_probabilities"].items()}
                }
            })
        else:
            response.update({
                "predicted_disease": str(result["predicted_class"]),
                "confidence": f"{float(result['confidence'])*100:.2f}%",
                "confidence_score": float(result["confidence"]),
                "entropy": float(result["entropy"]),
                "certainty_score": float(max(0, (2 - result["entropy"]) / 2)),
                "detailed_probabilities": {
                    str(d): f"{float(p)*100:.2f}%" for d, p in result["all_probabilities"].items()
                },
                "raw_probabilities": {str(k): float(v) for k, v in result["all_probabilities"].items()},
                "is_leaf_like": bool(result["is_leaf_like"])
            })

        return jsonify(response)

    except Exception as e:
        print(traceback.format_exc())
        return jsonify({"error": "Prediction failed", "details": str(e)}), 500


@app.route("/predict-url", methods=["POST"])
def predict_from_url():
    """Predict disease from an image URL"""
    if classifier is None:
        return jsonify({"error": "Model not loaded"}), 500

    data = request.get_json()
    if not data or "url" not in data:
        return jsonify({"error": "No URL provided. Send JSON with 'url' field"}), 400

    image_url = data["url"]
    
    try:
        print(f"🌐 Downloading image from URL: {image_url}")
        
        # Download image from URL with proper content handling and headers
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8'
        }
        response = requests.get(image_url, timeout=15, headers=headers, allow_redirects=True)
        response.raise_for_status()
        
        # Open image from response content (use BytesIO for proper handling)
        image_bytes = BytesIO(response.content)
        image = Image.open(image_bytes)
        
        # CRITICAL: Fully load the image to ensure it's not lazy-loaded
        image.load()
        
        # Debug: Log image properties
        print(f"📸 Image loaded: mode={image.mode}, size={image.size}, format={image.format}")
        
        # Ensure RGB format
        if image.mode != "RGB":
            print(f"⚠️ Converting image from {image.mode} to RGB")
            if image.mode == 'RGBA':
                background = Image.new('RGB', image.size, (255, 255, 255))
                background.paste(image, mask=image.split()[3])
                image = background
            else:
                image = image.convert("RGB")
        
        # Verify image is valid by checking it has data
        if image.size[0] == 0 or image.size[1] == 0:
            raise ValueError("Invalid image dimensions")
        
        # Make prediction
        result = classifier.predict_with_rejection(image)

        response_data = {
            "success": True,
            "is_rejected": bool(result["is_rejected"]),
            "message": str(result["message"]),
            "image_url": image_url
        }

        if result["is_rejected"]:
            response_data.update({
                "rejection_reasons": [str(r) for r in result["rejection_reasons"]],
                "technical_details": {
                    "confidence": float(result["confidence"]),
                    "entropy": float(result["entropy"]),
                    "is_leaf_like": bool(result["is_leaf_like"]),
                    "predicted_class": str(result["predicted_class"]),
                    "all_probabilities": {str(k): float(v) for k, v in result["all_probabilities"].items()}
                }
            })
        else:
            response_data.update({
                "predicted_disease": str(result["predicted_class"]),
                "confidence": f"{float(result['confidence'])*100:.2f}%",
                "confidence_score": float(result["confidence"]),
                "entropy": float(result["entropy"]),
                "certainty_score": float(max(0, (2 - result["entropy"]) / 2)),
                "detailed_probabilities": {
                    str(d): f"{float(p)*100:.2f}%" for d, p in result["all_probabilities"].items()
                },
                "raw_probabilities": {str(k): float(v) for k, v in result["all_probabilities"].items()},
                "is_leaf_like": bool(result["is_leaf_like"])
            })

        return jsonify(response_data)

    except requests.RequestException as e:
        print(f"❌ Error downloading image: {e}")
        return jsonify({"error": "Failed to download image from URL", "details": str(e)}), 400
    except Exception as e:
        print(traceback.format_exc())
        return jsonify({"error": "Prediction failed", "details": str(e)}), 500


@app.route("/model-info")
def model_info():
    if classifier is None:
        return jsonify({"error": "Model not loaded"}), 500

    return jsonify({
        "model_type": "Convolutional Neural Network",
        "diseases": classifier.diseases,
        "input_size": "224x224 pixels",
        "model_source": "Dropbox",
        "features": [
            "Disease classification",
            "Non-banana leaf rejection",
            "Confidence assessment",
            "Uncertainty detection"
        ],
        "thresholds": {
            "min_confidence": classifier.min_confidence_threshold,
            "max_entropy": classifier.max_entropy_threshold,
            "feature_similarity": classifier.feature_similarity_threshold
        },
        "rejection_criteria": [
            "Low prediction confidence",
            "High uncertainty (entropy)",
            "Non-leaf-like appearance"
        ]
    })


@app.route("/debug")
def debug_info():
    """Debug endpoint to check model status"""
    info = {
        "model_loaded": classifier is not None,
        "model_file_exists": os.path.exists(MODEL_PATH),
        "model_url": MODEL_URL,
        "model_source": "Dropbox",
        "base_dir": BASE_DIR
    }
    
    if os.path.exists(MODEL_PATH):
        info["model_size_mb"] = round(os.path.getsize(MODEL_PATH) / (1024 * 1024), 2)
    
    if classifier and classifier.model:
        try:
            # Test with random noise to verify model is trained
            random_input = np.random.rand(1, 224, 224, 3).astype(np.float32)
            preds = classifier.model.predict(random_input, verbose=0)[0]
            
            info["test_predictions"] = {
                disease: round(float(prob), 4)
                for disease, prob in zip(classifier.diseases, preds)
            }
            info["test_std"] = round(float(np.std(preds)), 4)
            
            # If std is low, model is untrained
            if info["test_std"] < 0.1:
                info["warning"] = "⚠️ Model appears UNTRAINED (uniform predictions)"
                info["trained"] = False
            else:
                info["status"] = "✅ Model appears TRAINED (varied predictions)"
                info["trained"] = True
                
        except Exception as e:
            info["test_error"] = str(e)
    
    return jsonify(info)


@app.route("/test-rejection", methods=["GET"])
def test_rejection():
    return jsonify({
        "message": "To test rejection capabilities, upload non-banana leaf images",
        "examples_that_should_be_rejected": [
            "Photos of people",
            "Car images",
            "Building photos",
            "Other plant types",
            "Blurry or unclear images"
        ],
        "examples_that_should_be_accepted": [
            "Clear banana leaf photos",
            "Banana leaves with disease symptoms",
            "Well-lit leaf images"
        ],
        "note": "Use POST /predict for file uploads or POST /predict-url for URL-based images"
    })


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
