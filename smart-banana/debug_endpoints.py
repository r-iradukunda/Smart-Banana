"""
Add these debugging endpoints to your server.py
They will help diagnose the model loading issue
"""

# Add these imports at the top of server.py
import hashlib

# Add these routes to your Flask app


@app.route("/debug/model-info", methods=["GET"])
def debug_model_info():
    """
    Comprehensive model debugging information
    """
    import sys
    
    info = {
        "python_version": sys.version,
        "tensorflow_version": None,
        "keras_version": None,
        "model_status": {
            "loaded": classifier is not None,
            "file_exists": os.path.exists(MODEL_PATH),
            "file_size_mb": 0,
            "file_hash": None
        },
        "paths": {
            "base_dir": BASE_DIR,
            "model_path": MODEL_PATH,
            "json_path": JSON_PATH,
            "weights_path": WEIGHTS_PATH,
            "current_working_dir": os.getcwd()
        },
        "files_in_directory": []
    }
    
    # Get TensorFlow/Keras versions
    try:
        import tensorflow as tf
        info["tensorflow_version"] = tf.__version__
    except:
        pass
    
    try:
        from tensorflow import keras
        info["keras_version"] = keras.__version__
    except:
        pass
    
    # Get model file info
    if os.path.exists(MODEL_PATH):
        file_size = os.path.getsize(MODEL_PATH)
        info["model_status"]["file_size_mb"] = file_size / (1024 * 1024)
        
        # Calculate file hash to verify integrity
        try:
            hasher = hashlib.md5()
            with open(MODEL_PATH, 'rb') as f:
                for chunk in iter(lambda: f.read(4096), b""):
                    hasher.update(chunk)
            info["model_status"]["file_hash"] = hasher.hexdigest()
        except:
            pass
    
    # List files in directory
    try:
        files = os.listdir(BASE_DIR)
        # Filter to relevant files
        relevant_files = [f for f in files if f.endswith(('.keras', '.h5', '.json', '.txt', '.md'))]
        info["files_in_directory"] = relevant_files[:50]  # Limit to 50 files
    except:
        pass
    
    # Model architecture info
    if classifier and classifier.model:
        try:
            info["model_architecture"] = {
                "layers": len(classifier.model.layers),
                "input_shape": str(classifier.model.input_shape),
                "output_shape": str(classifier.model.output_shape),
                "trainable_params": classifier.model.count_params()
            }
        except Exception as e:
            info["model_architecture"] = {"error": str(e)}
    
    return jsonify(info)


@app.route("/debug/test-random-prediction", methods=["GET"])
def debug_test_random():
    """
    Test model with random noise
    If model is untrained, predictions will be ~0.25 for each class (random)
    If model is trained, predictions will vary significantly
    """
    if classifier is None:
        return jsonify({"error": "Model not loaded"}), 500
    
    import numpy as np
    
    # Create random noise image
    random_image = np.random.rand(1, 224, 224, 3).astype(np.float32)
    
    try:
        predictions = classifier.model.predict(random_image, verbose=0)[0]
        
        result = {
            "predictions": {
                disease: float(prob) 
                for disease, prob in zip(classifier.diseases, predictions)
            },
            "max_probability": float(np.max(predictions)),
            "min_probability": float(np.min(predictions)),
            "entropy": float(-np.sum(predictions * np.log(predictions + 1e-10))),
            "std_dev": float(np.std(predictions)),
            "interpretation": ""
        }
        
        # Interpret results
        if result["std_dev"] < 0.1:
            result["interpretation"] = "⚠️ WARNING: Model appears UNTRAINED! Predictions are too uniform (~0.25 each). This means the model has no learned weights."
        else:
            result["interpretation"] = "✅ Model appears trained. Predictions vary significantly."
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/debug/test-known-image", methods=["POST"])
def debug_test_known():
    """
    Test with a known image and compare preprocessing
    """
    if classifier is None:
        return jsonify({"error": "Model not loaded"}), 500
    
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400
    
    file = request.files["file"]
    
    try:
        from PIL import Image
        import numpy as np
        
        # Load image
        image = Image.open(file.stream)
        
        # Get image properties
        original_props = {
            "mode": image.mode,
            "size": image.size,
            "format": image.format
        }
        
        # Preprocess
        preprocessed = classifier.preprocess_image(image)
        
        # Get statistics
        preprocess_stats = {
            "shape": preprocessed.shape,
            "dtype": str(preprocessed.dtype),
            "min": float(np.min(preprocessed)),
            "max": float(np.max(preprocessed)),
            "mean": float(np.mean(preprocessed)),
            "std": float(np.std(preprocessed))
        }
        
        # Predict
        predictions = classifier.model.predict(preprocessed, verbose=0)[0]
        
        result = {
            "original_image": original_props,
            "preprocessed_stats": preprocess_stats,
            "predictions": {
                disease: float(prob) 
                for disease, prob in zip(classifier.diseases, predictions)
            },
            "top_prediction": classifier.diseases[np.argmax(predictions)],
            "confidence": float(np.max(predictions)),
            "entropy": float(-np.sum(predictions * np.log(predictions + 1e-10)))
        }
        
        # Check if preprocessing is correct
        if preprocess_stats["min"] < 0 or preprocess_stats["max"] > 1:
            result["warning"] = "Preprocessing issue: Values should be in [0, 1] range"
        
        return jsonify(result)
    
    except Exception as e:
        import traceback
        return jsonify({
            "error": str(e),
            "traceback": traceback.format_exc()
        }), 500


@app.route("/debug/compare-files", methods=["GET"])
def debug_compare_files():
    """
    Compare file hashes to check if model files match
    """
    files_to_check = [
        MODEL_PATH,
        JSON_PATH,
        WEIGHTS_PATH
    ]
    
    results = {}
    
    for filepath in files_to_check:
        filename = os.path.basename(filepath)
        
        if os.path.exists(filepath):
            file_size = os.path.getsize(filepath)
            
            # Calculate hash
            hasher = hashlib.md5()
            try:
                with open(filepath, 'rb') as f:
                    for chunk in iter(lambda: f.read(4096), b""):
                        hasher.update(chunk)
                file_hash = hasher.hexdigest()
            except:
                file_hash = "error"
            
            results[filename] = {
                "exists": True,
                "size_mb": file_size / (1024 * 1024),
                "hash": file_hash
            }
        else:
            results[filename] = {
                "exists": False,
                "size_mb": 0,
                "hash": None
            }
    
    return jsonify({
        "files": results,
        "note": "Share these hashes with your local model file hashes to verify they match"
    })


@app.route("/debug/system-info", methods=["GET"])
def debug_system_info():
    """
    System environment information
    """
    import platform
    import sys
    
    return jsonify({
        "platform": platform.platform(),
        "python_version": sys.version,
        "python_executable": sys.executable,
        "environment_variables": {
            "PORT": os.environ.get("PORT", "not set"),
            "HOME": os.environ.get("HOME", "not set"),
            "PWD": os.environ.get("PWD", "not set")
        },
        "available_memory": "unknown"  # Would need psutil for this
    })


# Usage instructions:
"""
Add these endpoints to your server.py, then test with:

1. Check model info:
   GET /debug/model-info

2. Test random prediction (check if trained):
   GET /debug/test-random-prediction

3. Test with actual image:
   POST /debug/test-known-image
   (with file upload)

4. Compare file hashes:
   GET /debug/compare-files

5. System info:
   GET /debug/system-info

If /debug/test-random-prediction shows ~0.25 for all classes,
your model is UNTRAINED (using fallback architecture with no weights)!
"""
