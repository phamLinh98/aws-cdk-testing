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
      'grantReadWriteData',
      createPresignedUrlLambda,
    );

    const getStatusFromDynamoDBLambda = createNewLambdaFunction(
      this,
      'GetStatusFromDynamoDBLambda',
      'get-status-from-dynamodb-lambda',
      './src/rebuild/get-status',
      'get-status-from-dynamodb-lambda.mjs',
      'get-status-from-dynamodb-lambda.handler',
    );

    // getStatusFromDynamoDBLambda can read and write dynamoDb
    grantServiceListServiceReadWriteAnService(
      listTableInDynamoDB,
      'grantReadWriteData',
      getStatusFromDynamoDBLambda,
    );

    //TODO: create a new lambda function name get-batchid-update-status-to-uploaded get source from src/rebuild/get-batchid-uploaded
    const getBatchIdUpdateStatusToUploadedLambda = createNewLambdaFunction(
      this,
      'GetBatchIdUpdateStatusToUploadedLambda',
      'get-batchid-update-status-to-uploaded',
      './src/rebuild/get-batchid-uploaded',
      'get-batchid-update-status-to-uploaded.mjs',
      'get-batchid-update-status-to-uploaded.handler',
    );

    //TODO: getBatchIdUpdateStatusToUploadedLambda can read and write dynamoDb
    grantServiceListServiceReadWriteAnService(
      listTableInDynamoDB,
      'grantReadWriteData',
      getBatchIdUpdateStatusToUploadedLambda,
    );

    //TODO: create a new lambda function name get-csv-read-detail-update-inprocessing-lambda get source from src/rebuild/get-batchid-uploaded
    const getCsvReadDetailUpdateInProcessingLambda = createNewLambdaFunction(
      this,
      'GetCsvReadDetailUpdateInProcessingLambda',
      'get-csv-read-detail-update-inprocessing-lambda',
      './src/rebuild/get-csv-read-detail',
      'get-csv-read-detail-update-inprocessing-lambda.mjs',
      'get-csv-read-detail-update-inprocessing-lambda.handler',
    );
    grantServiceListServiceReadWriteAnService(
      listTableInDynamoDB,
      'grantReadWriteData',
      getCsvReadDetailUpdateInProcessingLambda,
    );

    //TODO: Add policy IAM to Lambda function to access SQS
    const listSqsRoleInIAM = [
      'sqs:SendMessage',
      'sqs:ReceiveMessage',
      'sqs:DeleteMessage',
      'sqs:GetQueueAttributes',
      'sqs:ListQueues',
    ];
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
      'addToRolePolicy',
      listQueuesPolicy,
    );
    grantServiceListServiceReadWriteAnService(listLambdaFunction, 'addToRolePolicy', sqsPolicy);
    grantServiceAnServiceReadWriteAListService(mainQueue, 'grantSendMessages', listLambdaFunction);

    // Add Policy to lambda function to access DynamoDB
    const listDynamoRoleInIAM = ['dynamodb:PutItem', 'dynamodb:GetItem', 'dynamodb:UpdateItem'];
    const dynamoDbArn = [usersTable.tableArn, uploadCsvTable.tableArn];
    const dynamoDbPolicy = settingNewPolicy(listDynamoRoleInIAM, dynamoDbArn);
    grantServiceListServiceReadWriteAnService(
      listLambdaFunction,
      'addToRolePolicy',
      dynamoDbPolicy,
    );
    grantServiceAnServiceReadWriteAListService(
      usersTable,
      'grantReadWriteData',
      listLambdaFunction,
    );
    grantServiceAnServiceReadWriteAListService(
      uploadCsvTable,
      'grantReadWriteData',
      listLambdaFunction,
    );

    //TODO: adding connect role to lambda function to access S3
    grantServiceAnServiceReadWriteAListService(csvBucket, 'grantReadWrite', listLambdaFunction);
    // grantServiceAnServiceReadWriteAListService(bucketAvatarS3, 'grantReadWrite', listLambdaFunction);

    // Add policy to Lambda function to access S3 bucket
    const listS3RoleInIAM = ['s3:PutObject', 's3:GetObject'];
    const s3Arn = [csvBucket.bucketArn + '/*'];
    const s3Policy = settingNewPolicy(listS3RoleInIAM, s3Arn);
    grantServiceListServiceReadWriteAnService(listLambdaFunction, 'addToRolePolicy', s3Policy);

    //TODO: SQS trigger Lambda getCsvReadDetailUpdateInProcessingLambda
    const queueSQSTrigger = settingSqsBatchSizeCurrentcy(mainQueue, 10, 5);
    getCsvReadDetailUpdateInProcessingLambda.addEventSource(queueSQSTrigger);

    //TODO: Lambda getBatchIdUpdateStatusToUploadedLambda triggered by S3 csvBucket when a new file is uploaded
    const bucketCsvS3Notification = settingS3Notification(csvBucket, '.csv');
    getBatchIdUpdateStatusToUploadedLambda.addEventSource(bucketCsvS3Notification);

    //TODO: Create an API Gateway name linhclass-api-gateway
    const apiName = settingApiGatewayRoleCors(this, 'LinhClassApiGateway');

    //TODO: GET get-url endpoint calling createPresignedUrlLambda
    const getUrlIntegration = setupApiGatewayForLambdaFn(createPresignedUrlLambda);
    apiName.root.addResource('get-url').addMethod('GET', getUrlIntegration);

    //TODO: GET get-status endpoint calling getStatusFromDynamoDBLambda
    const getStatusIntegration = setupApiGatewayForLambdaFn(getStatusFromDynamoDBLambda);
    apiName.root.addResource('get-status').addMethod('GET', getStatusIntegration);

    //TODO setting secretManager for all lambda function using secret
    grantServiceAnServiceReadWriteAListService(secret, 'grantRead', listLambdaFunction);
  }
}
