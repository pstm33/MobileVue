#!/bin/sh
set -e

echo "Installing web dependencies"
npm ci

echo "Building Vue/Vite bundle"
npm run build

echo "Syncing Capacitor iOS project"
npx cap sync ios

echo "Installing CocoaPods"
cd ios/App
pod install
