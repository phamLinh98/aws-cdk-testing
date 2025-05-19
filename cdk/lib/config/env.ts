export const envConfig = {
  nodeEnv: process.env.NODE_ENV || 'Debug',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  buildPath: process.env.BUILD_PATH || './src/rebuild',
  local: process.env.CORS_ORIGIN || 'http://localhost:5173',
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
    s3: {
      csvBucket: {
        idBucket: process.env.AWS_CSV_ID_BUCKET || 'LinhClassCsvBucket1',
        bucketName: process.env.AWS_CSV_BUCKET_NAME || 'linhclass-csv-bucket',
        triggerLambda: process.env.AWS_CSV_TRIGGER_LAMBDA || 1,
        s3RoleList: process.env.LIST_S3_ROLE_IN_IAM || 's3:PutObject,s3:GetObject',
      },
      // S3 Image bucket configuration
      imageBucket: {
        idBucket: process.env.AWS_MAGE_ID_BUCKET || 'LinhClassImageBucket1',
        bucketName: process.env.AWS_IMAGE_BUCKET_NAME || 'linhclass-avatar-bucket',
        triggerLambda: process.env.AWS_IMAGE_TRIGGER_LAMBDA || 0,
        s3RoleList: process.env.LIST_S3_ROLE_IN_IAM || 's3:PutObject,s3:GetObject',
      },
    },
    // SQS configuration
    queue: {
      deadLetter: {
        idQueue: process.env.AWS_DEAD_LTTER_ID_QUEUE || 'LinhClassDeadLetterQueue',
        queueName: process.env.AWS_DEAD_LTTER_QUEUE_NAME || 'linhclass-dead-letter-queue',
        maxTime: process.env.AWS_DEAD_LETTER_QUEUE_MAX_TIME || 14,
        isDeadLeterQueue: process.env.AWS_DEAD_LETTER_IS_DELETE || 1,
      },
      sideDeadLetter: {
        idQueue: process.env.AWS_SIDE_DEAD_LTTER_ID_QUEUE || 'LinhClassSideDeadLetterQueue',
        queueName: process.env.AWS_SIDE_DEAD_LTTER_QUEUE_NAME || 'linhclass-side-dead-letter-queue',
        maxTime: process.env.AWS_SIDE_DEAD_LETTER_QUEUE_MAX_TIME || 14,
        isDeadLeterQueue: process.env.AWS_SIDE_DEAD_LETTER_IS_DELETE || 1,
      },
      main: {
        idQueue: process.env.AWS_MAIN_ID_QUEUE || 'LinhClassMainQueue',
        queueName: process.env.AWS_MAIN_QUEUE_NAME || 'linhclass-lambda-call-to-queue',
        maxTime: process.env.AWS_MAIN_QUEUE_MAX_TIME || 14,
        visibilityTimeout: process.env.AWS_MAIN_QUEUE_VISIBILITY_TIMEOUT || 30,
        maxReceiveCount: process.env.AWS_MAIN_MAX_RETRIES || 5,
        batchSize: process.env.AWS_BATCH_SIZE || 10,
        maxCurrency: process.env.AWS_MAX_CURRENTCY || 5,
        isDeadLeterQueue: process.env.AWS_DEAD_LETTER_IS_DELETE || 0,
        deadLetterQueueName: 'deadLetter',
        deadQueue: {
          idQueue: process.env.AWS_DEAD_LTTER_ID_QUEUE || 'LinhClassDeadLetterQueue',
          queueName: process.env.AWS_DEAD_LTTER_QUEUE_NAME || 'linhclass-dead-letter-queue',
          maxTime: process.env.AWS_DEAD_LETTER_QUEUE_MAX_TIME || 14,
          isDeadLeterQueue: process.env.AWS_DEAD_LETTER_IS_DELETE || 1,
        },
        policyActionList: 'sqsNormalPolicy',
      },
      side: {
        idQueue: process.env.AWS_SIDE_ID_QUEUE || 'LinhClassSideQueue',
        queueName: process.env.AWS_SIDE_QUEUE_NAME || 'linhclass-side-queue',
        maxTime: process.env.AWS_SIDE_QUEUE_MAX_TIME || 14,
        visibilityTimeout: process.env.AWS_SIDE_QUEUE_VISIBILITY_TIMEOUT || 30,
        maxReceiveCount: process.env.AWS_SIDE_MAX_RETRIES || 5,
        batchSize: process.env.AWS_SIDE_BATCH_SIZE || 10,
        maxCurrency: process.env.AWS_SIDE_MAX_CURRENTCY || 5,
        isDeadLeterQueue: process.env.AWS_SIDE_DEAD_LETTER_IS_DELETE || 0,
        policyActionList: 'sqsSidePolicy',
      },
      take2: {
        idQueue: process.env.AWS_TAKE_2_ID_QUEUE || 'LinhClassTake2Queue',
        queueName: process.env.AWS_TAKE_2_QUEUE_NAME || 'linhclass-take-2-queue',
        maxTime: process.env.AWS_TAKE_2_QUEUE_MAX_TIME || 14,
        visibilityTimeout: process.env.AWS_TAKE_2_QUEUE_VISIBILITY_TIMEOUT || 30,
        maxReceiveCount: process.env.AWS_TAKE_2_MAX_RETRIES || 5,
        batchSize: process.env.AWS_TAKE_2_BATCH_SIZE || 10,
        maxCurrency: process.env.AWS_TAKE_2_MAX_CURRENTCY || 5,
        isDeadLeterQueue: process.env.AWS_TAKE_2_DEAD_LETTER_IS_DELETE || 0,
      },
      fuku: {
        idQueue: process.env.AWS_FUKU_ID_QUEUE || 'linhclass-fuku-queue',
        queueName: process.env.AWS_FUKU_QUEUE_NAME || 'linhclass-fuku-queue',
      },
    },
    // DynamoDB table names
    table: {
      usersTable: {
        idTable: process.env.AWS_USERS_ID_TABLE || 'UsersTable',
        tableName: process.env.AWS_USERS_TABLE_NAME || 'users',
        tableArn: 'arn:aws:dynamodb:ap-northeast-1:650251698778:table/users',
      },
      uploadCsvTable: {
        idTable: process.env.AWS_UPLOAD_CSV_ID_TABLE || 'UploadCsvTable',
        tableName: process.env.AWS_UPLOAD_CSV_TABLE_NAME || 'upload-csv',
        tableArn: 'arn:aws:dynamodb:ap-northeast-1:650251698778:table/upload-csv',
      },
    },
    // Lambda function configuration
    lambda: {
      createPresignedUrlLambda: {
        idLambda: process.env.AWS_CREATE_PRESIGNED_URL_ID_LAMBDA || 'CreatePresignedUrlLambda',
        lambdaName:
          process.env.AWS_CREATE_PRESIGNED_URL_LAMBDA_NAME ||
          'create-presigned-url-uploading-lambda',
        triggerSQS: false,
        triggerS3: true,
        createAPI: true,
        path: './src/rebuild' + '/create-preurl',
        excludeFunction: 'create-preurl-s3-update-status-uploading-lambda.mjs',
        lambdaHander: 'create-preurl-s3-update-status-uploading-lambda.handler',
      },
      getStatusFromDynamoDBLambda: {
        idLambda:
          process.env.AWS_GET_STATUS_FROM_DYNAMODB_ID_LAMBDA || 'GetStatusFromDynamoDBLambda',
        lambdaName:
          process.env.AWS_GET_STATUS_FROM_DYNAMODB_LAMBDA_NAME || 'get-status-from-dynamodb-lambda',
        triggerSQS: false,
        triggerS3: false,
        createAPI: true,
        path: './src/rebuild' + '/get-status',
        excludeFunction: 'get-status-from-dynamodb-lambda.mjs',
        lambdaHander: 'get-status-from-dynamodb-lambda.handler',
      },
      getBatchIdUpdateStatusToUploadedIdLambda: {
        idLambda:
          process.env.AWS_GET_BATCH_ID_UPDATE_STATUS_TO_UPLOADED_ID_LAMBDA ||
          'GetBatchIdUpdateStatusToUploadedIdLambda',
        lambdaName:
          process.env.AWS_GET_BATCH_ID_UPDATE_STATUS_TO_UPLOADED_ID_LAMBDA_NAME ||
          'get-batch-id-update-status-to-uploaded',
        triggerSQS: false,
        triggerS3: true,
        createAPI: false,
        path: './src/rebuild' + '/get-batchid-uploaded',
        excludeFunction: 'get-batchid-update-status-to-uploaded.mjs',
        lambdaHander: 'get-batchid-update-status-to-uploaded.handler',
      },
      getCsvReadDetailUpdateInProcessingLambda: {
        idLambda:
          process.env.AWS_GET_CSV_READ_DETAIL_UPDATE_IN_PROCESSING_LAMBDA ||
          'GetCsvReadDetailUpdateInProcessingLambda',
        lambdaName:
          process.env.AWS_GET_CSV_READ_DETAIL_UPDATE_IN_PROCESSING_LAMBDA_NAME ||
          'get-csv-read-detail-update-inprocessing-lambda',
        triggerSQS: true,
        triggerS3: false,
        createAPI: false,
        path: './src/rebuild' + '/get-csv-read-detail',
        excludeFunction: 'get-csv-read-detail-update-inprocessing-lambda.mjs',
        lambdaHander: 'get-csv-read-detail-update-inprocessing-lambda.handler',
      },
    },
    apiGateway: {
      createPresignedUrlLambda: {
        api: 'get-url',
        method: 'GET',
      },
      getStatusFromDynamoDBLambda: {
        api: 'get-status',
        method: 'GET',
      }
    },
    policyActionList: {
      sqsNormalPolicy:
        process.env.LIST_SQS_NORMAL_ROLE_IN_IAM ||
        'sqs:SendMessage,sqs:ReceiveMessage,sqs:DeleteMessage,sqs:GetQueueAttributes,sqs:ListQueues',
      sqsSidePolicy: process.env.LIST_SQS_SIDE_ROLE_IN_IAM || 'sqs:SendMessage,sqs:ListQueues',
      dynamoRoleList:
        process.env.LIST_DYNAMO_ROLE_IN_IAM ||
        '["dynamodb:PutItem", "dynamodb:GetItem", "dynamodb:UpdateItem"]',
      s3RoleList: process.env.LIST_S3_ROLE_IN_IAM || 's3:PutObject,s3:GetObject',
    },
    policyStatement: {
      actionList:
        process.env.LIST_POLICY_STATEMENT_ACTION_LIST ||
        'sqs:SendMessage,sqs:ReceiveMessage,sqs:DeleteMessage,sqs:GetQueueAttributes,sqs:ListQueues',
      resourceList: 'queue/deadLetter',
    },
    constants: {
      API_GATE_WAY_ID: process.env.API_GATE_WAY_ID || 'LinhClassApiGateway',
      MAIN_QUEUE_NAME: process.env.MAIN_QUEUE_NAME || 'main',
      BATCH_FUNCTION_NAME: process.env.BATCH_FUNCTION_NAME || 'getBatchIdUpdateStatusToUploadedIdLambda',
      URL_FUNCTION_NAME: process.env.CSV_FUNCTION_NAME || 'createPresignedUrlLambda',
      CSV_FUNCTION_NAME: process.env.CSV_FUNCTION_NAME || 'getCsvReadDetailUpdateInProcessingLambda',
    },
  },
};
