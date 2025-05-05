export const envConfig = {
  nodeEnv: process.env.NODE_ENV || 'Debug',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  buildPath: process.env.BUILD_PATH || './src/rebuild',

  // AWS configuration
  aws: {
    // Common AWS configuration
    region: process.env.AWS_REGION || 'ap-southeast-1',
    secretName: process.env.AWS_SCRET_NAME || 'HitoEnvSecret',
    // S3 bucket configuration
    csvBucket: {
      idBucket: process.env.AWS_CSV_ID_BUCKET || 'LinhClassCsvBucket',
      bucketName: process.env.AWS_CSV_BUCKET_NAME || 'linhclass-csv-bucket',
    },
    // SQS configuration
    deadLetterQueue: {
      idQueue: process.env.AWS_DEAD_LTTER_ID_QUEUE || 'LinhClassDeadLetterQueue',
      queueName: process.env.AWS_DEAD_LTTER_QUEUE_NAME || 'linhclass-dead-letter-queue',
      maxTime: process.env.AWS_DEAD_LETTER_QUEUE_MAX_TIME || 14,
    },
    mainQueue: {
      idQueue: process.env.AWS_MAIN_ID_QUEUE || 'LinhClassMainQueue',
      queueName: process.env.AWS_MAIN_QUEUE_NAME || 'linhclass-main-queue',
      maxTime: process.env.AWS_MAIN_QUEUE_MAX_TIME || 14,
      visibilityTimeout: process.env.AWS_MAIN_QUEUE_VISIBILITY_TIMEOUT || 30,
      maxReceiveCount: process.env.AWS_MAIN_MAX_RETRIES || 5,
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
  },
};
