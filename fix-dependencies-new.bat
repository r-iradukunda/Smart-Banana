@echo off
echo Installing new Expo CLI...
npm uninstall -g expo-cli
npm install -g @expo/cli@latest

echo Cleaning up...
rmdir /s /q node_modules 2>nul
del package-lock.json 2>nul

echo Fixing dependencies with new CLI...
npx @expo/cli install --fix

echo If that failed, trying manual approach...
npx @expo/cli install expo@~53.0.0 react@18.3.1 react-dom@18.3.1 react-test-renderer@18.3.1

echo Installing with legacy peer deps...
npm install --legacy-peer-deps

echo Done! Now try: npx expo start --web
pause
