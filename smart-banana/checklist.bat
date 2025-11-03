@echo off
REM Pre-deployment Checklist Script

setlocal enabledelayedexpansion
set PASS=0
set FAIL=0

echo.
echo 🔍 Smart Banana Deployment Checklist
echo =====================================
echo.

REM Check 1: Git LFS installed
echo [1] Checking Git LFS...
git lfs version >nul 2>&1
if %errorlevel% equ 0 (
    echo     ✅ Git LFS installed
    set /a PASS+=1
) else (
    echo     ❌ Git LFS NOT installed
    echo        Install from: https://git-lfs.github.com/
    set /a FAIL+=1
)

REM Check 2: Required files exist
echo [2] Checking model files...
if exist "banana_disease_classification_model.json" (
    echo     ✅ JSON file found
    set /a PASS+=1
) else (
    echo     ❌ JSON file NOT found
    set /a FAIL+=1
)

if exist "banana_disease_classification_weights.h5" (
    echo     ✅ H5 weights found
    set /a PASS+=1
) else (
    echo     ❌ H5 weights NOT found
    set /a FAIL+=1
)

if exist "banana_disease_classification_model1.keras" (
    echo     ✅ Keras model found
    set /a PASS+=1
) else (
    echo     ⚠️  Keras model NOT found ^(optional^)
)

REM Check 3: Files NOT in .gitignore
echo [3] Checking .gitignore...
findstr /C:"/banana_disease_classification_model.json" .gitignore >nul 2>&1
if %errorlevel% neq 0 (
    echo     ✅ JSON not ignored
    set /a PASS+=1
) else (
    echo     ❌ JSON is in .gitignore
    set /a FAIL+=1
)

findstr /C:"/banana_disease_classification_weights.h5" .gitignore >nul 2>&1
if %errorlevel% neq 0 (
    echo     ✅ H5 not ignored
    set /a PASS+=1
) else (
    echo     ❌ H5 is in .gitignore
    set /a FAIL+=1
)

REM Check 4: Git LFS tracking
echo [4] Checking Git LFS configuration...
if exist ".gitattributes" (
    findstr /C:"filter=lfs" .gitattributes >nul 2>&1
    if !errorlevel! equ 0 (
        echo     ✅ Git LFS tracking configured
        set /a PASS+=1
    ) else (
        echo     ❌ Git LFS not configured
        set /a FAIL+=1
    )
) else (
    echo     ❌ .gitattributes not found
    set /a FAIL+=1
)

REM Check 5: Updated code files
echo [5] Checking code updates...
findstr /C:"_load_model_safe" enhanced_inference.py >nul 2>&1
if %errorlevel% equ 0 (
    echo     ✅ enhanced_inference.py updated
    set /a PASS+=1
) else (
    echo     ❌ enhanced_inference.py NOT updated
    set /a FAIL+=1
)

findstr /C:"BASE_DIR" server.py >nul 2>&1
if %errorlevel% equ 0 (
    echo     ✅ server.py updated
    set /a PASS+=1
) else (
    echo     ❌ server.py NOT updated
    set /a FAIL+=1
)

REM Check 6: Git status
echo [6] Checking Git status...
git diff-index --quiet HEAD -- >nul 2>&1
if %errorlevel% equ 0 (
    echo     ✅ No uncommitted changes
    set /a PASS+=1
) else (
    echo     ⚠️  Uncommitted changes ^(normal if fixing now^)
)

echo.
echo ======================================
echo Results: %PASS% passed, %FAIL% failed
echo ======================================
echo.

if %FAIL% equ 0 (
    echo 🎉 All checks passed! Ready to deploy.
    echo.
    echo Next step: Run deploy_final.bat
    echo.
    pause
    exit /b 0
) else (
    echo ⚠️  Please fix the failed checks above before deploying.
    echo.
    echo Quick fixes:
    echo 1. Install Git LFS: https://git-lfs.github.com/
    echo 2. Fix .gitignore ^(remove model file entries^)
    echo 3. Run: git lfs track "*.keras" "*.h5"
    echo 4. Apply code fixes
    echo.
    echo See: DEPLOYMENT_SOLUTION.md for details
    echo.
    pause
    exit /b 1
)
