export const envConfig = {
  nodeEnv: process.env.NODE_ENV || 'Debug',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  buildPath: process.env.BUILD_PATH || './src/rebuild',

  // AWS configuration
  aws: {
    // Common AWS configuration
    region: process.env.AWS_REGION || 'ap-southeast-1',
    grantRole: {
      grandRead: process.env.GRANT_READ || 'grantRead',
      grantReadWrite: process.env.GRANT_READ_WRITE || 'grantReadWrite',
      readWriteData: process.env.GRANT_READ_WRITE_DATA || 'grantReadWriteData',
      addToRolePolicy: process.env.ADD_TO_ROLE_POLICY || 'addToRolePolicy',
      grantSendMessages: process.env.GRANT_SEND_MESSAGES || 'grantSendMessages',
    },
    secretName: process.env.AWS_SCRET_NAME || 'HitoEnvSecret',
    // S3 Csv bucket configuration
    csvBucket: {
      idBucket: process.env.AWS_CSV_ID_BUCKET || 'LinhClassCsvBucket',
      bucketName: process.env.AWS_CSV_BUCKET_NAME || 'linhclass-csv-bucket',
    },
    // S3 Image bucket configuration
    imageBucket:{
      idBucket: process.env.AWS_IMAGE_ID_BUCKET || 'LinhClassImageBucket',
      bucketName: process.env.AWS_IMAGE_BUCKET_NAME || 'linhclass-avatar-bucket',
    },
    // SQS configuration
    deadLetterQueue: {
      idQueue: process.env.AWS_DEAD_LTTER_ID_QUEUE || 'LinhClassDeadLetterQueue',
      queueName: process.env.AWS_DEAD_LTTER_QUEUE_NAME || 'linhclass-dead-letter-queue',
      maxTime: process.env.AWS_DEAD_LETTER_QUEUE_MAX_TIME || 14,
    },
    mainQueue: {
      idQueue: process.env.AWS_MAIN_ID_QUEUE || 'LinhClassMainQueue',
      queueName: process.env.AWS_MAIN_QUEUE_NAME || 'linhclass-lambda-call-to-queue',
      maxTime: process.env.AWS_MAIN_QUEUE_MAX_TIME || 14,
      visibilityTimeout: process.env.AWS_MAIN_QUEUE_VISIBILITY_TIMEOUT || 30,
      maxReceiveCount: process.env.AWS_MAIN_MAX_RETRIES || 5,
      batchSize: process.env.AWS_BATCH_SIZE || 10,
      maxCurrency: process.env.AWS_MAX_CURRENTCY || 5,
    },
    // DynamoDB table names
    usersTable: {
      idTable: process.env.AWS_USERS_ID_TABLE || 'UsersTable',
      tableName: process.env.AWS_USERS_TABLE_NAME || 'users',
    },
    uploadCsvTable: {
      idTable: process.env.AWS_UPLOAD_CSV_ID_TABLE || 'UploadCsvTable',
      tableName: process.env.AWS_UPLOAD_CSV_TABLE_NAME || 'upload-csv',
    },
    // Lambda function configuration
    createPresignedUrlLambda: {
      idLambda: process.env.AWS_CREATE_PRESIGNED_URL_ID_LAMBDA || 'CreatePresignedUrlLambda',
      lambdaName:
        process.env.AWS_CREATE_PRESIGNED_URL_LAMBDA_NAME || 'create-presigned-url-uploading-lambda',
    },
    getStatusFromDynamoDBLambda: {
      idLambda: process.env.AWS_GET_STATUS_FROM_DYNAMODB_ID_LAMBDA || 'GetStatusFromDynamoDBLambda',
      lambdaName:
        process.env.AWS_GET_STATUS_FROM_DYNAMODB_LAMBDA_NAME || 'get-status-from-dynamodb-lambda',
    },
    getBatchIdUpdateStatusToUploadedIdLambda: {
      idLambda:
        process.env.AWS_GET_BATCH_ID_UPDATE_STATUS_TO_UPLOADED_ID_LAMBDA ||
        'GetBatchIdUpdateStatusToUploadedIdLambda',
      lambdaName:
        process.env.AWS_GET_BATCH_ID_UPDATE_STATUS_TO_UPLOADED_ID_LAMBDA_NAME ||
        'get-batch-id-update-status-to-uploaded',
    },
    getCsvReadDetailUpdateInProcessingLambda: {
      idLambda:
        process.env.AWS_GET_CSV_READ_DETAIL_UPDATE_IN_PROCESSING_LAMBDA ||
        'GetCsvReadDetailUpdateInProcessingLambda',
      lambdaName:
        process.env.AWS_GET_CSV_READ_DETAIL_UPDATE_IN_PROCESSING_LAMBDA_NAME ||
        'get-csv-read-detail-update-inprocessing-lambda',
    },
    apiGateway: {
      idLambda: process.env.AWS_API_GATEWAY_ID || 'LinhClassApiGateway',
    },
    listRoleInIAM:{
       sqsRoleList: process.env.LIST_SQS_ROLE_IN_IAM || '["sqs:SendMessage","sqs:ReceiveMessage","sqs:DeleteMessage","sqs:GetQueueAttributes","sqs:ListQueues"]',
       dynamoRoleList: process.env.LIST_DYNAMO_ROLE_IN_IAM || '["dynamodb:PutItem", "dynamodb:GetItem", "dynamodb:UpdateItem"]',
       s3RoleList: process.env.LIST_S3_ROLE_IN_IAM || '["s3:PutObject", "s3:GetObject"]'
      },
  }
};
