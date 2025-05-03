import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { createNewBucketS3, createNewLambdaFunction, createNewSQS, createNewTableDynamoDB, grantServiceListServiceReadWriteAnService, settingNewPolicy, grantServiceAnServiceReadWriteAListService, settingSqsBatchSizeCurrentcy, settingS3Notification, settingApiGatewayRoleCors, setupApiGatewayForLambdaFn } from './custom-constracts/csv-upload-resources';

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //TODO: create mySecret get from secrets manager name HitoEnvSecret 
    const mySecret = cdk.aws_secretsmanager.Secret.fromSecretNameV2(this, 'HitoEnvSecret', 'HitoEnvSecret');

    //TODO: create an new bucket name linhclass-csv-bucket with cors policy
    const bucketCsvS3 = createNewBucketS3(this, 'LinhClassCsvBucket', 'linhclass-csv-bucket');

    //TODO: create an new SQS name linhclass-lambda-call-to-queue
    const queueSQS = createNewSQS(this, 'LinhClassLambdaCallToQueue', 'linhclass-lambda-call-to-queue', 14);

    //TODO: create 2 dynamoDB table name Users and upload-csv
    const usersTable = createNewTableDynamoDB(this, 'UsersTable', 'Users');
    const uploadCsvTable = createNewTableDynamoDB(this, 'UploadCsvTable', 'upload-csv');

    //TODO: create a new lambda function name create-presigned-url-uploading-lambda get source from src/rebuild/create-preurl
    const createPresignedUrlLambda = createNewLambdaFunction(this, 'CreatePresignedUrlLambda', 'create-presigned-url-uploading-lambda', './src/rebuild/create-preurl', "create-preurl-s3-update-status-uploading-lambda.mjs", 'create-preurl-s3-update-status-uploading-lambda.handler');

    //TODO: create role for lambda function createPresignedUrlLambda to access s3 and dynamoDB
    const listTableInDynamoDB = [usersTable, uploadCsvTable];
    grantServiceListServiceReadWriteAnService(listTableInDynamoDB, 'grantReadWriteData', createPresignedUrlLambda);

    //TODO: create a new lambda function name get-status-from-dynamodb-lambda get source from src/rebuild/get-status 
    const getStatusFromDynamoDBLambda = createNewLambdaFunction(this, 'GetStatusFromDynamoDBLambda', 'get-status-from-dynamodb-lambda', './src/rebuild/get-status', "get-status-from-dynamodb-lambda.mjs", 'get-status-from-dynamodb-lambda.handler');
    // getStatusFromDynamoDBLambda can read and write dynamoDb 
    grantServiceListServiceReadWriteAnService(listTableInDynamoDB, 'grantReadWriteData', getStatusFromDynamoDBLambda);

    //TODO: create a new lambda function name get-batchid-update-status-to-uploaded get source from src/rebuild/get-batchid-uploaded
    const getBatchIdUpdateStatusToUploadedLambda = createNewLambdaFunction(this, 'GetBatchIdUpdateStatusToUploadedLambda', 'get-batchid-update-status-to-uploaded', './src/rebuild/get-batchid-uploaded', "get-batchid-update-status-to-uploaded.mjs", 'get-batchid-update-status-to-uploaded.handler');

    //TODO: getBatchIdUpdateStatusToUploadedLambda can read and write dynamoDb
    grantServiceListServiceReadWriteAnService(listTableInDynamoDB, 'grantReadWriteData', getBatchIdUpdateStatusToUploadedLambda);

    //TODO: create a new lambda function name get-csv-read-detail-update-inprocessing-lambda get source from src/rebuild/get-batchid-uploaded
    const getCsvReadDetailUpdateInProcessingLambda = createNewLambdaFunction(this, 'GetCsvReadDetailUpdateInProcessingLambda', 'get-csv-read-detail-update-inprocessing-lambda', './src/rebuild/get-csv-read-detail', "get-csv-read-detail-update-inprocessing-lambda.mjs", 'get-csv-read-detail-update-inprocessing-lambda.handler');
    grantServiceListServiceReadWriteAnService(listTableInDynamoDB, 'grantReadWriteData', getCsvReadDetailUpdateInProcessingLambda);
   
    // Add policy IAM to Lambda function to access SQS
    const listSqsRoleInIAM = ['sqs:SendMessage', 'sqs:ReceiveMessage', 'sqs:DeleteMessage', 'sqs:GetQueueAttributes', 'sqs:ListQueues'];
    const sqsArn = [queueSQS.queueArn];
    const sqsPolicy = settingNewPolicy(listSqsRoleInIAM, sqsArn);

    // Add a separate policy for ListQueues as it applies to all queues in the account
    const sqsListRoleInIAM = ['*'];
    const listQueuesPolicy = settingNewPolicy(sqsListRoleInIAM, sqsListRoleInIAM);
    const listLambdaFunction = [createPresignedUrlLambda, getStatusFromDynamoDBLambda, getBatchIdUpdateStatusToUploadedLambda, getCsvReadDetailUpdateInProcessingLambda];

    grantServiceListServiceReadWriteAnService(listLambdaFunction, 'addToRolePolicy', listQueuesPolicy);
    grantServiceListServiceReadWriteAnService(listLambdaFunction, 'addToRolePolicy', sqsPolicy);
    grantServiceAnServiceReadWriteAListService(queueSQS, 'grantSendMessages', listLambdaFunction);

    // Add policy to lambda function to access DynamoDB
    const listDynamoRoleInIAM = ['dynamodb:PutItem', 'dynamodb:GetItem', 'dynamodb:UpdateItem'];
    const dynamoDbArn = [usersTable.tableArn, uploadCsvTable.tableArn];
    const dynamoDbPolicy = settingNewPolicy(listDynamoRoleInIAM, dynamoDbArn);
    grantServiceListServiceReadWriteAnService(listLambdaFunction, 'addToRolePolicy', dynamoDbPolicy);
    grantServiceAnServiceReadWriteAListService(usersTable, 'grantReadWriteData', listLambdaFunction);
    grantServiceAnServiceReadWriteAListService(uploadCsvTable, 'grantReadWriteData', listLambdaFunction);


    //TODO: adding connect role to lambda function to access S3 
    grantServiceAnServiceReadWriteAListService(bucketCsvS3, 'grantReadWrite', listLambdaFunction);

    // Add policy to Lambda function to access S3 bucket
    const listS3RoleInIAM = ['s3:PutObject', 's3:GetObject']
    const s3Arn = [bucketCsvS3.bucketArn + '/*'];
    const s3Policy = settingNewPolicy(listS3RoleInIAM, s3Arn);
    grantServiceListServiceReadWriteAnService(listLambdaFunction, 'addToRolePolicy', s3Policy);

    //TODO: SQS trigger Lambda getCsvReadDetailUpdateInProcessingLambda
    const queueSQSTrigger = settingSqsBatchSizeCurrentcy(queueSQS, 10, 5);
    getCsvReadDetailUpdateInProcessingLambda.addEventSource(queueSQSTrigger);

    //TODO: Lambda getBatchIdUpdateStatusToUploadedLambda triggered by S3 bucketCsvS3 when a new file is uploaded
    const bucketCsvS3Notification = settingS3Notification(bucketCsvS3, '.csv');
    getBatchIdUpdateStatusToUploadedLambda.addEventSource(bucketCsvS3Notification);

    //Create an API Gateway
    const apiName = settingApiGatewayRoleCors(this, 'LinhClassApiGateway');

    // GET get-url endpoint calling createPresignedUrlLambda
    const getUrlIntegration = setupApiGatewayForLambdaFn(createPresignedUrlLambda);
    apiName.root.addResource('get-url').addMethod('GET', getUrlIntegration);

    // GET get-status endpoint calling getStatusFromDynamoDBLambda
    const getStatusIntegration = setupApiGatewayForLambdaFn(getStatusFromDynamoDBLambda);
    apiName.root.addResource('get-status').addMethod('GET', getStatusIntegration);

    //TODO setting secretManager for all lambda function using
    grantServiceAnServiceReadWriteAListService(mySecret, 'grantRead', listLambdaFunction);
  }
}


