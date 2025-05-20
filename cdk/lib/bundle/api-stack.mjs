// lib/api-stack.ts
import * as cdk6 from "aws-cdk-lib";

// lib/config/env.ts
var envConfig = {
  nodeEnv: process.env.NODE_ENV || "Debug",
  corsOrigin: process.env.CORS_ORIGIN || "*",
  buildPath: process.env.BUILD_PATH || "./src/rebuild",
  local: process.env.CORS_ORIGIN || "http://localhost:5173",
  // AWS configuration
  aws: {
    // Common AWS configuration
    region: process.env.AWS_REGION || "ap-southeast-1",
    grantRole: {
      grandRead: process.env.GRANT_READ || "grantRead",
      grantReadWrite: process.env.GRANT_READ_WRITE || "grantReadWrite",
      readWriteData: process.env.GRANT_READ_WRITE_DATA || "grantReadWriteData",
      addToRolePolicy: process.env.ADD_TO_ROLE_POLICY || "addToRolePolicy",
      grantSendMessages: process.env.GRANT_SEND_MESSAGES || "grantSendMessages"
    },
    secretName: process.env.AWS_SCRET_NAME || "HitoEnvSecret",
    s3: {
      csvBucket: {
        idBucket: process.env.AWS_CSV_ID_BUCKET || "LinhClassCsvBucket1",
        bucketName: process.env.AWS_CSV_BUCKET_NAME || "linhclass-csv-bucket",
        triggerLambda: process.env.AWS_CSV_TRIGGER_LAMBDA || 1,
        s3RoleList: process.env.LIST_S3_ROLE_IN_IAM || "s3:PutObject,s3:GetObject"
      },
      // S3 Image bucket configuration
      imageBucket: {
        idBucket: process.env.AWS_MAGE_ID_BUCKET || "LinhClassImageBucket1",
        bucketName: process.env.AWS_IMAGE_BUCKET_NAME || "linhclass-avatar-bucket",
        triggerLambda: process.env.AWS_IMAGE_TRIGGER_LAMBDA || 0,
        s3RoleList: process.env.LIST_S3_ROLE_IN_IAM || "s3:PutObject,s3:GetObject"
      }
    },
    // SQS configuration
    queue: {
      deadLetter: {
        idQueue: process.env.AWS_DEAD_LTTER_ID_QUEUE || "LinhClassDeadLetterQueue",
        queueName: process.env.AWS_DEAD_LTTER_QUEUE_NAME || "linhclass-dead-letter-queue",
        maxTime: process.env.AWS_DEAD_LETTER_QUEUE_MAX_TIME || 14,
        isDeadLeterQueue: process.env.AWS_DEAD_LETTER_IS_DELETE || 1
      },
      sideDeadLetter: {
        idQueue: process.env.AWS_SIDE_DEAD_LTTER_ID_QUEUE || "LinhClassSideDeadLetterQueue",
        queueName: process.env.AWS_SIDE_DEAD_LTTER_QUEUE_NAME || "linhclass-side-dead-letter-queue",
        maxTime: process.env.AWS_SIDE_DEAD_LETTER_QUEUE_MAX_TIME || 14,
        isDeadLeterQueue: process.env.AWS_SIDE_DEAD_LETTER_IS_DELETE || 1
      },
      main: {
        idQueue: process.env.AWS_MAIN_ID_QUEUE || "LinhClassMainQueue",
        queueName: process.env.AWS_MAIN_QUEUE_NAME || "linhclass-lambda-call-to-queue",
        maxTime: process.env.AWS_MAIN_QUEUE_MAX_TIME || 14,
        visibilityTimeout: process.env.AWS_MAIN_QUEUE_VISIBILITY_TIMEOUT || 30,
        maxReceiveCount: process.env.AWS_MAIN_MAX_RETRIES || 5,
        batchSize: process.env.AWS_BATCH_SIZE || 10,
        maxCurrency: process.env.AWS_MAX_CURRENTCY || 5,
        isDeadLeterQueue: process.env.AWS_DEAD_LETTER_IS_DELETE || 0,
        deadLetterQueueName: "deadLetter",
        deadQueue: {
          idQueue: process.env.AWS_DEAD_LTTER_ID_QUEUE || "LinhClassDeadLetterQueue",
          queueName: process.env.AWS_DEAD_LTTER_QUEUE_NAME || "linhclass-dead-letter-queue",
          maxTime: process.env.AWS_DEAD_LETTER_QUEUE_MAX_TIME || 14,
          isDeadLeterQueue: process.env.AWS_DEAD_LETTER_IS_DELETE || 1
        },
        policyActionList: "sqsNormalPolicy"
      },
      side: {
        idQueue: process.env.AWS_SIDE_ID_QUEUE || "LinhClassSideQueue",
        queueName: process.env.AWS_SIDE_QUEUE_NAME || "linhclass-side-queue",
        maxTime: process.env.AWS_SIDE_QUEUE_MAX_TIME || 14,
        visibilityTimeout: process.env.AWS_SIDE_QUEUE_VISIBILITY_TIMEOUT || 30,
        maxReceiveCount: process.env.AWS_SIDE_MAX_RETRIES || 5,
        batchSize: process.env.AWS_SIDE_BATCH_SIZE || 10,
        maxCurrency: process.env.AWS_SIDE_MAX_CURRENTCY || 5,
        isDeadLeterQueue: process.env.AWS_SIDE_DEAD_LETTER_IS_DELETE || 0,
        policyActionList: "sqsSidePolicy"
      },
      take2: {
        idQueue: process.env.AWS_TAKE_2_ID_QUEUE || "LinhClassTake2Queue",
        queueName: process.env.AWS_TAKE_2_QUEUE_NAME || "linhclass-take-2-queue",
        maxTime: process.env.AWS_TAKE_2_QUEUE_MAX_TIME || 14,
        visibilityTimeout: process.env.AWS_TAKE_2_QUEUE_VISIBILITY_TIMEOUT || 30,
        maxReceiveCount: process.env.AWS_TAKE_2_MAX_RETRIES || 5,
        batchSize: process.env.AWS_TAKE_2_BATCH_SIZE || 10,
        maxCurrency: process.env.AWS_TAKE_2_MAX_CURRENTCY || 5,
        isDeadLeterQueue: process.env.AWS_TAKE_2_DEAD_LETTER_IS_DELETE || 0
      },
      fuku: {
        idQueue: process.env.AWS_FUKU_ID_QUEUE || "linhclass-fuku-queue",
        queueName: process.env.AWS_FUKU_QUEUE_NAME || "linhclass-fuku-queue"
      }
    },
    // DynamoDB table names
    table: {
      usersTable: {
        idTable: process.env.AWS_USERS_ID_TABLE || "UsersTable",
        tableName: process.env.AWS_USERS_TABLE_NAME || "users",
        tableArn: "arn:aws:dynamodb:ap-northeast-1:650251698778:table/users"
      },
      uploadCsvTable: {
        idTable: process.env.AWS_UPLOAD_CSV_ID_TABLE || "UploadCsvTable",
        tableName: process.env.AWS_UPLOAD_CSV_TABLE_NAME || "upload-csv",
        tableArn: "arn:aws:dynamodb:ap-northeast-1:650251698778:table/upload-csv"
      }
    },
    // Lambda function configuration
    lambda: {
      createPresignedUrlLambda: {
        idLambda: process.env.AWS_CREATE_PRESIGNED_URL_ID_LAMBDA || "CreatePresignedUrlLambda",
        lambdaName: process.env.AWS_CREATE_PRESIGNED_URL_LAMBDA_NAME || "create-presigned-url-uploading-lambda",
        triggerSQS: false,
        triggerS3: true,
        createAPI: true,
        path: "./src/rebuild/create-preurl",
        excludeFunction: "create-preurl-s3-update-status-uploading-lambda.mjs",
        lambdaHander: "create-preurl-s3-update-status-uploading-lambda.handler"
      },
      getStatusFromDynamoDBLambda: {
        idLambda: process.env.AWS_GET_STATUS_FROM_DYNAMODB_ID_LAMBDA || "GetStatusFromDynamoDBLambda",
        lambdaName: process.env.AWS_GET_STATUS_FROM_DYNAMODB_LAMBDA_NAME || "get-status-from-dynamodb-lambda",
        triggerSQS: false,
        triggerS3: false,
        createAPI: true,
        path: "./src/rebuild/get-status",
        excludeFunction: "get-status-from-dynamodb-lambda.mjs",
        lambdaHander: "get-status-from-dynamodb-lambda.handler"
      },
      getBatchIdUpdateStatusToUploadedIdLambda: {
        idLambda: process.env.AWS_GET_BATCH_ID_UPDATE_STATUS_TO_UPLOADED_ID_LAMBDA || "GetBatchIdUpdateStatusToUploadedIdLambda",
        lambdaName: process.env.AWS_GET_BATCH_ID_UPDATE_STATUS_TO_UPLOADED_ID_LAMBDA_NAME || "get-batch-id-update-status-to-uploaded",
        triggerSQS: false,
        triggerS3: true,
        createAPI: false,
        path: "./src/rebuild/get-batchid-uploaded",
        excludeFunction: "get-batchid-update-status-to-uploaded.mjs",
        lambdaHander: "get-batchid-update-status-to-uploaded.handler"
      },
      getCsvReadDetailUpdateInProcessingLambda: {
        idLambda: process.env.AWS_GET_CSV_READ_DETAIL_UPDATE_IN_PROCESSING_LAMBDA || "GetCsvReadDetailUpdateInProcessingLambda",
        lambdaName: process.env.AWS_GET_CSV_READ_DETAIL_UPDATE_IN_PROCESSING_LAMBDA_NAME || "get-csv-read-detail-update-inprocessing-lambda",
        triggerSQS: true,
        triggerS3: false,
        createAPI: false,
        path: "./src/rebuild/get-csv-read-detail",
        excludeFunction: "get-csv-read-detail-update-inprocessing-lambda.mjs",
        lambdaHander: "get-csv-read-detail-update-inprocessing-lambda.handler"
      }
    },
    apiGateway: {
      createPresignedUrlLambda: {
        api: "get-url",
        method: "GET"
      },
      getStatusFromDynamoDBLambda: {
        api: "get-status",
        method: "GET"
      }
    },
    policyActionList: {
      sqsNormalPolicy: process.env.LIST_SQS_NORMAL_ROLE_IN_IAM || "sqs:SendMessage,sqs:ReceiveMessage,sqs:DeleteMessage,sqs:GetQueueAttributes,sqs:ListQueues",
      sqsSidePolicy: process.env.LIST_SQS_SIDE_ROLE_IN_IAM || "sqs:SendMessage,sqs:ListQueues",
      dynamoRoleList: process.env.LIST_DYNAMO_ROLE_IN_IAM || '["dynamodb:PutItem", "dynamodb:GetItem", "dynamodb:UpdateItem"]',
      s3RoleList: process.env.LIST_S3_ROLE_IN_IAM || "s3:PutObject,s3:GetObject"
    },
    policyStatement: {
      actionList: process.env.LIST_POLICY_STATEMENT_ACTION_LIST || "sqs:SendMessage,sqs:ReceiveMessage,sqs:DeleteMessage,sqs:GetQueueAttributes,sqs:ListQueues",
      resourceList: "queue/deadLetter"
    },
    constants: {
      API_GATE_WAY_ID: process.env.API_GATE_WAY_ID || "LinhClassApiGateway",
      MAIN_QUEUE_NAME: process.env.MAIN_QUEUE_NAME || "main",
      BATCH_FUNCTION_NAME: process.env.BATCH_FUNCTION_NAME || "getBatchIdUpdateStatusToUploadedIdLambda",
      URL_FUNCTION_NAME: process.env.CSV_FUNCTION_NAME || "createPresignedUrlLambda",
      CSV_FUNCTION_NAME: process.env.CSV_FUNCTION_NAME || "getCsvReadDetailUpdateInProcessingLambda"
    }
  }
};

