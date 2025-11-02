@echo off
echo Cleaning up broken installation...
rmdir /s /q node_modules
del package-lock.json

echo Running Expo automatic fix...
npx expo install --fix

echo If the above failed, running with legacy peer deps...
npm install --legacy-peer-deps

echo Dependencies fixed! Now try:
echo npx expo start --web
