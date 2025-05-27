#!/bin/bash

echo "Pre-build script is running..."

# Prebuild Pharse
echo "Running pre-build pharse"
npx tsc

echo "CDK bootstrap"
cdk bootstrap aws://650251698778/ap-northeast-1

echo "Bundle source code"
npm run bundle-esbuild
