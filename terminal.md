npx esbuild ./src/lambda/create-preurl-s3-update-status-uploading-lambda/index.ts \
  --bundle \
  --platform=node \
  --outfile=rebuild/create-preurl-s3-update-status-uploading-lambda.mjs \
  --format=esm \
  --external:@aws-sdk/client-s3 \
  --external:@aws-sdk/s3-request-presigner \
  --external:@aws-sdk/client-dynamodb \
  --external:@aws-sdk/client-sqs \
  --external:@aws-sdk/client-secrets-manager

  "bundle-1": "npx esbuild ./src/lambda/get-status-from-dynamodb-lambda/index.ts --bundle --platform=node --outfile=rebuild/get-status-from-dynamodb-lambda.mjs --format=esm --external:@aws-sdk/client-s3 --external:@aws-sdk/s3-request-presigner --external:@aws-sdk/client-dynamodb --external:@aws-sdk/client-sqs --external:@aws-sdk/client-secrets-manager"