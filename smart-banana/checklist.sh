#!/bin/bash
# Pre-deployment Checklist Script

echo "🔍 Smart Banana Deployment Checklist"
echo "====================================="
echo ""

PASS=0
FAIL=0

# Check 1: Git LFS installed
echo -n "[1] Git LFS installed... "
if command -v git-lfs &> /dev/null; then
    echo "✅"
    ((PASS++))
else
    echo "❌ Install from: https://git-lfs.github.com/"
    ((FAIL++))
fi

# Check 2: Required files exist
echo -n "[2] Model JSON exists... "
if [ -f "banana_disease_classification_model.json" ]; then
    echo "✅"
    ((PASS++))
else
    echo "❌"
    ((FAIL++))
fi

echo -n "[3] Model weights (H5) exist... "
if [ -f "banana_disease_classification_weights.h5" ]; then
    echo "✅"
    ((PASS++))
else
    echo "❌"
    ((FAIL++))
fi

echo -n "[4] Keras model exists... "
if [ -f "banana_disease_classification_model1.keras" ]; then
    echo "✅"
    ((PASS++))
else
    echo "⚠️  Optional but recommended"
fi

# Check 3: Files NOT in .gitignore
echo -n "[5] JSON not in .gitignore... "
if ! grep -q "^/banana_disease_classification_model.json$" .gitignore; then
    echo "✅"
    ((PASS++))
else
    echo "❌ Remove from .gitignore"
    ((FAIL++))
fi

echo -n "[6] H5 not in .gitignore... "
if ! grep -q "^/banana_disease_classification_weights.h5$" .gitignore; then
    echo "✅"
    ((PASS++))
else
    echo "❌ Remove from .gitignore"
    ((FAIL++))
fi

# Check 4: Git LFS tracking
echo -n "[7] Git LFS tracking configured... "
if [ -f ".gitattributes" ] && grep -q "filter=lfs" .gitattributes; then
    echo "✅"
    ((PASS++))
else
    echo "❌ Run: git lfs track '*.keras' '*.h5'"
    ((FAIL++))
fi

# Check 5: Updated code files
echo -n "[8] enhanced_inference.py updated... "
if grep -q "_load_model_safe" enhanced_inference.py; then
    echo "✅"
    ((PASS++))
else
    echo "❌ Apply the code fixes"
    ((FAIL++))
fi

echo -n "[9] server.py updated... "
if grep -q "BASE_DIR" server.py; then
    echo "✅"
    ((PASS++))
else
    echo "❌ Apply the code fixes"
    ((FAIL++))
fi

# Check 6: Git status
echo -n "[10] Git repository clean... "
if git diff-index --quiet HEAD --; then
    echo "✅"
    ((PASS++))
else
    echo "⚠️  Uncommitted changes (normal if fixing now)"
fi

echo ""
echo "======================================"
echo "Results: $PASS passed, $FAIL failed"
echo "======================================"
echo ""

if [ $FAIL -eq 0 ]; then
    echo "🎉 All checks passed! Ready to deploy."
    echo ""
    echo "Run: deploy_final.bat (Windows) or ./deploy.sh (Mac/Linux)"
    exit 0
else
    echo "⚠️  Please fix the failed checks above before deploying."
    echo ""
    echo "Quick fixes:"
    echo "1. Install Git LFS: https://git-lfs.github.com/"
    echo "2. Update .gitignore (remove model file entries)"
    echo "3. Run: git lfs track '*.keras' '*.h5'"
    echo "4. Apply code fixes to enhanced_inference.py and server.py"
    exit 1
fi
