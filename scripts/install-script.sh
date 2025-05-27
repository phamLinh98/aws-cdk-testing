#!/bin/bash

echo "Install script is running..."

# Install Pharse
echo "Running install pharse"
ls -la
cat buildspec.yaml

echo "Installing dependencies"
npm install -g aws-cdk@2
npm install && npm install --save-dev @types/node
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