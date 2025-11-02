from flask import Flask, request, jsonify
import numpy as np
from PIL import Image
from flask_cors import CORS
from enhanced_inference import BananaLeafClassifier
import traceback

app = Flask(__name__)
CORS(app)

# Initialize the enhanced classifier
try:
    classifier = BananaLeafClassifier('banana_disease_classification_model.keras')
    print("Enhanced Banana Disease Classifier loaded successfully!")
except Exception as e:
    print(f"Error loading classifier: {e}")
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

@app.route("/health")
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy" if classifier else "unhealthy",
        "model_loaded": classifier is not None
    })

@app.route("/predict", methods=["POST"])
def predict():
    """Enhanced prediction endpoint with rejection capability"""
    
    if classifier is None:
        return jsonify({
            "error": "Model not loaded",
            "message": "The classification model failed to load. Please check server logs."
        }), 500
    
    # Check if file is in request
    if "file" not in request.files:
        return jsonify({
            "error": "No file provided",
            "message": "Please include an image file in your request."
        }), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({
            "error": "No file selected",
            "message": "Please select an image file to upload."
        }), 400

    try:
        # Open and process the image
        image = Image.open(file.stream)
        
        # Get enhanced prediction with rejection capability
        result = classifier.predict_with_rejection(image)
        
        # Build comprehensive response with explicit type conversion
        response = {
            "success": True,
            "is_rejected": bool(result["is_rejected"]),
            "message": str(result["message"])
        }
        
        if result["is_rejected"]:
            # Image was rejected
            response.update({
                "rejection_reasons": [str(reason) for reason in result["rejection_reasons"]],
                "technical_details": {
                    "confidence": float(result["confidence"]),
                    "entropy": float(result["entropy"]),
                    "is_leaf_like": bool(result["is_leaf_like"]),
                    "predicted_class": str(result["predicted_class"]),
                    "all_probabilities": {str(k): float(v) for k, v in result["all_probabilities"].items()}
                }
            })
        else:
            # Valid banana leaf detected
            response.update({
                "predicted_disease": str(result["predicted_class"]),
                "confidence": f"{float(result['confidence'])*100:.2f}%",
                "confidence_score": float(result["confidence"]),
                "entropy": float(result["entropy"]),
                "certainty_score": float(max(0, (2 - result["entropy"]) / 2)),  # Normalized certainty
                "detailed_probabilities": {
                    str(disease): f"{float(prob)*100:.2f}%" 
                    for disease, prob in result["all_probabilities"].items()
                },
                "raw_probabilities": {str(k): float(v) for k, v in result["all_probabilities"].items()},
                "is_leaf_like": bool(result["is_leaf_like"])
            })
            
            # Add disease-specific information
            disease_info = {
                "healthy": {
                    "description": "The leaf appears healthy with no visible signs of disease.",
                    "severity": "None",
                    "recommendation": "Continue regular monitoring and good agricultural practices.",
                    "urgent": False
                },
                "cordana": {
                    "description": "Cordana leaf spot is a fungal disease causing dark spots on leaves.",
                    "severity": "Moderate",
                    "recommendation": "Apply fungicide and improve air circulation around plants.",
                    "urgent": True
                },
                "pestalotiopsis": {
                    "description": "Pestalotiopsis causes leaf spots and can lead to leaf blight.",
                    "severity": "Moderate to High",
                    "recommendation": "Remove affected leaves and apply appropriate fungicide treatment.",
                    "urgent": True
                },
                "sigatoka": {
                    "description": "Sigatoka is a serious fungal disease causing yellowing and black streaks.",
                    "severity": "High",
                    "recommendation": "Immediate fungicide treatment and removal of affected leaves required.",
                    "urgent": True
                }
            }
            
            predicted_disease = result["predicted_class"]
            if predicted_disease in disease_info:
                response["disease_info"] = disease_info[predicted_disease]
        
        return jsonify(response)
        
    except Exception as e:
        # Log the full error for debugging
        print(f"Error processing image: {str(e)}")
        print(traceback.format_exc())
        
        return jsonify({
            "error": "Image processing failed",
            "message": "An error occurred while processing your image. Please ensure it's a valid image file.",
            "details": str(e)
        }), 500

@app.route("/model-info")
def model_info():
    """Get information about the model and its capabilities"""
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

@app.route("/test-rejection", methods=["GET"])
def test_rejection():
    """Test endpoint to demonstrate rejection capabilities"""
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
        ]
    })

if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)

