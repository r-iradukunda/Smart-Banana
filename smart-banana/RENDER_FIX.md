# Render Deployment Fix

## Problem
The model was not loading on Render because the path was incorrect for the deployed environment.

## Changes Made

### 1. **server.py** - Fixed Model Path Loading
- Changed from hardcoded path to multiple path attempts
- Now tries: `saved_models/`, `smart-banana/saved_models/`, and root directory
- Added better error logging with traceback

### 2. **Procfile** - Fixed Working Directory
- Removed `cd smart-banana &&` from Procfile
- Render deploys from the `smart-banana` directory, so cd was failing

### 3. **Debug Endpoint** - Added `/debug` Route
- Visit `https://smart-banana.onrender.com/debug` to see:
  - Current working directory
  - Files in directory
  - Model loading status
  - Python and TensorFlow versions

## Deployment Steps

1. **Commit the changes:**
   ```bash
   git add .
   git commit -m "Fix model loading path for Render deployment"
   git push
   ```

2. **On Render Dashboard:**
   - Go to your service
   - It should auto-deploy after the push
   - Or click "Manual Deploy" > "Deploy latest commit"

3. **Verify the Fix:**
   - Visit: `https://smart-banana.onrender.com/health`
   - Should show: `{"status": "healthy", "model_loaded": true}`
   
   - Visit: `https://smart-banana.onrender.com/debug`
   - Check that model_loaded is `true`

4. **Test the API:**
   ```bash
   # In Postman:
   POST https://smart-banana.onrender.com/predict
   Body: form-data
   Key: file (type: File)
   Value: [select a banana leaf image]
   ```

## Render Configuration Check

Make sure your Render service has:
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** (leave empty - uses Procfile)
- **Root Directory:** Set to `smart-banana` (important!)

## If Still Not Working

1. Check Render logs for the exact error
2. Visit `/debug` endpoint to see file structure
3. Ensure the model file `banana_mobilenetv2_final.keras` is committed to git
4. Check if file is tracked by Git LFS (large files)

## Git LFS for Large Model Files

If model file is too large:
```bash
git lfs install
git lfs track "*.keras"
git add .gitattributes
git add saved_models/banana_mobilenetv2_final.keras
git commit -m "Track model with Git LFS"
git push
```
