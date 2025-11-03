# Model Loading Fix for Render Deployment

## Problem
The error `"Model not loaded"` occurs because of a Keras version mismatch between:
- **Local environment**: Keras 2.x (part of TensorFlow 2.13-2.15)
- **Render deployment**: Keras 3.x (part of TensorFlow 2.20)

Keras 3.x has breaking changes and cannot deserialize models saved in the old format.

## Solutions

### Option 1: Convert Model Locally (RECOMMENDED)

1. **Run the conversion script locally**:
   ```bash
   python convert_model.py
   ```

2. **This creates a new file**: `banana_disease_model_v3.keras`

3. **Update your Google Drive**:
   - Upload `banana_disease_model_v3.keras` to Google Drive
   - Get the new file ID
   - Update `server.py` with the new file ID:
     ```python
     MODEL_FILES = {
         "keras": {
             "url": "https://drive.google.com/uc?export=download&id=YOUR_NEW_FILE_ID",
             "path": MODEL_PATH
         }
     }
     ```

4. **Deploy to Render** - it should work now!

### Option 2: Use JSON + H5 Files (Already Implemented)

The updated `enhanced_inference.py` now has fallback loading strategies:
1. First tries to load the `.keras` file
2. If that fails, tries to load from JSON + H5 files
3. If that fails, builds a fallback architecture

**Steps**:
1. Make sure these files are in your repo:
   - `banana_disease_classification_model.json`
   - `banana_disease_classification_weights.h5`

2. Push the updated code to GitHub

3. Redeploy on Render

### Option 3: Pin TensorFlow to Older Version

Update `requirements.txt`:
```txt
tensorflow==2.15.0
keras==2.15.0
```

**Warning**: This keeps you on older versions with potential security issues.

## Files Modified

1. ✅ `enhanced_inference.py` - Added multi-strategy model loading
2. ✅ `server.py` - Improved model download and file checking
3. ✅ `convert_model.py` - New script to convert model format

## Quick Deploy Steps

```bash
# 1. Install dependencies locally
pip install -r requirements.txt

# 2. Convert the model
python convert_model.py

# 3. Commit changes
git add .
git commit -m "Fix: Add Keras 3.x compatibility for model loading"
git push

# 4. Redeploy on Render (automatic if you have auto-deploy enabled)
```

## Verification

After deployment, check:
1. Look for "✅ Model loaded successfully" in Render logs
2. Test the health endpoint: `https://your-app.onrender.com/health`
3. Test prediction: Upload an image via `/predict`

## Current Status

✅ Code updated with multi-strategy loading
✅ Fallback mechanisms in place
⏳ Waiting for you to:
   - Convert model using `convert_model.py`, OR
   - Ensure JSON + H5 files are in the repo

## Need Help?

Check Render logs for which loading strategy worked:
- "Strategy 1" = Direct `.keras` load (Keras 3.x compatible)
- "Strategy 2" = JSON + H5 load (most compatible)
- "Strategy 3" = Fallback architecture (no weights - won't predict correctly)
