@echo off
REM setup_git_lfs.bat - Windows batch script to set up Git LFS for model files

echo.
echo 🔧 Git LFS Setup for Banana Disease Model
echo ==========================================
echo.

REM Check if git lfs is installed
echo 1. Checking Git LFS installation...
git lfs version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git LFS is not installed!
    echo.
    echo Please install Git LFS first:
    echo   Download from https://git-lfs.github.com/
    echo.
    pause
    exit /b 1
) else (
    echo ✅ Git LFS is installed
    git lfs version
)

echo.

REM Initialize Git LFS
echo 2. Initializing Git LFS...
git lfs install
echo ✅ Git LFS initialized

echo.

REM Track model files
echo 3. Tracking model files with Git LFS...
git lfs track "*.keras"
git lfs track "*.h5"
echo ✅ Model file patterns tracked

echo.

REM Check what's tracked
echo 4. Currently tracked patterns:
type .gitattributes
echo.

REM Check if model file exists
echo 5. Checking for model file...
if exist "banana_disease_classification_model1.keras" (
    echo ✅ Model file found: banana_disease_classification_model1.keras
    dir banana_disease_classification_model1.keras | find "banana_disease"
) else (
    echo ❌ Model file not found: banana_disease_classification_model1.keras
    echo    Please ensure the model file is in the current directory
    pause
    exit /b 1
)

echo.

REM Add files to git
echo 6. Adding files to git...
git add .gitattributes
git add banana_disease_classification_model1.keras

echo.

REM Show status
echo 7. Git status:
git status

echo.
echo 📝 Next steps:
echo    1. Commit the changes:
echo       git commit -m "Add model file with Git LFS"
echo.
echo    2. Push to repository:
echo       git push
echo.
echo    3. Verify on GitHub:
echo       - Go to your repository
echo       - Click on banana_disease_classification_model1.keras
echo       - Should show "Stored with Git LFS"
echo.
echo    4. Redeploy on Render
echo.
echo    5. Check Render logs for:
echo       "✅ Model file exists: .../banana_disease_classification_model1.keras"
echo       "   File size: 134,079,249 bytes (127.88 MB)"
echo.

echo ✅ Git LFS setup complete!
echo.
pause
