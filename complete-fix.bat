@echo off
echo ================================
echo COMPLETE EXPO PROJECT FIX
echo ================================

echo Step 1: Installing Expo CLI globally...
call npm install -g @expo/cli@latest

echo Step 2: Verify Expo installation...
call npx @expo/cli --version

echo Step 3: Clean project...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
if exist yarn.lock del yarn.lock

echo Step 4: Copy fixed package.json...
copy package-fixed.json package.json

echo Step 5: Install dependencies with Expo...
call npx @expo/cli install --fix

echo Step 6: Install remaining dependencies...
call npm install --legacy-peer-deps

echo Step 7: Verify installation...
call npx @expo/cli doctor

echo ================================
echo INSTALLATION COMPLETE!
echo ================================
echo You can now run:
echo   npx expo start
echo   or
echo   npm start
echo ================================
pause
