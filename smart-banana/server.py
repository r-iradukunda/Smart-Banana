from flask import Flask, request, jsonify
import numpy as np
from PIL import Image
from flask_cors import CORS
from enhanced_inference import BananaLeafClassifier
import traceback
from flasgger import Swagger, swag_from
import os
import requests

app = Flask(__name__)
CORS(app)
swagger = Swagger(app)

# ----------------------------
# Model file paths
# ----------------------------
BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, "banana_disease_classification_model1.keras")
JSON_PATH = os.path.join(BASE_DIR, "banana_disease_classification_model.json")
WEIGHTS_PATH = os.path.join(BASE_DIR, "banana_disease_classification_weights.h5")

# Google Drive URLs for downloading model files
MODEL_FILES = {
    "keras": {
        "url": "https://drive.google.com/uc?export=download&id=1RdifNpsZYjiU7dKFVXH3zCyrpp9jPcg7",
        "path": MODEL_PATH
    },
    # Add JSON and H5 file IDs if you have them on Google Drive
}


def download_model():
    """Download the model files from Google Drive if they're not already cached locally."""
    downloaded = False
    
    # Check if we have the main keras model
    if not os.path.exists(MODEL_PATH):
        print("\ud83d\udce5 Downloading Keras model from Google Drive...")
        try:
            response = requests.get(MODEL_FILES["keras"]["url"], stream=True, timeout=60)
            if response.status_code == 200:
                with open(MODEL_PATH, "wb") as f:
                    for chunk in response.iter_content(1024 * 1024):
                        f.write(chunk)
                print("\u2705 Keras model downloaded successfully!")
                downloaded = True
            else:
                print(f"\u26a0\ufe0f Failed to download model. Status: {response.status_code}")
        except Exception as e:
            print(f"\u26a0\ufe0f Error downloading model: {e}")
    
    # Check if JSON and H5 files exist (for fallback loading)
    files_exist = (
        os.path.exists(MODEL_PATH) or 
        (os.path.exists(JSON_PATH) and os.path.exists(WEIGHTS_PATH))
    )
    
    if not files_exist:
        print("\u274c No model files found. Please ensure model files are included in the repository.")
        raise Exception("Model files not found.")
    
    return downloaded or files_exist


# Initialize the enhanced classifier
try:
    download_model()
    classifier = BananaLeafClassifier(MODEL_PATH)
    print("\u2705 Enhanced Banana Disease Classifier loaded successfully!")
except Exception as e:
    print(f"\u274c Error loading classifier: {e}")
    classifier = None


@app.route("/")
def home():
    return jsonify({
        "message": "Enhanced Banana Disease Classification API",
        "version": "2.0",
        "features": [
            "Disease classification",
            "Non-banana leaf rejection",
            "Confidence assessment",
            "Uncertainty detection"
        ],
        "diseases": ["cordana", "healthy", "pestalotiopsis", "sigatoka"],
        "status": "ready" if classifier else "error"
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
        "model_loaded": classifier is not None
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


@swag_from({
    'tags': ['Model'],
    'summary': 'Model information',
    'description': 'Get details about the model architecture, features, and thresholds.',
    'responses': {200: {'description': 'Model metadata'}}
})
@app.route("/model-info")
def model_info():
    if classifier is None:
        return jsonify({"error": "Model not loaded"}), 500

    return jsonify({
        "model_type": "Convolutional Neural Network",
        "diseases": classifier.diseases,
        "input_size": "224x224 pixels",
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
        from io import BytesIO
        image_bytes = BytesIO(response.content)
        image = Image.open(image_bytes)
        
        # CRITICAL: Fully load the image to ensure it's not lazy-loaded
        image.load()
        
        # Debug: Log image properties
        print(f"📸 Image loaded: mode={image.mode}, size={image.size}, format={image.format}")
        
        # Ensure RGB format
        if image.mode != "RGB":
            print(f"⚠️ Converting image from {image.mode} to RGB")
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
    app.run(host="0.0.0.0", port=port)