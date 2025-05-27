#!/bin/bash

echo "Starting script/build.sh"

# Install Pharse
echo "Running install pharse"
ls -la

echo "Installing dependencies"
npm install
npm install --save-dev @types/node
cd cdk && npm install && npm install --save-dev @types/node && cd ..

echo "Check Node.js version"
node -v

echo "Check npm version"
npm -v

echo "Check npx version"
npx -v

echo "Check aws cli version"
aws --version

# Prebuild Pharse
echo "Running pre-build pharse"
npx tsc

# Build Pharse
echo "Running build pharse"

echo "Showing directory structure"
ls -la

echo "Running cdk deploy"
cd cdk && npm run deploy && cd ..