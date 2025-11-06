# Deployment Fix Guide for Model Loading Issue

## Problem
The model file (25MB) is not being loaded on the deployment platform. This is because:
1. Git LFS (Large File Storage) pointer files are being committed instead of actual model files
2. The deployment platform isn't pulling the actual LFS files

## Solution

### Option 1: Upload Model Directly to Deployment Platform (Recommended for Render/Heroku)

Since Git LFS may not work properly on some platforms, manually upload the model file:

1. **Download the model file locally**:
   - The file should be at: `smart-banana/saved_models/banana_mobilenetv2_final.keras`
   - Size should be approximately 25 MB

2. **For Render.com**:
   - Go to your service dashboard
   - Navigate to "Shell" tab
   - Upload the model file using:
     ```bash
     # Create the directory
     mkdir -p smart-banana/saved_models
     
     # You can upload via scp, rsync, or use a cloud storage link
     # Example with wget (if you host it somewhere):
     cd smart-banana/saved_models
     wget YOUR_MODEL_URL -O banana_mobilenetv2_final.keras
     ```

3. **For Heroku**:
   - Use buildpacks or upload via Heroku CLI

### Option 2: Use Cloud Storage (Google Drive/AWS S3)

1. **Upload model to Google Drive**:
   - Upload `banana_mobilenetv2_final.keras` to Google Drive
   - Make it publicly accessible or get a shareable link
   - Note the file ID from the URL

2. **Add download script** - Create `download_model.py`:
   ```python
   import gdown
   import os
   
   def download_model_if_missing():
       model_path = 'saved_models/banana_mobilenetv2_final.keras'
       if not os.path.exists(model_path) or os.path.getsize(model_path) < 1000:
           print("Downloading model from Google Drive...")
           os.makedirs('saved_models', exist_ok=True)
           # Replace with your Google Drive file ID
           file_id = "YOUR_FILE_ID_HERE"
           url = f'https://drive.google.com/uc?id={file_id}'
           gdown.download(url, model_path, quiet=False)
           print("Model downloaded successfully!")
   
   if __name__ == "__main__":
       download_model_if_missing()
   ```

3. **Update server.py** to call this before initializing:
   ```python
   from download_model import download_model_if_missing
   download_model_if_missing()
   ```

### Option 3: Fix Git LFS Properly

1. **Install Git LFS**:
   ```bash
   git lfs install
   ```

2. **Track the model file**:
   ```bash
   git lfs track "*.keras"
   git lfs track "*.h5"
   ```

3. **Add .gitattributes**:
   ```bash
   echo "*.keras filter=lfs diff=lfs merge=lfs -text" >> .gitattributes
   echo "*.h5 filter=lfs diff=lfs merge=lfs -text" >> .gitattributes
   ```

4. **Remove and re-add the model file**:
   ```bash
   git rm --cached saved_models/banana_mobilenetv2_final.keras
   git add saved_models/banana_mobilenetv2_final.keras
   git add .gitattributes
   git commit -m "Add model file with Git LFS"
   git push
   ```

5. **On deployment platform**, ensure Git LFS is installed:
   - For Render: Add build command: `git lfs install && git lfs pull`
   - For Heroku: Use the Git LFS buildpack

### Option 4: Split Deployment (Frontend + Separate Model Service)

If the model is too large for your platform's limits:

1. Deploy the model on a platform that supports large files (AWS Lambda with layers, Google Cloud Run, etc.)
2. Update your main app to call the model service via HTTP

## Verify the Fix

1. Check the `/debug` endpoint to see file system info
2. Verify model file size is ~25 MB (not <1 KB)
3. Test the `/predict` endpoint

## Current Server Updates

The `server.py` has been updated to:
- Check multiple possible model locations
- Handle running from parent directory (Render's default)
- Detect Git LFS pointer files (files <1KB)
- Provide detailed debugging information at `/debug` endpoint

## Testing Locally

Before deploying, test locally:

```bash
cd smart-banana
python server.py
```

Visit:
- http://localhost:5000/ - Check status
- http://localhost:5000/debug - See file system info
- http://localhost:5000/health - Check if model loaded

## Deploy Commands

### For Render:
1. Update build command: `pip install -r smart-banana/requirements.txt`
2. Update start command: `cd smart-banana && gunicorn server:app --bind 0.0.0.0:$PORT`

### For Heroku:
```bash
heroku login
git push heroku main
heroku logs --tail  # Check for errors
```

## Troubleshooting

1. **"Model not found" error**:
   - Check `/debug` endpoint
   - Verify model file exists and is >25 MB
   - Check Procfile is correct

2. **"Model too small" warning**:
   - This means you have a Git LFS pointer file, not the actual model
   - Follow Option 1 or 2 above

3. **Memory errors**:
   - Upgrade your deployment plan
   - Model requires ~512MB RAM minimum

4. **TensorFlow installation issues**:
   - Ensure requirements.txt has: `tensorflow>=2.13.0`
   - Some platforms require specific TensorFlow builds

## Contact

If you continue to have issues, provide the output from the `/debug` endpoint.
