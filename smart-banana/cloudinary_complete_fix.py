"""
COMPLETE FIX - Upload Model to Cloudinary and Update Server
This replaces all previous attempts with a working solution.
"""

import os
import requests
import cloudinary
import cloudinary.uploader
from cloudinary.utils import cloudinary_url

def upload_to_cloudinary():
    """
    Upload model to Cloudinary (free 25GB storage)
    """
    print("="*60)
    print("☁️  UPLOADING TO CLOUDINARY")
    print("="*60)
    
    model_file = "banana_disease_classification_model1.keras"
    
    if not os.path.exists(model_file):
        print(f"❌ Model file not found: {model_file}")
        return None
    
    file_size = os.path.getsize(model_file) / (1024 * 1024)
    print(f"📦 Model size: {file_size:.2f} MB\n")
    
    # Get Cloudinary credentials
    print("🔑 Cloudinary Setup")
    print("1. Sign up at: https://cloudinary.com/users/register/free")
    print("2. Get your credentials from the Dashboard")
    print()
    
    cloud_name = input("Enter CLOUD_NAME: ").strip()
    api_key = input("Enter API_KEY: ").strip()
    api_secret = input("Enter API_SECRET: ").strip()
    
    if not all([cloud_name, api_key, api_secret]):
        print("❌ All credentials are required!")
        return None
    
    # Configure Cloudinary
    cloudinary.config(
        cloud_name=cloud_name,
        api_key=api_key,
        api_secret=api_secret,
        secure=True
    )
    
    # Upload
    print(f"\n📤 Uploading {model_file}...")
    print("⏳ This may take 2-5 minutes for 127MB file...")
    
    try:
        result = cloudinary.uploader.upload(
            model_file,
            resource_type="raw",
            public_id="banana_disease_model",
            overwrite=True,
            invalidate=True
        )
        
        url = result['secure_url']
        print(f"\n✅ Upload successful!")
        print(f"📎 URL: {url}")
        
        return {
            'url': url,
            'cloud_name': cloud_name,
            'public_id': result['public_id']
        }
        
    except Exception as e:
        print(f"\n❌ Upload failed: {e}")
        return None


