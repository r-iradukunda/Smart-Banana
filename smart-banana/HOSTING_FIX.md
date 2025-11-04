# 🔧 Fix Model Hosting Issue - Complete Guide

## Problem
Your local server works (89% confidence) but hosted version fails (25% confidence - random guessing).

## Root Cause
The hosted server isn't loading the correct 127MB model file. It's either:
1. Using fallback model with NO trained weights
2. Loading corrupted model from Google Drive
3. GitHub rejecting the large file

## Solution Options

### Option 1: Use Git LFS (Recommended for GitHub/Render)

**Step 1: Install Git LFS**
```bash
# Windows (PowerShell/CMD)
# Download from: https://git-lfs.github.com/

# Or use chocolatey:
choco install git-lfs

# Or use scoop:
scoop install git-lfs

# Initialize
git lfs install
```

**Step 2: Track model file**
```bash
cd C:\Users\fab\Documents\projects\smart-banana-expo\smart-banana

# Track the .keras file
git lfs track "*.keras"

# This creates .gitattributes file
```

**Step 3: Add and commit**
```bash
# Add .gitattributes
git add .gitattributes

# Add model file
git add banana_disease_classification_model1.keras

# Commit
git commit -m "Add model with Git LFS"

# Push
git push origin main
```

**Step 4: Verify on GitHub**
- Go to your GitHub repo
- Check if `banana_disease_classification_model1.keras` shows "Stored with Git LFS"
- File size should show ~127MB

---

### Option 2: Use Google Drive with DIRECT Download Link

**Step 1: Upload to Google Drive**
1. Upload `banana_disease_classification_model1.keras` to Google Drive
2. Right-click → Get link → "Anyone with the link can view"
3. Copy the file ID from the URL

**Step 2: Create direct download URL**
```
Original: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
Direct:   https://drive.google.com/uc?export=download&id=FILE_ID
```

**Step 3: Update server.py**
Replace the Google Drive URL in `server.py` line 24:
```python
MODEL_FILES = {
    "keras": {
        "url": "https://drive.google.com/uc?export=download&id=YOUR_ACTUAL_FILE_ID",
        "path": MODEL_PATH
    }
}
```

**Step 4: Test download**
```bash
# Test if URL works
curl -L "https://drive.google.com/uc?export=download&id=YOUR_FILE_ID" -o test_model.keras

# Check file size
ls -lh test_model.keras
# Should be ~127MB
```

---

### Option 3: Use Hugging Face Hub (Best for ML models)

**Step 1: Install dependencies**
```bash
pip install huggingface-hub
```

**Step 2: Create account and upload**
```python
# upload_to_hf.py
from huggingface_hub import HfApi, login

# Login (creates token)
login()

# Upload
api = HfApi()
api.upload_file(
    path_or_fileobj="banana_disease_classification_model1.keras",
    path_in_repo="banana_disease_classification_model1.keras",
    repo_id="YOUR_USERNAME/banana-disease-model",
    repo_type="model",
)
```

**Step 3: Update server.py**
```python
from huggingface_hub import hf_hub_download

def download_model():
    if not os.path.exists(MODEL_PATH):
        print("📥 Downloading from Hugging Face...")
        hf_hub_download(
            repo_id="YOUR_USERNAME/banana-disease-model",
            filename="banana_disease_classification_model1.keras",
            local_dir=BASE_DIR,
            local_dir_use_symlinks=False
        )
```

---

### Option 4: Host on Cloudinary or AWS S3 (For large files)

**Cloudinary (Free tier: 25GB storage)**
```python
import cloudinary
import cloudinary.uploader

# Configure
cloudinary.config( 
  cloud_name="YOUR_CLOUD_NAME", 
  api_key="YOUR_API_KEY", 
  api_secret="YOUR_API_SECRET"
)

# Upload
cloudinary.uploader.upload(
    "banana_disease_classification_model1.keras",
    resource_type="raw",
    public_id="banana_model"
)

# Download URL will be:
# https://res.cloudinary.com/YOUR_CLOUD_NAME/raw/upload/banana_model.keras
```

---

## Quick Test Script

Create `test_model_download.py`:
```python
import requests
import os

MODEL_URL = "YOUR_DOWNLOAD_URL_HERE"
OUTPUT_PATH = "downloaded_model.keras"

def test_download():
    print(f"🔄 Downloading from: {MODEL_URL}")
    
    response = requests.get(MODEL_URL, stream=True)
    file_size = int(response.headers.get('content-length', 0))
    
    print(f"📦 File size: {file_size / (1024*1024):.2f} MB")
    
    if file_size < 100_000_000:  # Less than 100MB
        print("⚠️ WARNING: File seems too small! Expected ~127MB")
        return False
    
    with open(OUTPUT_PATH, 'wb') as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)
    
    actual_size = os.path.getsize(OUTPUT_PATH)
    print(f"✅ Downloaded: {actual_size / (1024*1024):.2f} MB")
    
    # Try loading
    from tensorflow import keras
    try:
        model = keras.models.load_model(OUTPUT_PATH)
        print("✅ Model loads successfully!")
        print(f"Model layers: {len(model.layers)}")
        return True
    except Exception as e:
        print(f"❌ Failed to load model: {e}")
        return False

if __name__ == "__main__":
    test_download()
```

---

## Debugging Steps

**1. Check current setup on hosted server**
Add this endpoint to `server.py`:
```python
@app.route("/debug")
def debug_info():
    return jsonify({
        "model_path": MODEL_PATH,
        "model_exists": os.path.exists(MODEL_PATH),
        "model_size": os.path.getsize(MODEL_PATH) if os.path.exists(MODEL_PATH) else 0,
        "model_loaded": classifier is not None,
        "current_dir": os.getcwd(),
        "files_in_dir": os.listdir(BASE_DIR)[:20]  # First 20 files
    })
```

**2. Check model predictions**
```python
@app.route("/test-model")
def test_model():
    """Test if model is actually trained"""
    import numpy as np
    
    # Create random noise image
    noise = np.random.rand(1, 224, 224, 3).astype(np.float32)
    preds = classifier.model.predict(noise, verbose=0)[0]
    
    return jsonify({
        "predictions": preds.tolist(),
        "max_prob": float(np.max(preds)),
        "min_prob": float(np.min(preds)),
        "entropy": float(-np.sum(preds * np.log(preds + 1e-10))),
        "note": "Random predictions (~0.25 each) mean untrained model"
    })
```

---

## Recommended Solution Path

For your case, I recommend **Option 1 (Git LFS)** if using GitHub, or **Option 3 (Hugging Face)** if you want ML-specific hosting.

**Why Git LFS?**
- ✅ Integrates seamlessly with GitHub
- ✅ Works with Render/Heroku/Railway
- ✅ Version controlled
- ✅ Free for files up to 2GB

**Why Hugging Face?**
- ✅ Built for ML models
- ✅ Free hosting
- ✅ Easy downloads with Python
- ✅ Model versioning
- ✅ Community visibility

---

## After Fixing

**Verify it works:**
```bash
# Local test
curl -X POST http://localhost:5000/predict \
  -F "file=@your_test_image.jpg"

# Hosted test
curl -X POST https://your-app.onrender.com/predict \
  -F "file=@your_test_image.jpg"

# Both should give similar confidence scores!
```

---

## Need Help?

1. **Check model loading logs** - Look at server startup logs
2. **Verify file size** - Model should be ~127MB
3. **Test locally first** - Ensure local version works
4. **Check deployment logs** - Look for download errors

Let me know which option you'd like to proceed with!
