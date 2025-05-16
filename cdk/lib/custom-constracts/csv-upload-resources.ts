import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { configCors, configCorsApiGateway } from '../../utils/cors';
import { envConfig } from '../config/env';

/**
 * Create a new S3 bucket
 */
export function createNewBucketS3(scope: Construct, idBucket: string, bucketName: string) {
  return new cdk.aws_s3.Bucket(scope, idBucket, {
    bucketName: bucketName,
    versioned: true,
    removalPolicy: cdk.RemovalPolicy.DESTROY,
    cors: configCors(envConfig.corsOrigin),
  });
}

/**
 * Create a new SQS queue
 */
export function createNewSQS(
  scope: Construct,
  idQueue: string,
  queueName: string,
  maxTime: number,
  visibilityTimeout: number = 30,
  deadLetterQueue: cdk.aws_sqs.IQueue | undefined = undefined,
  maxReceiveCount: number = 5,
  ...props: any
) {
  return new cdk.aws_sqs.Queue(scope, idQueue, {
    queueName: queueName, // the name of the queue
    retentionPeriod: cdk.Duration.days(maxTime), // the time that a message is retained in the queue
    visibilityTimeout: cdk.Duration.seconds(visibilityTimeout), // the time that a message is invisible to other consumers after being received
    // TODO: Check this
    deadLetterQueue: deadLetterQueue
      ? {
          queue: deadLetterQueue, // Reference the dead-letter queue object
          maxReceiveCount: maxReceiveCount, // the maximum number of times a message can be received before being sent to the dead-letter queue
        }
      : undefined, // the dead letter queue
    ...props,
  });
}

/**
 * Create a new dead-letter queue
 */
export function createNewDeadLetterQueue(
  scope: Construct,
  idQueue: string,
  queueName: string,
  maxTime: number,
) {
  return new cdk.aws_sqs.Queue(scope, idQueue, {
    queueName: queueName,
    retentionPeriod: cdk.Duration.days(maxTime),
  });
}

/**
 * Create a new SQS event source
 */
export function settingSqsEventSource(
  queueName: any,
  batchSize: number,
  maxConcurrency: number,
) {
  return new cdk.aws_lambda_event_sources.SqsEventSource(queueName, {
    batchSize: batchSize,
    maxConcurrency: maxConcurrency,
  });
}

/**
 * Create a new Policy statement
 */
export function settingNewPolicy(actionList: any[], queueArn: any[]) {
  return new cdk.aws_iam.PolicyStatement({
    actions: actionList,
    resources: queueArn,
  });
}

/**
 * Create a new DynamoDB table
 */
export function createNewTableDynamoDB(scope: Construct, idTable: string, tableName: string) {
  return new cdk.aws_dynamodb.Table(scope, idTable, {
    tableName: tableName,
    partitionKey: { name: 'id', type: cdk.aws_dynamodb.AttributeType.STRING },
    removalPolicy: cdk.RemovalPolicy.DESTROY,
  });
}

/**
 * Create a new Lambda function
 */
export function createNewLambdaFunction(
  scope: Construct,
  idLambda: string,
  lambdaName: string,
  path: string,
  excludeFunction: string,
  lambdaHander: string,
) {
  return new cdk.aws_lambda.Function(scope, idLambda, {
    functionName: lambdaName,
    runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
    code: cdk.aws_lambda.Code.fromAsset(path, {
      exclude: ['**', `!${excludeFunction}`],
    }),
    handler: lambdaHander,
  });
}

/**
 * Grant read/write permissions from a List of services to a service
 */
export function grantServiceListServiceReadWriteAnService(
  listService: any[],
  policy: string,
  service: any,
) {
  return listService.forEach((list: any) => {
    list[policy](service);
  });
}

/**
 * Grant read/write permissions from a service to a List of services
 */
export function grantServiceAnServiceReadWriteAListService(
  service: any,
  policy: string,
  ListService: any[],
) {
  return ListService.forEach((list: any) => {
    service[policy](list);
  });
}

/**
 * Setting S3 notification
 */
export function settingS3Notification(bucketName: cdk.aws_s3.Bucket, filterFile: string) {
  return new cdk.aws_lambda_event_sources.S3EventSource(bucketName, {
    events: [cdk.aws_s3.EventType.OBJECT_CREATED],
    filters: [{ suffix: filterFile }],
  });
}

/**
 * Setting API Gateway with CORS
 */
export function settingApiGatewayRoleCors(scope: any, apiGatewayName: string) {
  return new cdk.aws_apigateway.RestApi(scope, apiGatewayName, {
    restApiName: apiGatewayName,
    defaultCorsPreflightOptions: configCorsApiGateway(envConfig.local, [
      'Content-Type',
      'Authorization',
      'X-Api-Key',
    ]),
  });
}

/**
 * Setting API Gateway with Lambda function
 */
export function setupApiGatewayForLambdaFn(lambdaFunc: any) {
  return new cdk.aws_apigateway.LambdaIntegration(lambdaFunc);
}
