#!/bin/bash

echo "============================================================"
echo "Smart Banana - Quick Deployment Fix"
echo "============================================================"
echo ""

echo "Step 1: Converting model to H5 format..."
echo "------------------------------------------------------------"
python model_converter.py
if [ $? -ne 0 ]; then
    echo "ERROR: Model conversion failed!"
    echo "Please check if the model file exists."
    exit 1
fi
echo ""

echo "Step 2: Backing up current files..."
echo "------------------------------------------------------------"
if [ -f server.py ]; then
    cp server.py server_backup.py
    echo "- Backed up server.py"
fi
if [ -f enhanced_inference.py ]; then
    cp enhanced_inference.py enhanced_inference_backup.py
    echo "- Backed up enhanced_inference.py"
fi
echo ""

echo "Step 3: Updating to new versions..."
echo "------------------------------------------------------------"
cp server_v2.py server.py
echo "- Updated server.py"
cp enhanced_inference_v2.py enhanced_inference.py
echo "- Updated enhanced_inference.py"
echo ""

echo "Step 4: Testing locally..."
echo "------------------------------------------------------------"
echo "Testing model loading..."
python -c "from enhanced_inference import BananaLeafClassifier; c = BananaLeafClassifier('saved_models/banana_mobilenetv2_final.h5'); print('Model loaded successfully!')"
if [ $? -ne 0 ]; then
    echo "ERROR: Model loading test failed!"
    echo "Restoring backup files..."
    [ -f server_backup.py ] && cp server_backup.py server.py
    [ -f enhanced_inference_backup.py ] && cp enhanced_inference_backup.py enhanced_inference.py
    exit 1
fi
echo ""

echo "Step 5: Git operations..."
echo "------------------------------------------------------------"
echo "Checking Git status..."
git status --short
echo ""

echo "Do you want to commit and push changes? (Y/N)"
read CONFIRM
if [ "$CONFIRM" != "Y" ] && [ "$CONFIRM" != "y" ]; then
    echo "Deployment cancelled."
    echo "Files have been updated but not committed."
    exit 0
fi

echo ""
echo "Adding files to Git..."
git add .
echo ""

echo "Committing changes..."
git commit -m "Fix: Model loading compatibility for Render deployment - Added H5 format support and fallback strategies"
echo ""

echo "Pushing to remote..."
git push
if [ $? -ne 0 ]; then
    echo "ERROR: Git push failed!"
    echo "Please check your Git configuration."
    exit 1
fi
echo ""

echo "============================================================"
echo "Deployment Complete!"
echo "============================================================"
echo ""
echo "Your changes have been pushed to the repository."
echo "Render should automatically start rebuilding your service."
echo ""
echo "Next steps:"
echo "1. Go to your Render dashboard"
echo "2. Monitor the build logs"
echo "3. Wait for deployment to complete (usually 5-10 minutes)"
echo "4. Test the API: https://smart-banana.onrender.com/health"
echo ""
echo "============================================================"