// lib/custom-constracts/csv-upload-resources.ts
import * as cdk2 from "aws-cdk-lib";

// utils/cors.ts
import * as cdk from "aws-cdk-lib";
var configCors = (domain) => {
  return [
    {
      allowedHeaders: ["Content-Type", "Authorization"],
      allowedMethods: [
        cdk.aws_s3.HttpMethods.GET,
        cdk.aws_s3.HttpMethods.PUT,
        cdk.aws_s3.HttpMethods.POST,
        cdk.aws_s3.HttpMethods.DELETE,
        cdk.aws_s3.HttpMethods.HEAD
      ],
      allowedOrigins: [domain],
      exposedHeaders: ["ETag"]
    }
  ];
};
var configCorsApiGateway = (domain, allowsHeadList) => {
  return {
    allowOrigins: [domain],
    allowMethods: cdk.aws_apigateway.Cors.ALL_METHODS,
    allowHeaders: allowsHeadList,
    allowCredentials: true
  };
};

// lib/custom-constracts/csv-upload-resources.ts
function createNewBucketS3(scope, idBucket, bucketName) {
  return new cdk2.aws_s3.Bucket(scope, idBucket, {
    bucketName,
    versioned: true,
    removalPolicy: cdk2.RemovalPolicy.DESTROY,
    cors: configCors(envConfig.corsOrigin)
  });
}
function createNewSQS(scope, idQueue, queueName, maxTime, visibilityTimeout = 30, deadLetterQueue = void 0, maxReceiveCount = 5, ...props) {
  return new cdk2.aws_sqs.Queue(scope, idQueue, {
    queueName,
    // the name of the queue
    retentionPeriod: cdk2.Duration.days(maxTime),
    // the time that a message is retained in the queue
    visibilityTimeout: cdk2.Duration.seconds(visibilityTimeout),
    // the time that a message is invisible to other consumers after being received
    // TODO: Check this
    deadLetterQueue: deadLetterQueue ? {
      queue: deadLetterQueue,
      // Reference the dead-letter queue object
      maxReceiveCount
      // the maximum number of times a message can be received before being sent to the dead-letter queue
    } : void 0,
    // the dead letter queue
    ...props
  });
}
function createNewDeadLetterQueue(scope, idQueue, queueName, maxTime) {
  return new cdk2.aws_sqs.Queue(scope, idQueue, {
    queueName,
    retentionPeriod: cdk2.Duration.days(maxTime)
  });
}
function settingSqsEventSource(queueName, batchSize, maxConcurrency) {
  return new cdk2.aws_lambda_event_sources.SqsEventSource(queueName, {
    batchSize,
    maxConcurrency
  });
}
function settingNewPolicy(actionList, queueArn) {
  return new cdk2.aws_iam.PolicyStatement({
    actions: actionList,
    resources: queueArn
  });
}
function createNewTableDynamoDB(scope, idTable, tableName) {
  return new cdk2.aws_dynamodb.Table(scope, idTable, {
    tableName,
    partitionKey: { name: "id", type: cdk2.aws_dynamodb.AttributeType.STRING },
    removalPolicy: cdk2.RemovalPolicy.DESTROY
  });
}
function createNewLambdaFunction(scope, idLambda, lambdaName, path, excludeFunction, lambdaHander) {
  return new cdk2.aws_lambda.Function(scope, idLambda, {
    functionName: lambdaName,
    runtime: cdk2.aws_lambda.Runtime.NODEJS_18_X,
    code: cdk2.aws_lambda.Code.fromAsset(path, {
      exclude: ["**", `!${excludeFunction}`]
    }),
    handler: lambdaHander
  });
}
function grantServiceListServiceReadWriteAnService(listService, policy, service) {
  return listService.forEach((list) => {
    list[policy](service);
  });
}
function grantServiceAnServiceReadWriteAListService(service, policy, ListService) {
  return ListService.forEach((list) => {
    service[policy](list);
  });
}
function settingS3Notification(bucketName, filterFile) {
  return new cdk2.aws_lambda_event_sources.S3EventSource(bucketName, {
    events: [cdk2.aws_s3.EventType.OBJECT_CREATED],
    filters: [{ suffix: filterFile }]
  });
}
function settingApiGatewayRoleCors(scope, apiGatewayName) {
  return new cdk2.aws_apigateway.RestApi(scope, apiGatewayName, {
    restApiName: apiGatewayName,
    defaultCorsPreflightOptions: configCorsApiGateway(envConfig.local, [
      "Content-Type",
      "Authorization",
      "X-Api-Key"
    ])
  });
}
function setupApiGatewayForLambdaFn(lambdaFunc) {
  return new cdk2.aws_apigateway.LambdaIntegration(lambdaFunc);
}

