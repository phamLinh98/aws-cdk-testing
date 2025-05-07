import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { envConfig } from './config/env';
import {
  createNewBucketS3,
  createNewDeadLetterQueue,
  createNewLambdaFunction,
  createNewSQS,
  createNewTableDynamoDB,
  grantServiceAnServiceReadWriteAListService,
  grantServiceListServiceReadWriteAnService,
  settingApiGatewayRoleCors,
  settingNewPolicy,
  settingS3Notification,
  settingSqsBatchSizeCurrentcy,
  setupApiGatewayForLambdaFn,
} from './custom-constracts/csv-upload-resources';

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const env = envConfig.aws;

    const secret = cdk.aws_secretsmanager.Secret.fromSecretNameV2(
      this,
      env.secretName,
      env.secretName,
    );

    const csvBucket = createNewBucketS3(this, env.csvBucket.idBucket, env.csvBucket.bucketName);

    const deadLetterQueue = createNewDeadLetterQueue(
      this,
      env.deadLetterQueue.idQueue,
      env.deadLetterQueue.queueName,
      +env.deadLetterQueue.maxTime,
    );
    const mainQueue = createNewSQS(
      this,
      env.mainQueue.idQueue,
      env.mainQueue.queueName,
      +env.mainQueue.maxTime,
      +env.mainQueue.visibilityTimeout,
      deadLetterQueue,
      +env.mainQueue.maxReceiveCount,
    );

    const usersTable = createNewTableDynamoDB(
      this,
      env.usersTable.idTable,
      env.usersTable.tableName,
    );
    const uploadCsvTable = createNewTableDynamoDB(
      this,
      env.uploadCsvTable.idTable,
      env.uploadCsvTable.tableName,
    );

    const BUILD_PATH = envConfig.buildPath;
    const CREATE_PRESIGNED_URL_LAMBDA_INFO = {
      path: BUILD_PATH + '/create-preurl',
      excludeFunction: 'create-preurl-s3-update-status-uploading-lambda.mjs',
      lambdaHander: 'create-preurl-s3-update-status-uploading-lambda.handler',
    };
    const createPresignedUrlLambda = createNewLambdaFunction(
      this,
      env.createPresignedUrlLambda.idLambda,
      env.createPresignedUrlLambda.lambdaName,
      CREATE_PRESIGNED_URL_LAMBDA_INFO.path,
      CREATE_PRESIGNED_URL_LAMBDA_INFO.excludeFunction,
      CREATE_PRESIGNED_URL_LAMBDA_INFO.lambdaHander,
    );

    //TODO: create role for lambda function createPresignedUrlLambda to access s3 and dynamoDB
    const listTableInDynamoDB = [usersTable, uploadCsvTable];
    grantServiceListServiceReadWriteAnService(
      listTableInDynamoDB,
      env.grantRole.readWriteData,
      createPresignedUrlLambda,
    );

    const GET_STATUS_FROM_DYNAMODB = {
      path: BUILD_PATH + '/get-status',
      excludeFunction: 'get-status-from-dynamodb-lambda.mjs',
      lambdaHander: 'get-status-from-dynamodb-lambda.handler',
    };
    const getStatusFromDynamoDBLambda = createNewLambdaFunction(
      this,
      env.getStatusFromDynamoDBLambda.idLambda,
      env.getStatusFromDynamoDBLambda.lambdaName,
      GET_STATUS_FROM_DYNAMODB.path,
      GET_STATUS_FROM_DYNAMODB.excludeFunction,
      GET_STATUS_FROM_DYNAMODB.lambdaHander,
    );

    // getStatusFromDynamoDBLambda can read and write dynamoDb
    grantServiceListServiceReadWriteAnService(
      listTableInDynamoDB,
      env.grantRole.readWriteData,
      getStatusFromDynamoDBLambda,
    );

    //TODO: create a new lambda function name get-batchid-update-status-to-uploaded get source from src/rebuild/get-batchid-uploaded
    const GET_BATCH_ID_UPDATE_STATUS_TO_UPLOADED = {
      path: BUILD_PATH + '/get-batchid-uploaded',
      excludeFunction: 'get-batchid-update-status-to-uploaded.mjs',
      lambdaHander: 'get-batchid-update-status-to-uploaded.handler',
    };
    const getBatchIdUpdateStatusToUploadedLambda = createNewLambdaFunction(
      this,
      env.getBatchIdUpdateStatusToUploadedIdLambda.idLambda,
      env.getBatchIdUpdateStatusToUploadedIdLambda.lambdaName,
      GET_BATCH_ID_UPDATE_STATUS_TO_UPLOADED.path,
      GET_BATCH_ID_UPDATE_STATUS_TO_UPLOADED.excludeFunction,
      GET_BATCH_ID_UPDATE_STATUS_TO_UPLOADED.lambdaHander,
    );

    //TODO: getBatchIdUpdateStatusToUploadedLambda can read and write dynamoDb
    grantServiceListServiceReadWriteAnService(
      listTableInDynamoDB,
      env.grantRole.readWriteData,
      getBatchIdUpdateStatusToUploadedLambda,
    );

    //TODO: create a new lambda function name get-csv-read-detail-update-inprocessing-lambda get source from src/rebuild/get-batchid-uploaded
    const GET_CSV_READ_DETAIL_UPDATE_IN_PROCESSING_LAMBDA = {
      path: BUILD_PATH + '/get-csv-read-detail',
      excludeFunction: 'get-csv-read-detail-update-inprocessing-lambda.mjs',
      lambdaHander: 'get-csv-read-detail-update-inprocessing-lambda.handler',
    };
    // 'GetCsvReadDetailUpdateInProcessingLambda',
    //   'get-csv-read-detail-update-inprocessing-lambda',
    //   './src/rebuild/get-csv-read-detail',
    //   'get-csv-read-detail-update-inprocessing-lambda.mjs',
    //   'get-csv-read-detail-update-inprocessing-lambda.handler',
    const getCsvReadDetailUpdateInProcessingLambda = createNewLambdaFunction(
      this,
      env.getCsvReadDetailUpdateInProcessingLambda.idLambda,
      env.getCsvReadDetailUpdateInProcessingLambda.lambdaName,
      GET_CSV_READ_DETAIL_UPDATE_IN_PROCESSING_LAMBDA.path,
      GET_CSV_READ_DETAIL_UPDATE_IN_PROCESSING_LAMBDA.excludeFunction,
      GET_CSV_READ_DETAIL_UPDATE_IN_PROCESSING_LAMBDA.lambdaHander,
    );
    grantServiceListServiceReadWriteAnService(
      listTableInDynamoDB,
      env.grantRole.readWriteData,
      getCsvReadDetailUpdateInProcessingLambda,
    );

    //TODO: Add policy IAM to Lambda function to access SQS
    // 'sqs:SendMessage',
    // 'sqs:ReceiveMessage',
    // 'sqs:DeleteMessage',
    // 'sqs:GetQueueAttributes',
    // 'sqs:ListQueues',
    const listSqsRoleInIAM = JSON.parse(env.listRoleInIAM.sqsRoleList);
    const sqsArn = [mainQueue.queueArn];
    const sqsPolicy = settingNewPolicy(listSqsRoleInIAM, sqsArn);

    //TODO Add a separate policy for ListQueues as it applies to all queues in the account
    const sqsListRoleInIAM = ['*'];
    const listQueuesPolicy = settingNewPolicy(sqsListRoleInIAM, sqsListRoleInIAM);
    const listLambdaFunction = [
      createPresignedUrlLambda,
      getStatusFromDynamoDBLambda,
      getBatchIdUpdateStatusToUploadedLambda,
      getCsvReadDetailUpdateInProcessingLambda,
    ];

    grantServiceListServiceReadWriteAnService(
      listLambdaFunction,
      env.grantRole.addToRolePolicy,
      listQueuesPolicy,
    );
    grantServiceListServiceReadWriteAnService(
      listLambdaFunction,
      env.grantRole.addToRolePolicy,
      sqsPolicy,
    );
    grantServiceAnServiceReadWriteAListService(
      mainQueue,
      env.grantRole.grantSendMessages,
      listLambdaFunction,
    );

    // Add Policy to lambda function to access DynamoDB
    // dynamodb:PutItem', 
    // 'dynamodb:GetItem', 
    // 'dynamodb:UpdateItem'
    const listDynamoRoleInIAM = JSON.parse(env.listRoleInIAM.dynamoRoleList);
    const dynamoDbArn = [usersTable.tableArn, uploadCsvTable.tableArn];
    const dynamoDbPolicy = settingNewPolicy(listDynamoRoleInIAM, dynamoDbArn);
    grantServiceListServiceReadWriteAnService(
      listLambdaFunction,
      env.grantRole.addToRolePolicy,
      dynamoDbPolicy,
    );
    grantServiceAnServiceReadWriteAListService(
      usersTable,
      env.grantRole.readWriteData,
      listLambdaFunction,
    );
    grantServiceAnServiceReadWriteAListService(
      uploadCsvTable,
      env.grantRole.readWriteData,
      listLambdaFunction,
    );

    //TODO: adding connect role to lambda function to access S3
    grantServiceAnServiceReadWriteAListService(
      csvBucket,
      env.grantRole.grantReadWrite,
      listLambdaFunction,
    );
    // grantServiceAnServiceReadWriteAListService(bucketAvatarS3, 'grantReadWrite', listLambdaFunction);

    // Add policy to Lambda function to access S3 bucket
    // s3:PutObject', 
    // 's3:GetObject'
    const listS3RoleInIAM = JSON.parse(env.listRoleInIAM.s3RoleList);
    const s3Arn = [csvBucket.bucketArn + '/*'];
    const s3Policy = settingNewPolicy(listS3RoleInIAM, s3Arn);
    grantServiceListServiceReadWriteAnService(
      listLambdaFunction,
      env.grantRole.addToRolePolicy,
      s3Policy,
    );

    //TODO: SQS trigger Lambda getCsvReadDetailUpdateInProcessingLambda
    const queueSQSTrigger = settingSqsBatchSizeCurrentcy(
      mainQueue,
      +env.mainQueue.batchSize,
      +env.mainQueue.maxCurrency,
    );
    getCsvReadDetailUpdateInProcessingLambda.addEventSource(queueSQSTrigger);

    //TODO: Lambda getBatchIdUpdateStatusToUploadedLambda triggered by S3 csvBucket when a new file is uploaded
    const bucketCsvS3Notification = settingS3Notification(csvBucket, '.csv');
    getBatchIdUpdateStatusToUploadedLambda.addEventSource(bucketCsvS3Notification);

    //TODO: Create an API Gateway name linhclass-api-gateway
    const apiName = settingApiGatewayRoleCors(this, env.apiGateway.idLambda);

    //TODO: GET get-url endpoint calling createPresignedUrlLambda
    const getUrlIntegration = setupApiGatewayForLambdaFn(createPresignedUrlLambda);
    apiName.root.addResource('get-url').addMethod('GET', getUrlIntegration);

    //TODO: GET get-status endpoint calling getStatusFromDynamoDBLambda
    const getStatusIntegration = setupApiGatewayForLambdaFn(getStatusFromDynamoDBLambda);
    apiName.root.addResource('get-status').addMethod('GET', getStatusIntegration);

    //TODO setting secretManager for all lambda function using secret
    grantServiceAnServiceReadWriteAListService(secret, env.grantRole.grandRead, listLambdaFunction);
  }
}
