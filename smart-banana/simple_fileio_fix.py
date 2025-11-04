"""
SIMPLEST FIX - Upload to file.io and update server
No account needed, just upload and use the link!
"""

import os
import requests

def upload_to_fileio():
    """
    Upload to file.io (no account needed!)
    Note: file.io links expire after 1 download or 14 days
    For production, use Cloudinary or another permanent solution
    """
    print("="*60)
    print("📤 UPLOADING TO FILE.IO (Free, No Account)")
    print("="*60)
    
    model_file = "banana_disease_classification_model1.keras"
    
    if not os.path.exists(model_file):
        print(f"❌ Model file not found: {model_file}")
        return None
    
    file_size = os.path.getsize(model_file) / (1024 * 1024)
    print(f"📦 Model size: {file_size:.2f} MB\n")
    
    print("📤 Uploading to file.io...")
    print("⏳ This may take 2-5 minutes...")
    
    try:
        with open(model_file, 'rb') as f:
            response = requests.post(
                'https://file.io',
                files={'file': f},
                data={'expires': '1y'}  # 1 year expiry
            )
        
        result = response.json()
        
        if result['success']:
            url = result['link']
            print(f"\n✅ Upload successful!")
            print(f"📎 URL: {url}")
            print(f"\n⚠️  IMPORTANT: Save this URL! It will be needed for deployment.")
            print(f"⚠️  File.io links expire after first download or 1 year.")
            print(f"⚠️  For production, consider using Cloudinary instead.")
            return url
        else:
            print(f"❌ Upload failed: {result}")
            return None
            
    except Exception as e:
        print(f"❌ Upload failed: {e}")
        return None


def create_server_with_url(model_url):
    """Create server.py with direct URL download"""
    
    server_code = f'''from flask import Flask, request, jsonify
import numpy as np
from PIL import Image
from flask_cors import CORS
import traceback
from flasgger import Swagger
import os
import requests
from io import BytesIO

app = Flask(__name__)
CORS(app)
swagger = Swagger(app)

BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, "banana_disease_classification_model1.keras")
MODEL_URL = "{model_url}"

classifier = None


def download_model():
    """Download model from URL"""
    if os.path.exists(MODEL_PATH):
        size = os.path.getsize(MODEL_PATH) / (1024 * 1024)
        if size > 100:  # Valid model should be >100MB
            print(f"✅ Model exists ({size:.2f} MB)")
            return True
        else:
            print(f"⚠️  Model file too small ({size:.2f} MB), re-downloading...")
            os.remove(MODEL_PATH)
    
    print(f"📥 Downloading model from: {{MODEL_URL}}")
    
    try:
        response = requests.get(MODEL_URL, stream=True, timeout=300)
        response.raise_for_status()
        
        total = int(response.headers.get('content-length', 0))
        print(f"📦 Size: {{total / (1024*1024):.2f}} MB")
        
        with open(MODEL_PATH, 'wb') as f:
            downloaded = 0
            for chunk in response.iter_content(chunk_size=1024*1024):
                if chunk:
                    f.write(chunk)
                    downloaded += len(chunk)
                    if total > 0:
                        pct = (downloaded / total) * 100
                        print(f"⏳ {{pct:.1f}}%", end='\\r')
        
        print("\\n✅ Downloaded!")
        
        size = os.path.getsize(MODEL_PATH) / (1024 * 1024)
        if size < 100:
            print(f"❌ Downloaded file too small: {{size:.2f}} MB")
            os.remove(MODEL_PATH)
            return False
        
        print(f"✅ Verified: {{size:.2f}} MB")
        return True
        
    except Exception as e:
        print(f"❌ Download failed: {{e}}")
        if os.path.exists(MODEL_PATH):
            os.remove(MODEL_PATH)
        return False


def load_classifier():
    """Load classifier"""
    from enhanced_inference import BananaLeafClassifier
    
    if not download_model():
        raise Exception("Failed to download model")
    
    print("🔄 Loading classifier...")
    clf = BananaLeafClassifier(MODEL_PATH)
    print("✅ Classifier ready!")
    return clf


# Initialize
try:
    classifier = load_classifier()
except Exception as e:
    print(f"❌ Init error: {{e}}")
    classifier = None


@app.route("/")
def home():
    return jsonify({{
        "message": "Banana Disease Classification API",
        "version": "3.0",
        "status": "ready" if classifier else "loading",
        "diseases": ["cordana", "healthy", "pestalotiopsis", "sigatoka"]
    }})


@app.route("/health")
def health():
    return jsonify({{
        "status": "healthy" if classifier else "unhealthy",
        "model_loaded": classifier is not None
    }})


@app.route("/predict", methods=["POST"])
def predict():
    if not classifier:
        return jsonify({{"error": "Model not ready"}}), 503

    if "file" not in request.files:
        return jsonify({{"error": "No file"}}), 400

    file = request.files["file"]
    if not file.filename:
        return jsonify({{"error": "No filename"}}), 400

    try:
        image = Image.open(file.stream)
        image.load()
        
        if image.mode != "RGB":
            if image.mode == 'RGBA':
                bg = Image.new('RGB', image.size, (255, 255, 255))
                bg.paste(image, mask=image.split()[3])
                image = bg
            else:
                image = image.convert("RGB")
        
        result = classifier.predict_with_rejection(image)

        response = {{
            "success": True,
            "is_rejected": bool(result["is_rejected"]),
            "message": str(result["message"])
        }}

        if result["is_rejected"]:
            response["rejection_reasons"] = result["rejection_reasons"]
            response["technical_details"] = {{
                "confidence": float(result["confidence"]),
                "entropy": float(result["entropy"]),
                "predicted_class": str(result["predicted_class"])
            }}
        else:
            response.update({{
                "predicted_disease": str(result["predicted_class"]),
                "confidence": f"{{result['confidence']*100:.2f}}%",
                "confidence_score": float(result["confidence"]),
                "entropy": float(result["entropy"]),
                "detailed_probabilities": {{
                    d: f"{{p*100:.2f}}%" 
                    for d, p in result["all_probabilities"].items()
                }},
                "raw_probabilities": result["all_probabilities"]
            }})

        return jsonify(response)

    except Exception as e:
        print(traceback.format_exc())
        return jsonify({{"error": str(e)}}), 500


@app.route("/predict-url", methods=["POST"])
def predict_url():
    if not classifier:
        return jsonify({{"error": "Model not ready"}}), 503

    data = request.get_json()
    if not data or "url" not in data:
        return jsonify({{"error": "No URL"}}), 400

    try:
        resp = requests.get(data["url"], timeout=15)
        resp.raise_for_status()
        
        image = Image.open(BytesIO(resp.content))
        image.load()
        
        if image.mode != "RGB":
            if image.mode == 'RGBA':
                bg = Image.new('RGB', image.size, (255, 255, 255))
                bg.paste(image, mask=image.split()[3])
                image = bg
            else:
                image = image.convert("RGB")
        
        result = classifier.predict_with_rejection(image)

        response = {{
            "success": True,
            "is_rejected": bool(result["is_rejected"]),
            "message": str(result["message"])
        }}

        if result["is_rejected"]:
            response["rejection_reasons"] = result["rejection_reasons"]
        else:
            response.update({{
                "predicted_disease": str(result["predicted_class"]),
                "confidence": f"{{result['confidence']*100:.2f}}%",
                "confidence_score": float(result["confidence"])
            }})

        return jsonify(response)

    except Exception as e:
        return jsonify({{"error": str(e)}}), 500


@app.route("/debug")
def debug():
    info = {{
        "model_loaded": classifier is not None,
        "model_exists": os.path.exists(MODEL_PATH),
        "model_url": MODEL_URL
    }}
    
    if os.path.exists(MODEL_PATH):
        info["size_mb"] = os.path.getsize(MODEL_PATH) / (1024*1024)
    
    if classifier:
        try:
            noise = np.random.rand(1, 224, 224, 3).astype(np.float32)
            preds = classifier.model.predict(noise, verbose=0)[0]
            info["test_std"] = float(np.std(preds))
            info["trained"] = info["test_std"] > 0.1
        except:
            pass
    
    return jsonify(info)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
'''
    
    # Backup and save
    if os.path.exists("server.py"):
        import shutil
        shutil.copy("server.py", "server.py.backup2")
        print("✅ Backed up old server.py")
    
    with open("server.py", "w") as f:
        f.write(server_code)
    
    print("✅ Created new server.py")