// lib/src/api-gateway-setup.ts
var apiGatewaySetup = (scope, env, lamda) => {
  const envApiGateway = env.apiGateway;
  const apiName = settingApiGatewayRoleCors(scope, env.constants.API_GATE_WAY_ID);
  for (const key of Object.keys(envApiGateway)) {
    const apiInfo = envApiGateway[key];
    const integration = setupApiGatewayForLambdaFn(lamda[key].lambda);
    const resource = apiName.root.addResource(apiInfo.api);
    resource.addMethod(apiInfo.method, integration);
  }
};

// lib/src/dynamodb-setup.ts
import * as cdk3 from "aws-cdk-lib";
var dynamoDBSetup = (scope, env) => {
  const envDynamoDB = env.table;
  const result = {};
  for (const key of Object.keys(envDynamoDB)) {
    const tableInfo = envDynamoDB[key];
    const dynamoDBSetupItem = {};
    dynamoDBSetupItem.table = createNewTableDynamoDB(scope, tableInfo.idTable, tableInfo.tableName);
    dynamoDBSetupItem.policy = settingNewPolicy(
      JSON.parse(envConfig.aws.policyActionList.dynamoRoleList),
      [dynamoDBSetupItem.table.tableArn]
    );
    dynamoDBSetupItem.table.applyRemovalPolicy(cdk3.RemovalPolicy.DESTROY);
    result[key] = dynamoDBSetupItem;
  }
  return result;
};

