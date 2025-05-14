import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { envConfig } from './config/env';
import { s3BucketSetup } from './src/s3-setup';
import { secretSetup } from './src/secret-setup';
import { sqsSetup } from './src/sqs-setup';
import { dynamoDBSetup } from './src/dybamo-setup';
import { lambdaAddEventSource, lambdaListSetup } from './src/lambda-setup';
import { rolesSetup } from './src/role-setup';
import { apiGatewaySetup } from './src/api-gateway-setup';

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const env = envConfig.aws;

    // Setup Secret
    const { secret } = secretSetup(this, env);

    // Setup SQS
    const { queue, policy, sqsEventSource } = sqsSetup(this);

    // Setup DynamoDB
    const [
      usersTable, 
      uploadCsvTable, 
      dynamoDbPolicy
    ] = dynamoDBSetup(this, env);

    const listTableInDynamoDB = [usersTable, uploadCsvTable];

    // Setup Lambda
    const [
      createPresignedUrlLambda,
      getStatusFromDynamoDBLambda,
      getBatchIdUpdateStatusToUploadedLambda,
      getCsvReadDetailUpdateInProcessingLambda,
    ] = lambdaListSetup(this, env, envConfig.buildPath);

    // Setup Lambda Event Source
    lambdaAddEventSource(
      getCsvReadDetailUpdateInProcessingLambda,
      sqsEventSource[env.queue.main.idQueue],
    );

    const lambdaFuncList = [
      createPresignedUrlLambda,
      getStatusFromDynamoDBLambda,
      getBatchIdUpdateStatusToUploadedLambda,
      getCsvReadDetailUpdateInProcessingLambda,
    ];

    // Setup S3
    const s3Setup = s3BucketSetup(
      this,
      env,
      getBatchIdUpdateStatusToUploadedLambda,
    );

    // Setup Role for All Services
    rolesSetup(
      lambdaFuncList,
      env,
      listTableInDynamoDB,
      policy[env.queue.main.idQueue],
      dynamoDbPolicy,
      queue[env.queue.main.idQueue],
      usersTable,
      uploadCsvTable,
      secret,
      s3Setup
    );

    const infoForSettingAPIGateway = [
      {
        lambdaFunc: createPresignedUrlLambda,
        api: 'get-url',
        method: 'GET',
      },
      {
        lambdaFunc: getStatusFromDynamoDBLambda,
        api: 'get-status',
        method: 'GET',
      },
    ];

    // Setup API Gateway
    apiGatewaySetup(this, env, infoForSettingAPIGateway);

    // Specify the resource will be setting from here
    // ...
  }
}
