#!/bin/bash

# 🚀 Quick Deployment Script for Render
# This script helps you deploy the fixed model to Render

echo "🔧 Smart Banana Model Deployment Fix"
echo "====================================="
echo ""

# Step 1: Check if model files exist
echo "📁 Step 1: Checking model files..."
if [ -f "banana_disease_classification_model.json" ]; then
    echo "✅ JSON file found"
else
    echo "❌ JSON file NOT found"
fi

if [ -f "banana_disease_classification_weights.h5" ]; then
    echo "✅ H5 weights file found"
else
    echo "❌ H5 weights file NOT found"
fi

if [ -f "banana_disease_classification_model1.keras" ]; then
    echo "✅ Keras model file found"
else
    echo "❌ Keras model file NOT found"
fi

echo ""

# Step 2: Git status
echo "📊 Step 2: Checking Git status..."
git status --short

echo ""

# Step 3: Add files
echo "➕ Step 3: Adding model files to Git..."
git add banana_disease_classification_model.json
git add banana_disease_classification_weights.h5
git add banana_disease_classification_model1.keras
git add enhanced_inference.py
git add server.py
git add .gitignore
git add MODEL_FIX_GUIDE.md

echo "✅ Files added"
echo ""

# Step 4: Commit
echo "💾 Step 4: Committing changes..."
git commit -m "Fix: Add Keras 3.x compatibility and include model files

- Updated enhanced_inference.py with multi-strategy model loading
- Fixed .gitignore to include required model files
- Added fallback loading from JSON + H5 weights
- Improved error handling in server.py
- Added deployment documentation"

echo ""

# Step 5: Push
echo "🚀 Step 5: Pushing to repository..."
read -p "Push to origin? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]
then
    git push
    echo "✅ Pushed successfully!"
    echo ""
    echo "🎉 Deployment Complete!"
    echo "===================="
    echo "Next steps:"
    echo "1. Go to your Render dashboard"
    echo "2. Check the deployment logs"
    echo "3. Look for '✅ Model loaded successfully'"
    echo "4. Test at: https://smart-banana.onrender.com/health"
else
    echo "⏸️  Push cancelled. Run 'git push' manually when ready."
fi