// lib/src/lambda-setup.ts
var lambdaListSetup = (scope, env) => {
  const envLambda = env.lambda;
  const result = {};
  for (const key of Object.keys(envLambda)) {
    const lambdaInfo = envLambda[key];
    const lambdaSetupItem = {};
    lambdaSetupItem.lambda = createNewLambdaFunction(
      scope,
      lambdaInfo.idLambda,
      lambdaInfo.lambdaName,
      lambdaInfo.path,
      lambdaInfo.excludeFunction,
      lambdaInfo.lambdaHander
    );
    result[key] = lambdaSetupItem;
  }
  return result;
};
var lambdaAddEventSource = (lambdaFunc, eventSource) => {
  lambdaFunc.addEventSource(eventSource);
};

// lib/src/role-setup.ts
var roleSetup = (lambdaSetUp, sqsSetup2, dynamoDBSetup2, s3Setup2, secret) => {
  const env = envConfig.aws;
  const lambdaList = Object.keys(lambdaSetUp).map((key) => {
    return lambdaSetUp[key].lambda;
  });
  const tableList = Object.keys(dynamoDBSetup2).map((key) => {
    return dynamoDBSetup2[key].table;
  });
  const policyListLambdaCanAccessDynamoDB = Object.keys(dynamoDBSetup2).map((key) => {
    return dynamoDBSetup2[key].policy;
  });
  const s3List = Object.keys(s3Setup2).map((key) => {
    return s3Setup2[key];
  });
  lambdaList.forEach((lambdaFunc) => {
    grantServiceListServiceReadWriteAnService(tableList, env.grantRole.readWriteData, lambdaFunc);
  });
  grantServiceListServiceReadWriteAnService(
    lambdaList,
    env.grantRole.addToRolePolicy,
    settingNewPolicy(["*"], ["*"])
  );
  const MAIN_QUEUE_NAME = env.constants.MAIN_QUEUE_NAME;
  grantServiceListServiceReadWriteAnService(
    lambdaList,
    env.grantRole.addToRolePolicy,
    sqsSetup2[MAIN_QUEUE_NAME].policy
  );
  policyListLambdaCanAccessDynamoDB.forEach((tablePolicy) => {
    grantServiceListServiceReadWriteAnService(
      lambdaList,
      env.grantRole.addToRolePolicy,
      tablePolicy
    );
  });
  s3List.forEach((s3SetupItem) => {
    grantServiceListServiceReadWriteAnService(
      lambdaList,
      env.grantRole.addToRolePolicy,
      s3SetupItem.policy
    );
    grantServiceAnServiceReadWriteAListService(
      s3SetupItem.bucket,
      env.grantRole.grantReadWrite,
      lambdaList
    );
  });
  grantServiceAnServiceReadWriteAListService(
    sqsSetup2[MAIN_QUEUE_NAME].queue,
    env.grantRole.grantSendMessages,
    lambdaList
  );
  tableList.forEach((table) => {
    grantServiceAnServiceReadWriteAListService(table, env.grantRole.readWriteData, lambdaList);
  });
  grantServiceAnServiceReadWriteAListService(secret, env.grantRole.grandRead, lambdaList);
  const CSV_FUNCTION_NAME = env.constants.CSV_FUNCTION_NAME;
  lambdaAddEventSource(
    lambdaSetUp[CSV_FUNCTION_NAME].lambda,
    sqsSetup2[MAIN_QUEUE_NAME].sqsEventSource
  );
};

