from flask import Flask, request, jsonify
import numpy as np
from PIL import Image
from flask_cors import CORS
import traceback
import os
import sys

# Add the current directory to Python path for imports
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

# Import TensorFlow with proper configuration
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'  # Reduce TensorFlow logging
import tensorflow as tf
from tensorflow import keras

from enhanced_inference import BananaLeafClassifier

# --- Enhanced Safe Model Loader ---
def safe_load_model(model_path):
    """
    Enhanced model loader with multiple fallback strategies for TF 2.20+ compatibility.
    
    Args:
        model_path: Path to the model file
        
    Returns:
        Loaded Keras model or None if loading fails
    """
    try:
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model not found at {model_path}")
        
        print(f"🔄 Attempting to load model from {model_path}...")
        print(f"   TensorFlow version: {tf.__version__}")
        print(f"   Keras version: {keras.__version__}")
        
        # Strategy 1: Try standard Keras loading
        try:
            print("   📍 Strategy 1: Standard Keras loading...")
            model = keras.models.load_model(model_path, compile=False)
            print("   ✅ Strategy 1 succeeded!")
            return model
        except Exception as e1:
            print(f"   ⚠️  Strategy 1 failed: {str(e1)[:100]}")
        
        # Strategy 2: Try with safe_mode=False
        try:
            print("   📍 Strategy 2: Loading with safe_mode=False...")
            model = keras.models.load_model(model_path, compile=False, safe_mode=False)
            print("   ✅ Strategy 2 succeeded!")
            return model
        except Exception as e2:
            print(f"   ⚠️  Strategy 2 failed: {str(e2)[:100]}")
        
        # Strategy 3: Try loading weights only with recreated architecture
        try:
            print("   📍 Strategy 3: Recreating architecture and loading weights...")
            from tensorflow.keras.applications import MobileNetV2
            from tensorflow.keras.layers import GlobalAveragePooling2D, Dense
            from tensorflow.keras import Sequential
            
            # Check if there's a weights file
            weights_path = model_path.replace('.keras', '_weights.h5')
            if not os.path.exists(weights_path):
                weights_path = os.path.join(os.path.dirname(model_path), "best_mobilenetv2_weights.h5")
            
            if os.path.exists(weights_path):
                print(f"   📦 Found weights file: {weights_path}")
                
                # Recreate the model architecture
                base_model = MobileNetV2(
                    input_shape=(160, 160, 3),
                    include_top=False,
                    weights=None  # Don't load pretrained weights
                )
                
                model = Sequential([
                    base_model,
                    GlobalAveragePooling2D(),
                    Dense(4, activation='softmax')  # 4 classes: cordana, healthy, pestalotiopsis, sigatoka
                ])
                
                # Load the weights
                model.load_weights(weights_path)
                print("   ✅ Strategy 3 succeeded!")
                return model
            else:
                print(f"   ⚠️  Strategy 3 failed: Weights file not found")
        except Exception as e3:
            print(f"   ⚠️  Strategy 3 failed: {str(e3)[:100]}")
        
        # Strategy 4: Try loading as SavedModel format
        try:
            print("   📍 Strategy 4: Loading as SavedModel...")
            savedmodel_path = model_path.replace('.keras', '_savedmodel').replace('.h5', '_savedmodel')
            if os.path.isdir(savedmodel_path):
                model = tf.keras.models.load_model(savedmodel_path)
                print("   ✅ Strategy 4 succeeded!")
                return model
            else:
                print(f"   ⚠️  Strategy 4 failed: SavedModel directory not found")
        except Exception as e4:
            print(f"   ⚠️  Strategy 4 failed: {str(e4)[:100]}")
        
        # All strategies failed
        raise Exception("All loading strategies failed")
        
    except Exception as e:
        print(f"❌ Model loading failed after all attempts")
        print(f"   Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

app = Flask(__name__)
CORS(app)

# Initialize the enhanced classifier
classifier = None
model_loaded = False

try:
    # Get the directory where server.py is located
    current_dir = os.path.dirname(os.path.abspath(__file__))
    print(f"📁 Server running from: {current_dir}")
    print(f"📁 Current working directory: {os.getcwd()}")
    
    # Try multiple possible paths and file formats
    possible_paths = [
        # H5 format (most compatible)
        os.path.join(current_dir, "saved_models", "banana_mobilenetv2_final.h5"),
        os.path.join("saved_models", "banana_mobilenetv2_final.h5"),
        "banana_mobilenetv2_final.h5",
        
        # Keras format
        os.path.join(current_dir, "saved_models", "banana_mobilenetv2_final.keras"),
        os.path.join("saved_models", "banana_mobilenetv2_final.keras"),
        "banana_mobilenetv2_final.keras",
        
        # SavedModel format
        os.path.join(current_dir, "saved_models", "banana_model_savedmodel"),
        os.path.join("saved_models", "banana_model_savedmodel"),
    ]
    
    model_path = None
    for path in possible_paths:
        if os.path.exists(path):
            model_path = path
            print(f"✅ Found model at: {path}")
            break
    
    if model_path is None:
        print(f"❌ Model not found in any of these paths:")
        for path in possible_paths:
            print(f"   - {path}")
        raise FileNotFoundError("Model file not found")
    
    # Test model loading
    print("\n" + "="*60)
    print("Testing model loading...")
    print("="*60)
    test_model = safe_load_model(model_path)
    
    if test_model is not None:
        print(f"✅ Model loaded successfully!")
        print(f"   Input shape: {test_model.input_shape}")
        print(f"   Output shape: {test_model.output_shape}")
        
        # Initialize classifier
        classifier = BananaLeafClassifier(model_path)
        model_loaded = True
        print("✅ Enhanced Banana Disease Classifier initialized!")
    else:
        print("❌ Model loading failed - API will run in degraded mode")
        
except Exception as e:
    print(f"❌ Initialization error: {e}")
    import traceback
    traceback.print_exc()

print("="*60)
print(f"Server Status: {'🟢 READY' if model_loaded else '🔴 DEGRADED'}")
print("="*60)
print()


@app.route("/")
def home():
    return jsonify({
        "message": "Enhanced Banana Disease Classification API",
        "version": "2.1",
        "features": [
            "Disease classification",
            "Non-banana leaf rejection", 
            "Confidence assessment",
            "Uncertainty detection"
        ],
        "diseases": ["cordana", "healthy", "pestalotiopsis", "sigatoka"],
        "status": "ready" if model_loaded else "error",
        "model_loaded": model_loaded
    })

@app.route("/health")
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy" if model_loaded else "unhealthy",
        "model_loaded": model_loaded,
        "tensorflow_version": tf.__version__,
        "keras_version": keras.__version__
    })