def create_updated_server():
    """
    Create new server.py with Cloudinary download
    """
    cloudinary_url = input("\n📎 Enter the Cloudinary URL from above: ").strip()
    
    if not cloudinary_url:
        print("❌ URL required!")
        return False
    
    server_code = f'''from flask import Flask, request, jsonify
import numpy as np
from PIL import Image
from flask_cors import CORS
import traceback
from flasgger import Swagger, swag_from
import os
import requests
from io import BytesIO

app = Flask(__name__)
CORS(app)
swagger = Swagger(app)

# Model configuration
BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, "banana_disease_classification_model1.keras")
MODEL_URL = "{cloudinary_url}"

# Import classifier after ensuring model is downloaded
classifier = None


def download_model():
    """Download model from Cloudinary if not exists"""
    if os.path.exists(MODEL_PATH):
        file_size = os.path.getsize(MODEL_PATH) / (1024 * 1024)
        print(f"✅ Model already exists ({file_size:.2f} MB)")
        return True
    
    print("📥 Downloading model from Cloudinary...")
    print(f"URL: {{MODEL_URL}}")
    
    try:
        response = requests.get(MODEL_URL, stream=True, timeout=120)
        response.raise_for_status()
        
        total_size = int(response.headers.get('content-length', 0))
        print(f"📦 File size: {{total_size / (1024*1024):.2f}} MB")
        
        with open(MODEL_PATH, 'wb') as f:
            downloaded = 0
            for chunk in response.iter_content(chunk_size=1024*1024):
                if chunk:
                    f.write(chunk)
                    downloaded += len(chunk)
                    progress = (downloaded / total_size) * 100 if total_size > 0 else 0
                    print(f"⏳ Progress: {{progress:.1f}}%", end='\\r')
        
        print("\\n✅ Model downloaded successfully!")
        
        # Verify file size
        actual_size = os.path.getsize(MODEL_PATH) / (1024 * 1024)
        print(f"✅ Saved file size: {{actual_size:.2f}} MB")
        
        if actual_size < 100:
            print("⚠️ WARNING: File seems too small!")
            return False
            
        return True
        
    except Exception as e:
        print(f"❌ Download failed: {{e}}")
        if os.path.exists(MODEL_PATH):
            os.remove(MODEL_PATH)
        return False


def load_classifier():
    """Load the classifier after downloading model"""
    from enhanced_inference import BananaLeafClassifier
    
    if not download_model():
        raise Exception("Failed to download model")
    
    return BananaLeafClassifier(MODEL_PATH)


# Initialize classifier
try:
    print("🔄 Initializing classifier...")
    classifier = load_classifier()
    print("✅ Classifier loaded successfully!")
except Exception as e:
    print(f"❌ Error loading classifier: {{e}}")
    classifier = None


@app.route("/")
def home():
    return jsonify({{
        "message": "Enhanced Banana Disease Classification API",
        "version": "3.0",
        "model_source": "Cloudinary",
        "features": [
            "Disease classification",
            "Non-banana leaf rejection",
            "Confidence assessment",
            "Uncertainty detection"
        ],
        "diseases": ["cordana", "healthy", "pestalotiopsis", "sigatoka"],
        "status": "ready" if classifier else "error"
    }})


@app.route("/health")
def health_check():
    return jsonify({{
        "status": "healthy" if classifier else "unhealthy",
        "model_loaded": classifier is not None,
        "model_exists": os.path.exists(MODEL_PATH)
    }})


@app.route("/predict", methods=["POST"])
def predict():
    if classifier is None:
        return jsonify({{
            "error": "Model not loaded",
            "details": "Server is starting up or model failed to load"
        }}), 500

    if "file" not in request.files:
        return jsonify({{
            "error": "No file provided",
            "usage": "Send POST request with 'file' in form data"
        }}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({{
            "error": "No file selected",
            "usage": "File must have a filename"
        }}), 400

    try:
        # Load image
        image = Image.open(file.stream)
        image.load()  # Ensure fully loaded
        
        # Convert to RGB if needed
        if image.mode != "RGB":
            if image.mode == 'RGBA':
                background = Image.new('RGB', image.size, (255, 255, 255))
                background.paste(image, mask=image.split()[3])
                image = background
            else:
                image = image.convert("RGB")
        
        # Predict
        result = classifier.predict_with_rejection(image)

        response = {{
            "success": True,
            "is_rejected": bool(result["is_rejected"]),
            "message": str(result["message"])
        }}

        if result["is_rejected"]:
            response.update({{
                "rejection_reasons": [str(r) for r in result["rejection_reasons"]],
                "technical_details": {{
                    "confidence": float(result["confidence"]),
                    "entropy": float(result["entropy"]),
                    "is_leaf_like": bool(result["is_leaf_like"]),
                    "predicted_class": str(result["predicted_class"]),
                    "all_probabilities": {{str(k): float(v) for k, v in result["all_probabilities"].items()}}
                }}
            }})
        else:
            response.update({{
                "predicted_disease": str(result["predicted_class"]),
                "confidence": f"{{float(result['confidence'])*100:.2f}}%",
                "confidence_score": float(result["confidence"]),
                "entropy": float(result["entropy"]),
                "certainty_score": float(max(0, (2 - result["entropy"]) / 2)),
                "detailed_probabilities": {{
                    str(d): f"{{float(p)*100:.2f}}%" for d, p in result["all_probabilities"].items()
                }},
                "raw_probabilities": {{str(k): float(v) for k, v in result["all_probabilities"].items()}},
                "is_leaf_like": bool(result["is_leaf_like"])
            }})

        return jsonify(response)

    except Exception as e:
        print(traceback.format_exc())
        return jsonify({{
            "error": "Prediction failed",
            "details": str(e)
        }}), 500


@app.route("/predict-url", methods=["POST"])
def predict_from_url():
    if classifier is None:
        return jsonify({{
            "error": "Model not loaded",
            "details": "Server is starting up or model failed to load"
        }}), 500

    data = request.get_json()
    if not data or "url" not in data:
        return jsonify({{
            "error": "No URL provided",
            "usage": "Send JSON with 'url' field"
        }}), 400

    image_url = data["url"]
    
    try:
        headers = {{
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }}
        response = requests.get(image_url, timeout=15, headers=headers)
        response.raise_for_status()
        
        image_bytes = BytesIO(response.content)
        image = Image.open(image_bytes)
        image.load()
        
        if image.mode != "RGB":
            if image.mode == 'RGBA':
                background = Image.new('RGB', image.size, (255, 255, 255))
                background.paste(image, mask=image.split()[3])
                image = background
            else:
                image = image.convert("RGB")
        
        result = classifier.predict_with_rejection(image)

        response_data = {{
            "success": True,
            "is_rejected": bool(result["is_rejected"]),
            "message": str(result["message"]),
            "image_url": image_url
        }}

        if result["is_rejected"]:
            response_data.update({{
                "rejection_reasons": [str(r) for r in result["rejection_reasons"]],
                "technical_details": {{
                    "confidence": float(result["confidence"]),
                    "entropy": float(result["entropy"]),
                    "is_leaf_like": bool(result["is_leaf_like"]),
                    "predicted_class": str(result["predicted_class"]),
                    "all_probabilities": {{str(k): float(v) for k, v in result["all_probabilities"].items()}}
                }}
            }})
        else:
            response_data.update({{
                "predicted_disease": str(result["predicted_class"]),
                "confidence": f"{{float(result['confidence'])*100:.2f}}%",
                "confidence_score": float(result["confidence"]),
                "entropy": float(result["entropy"]),
                "certainty_score": float(max(0, (2 - result["entropy"]) / 2)),
                "detailed_probabilities": {{
                    str(d): f"{{float(p)*100:.2f}}%" for d, p in result["all_probabilities"].items()
                }},
                "raw_probabilities": {{str(k): float(v) for k, v in result["all_probabilities"].items()}},
                "is_leaf_like": bool(result["is_leaf_like"])
            }})

        return jsonify(response_data)

    except Exception as e:
        print(traceback.format_exc())
        return jsonify({{
            "error": "Prediction failed",
            "details": str(e)
        }}), 500


@app.route("/model-info")
def model_info():
    if classifier is None:
        return jsonify({{
            "error": "Model not loaded",
            "model_exists": os.path.exists(MODEL_PATH)
        }}), 500

    return jsonify({{
        "model_type": "Convolutional Neural Network",
        "diseases": classifier.diseases,
        "input_size": "224x224 pixels",
        "model_source": "Cloudinary CDN",
        "features": [
            "Disease classification",
            "Non-banana leaf rejection",
            "Confidence assessment",
            "Uncertainty detection"
        ],
        "thresholds": {{
            "min_confidence": classifier.min_confidence_threshold,
            "max_entropy": classifier.max_entropy_threshold,
            "feature_similarity": classifier.feature_similarity_threshold
        }}
    }})


@app.route("/debug/info")
def debug_info():
    """Debug endpoint to check model status"""
    info = {{
        "model_loaded": classifier is not None,
        "model_file_exists": os.path.exists(MODEL_PATH),
        "model_url": MODEL_URL,
        "base_dir": BASE_DIR
    }}
    
    if os.path.exists(MODEL_PATH):
        info["model_size_mb"] = os.path.getsize(MODEL_PATH) / (1024 * 1024)
    
    if classifier and classifier.model:
        try:
            import numpy as np
            # Test with random noise
            random_input = np.random.rand(1, 224, 224, 3).astype(np.float32)
            preds = classifier.model.predict(random_input, verbose=0)[0]
            
            info["test_predictions"] = {{
                disease: float(prob) 
                for disease, prob in zip(classifier.diseases, preds)
            }}
            info["predictions_std"] = float(np.std(preds))
            
            if info["predictions_std"] < 0.1:
                info["warning"] = "Model appears UNTRAINED (uniform predictions)"
            else:
                info["status"] = "Model appears TRAINED (varied predictions)"
        except Exception as e:
            info["test_error"] = str(e)
    
    return jsonify(info)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
'''
    
    # Save new server.py
    backup_path = "server.py.backup"
    if os.path.exists("server.py"):
        import shutil
        shutil.copy("server.py", backup_path)
        print(f"✅ Backed up old server.py to {backup_path}")
    
    with open("server.py", "w") as f:
        f.write(server_code)
    
    print("✅ Created new server.py with Cloudinary download")
    return True