// lib/src/s3-setup.ts
import * as cdk4 from "aws-cdk-lib";
var s3Setup = (scope, lambdaFunction) => {
  const envS3 = envConfig.aws.s3;
  const result = {};
  for (const key of Object.keys(envS3)) {
    const bucketInfo = envS3[key];
    const bucketSetupItem = {};
    bucketSetupItem.bucket = createNewBucketS3(scope, bucketInfo.idBucket, bucketInfo.bucketName);
    const s3Actions = envConfig.aws.policyActionList.s3RoleList.split(",");
    bucketSetupItem.policy = settingNewPolicy(s3Actions, [
      bucketSetupItem.bucket.arnForObjects("*")
    ]);
    bucketSetupItem.bucket.applyRemovalPolicy(cdk4.RemovalPolicy.DESTROY);
    const bucketS3Notification = settingS3Notification(bucketSetupItem.bucket, ".csv");
    lambdaFunction.addEventSource(bucketS3Notification);
    result[key] = bucketSetupItem;
  }
  return result;
};

// lib/src/secret-setup.ts
import * as cdk5 from "aws-cdk-lib";
var secretSetup = (scope, env) => {
  const secret = cdk5.aws_secretsmanager.Secret.fromSecretNameV2(
    scope,
    env.secretName,
    env.secretName
  );
  return { secret };
};

