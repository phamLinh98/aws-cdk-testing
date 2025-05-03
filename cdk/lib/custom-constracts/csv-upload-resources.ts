import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { configCors, configCorsApiGateway } from '../../utils/cors';
import { Function as LambdaFunction } from 'aws-cdk-lib/aws-lambda';

//TODO: Create New Bucket S3
export const createNewBucketS3 = (scope: Construct, idBucket: any, bucketName: string) => {
      return new cdk.aws_s3.Bucket(scope, idBucket, {
            bucketName: bucketName,
            versioned: true,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            cors: configCors("http://localhost:5173")
      });
};

//TODO: Create New SQS queue 
export const createNewSQS = (scope: Construct, idQueue: any, queueName: any, maxTime: any) => {
      return new cdk.aws_sqs.Queue(scope, idQueue, {
            queueName: queueName,
            retentionPeriod: cdk.Duration.days(maxTime),
      });
}

//TODO: Setting SQS Batch Size and Max Concurrency
export const settingSqsBatchSizeCurrentcy = (queueName: any, batchSize: any, maxConcurrency: any) => {
      return new cdk.aws_lambda_event_sources.SqsEventSource(queueName, {
            batchSize: batchSize,
            maxConcurrency: maxConcurrency
      });
}

//TODO; Setting Policy for Service
export const settingNewPolicy = (actionList: any, queueArn: any) => {
      return new cdk.aws_iam.PolicyStatement({
            actions: actionList,
            resources: queueArn,
      });
}

//TODO: Create new table in DynamoDB
export const createNewTableDynamoDB = (scope: Construct, idTable: any, tableName: string) => {
      return new cdk.aws_dynamodb.Table(scope, idTable, {
            tableName: tableName,
            partitionKey: { name: 'id', type: cdk.aws_dynamodb.AttributeType.STRING },
            removalPolicy: cdk.RemovalPolicy.DESTROY,
      });
}

//TODO: Create new Lambda function
export const createNewLambdaFunction = (scope: Construct, idLambda: any, lambdaName: any, path: any, excludeFunction: any, lambdaHander: any) => {
      return new cdk.aws_lambda.Function(scope, idLambda, {
            functionName: lambdaName,
            runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
            code: cdk.aws_lambda.Code.fromAsset(path, {
                  exclude: ["**", `!${excludeFunction}`],
            }),
            handler: lambdaHander
      });
}

//TODO: Setting A List Service Can Read/Write A Service
export const grantServiceListServiceReadWriteAnService = (listService: any, policy: string, service: any) => {
      return listService.forEach((list: any) => {
            list[policy](service);
      });
}

//TODO: Setting A Service Can Read/Write A List Service
export const grantServiceAnServiceReadWriteAListService = (service: any, policy: any, ListService: any) => {
      return ListService.forEach((list: any) => {
            service[policy](list);
      });
}

//TODO; Setting S3 Notification When New file add to S3
export const settingS3Notification = (bucketName:any, filterFile:any) => {
      return new cdk.aws_lambda_event_sources.S3EventSource(bucketName, {
            events: [cdk.aws_s3.EventType.OBJECT_CREATED],
            filters: [{ suffix: filterFile }],
      });
}

//TODO: Setting CORS for API Gateway
export const settingApiGatewayRoleCors = (scope:any, apiGatewayName:any, ) => {
     return new cdk.aws_apigateway.RestApi(scope, apiGatewayName, {
      restApiName: apiGatewayName,
      // enable CORS for the API
      defaultCorsPreflightOptions: configCorsApiGateway("http://localhost:5173", ["Content-Type", "Authorization", "X-Api-Key"]),
    }); 
}

//TODO: Setup API Gateway for Lambda Function
export const setupApiGatewayForLambdaFn = (lambdaFunc:any) => {
      return new cdk.aws_apigateway.LambdaIntegration(lambdaFunc);
}
