# Render Configuration Guide

## Your Current Setup
- **Start Command:** `python smart-banana/server.py`
- **Issue:** Model path was not resolving correctly

## Fix Applied
Updated `server.py` to detect its own location and find the model relative to itself.

## Quick Deploy

```bash
git add .
git commit -m "Fix model path for Render deployment"
git push
```

## Verify After Deploy

1. **Check Health:**
   ```
   GET https://smart-banana.onrender.com/health
   ```
   Should return: `{"status": "healthy", "model_loaded": true}`

2. **Check Debug Info:**
   ```
   GET https://smart-banana.onrender.com/debug
   ```
   Look for model_loaded: true

3. **Test Prediction:**
   ```
   POST https://smart-banana.onrender.com/predict
   Body: form-data, file: [banana_leaf_image]
   ```

## Render Logs Should Show:
```
📁 Server running from: /opt/render/project/src/smart-banana
📁 Current working directory: /opt/render/project/src
✅ Found model at: /opt/render/project/src/smart-banana/saved_models/banana_mobilenetv2_final.keras
Enhanced Banana Disease Classifier loaded successfully!
```

## Alternative: Use Gunicorn (Recommended)

Change Render Start Command to:
```
gunicorn smart-banana.server:app --bind 0.0.0.0:$PORT
```

This is better for production but both will work now!