// lib/src/sqs-setup.ts
var sqsSetup = (scope, env) => {
  const envQueue = env.queue;
  const keys = Object.keys(envQueue).sort(
    (a, b) => +envQueue[a].isDeadLeterQueue - +envQueue[b].isDeadLeterQueue
  );
  const result = {};
  for (const key of keys) {
    const queueInfo = envQueue[key];
    const sqsSetupItem = {};
    switch (+queueInfo.isDeadLeterQueue) {
      case 0: {
        const dlq = queueInfo.deadLetterQueueName ? result[queueInfo.deadLetterQueueName]?.queue : void 0;
        sqsSetupItem.queue = createNewSQS(
          scope,
          queueInfo.idQueue,
          queueInfo.queueName,
          +(queueInfo.maxTime ?? 14),
          +(queueInfo.visibilityTimeout ?? 30),
          dlq,
          +(queueInfo.maxReceiveCount ?? 5)
        );
        break;
      }
      case 1:
      default: {
        sqsSetupItem.queue = createNewDeadLetterQueue(
          scope,
          queueInfo.idQueue,
          queueInfo.queueName,
          +(queueInfo.maxTime ?? 14)
        );
        break;
      }
    }
    const keyPolicy = queueInfo.policyActionList;
    const policyActionString = envConfig.aws.policyActionList[keyPolicy] || "";
    const policyActionList = policyActionString.split(",").map((item) => item.trim()).filter((action) => action.includes(":"));
    if (policyActionList.length) {
      sqsSetupItem.policy = settingNewPolicy(policyActionList, [sqsSetupItem.queue.queueArn]);
    }
    if (queueInfo.batchSize && queueInfo.maxCurrency) {
      sqsSetupItem.sqsEventSource = settingSqsEventSource(
        sqsSetupItem.queue,
        +queueInfo.batchSize,
        +queueInfo.maxCurrency
      );
    }
    result[key] = sqsSetupItem;
  }
  return result;
};

// lib/api-stack.ts
var ApiStack = class extends cdk6.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);
    const env = envConfig.aws;
    const { secret } = secretSetup(this, env);
    const queue = sqsSetup(this, env);
    const table = dynamoDBSetup(this, env);
    const lamda = lambdaListSetup(this, env);
    const s3 = s3Setup(this, lamda[env.constants.BATCH_FUNCTION_NAME].lambda);
    roleSetup(lamda, queue, table, s3, secret);
    apiGatewaySetup(this, env, lamda);
  }
};
export {
  ApiStack
};
