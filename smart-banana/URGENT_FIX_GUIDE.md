# 🚨 URGENT: Fix Model Hosting Issue - Step by Step

## Your Problem
- **Local**: 89% confidence ✅
- **Hosted**: 25% confidence ❌ (random guessing = untrained model)

## Root Cause
Your hosted server is **NOT loading the correct 127MB model file**. It's using:
- Fallback model architecture with NO trained weights, OR
- Corrupted/incomplete model download from Google Drive

---

## 🎯 FASTEST FIX (Choose ONE)

### Option A: Git LFS (If using GitHub + Render/Heroku)

**Time**: 10-15 minutes

```bash
# 1. Install Git LFS
# Windows: Download from https://git-lfs.github.com/
# Or: choco install git-lfs
# Or: scoop install git-lfs

# 2. Setup (run in your project folder)
python setup_git_lfs_quick.py

# 3. Follow the instructions printed by the script

# 4. OR manually:
git lfs install
git lfs track "*.keras"
git add .gitattributes
git add banana_disease_classification_model1.keras
git commit -m "Add model with Git LFS"
git push origin main

# 5. Redeploy on Render/Heroku
```

**Verify on GitHub**: File should say "Stored with Git LFS" and show ~127MB

---

### Option B: Hugging Face Hub (Recommended for ML)

**Time**: 10-15 minutes

```bash
# 1. Install
pip install huggingface-hub

# 2. Run upload script
python upload_to_huggingface.py

# 3. Follow prompts to create account and upload

# 4. Update server.py
# Add at top:
from huggingface_hub import hf_hub_download

# Replace download_model() function with:
def download_model():
    if not os.path.exists(MODEL_PATH):
        print("📥 Downloading from Hugging Face...")
        hf_hub_download(
            repo_id="YOUR_USERNAME/banana-disease-classifier",
            filename="banana_disease_classification_model1.keras",
            local_dir=BASE_DIR,
            local_dir_use_symlinks=False
        )
    return True

# 5. Commit and redeploy
git add server.py requirements.txt
git commit -m "Use Hugging Face for model hosting"
git push origin main
```

Don't forget to add to `requirements.txt`:
```
huggingface-hub>=0.19.0
```

---

## 🔍 DEBUG FIRST (Before fixing)

### Step 1: Add debug endpoints to your server

Copy contents from `debug_endpoints.py` and add to your `server.py`.

### Step 2: Test your hosted server

```bash
# Check model info
curl https://your-app.onrender.com/debug/model-info

# Test if model is trained
curl https://your-app.onrender.com/debug/test-random-prediction
```

### Step 3: Interpret results

**If "std_dev" < 0.1 in random prediction test:**
```json
{
  "predictions": {
    "cordana": 0.25,
    "healthy": 0.25,
    "pestalotiopsis": 0.25,
    "sigatoka": 0.25
  },
  "std_dev": 0.0
}
```
→ **Model is UNTRAINED!** (No learned weights)

**If "std_dev" > 0.1:**
```json
{
  "predictions": {
    "cordana": 0.02,
    "healthy": 0.15,
    "pestalotiopsis": 0.78,
    "sigatoka": 0.05
  },
  "std_dev": 0.35
}
```
→ **Model has weights** (might be corrupted preprocessing)

---

## 🔧 If Model is Untrained (Most Likely)

Your hosted server is using the fallback model from this code in `enhanced_inference.py`:

```python
def _build_fallback_model(self):
    # This creates a model with RANDOM weights!
    model = Sequential([...])
    return model
```

**Solution**: Upload the actual model file using Option A or B above.

---

## 🔧 If Model is Loaded but Wrong Predictions

Check preprocessing differences:

```bash
# Test with same image on both servers
curl -X POST http://localhost:5000/debug/test-known-image \
  -F "file=@test_image.jpg"

curl -X POST https://your-app.onrender.com/debug/test-known-image \
  -F "file=@test_image.jpg"

# Compare the "preprocessed_stats" in both responses
```

Look for differences in:
- `min`, `max` values (should be in [0, 1])
- `mean`, `std` values
- Image mode conversions

---

## 📊 Quick Comparison Table

| Method | Pros | Cons | Best For |
|--------|------|------|----------|
| **Git LFS** | ✅ Integrated with GitHub<br>✅ Version control<br>✅ Works with Render | ❌ Requires Git LFS install<br>❌ Learning curve | GitHub users |
| **Hugging Face** | ✅ Built for ML<br>✅ Easy Python API<br>✅ Free hosting<br>✅ Community | ❌ Extra dependency | ML projects |
| **Google Drive** | ✅ Simple<br>✅ No setup | ❌ Unreliable downloads<br>❌ Not working for you | Last resort |

---

## ✅ Verification Checklist

After deploying, verify:

- [ ] `/debug/model-info` shows `file_size_mb` ≈ 127
- [ ] `/debug/test-random-prediction` shows `std_dev` > 0.1
- [ ] `/debug/compare-files` hash matches local model hash
- [ ] `/predict` gives similar confidence to local (≈80-90%)
- [ ] Test with same image locally and hosted - similar results

---

## 🆘 Still Not Working?

### Check deployment logs

**Render/Heroku:**
```bash
# Look for model download/loading errors
# Search for: "Model loaded", "downloading", "error"
```

### Common Issues:

1. **"Model not found"**
   → File didn't upload correctly
   → Use Option B (Hugging Face)

2. **"Model loaded" but still 25% confidence**
   → Fallback model is being used
   → Check file size in debug endpoint

3. **"Out of memory"**
   → Free tier has limited RAM
   → Model is 127MB, needs ~500MB RAM to load
   → Upgrade to paid tier

4. **"Download timeout"**
   → Google Drive download failing
   → Use Option A or B instead

---

## 💡 Need Help?

Run this diagnostic and share output:

```bash
# On hosted server
curl https://your-app.onrender.com/debug/model-info > hosted_info.json
curl https://your-app.onrender.com/debug/test-random-prediction > hosted_random.json

# On local
curl http://localhost:5000/debug/model-info > local_info.json
curl http://localhost:5000/debug/test-random-prediction > local_random.json

# Compare
diff local_info.json hosted_info.json
diff local_random.json hosted_random.json
```

Share the differences in your next message.

---

## ⚡ TL;DR

1. Your hosted server has the **wrong model** (untrained weights)
2. **Fix**: Upload correct model using **Git LFS** or **Hugging Face**
3. **Verify**: Check `/debug/test-random-prediction` shows varied predictions
4. **Test**: Same image should give similar confidence locally and hosted

**Recommended**: Use **Option B (Hugging Face)** - it's built for this!
