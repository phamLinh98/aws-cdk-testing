import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { configCors, configCorsApiGateway } from '../../utils/cors';
import { envConfig } from '../config/env';

export const createNewBucketS3 = (scope: Construct, idBucket: string, bucketName: string) => {
  return new cdk.aws_s3.Bucket(scope, idBucket, {
    bucketName: bucketName,
    versioned: true,
    removalPolicy: cdk.RemovalPolicy.DESTROY,
    cors: configCors(envConfig.corsOrigin),
  });
};

export const createNewSQS = (
  scope: Construct,
  idQueue: string,
  queueName: string,
  maxTime: number,
  visibilityTimeout: number = 30,
  deadLetterQueue: cdk.aws_sqs.IQueue,
  maxReceiveCount: number = 5,
  ...props: any
) => {
  return new cdk.aws_sqs.Queue(scope, idQueue, {
    queueName: queueName, // the name of the queue
    retentionPeriod: cdk.Duration.days(maxTime), // the time that a message is retained in the queue
    visibilityTimeout: cdk.Duration.seconds(visibilityTimeout), // the time that a message is invisible to other consumers after being received
    deadLetterQueue: {
      queue: deadLetterQueue, // Reference the dead-letter queue object
      maxReceiveCount: maxReceiveCount, // the maximum number of times a message can be received before being sent to the dead-letter queue
    },
    ...props,
  });
};

export const createNewDeadLetterQueue = (
  scope: Construct,
  idQueue: string,
  queueName: string,
  maxTime: number,
) => {
  return new cdk.aws_sqs.Queue(scope, idQueue, {
    queueName: queueName,
    retentionPeriod: cdk.Duration.days(maxTime),
  });
};

//TODO: Setting SQS Batch Size and Max Concurrency
export const settingSqsBatchSizeCurrentcy = (
  queueName: any,
  batchSize: number,
  maxConcurrency: number,
) => {
  return new cdk.aws_lambda_event_sources.SqsEventSource(queueName, {
    batchSize: batchSize,
    maxConcurrency: maxConcurrency,
  });
};

//TODO; Setting Policy for Service
export const settingNewPolicy = (actionList: any[], queueArn: any[]) => {
  return new cdk.aws_iam.PolicyStatement({
    actions: actionList,
    resources: queueArn,
  });
};

//TODO: Create new table in DynamoDB
export const createNewTableDynamoDB = (scope: Construct, idTable: string, tableName: string) => {
  return new cdk.aws_dynamodb.Table(scope, idTable, {
    tableName: tableName,
    partitionKey: { name: 'id', type: cdk.aws_dynamodb.AttributeType.STRING },
    removalPolicy: cdk.RemovalPolicy.DESTROY,
  });
};

//TODO: Create new Lambda function
export const createNewLambdaFunction = (
  scope: Construct,
  idLambda: string,
  lambdaName: string,
  path: string,
  excludeFunction: string,
  lambdaHander: string,
) => {
  return new cdk.aws_lambda.Function(scope, idLambda, {
    functionName: lambdaName,
    runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
    code: cdk.aws_lambda.Code.fromAsset(path, {
      exclude: ['**', `!${excludeFunction}`],
    }),
    handler: lambdaHander,
  });
};

//TODO: Setting A List Service Can Read/Write A Service
export const grantServiceListServiceReadWriteAnService = (
  listService: any[],
  policy: string,
  service: any,
) => {
  return listService.forEach((list: any) => {
    list[policy](service);
  });
};

//TODO: Setting A Service Can Read/Write A List Service
export const grantServiceAnServiceReadWriteAListService = (
  service: any,
  policy: string,
  ListService: any[],
) => {
  return ListService.forEach((list: any) => {
    service[policy](list);
  });
};

//TODO; Setting S3 Notification When New file add to S3
export const settingS3Notification = (bucketName: cdk.aws_s3.Bucket, filterFile: string) => {
  return new cdk.aws_lambda_event_sources.S3EventSource(bucketName, {
    events: [cdk.aws_s3.EventType.OBJECT_CREATED],
    filters: [{ suffix: filterFile }],
  });
};

//TODO: Setting CORS for API Gateway
export const settingApiGatewayRoleCors = (scope: any, apiGatewayName: string) => {
  return new cdk.aws_apigateway.RestApi(scope, apiGatewayName, {
    restApiName: apiGatewayName,
    // enable CORS for the API
    defaultCorsPreflightOptions: configCorsApiGateway('http://localhost:5173', [
      'Content-Type',
      'Authorization',
      'X-Api-Key',
    ]),
  });
};

//TODO: Setup API Gateway for Lambda Function
export const setupApiGatewayForLambdaFn = (lambdaFunc: any) => {
  return new cdk.aws_apigateway.LambdaIntegration(lambdaFunc);
};