@app.route("/predict", methods=["POST"])
def predict():
    """Enhanced prediction endpoint with rejection capability"""
    
    if not model_loaded or classifier is None:
        return jsonify({
            "error": "Model not loaded",
            "message": "The classification model failed to load. Please check server logs.",
            "status": "unavailable"
        }), 503

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
                "certainty_score": float(max(0, (2 - result["entropy"]) / 2)),
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
        print(f"❌ Error processing image: {str(e)}")
        print(traceback.format_exc())
        
        return jsonify({
            "error": "Image processing failed",
            "message": "An error occurred while processing your image. Please ensure it's a valid image file.",
            "details": str(e)
        }), 500

@app.route("/model-info")
def model_info():
    """Get information about the model and its capabilities"""
    if not model_loaded or classifier is None:
        return jsonify({
            "error": "Model not loaded",
            "status": "unavailable"
        }), 503
        
    return jsonify({
        "model_type": "MobileNetV2 CNN",
        "diseases": classifier.diseases,
        "input_size": "160x160 pixels",
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
    """Debug endpoint to check file paths and system info"""
    import sys
    cwd = os.getcwd()
    files_in_cwd = os.listdir(cwd) if os.path.exists(cwd) else []
    
    saved_models_path = os.path.join(cwd, "saved_models")
    files_in_saved_models = os.listdir(saved_models_path) if os.path.exists(saved_models_path) else []
    
    return jsonify({
        "python_version": sys.version,
        "tensorflow_version": tf.__version__,
        "keras_version": keras.__version__,
        "current_working_directory": cwd,
        "files_in_cwd": files_in_cwd[:20],  # Limit to first 20 files
        "saved_models_exists": os.path.exists(saved_models_path),
        "files_in_saved_models": files_in_saved_models,
        "model_loaded": model_loaded,
        "classifier_initialized": classifier is not None
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"🚀 Starting server on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=False)