def update_requirements():
    """Update requirements.txt"""
    print("\n📝 Updating requirements.txt...")
    
    requirements = """flask==3.0.0
flask-cors==4.0.0
tensorflow==2.15.0
pillow==10.1.0
numpy==1.24.3
opencv-python-headless==4.8.1.78
flasgger==0.9.7.1
requests==2.31.0
cloudinary==1.36.0
"""
    
    with open("requirements.txt", "w") as f:
        f.write(requirements)
    
    print("✅ Updated requirements.txt")


def create_deployment_guide():
    """Create deployment guide"""
    guide = """# 🚀 DEPLOYMENT GUIDE - Cloudinary Solution

## What Changed
- ✅ Model now hosted on Cloudinary CDN
- ✅ Auto-downloads on first request
- ✅ No more Git LFS needed
- ✅ Works with any deployment platform

## Deploy Steps

### 1. Install Cloudinary Package Locally
```bash
pip install cloudinary
```

### 2. Test Locally
```bash
# Run server
python server.py

# Test in another terminal
curl -X POST http://localhost:5000/predict \\
  -F "file=@your_test_image.jpg"

# Should show ~89% confidence like before
```

### 3. Deploy to Render/Heroku/Railway

**Commit changes:**
```bash
git add server.py requirements.txt
git commit -m "Use Cloudinary for model hosting"
git push origin main
```

**On Render/Heroku:**
- Your app will auto-redeploy
- First request will download model (may take 30-60 seconds)
- Subsequent requests will be fast

### 4. Verify Deployment

```bash
# Check model status
curl https://your-app.onrender.com/debug/info

# Should show:
# - "model_size_mb": ~127
# - "predictions_std": > 0.1 (trained model)
# - "status": "Model appears TRAINED"

# Test prediction
curl -X POST https://your-app.onrender.com/predict \\
  -F "file=@your_test_image.jpg"

# Should show confidence ~80-90%
```

## Troubleshooting

### Issue: "Model not loaded"
**Solution:** Wait 1-2 minutes for first download, then retry

### Issue: "predictions_std" < 0.1
**Solution:** Model file corrupted during download
1. Delete model file on server
2. Restart server to re-download

### Issue: Download timeout
**Solution:** Increase timeout in Render/Heroku settings

## Debug Endpoints

- `GET /debug/info` - Check model status
- `GET /health` - Quick health check
- `POST /predict` - Predict from file upload
- `POST /predict-url` - Predict from URL

## Success Criteria

✅ `/debug/info` shows:
   - `model_loaded`: true
   - `model_size_mb`: ~127
   - `predictions_std`: > 0.1
   - `status`: "Model appears TRAINED"

✅ `/predict` gives:
   - Similar confidence to local (~80-90%)
   - Correct disease classification

## Notes

- Model downloads only once
- Stored in server filesystem
- Persists across requests
- Re-downloads if deleted

**Your model is now properly hosted and accessible! 🎉**
"""
    
    with open("CLOUDINARY_DEPLOYMENT.md", "w") as f:
        f.write(guide)
    
    print("✅ Created CLOUDINARY_DEPLOYMENT.md")