def create_simple_requirements():
    """Create minimal requirements"""
    reqs = """flask==3.0.0
flask-cors==4.0.0
tensorflow==2.15.0
pillow==10.1.0
numpy==1.24.3
opencv-python-headless==4.8.1.78
flasgger==0.9.7.1
requests==2.31.0
"""
    with open("requirements.txt", "w") as f:
        f.write(reqs)
    print("✅ Updated requirements.txt")


def main():
    print("\n🚀 SIMPLEST FIX - Direct File Hosting\n")
    print("This will:")
    print("1. Upload model to file.io (no account!)")
    print("2. Create new server.py with direct download")
    print("3. Update requirements.txt")
    print("\nNote: file.io links expire. For production, use Cloudinary.")
    print("\n" + "="*60 + "\n")
    
    resp = input("Continue? (y/n): ")
    if resp.lower() != 'y':
        print("Cancelled")
        return
    
    # Upload
    url = upload_to_fileio()
    if not url:
        print("\n❌ Upload failed")
        print("\nAlternatives:")
        print("1. Try cloudinary_complete_fix.py (more reliable)")
        print("2. Upload manually to Dropbox/Google Drive")
        print("3. Use another file host (transfer.sh, gofile.io)")
        return
    
    # Save URL to file for reference
    with open("MODEL_URL.txt", "w") as f:
        f.write(f"Model URL: {url}\n")
        f.write(f"Generated: {__import__('datetime').datetime.now()}\n")
        f.write(f"\nIMPORTANT: This URL may expire!\n")
        f.write(f"For production, use Cloudinary or permanent hosting.\n")
    print("✅ Saved URL to MODEL_URL.txt")
    
    # Create server
    create_server_with_url(url)
    
    # Update requirements
    create_simple_requirements()
    
    # Instructions
    print("\n" + "="*60)
    print("✅ DONE!")
    print("="*60)
    print("\n📋 Next:")
    print("\n1. Test locally:")
    print("   python server.py")
    print("\n2. Test prediction:")
    print("   curl -X POST http://localhost:5000/predict -F 'file=@test.jpg'")
    print("\n3. Deploy:")
    print("   git add server.py requirements.txt MODEL_URL.txt")
    print('   git commit -m "Fix model hosting"')
    print("   git push origin main")
    print("\n4. Verify on hosted:")
    print("   curl https://your-app.onrender.com/debug")
    print("   # Check: trained=true, size_mb=~127")
    print("\n⚠️  IMPORTANT: file.io links may expire!")
    print("   For production, run: python cloudinary_complete_fix.py")
    print("="*60 + "\n")


if __name__ == "__main__":
    main()
