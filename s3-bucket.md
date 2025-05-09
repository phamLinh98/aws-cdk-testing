aws cloudformation create-stack \
  --stack-name tuan-test-s3-stack \
  --template-body file://s3-bucket.json \
  --parameters ParameterKey=BucketName,ParameterValue=tuanlinhclass-09052025-bucket \
  --capabilities CAPABILITY_NAMED_IAM


// destroy above stack
aws cloudformation delete-stack \
  --stack-name tuan-test-s3-stack
