#!/bin/bash
# setup_git_lfs.sh - Script to set up Git LFS for model files

echo "🔧 Git LFS Setup for Banana Disease Model"
echo "=========================================="
echo ""

# Check if git lfs is installed
echo "1. Checking Git LFS installation..."
if ! command -v git-lfs &> /dev/null; then
    echo "❌ Git LFS is not installed!"
    echo ""
    echo "Please install Git LFS first:"
    echo "  - Windows: Download from https://git-lfs.github.com/"
    echo "  - macOS: brew install git-lfs"
    echo "  - Linux: sudo apt-get install git-lfs"
    echo ""
    exit 1
else
    echo "✅ Git LFS is installed"
    git lfs version
fi

echo ""

# Initialize Git LFS
echo "2. Initializing Git LFS..."
git lfs install
echo "✅ Git LFS initialized"

echo ""

# Track model files
echo "3. Tracking model files with Git LFS..."
git lfs track "*.keras"
git lfs track "*.h5"
echo "✅ Model file patterns tracked"

echo ""

# Check what's tracked
echo "4. Currently tracked patterns:"
cat .gitattributes
echo ""

# Check if model file exists
echo "5. Checking for model file..."
if [ -f "banana_disease_classification_model1.keras" ]; then
    size=$(ls -lh banana_disease_classification_model1.keras | awk '{print $5}')
    echo "✅ Model file found: banana_disease_classification_model1.keras ($size)"
else
    echo "❌ Model file not found: banana_disease_classification_model1.keras"
    echo "   Please ensure the model file is in the current directory"
    exit 1
fi

echo ""

# Add files to git
echo "6. Adding files to git..."
git add .gitattributes
git add banana_disease_classification_model1.keras

echo ""

# Show status
echo "7. Git status:"
git status

echo ""
echo "📝 Next steps:"
echo "   1. Commit the changes:"
echo "      git commit -m 'Add model file with Git LFS'"
echo ""
echo "   2. Push to repository:"
echo "      git push"
echo ""
echo "   3. Verify on GitHub:"
echo "      - Go to your repository"
echo "      - Click on banana_disease_classification_model1.keras"
echo "      - Should show 'Stored with Git LFS'"
echo ""
echo "   4. Redeploy on Render"
echo ""
echo "   5. Check Render logs for:"
echo "      '✅ Model file exists: .../banana_disease_classification_model1.keras'"
echo "      '   File size: 134,079,249 bytes (127.88 MB)'"
echo ""

echo "✅ Git LFS setup complete!"
