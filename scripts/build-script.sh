#!/bin/bash

echo "Starting script/build.sh"

# Install Pharse
echo "Running install pharse"
ls -la

echo "Installing dependencies"
npm install -g aws-cdk@2
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

echo "Check cdk version"
cdk --version

# Prebuild Pharse
echo "Running pre-build pharse"
npx tsc

# echo "CDK bootstrap"
# cdk bootstrap aws://650251698778/ap-northeast-1

# Build Pharse
echo "Running build pharse"

echo "Showing directory structure"
ls -la

echo "Running cdk deploy"
npm run deploy