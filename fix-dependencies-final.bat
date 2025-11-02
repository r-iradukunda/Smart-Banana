@echo off
echo ================================
echo FIXING EXPO DEPENDENCY CONFLICTS
echo ================================

echo Step 1: Clean installation...
rmdir /s /q node_modules 2>nul
del package-lock.json 2>nul
del yarn.lock 2>nul

echo Step 2: Update Expo CLI...
npm uninstall -g expo-cli 2>nul
npm install -g @expo/cli@latest

echo Step 3: Install compatible dependencies...
npx expo install --fix

echo Step 4: Manual installation of problematic packages...
npm install expo-sharing@12.0.1 --save-exact
npm install react-native@0.76.3 --save-exact
npm install @types/react@18.3.12 --save-exact

echo Step 5: Final installation with legacy peer deps...
npm install --legacy-peer-deps

echo ================================
echo INSTALLATION COMPLETE!
echo ================================
echo Try running: npm start
pause