def main():
    print("\n" + "="*60)
    print("🔧 COMPLETE MODEL HOSTING FIX - CLOUDINARY")
    print("="*60)
    print("\nThis will:")
    print("1. Upload your model to Cloudinary (free CDN)")
    print("2. Create new server.py with auto-download")
    print("3. Update requirements.txt")
    print("4. Create deployment guide")
    print("\n" + "="*60 + "\n")
    
    response = input("Continue? (y/n): ")
    if response.lower() != 'y':
        print("Cancelled.")
        return
    
    # Upload to Cloudinary
    result = upload_to_cloudinary()
    if not result:
        print("\n❌ Upload failed. Please try again.")
        return
    
    print("\n" + "="*60)
    
    # Create new server
    if not create_updated_server():
        print("\n❌ Failed to create server.py")
        return
    
    # Update requirements
    update_requirements()
    
    # Create guide
    create_deployment_guide()
    
    # Final instructions
    print("\n" + "="*60)
    print("✅ SETUP COMPLETE!")
    print("="*60)
    print("\n📋 Next Steps:")
    print("\n1. Test locally:")
    print("   python server.py")
    print("   # In another terminal:")
    print("   curl -X POST http://localhost:5000/predict -F 'file=@test.jpg'")
    print("\n2. Deploy:")
    print("   git add server.py requirements.txt CLOUDINARY_DEPLOYMENT.md")
    print("   git commit -m 'Use Cloudinary for model hosting'")
    print("   git push origin main")
    print("\n3. Verify:")
    print("   curl https://your-app.onrender.com/debug/info")
    print("\n4. Test:")
    print("   curl -X POST https://your-app.onrender.com/predict -F 'file=@test.jpg'")
    print("\nSee CLOUDINARY_DEPLOYMENT.md for details!")
    print("="*60 + "\n")


if __name__ == "__main__":
    # Check if cloudinary is installed
    try:
        import cloudinary
    except ImportError:
        print("❌ cloudinary package not installed")
        print("Run: pip install cloudinary")
        exit(1)
    
    main()
