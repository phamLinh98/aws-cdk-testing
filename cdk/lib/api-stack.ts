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

    // Read Environment Variables
    const env = envConfig.aws;

    // Read Secret Manager
    const secret = cdk.aws_secretsmanager.Secret.fromSecretNameV2(
      this,
      env.secretName,
      env.secretName,
    );

    // Create S3 Bucket save csv file
    const csvBucket = createNewBucketS3(this, env.csvBucket.idBucket, env.csvBucket.bucketName);

    // Create S3 Bucket save image
    const imageBucket = createNewBucketS3(
      this,
      env.imageBucket.idBucket,
      env.imageBucket.bucketName,
    );

    // Create new SQS dead letter queue to save messages that failed to process
    const deadLetterQueue = createNewDeadLetterQueue(
      this,
      env.deadLetterQueue.idQueue,
      env.deadLetterQueue.queueName,
      +env.deadLetterQueue.maxTime,
    );

    // Create new SQS main queue save messages
    const mainQueue = createNewSQS(
      this,
      env.mainQueue.idQueue,
      env.mainQueue.queueName,
      +env.mainQueue.maxTime,
      +env.mainQueue.visibilityTimeout,
      deadLetterQueue,
      +env.mainQueue.maxReceiveCount,
    );

    // Create Users Table
    const usersTable = createNewTableDynamoDB(
      this,
      env.usersTable.idTable,
      env.usersTable.tableName,
    );

    // Create Upload CSV Table
    const uploadCsvTable = createNewTableDynamoDB(
      this,
      env.uploadCsvTable.idTable,
      env.uploadCsvTable.tableName,
    );

    // Path to Rebuild(bundle folder)
    const BUILD_PATH = envConfig.buildPath;

    // Create Lambda function to create presigned URL and update status to uploading
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

    // List of tables in DynamoDB
    const listTableInDynamoDB = [usersTable, uploadCsvTable];

    // Create Lambda function createPresignedUrlLambda can access list table in DynamoDB
    grantServiceListServiceReadWriteAnService(
      listTableInDynamoDB,
      env.grantRole.readWriteData,
      createPresignedUrlLambda,
    );

    // Create Lambda function getStatusFromDynamoDBLambda
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

    // Creare Role to Lambda function getStatusFromDynamoDBLambda can access list table in DynamoDB
    grantServiceListServiceReadWriteAnService(
      listTableInDynamoDB,
      env.grantRole.readWriteData,
      getStatusFromDynamoDBLambda,
    );

    // Create Lambda function getBatchIdUpdateStatusToUploadedLambda
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

    // Create Role to Lambda function getBatchIdUpdateStatusToUploadedLambda can access list table in DynamoDB
    grantServiceListServiceReadWriteAnService(
      listTableInDynamoDB,
      env.grantRole.readWriteData,
      getBatchIdUpdateStatusToUploadedLambda,
    );

    // Create Lambda function getCsvReadDetailUpdateInProcessingLambda
    const GET_CSV_READ_DETAIL_UPDATE_IN_PROCESSING_LAMBDA = {
      path: BUILD_PATH + '/get-csv-read-detail',
      excludeFunction: 'get-csv-read-detail-update-inprocessing-lambda.mjs',
      lambdaHander: 'get-csv-read-detail-update-inprocessing-lambda.handler',
    };

    const getCsvReadDetailUpdateInProcessingLambda = createNewLambdaFunction(
      this,
      env.getCsvReadDetailUpdateInProcessingLambda.idLambda,
      env.getCsvReadDetailUpdateInProcessingLambda.lambdaName,
      GET_CSV_READ_DETAIL_UPDATE_IN_PROCESSING_LAMBDA.path,
      GET_CSV_READ_DETAIL_UPDATE_IN_PROCESSING_LAMBDA.excludeFunction,
      GET_CSV_READ_DETAIL_UPDATE_IN_PROCESSING_LAMBDA.lambdaHander,
    );

    // Create Role to Lambda function getCsvReadDetailUpdateInProcessingLambda can access list table in DynamoDB
    grantServiceListServiceReadWriteAnService(
      listTableInDynamoDB,
      env.grantRole.readWriteData,
      getCsvReadDetailUpdateInProcessingLambda,
    );

    // Read List SQS Role in IAM
    const listSqsRoleInIAM = JSON.parse(env.listRoleInIAM.sqsRoleList);
    const sqsArn = [mainQueue.queueArn];
    const sqsPolicy = settingNewPolicy(listSqsRoleInIAM, sqsArn);

    // Add a separate policy for ListQueues as it applies to all queues in the account
    const sqsListRoleInIAM = ['*'];
    const listQueuesPolicy = settingNewPolicy(sqsListRoleInIAM, sqsListRoleInIAM);
    const listLambdaFunction = [
      createPresignedUrlLambda,
      getStatusFromDynamoDBLambda,
      getBatchIdUpdateStatusToUploadedLambda,
      getCsvReadDetailUpdateInProcessingLambda,
    ];

    // Creare Role to List Lambda function can access SQS in List Queue Role
    grantServiceListServiceReadWriteAnService(
      listLambdaFunction,
      env.grantRole.addToRolePolicy,
      listQueuesPolicy,
    );

    // Create Role to List Lambda function can access SQS
    grantServiceListServiceReadWriteAnService(
      listLambdaFunction,
      env.grantRole.addToRolePolicy,
      sqsPolicy,
    );

    // Create Role to Main Queue can access All Lambda function
    grantServiceAnServiceReadWriteAListService(
      mainQueue,
      env.grantRole.grantSendMessages,
      listLambdaFunction,
    );

    // Read List DynamoDB Role in IAM
    const listDynamoRoleInIAM = JSON.parse(env.listRoleInIAM.dynamoRoleList);
    const dynamoDbArn = [usersTable.tableArn, uploadCsvTable.tableArn];
    const dynamoDbPolicy = settingNewPolicy(listDynamoRoleInIAM, dynamoDbArn);

    // Create Role to List Lambda function can access DynamoDB
    grantServiceListServiceReadWriteAnService(
      listLambdaFunction,
      env.grantRole.addToRolePolicy,
      dynamoDbPolicy,
    );

    // Create Role to UserTable can access ListLambda function
    grantServiceAnServiceReadWriteAListService(
      usersTable,
      env.grantRole.readWriteData,
      listLambdaFunction,
    );

    // Create Role to UploadCsvTable can access ListLambda function
    grantServiceAnServiceReadWriteAListService(
      uploadCsvTable,
      env.grantRole.readWriteData,
      listLambdaFunction,
    );

    // Create role to Csv read List Lambda function
    grantServiceAnServiceReadWriteAListService(
      csvBucket,
      env.grantRole.grantReadWrite,
      listLambdaFunction,
    );

    // Read List S3 Csv Role in IAM
    const listS3RoleInIAM = JSON.parse(env.listRoleInIAM.s3RoleList);
    const s3Arn = [csvBucket.bucketArn + '/*'];
    const s3Policy = settingNewPolicy(listS3RoleInIAM, s3Arn);

    // Read List S3 Image Role in IAM
    const listS3ImageRoleInIAM = JSON.parse(env.listRoleInIAM.s3RoleList);
    const s3ImageArn = [imageBucket.bucketArn + '/*'];
    const s3ImagePolicy = settingNewPolicy(listS3ImageRoleInIAM, s3ImageArn);

    // Create Role to List Lambda function can access S3
    grantServiceListServiceReadWriteAnService(
      listLambdaFunction,
      env.grantRole.addToRolePolicy,
      s3Policy,
    );

    // Create Role to List Lambda function can access S3 Image
    grantServiceListServiceReadWriteAnService(
      listLambdaFunction,
      env.grantRole.addToRolePolicy,
      s3ImagePolicy,
    );

    // SQS trigger Lambda getCsvReadDetailUpdateInProcessingLambda
    const queueSQSTrigger = settingSqsBatchSizeCurrentcy(
      mainQueue,
      +env.mainQueue.batchSize,
      +env.mainQueue.maxCurrency,
    );

    getCsvReadDetailUpdateInProcessingLambda.addEventSource(queueSQSTrigger);

    // Lambda getBatchIdUpdateStatusToUploadedLambda triggered by S3 csvBucket when a new file is uploaded
    const bucketCsvS3Notification = settingS3Notification(csvBucket, '.csv');
    getBatchIdUpdateStatusToUploadedLambda.addEventSource(bucketCsvS3Notification);

    // Create an API Gateway name linhclass-api-gateway
    const apiName = settingApiGatewayRoleCors(this, env.apiGateway.idLambda);

    // GET get-url endpoint calling createPresignedUrlLambda
    const getUrlIntegration = setupApiGatewayForLambdaFn(createPresignedUrlLambda);
    apiName.root.addResource('get-url').addMethod('GET', getUrlIntegration);

    // GET get-status endpoint calling getStatusFromDynamoDBLambda
    const getStatusIntegration = setupApiGatewayForLambdaFn(getStatusFromDynamoDBLambda);
    apiName.root.addResource('get-status').addMethod('GET', getStatusIntegration);

    // setting secretManager for all lambda function using secret
    grantServiceAnServiceReadWriteAListService(secret, env.grantRole.grandRead, listLambdaFunction);

    // when destroy remove dynamoDb and S3 bucket
    csvBucket.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);
    imageBucket.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);
    uploadCsvTable.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);
    usersTable.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);
  }
}
