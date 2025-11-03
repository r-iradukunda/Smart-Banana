@echo off
REM 🚀 FINAL DEPLOYMENT SCRIPT - Smart Banana
REM This fixes the "Model not loaded" error on Render

echo.
echo ========================================
echo   Smart Banana - Render Deployment Fix
echo ========================================
echo.

REM Check Git LFS
echo [1/6] Checking Git LFS...
git lfs version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git LFS not installed!
    echo.
    echo Install Git LFS from: https://git-lfs.github.com/
    echo.
    pause
    exit /b 1
)
echo ✅ Git LFS is installed
echo.

REM Check model files
echo [2/6] Checking model files...
set MODEL_COUNT=0

if exist "banana_disease_classification_model.json" (
    echo ✅ JSON file found ^(5 KB^)
    set /a MODEL_COUNT+=1
) else (
    echo ❌ JSON file NOT found
)

if exist "banana_disease_classification_weights.h5" (
    echo ✅ H5 weights found ^(43 MB^)
    set /a MODEL_COUNT+=1
) else (
    echo ❌ H5 weights NOT found
)

if exist "banana_disease_classification_model1.keras" (
    echo ✅ Keras model found ^(128 MB^)
    set /a MODEL_COUNT+=1
) else (
    echo ❌ Keras model NOT found
)

echo.
if %MODEL_COUNT% LSS 2 (
    echo ⚠️  WARNING: Need at least JSON + H5 OR the Keras file
    echo.
    pause
    exit /b 1
)
echo ✅ Sufficient model files found
echo.

REM Initialize Git LFS
echo [3/6] Setting up Git LFS...
git lfs install
git lfs track "*.keras"
git lfs track "*.h5"
echo ✅ Git LFS configured
echo.

REM Add files
echo [4/6] Adding files to Git...
git add .gitattributes
git add .gitignore
git add banana_disease_classification_model.json
git add banana_disease_classification_weights.h5
git add banana_disease_classification_model1.keras
git add enhanced_inference.py
git add server.py
git add MODEL_FIX_GUIDE.md
git add QUICK_FIX.md
git add deploy_final.bat

echo ✅ Files staged
echo.

REM Show what will be committed
echo [5/6] Files to be committed:
git status --short
echo.

REM Commit
echo [6/6] Committing changes...
git commit -m "Fix: Resolve Render deployment with Keras 3.x compatibility

- Fixed .gitignore to include model files
- Configured Git LFS for large model files
- Added multi-strategy model loading (Keras 3.x support)
- JSON + H5 fallback for maximum compatibility
- Enhanced error handling and logging
- Added deployment documentation

Resolves: Model not loaded error on Render
Size: JSON (5KB) + H5 (43MB) + Keras (128MB with LFS)"

if %errorlevel% neq 0 (
    echo.
    echo ⚠️  Nothing to commit or commit failed
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ Changes committed successfully!
echo.
echo ====================================
echo   Ready to Deploy!
echo ====================================
echo.
echo What happens next:
echo 1. This script will push to GitHub
echo 2. Render will auto-deploy
echo 3. Model loads using Strategy 2 (JSON + H5)
echo 4. API becomes available
echo.

set /p CONFIRM="Push to GitHub now? (y/n): "
if /i "%CONFIRM%"=="y" (
    echo.
    echo 🚀 Pushing to GitHub...
    git push
    
    if %errorlevel% equ 0 (
        echo.
        echo ========================================
        echo   🎉 Deployment Initiated!
        echo ========================================
        echo.
        echo Next steps:
        echo.
        echo 1. Go to: https://dashboard.render.com
        echo 2. Select your service: smart-banana
        echo 3. Click "Logs" tab
        echo 4. Wait for: "✅ Model loaded successfully"
        echo 5. Test: https://smart-banana.onrender.com/health
        echo.
        echo Expected log output:
        echo   🔄 Attempting to load model...
        echo   Strategy 2: Loading from JSON + H5 weights...
        echo   ✅ Model loaded successfully with Strategy 2
        echo.
        echo ⏱️  Deployment usually takes 3-5 minutes
        echo.
    ) else (
        echo.
        echo ❌ Push failed! Check your internet connection.
        echo.
    )
) else (
    echo.
    echo ⏸️  Push cancelled.
    echo.
    echo To push manually, run:
    echo   git push
    echo.
)

echo.
echo For troubleshooting, see: MODEL_FIX_GUIDE.md
echo.
pause
