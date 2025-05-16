import {
  grantServiceAnServiceReadWriteAListService,
  grantServiceListServiceReadWriteAnService,
  settingNewPolicy,
} from '../custom-constracts/csv-upload-resources';

import * as cdk from 'aws-cdk-lib';
import { S3SetupType } from './interface/s3';
import { SqsSetupType } from './interface/sqs';
import { lambdaAddEventSource } from './lambda-setup';
import { LambdaSetUpType } from './interface/lambda';

export const rolesSetup = (
  result: any,
  env: any,
  queueMain: any,
  secret: cdk.aws_secretsmanager.ISecret,
  s3Setup: S3SetupType,
  tableList: cdk.aws_dynamodb.Table[],
  policyListLambdaCanAccessDynamoDB: cdk.aws_iam.PolicyStatement[],
) => {

  const lambdaList = [
    result['createPresignedUrlLambda'].lambda,
    result['getStatusFromDynamoDBLambda'].lambda,
    result['getBatchIdUpdateStatusToUploadedIdLambda'].lambda,
    result['getCsvReadDetailUpdateInProcessingLambda'].lambda,
  ] 

  // Create Role to List Lambda function can access DynamoDB to Read and Write
  lambdaList.forEach((lambdaFunc: any) => {
    grantServiceListServiceReadWriteAnService(tableList, env.grantRole.readWriteData, lambdaFunc);
  });
  
  // Creare Role to List Lambda function can access SQS in List Queue Role
  grantServiceListServiceReadWriteAnService(
    lambdaList,
    env.grantRole.addToRolePolicy,
    settingNewPolicy(['*'], ['*']),
  );

  // Create Policy to List Lambda function can access SQS
  grantServiceListServiceReadWriteAnService(lambdaList, env.grantRole.addToRolePolicy, queueMain.policy);

  // Create Policy to List Lambda function can access DynamoDB to Read and Write
  policyListLambdaCanAccessDynamoDB.forEach((tablePolicy) => {
    grantServiceListServiceReadWriteAnService(lambdaList, env.grantRole.addToRolePolicy, tablePolicy);
  });

  // Create Role to List Lambda function can access S3
  Object.keys(s3Setup).forEach((key) => {
    const s3SetupItem = s3Setup[key];
    grantServiceListServiceReadWriteAnService(
      lambdaList,
      env.grantRole.addToRolePolicy,
      s3SetupItem.policy,
    );

    grantServiceAnServiceReadWriteAListService(
      s3SetupItem.bucket,
      env.grantRole.grantReadWrite,
      lambdaList,
    );
  });

  // Create Role to List Lambda function can access SQS in Main Queue Roles
  grantServiceAnServiceReadWriteAListService(
    queueMain.queue,
    env.grantRole.grantSendMessages,
    lambdaList,
  );

  // Create Role to table dynamoDB can access ListLambda function
  tableList.forEach((table) => {
    grantServiceAnServiceReadWriteAListService(table, env.grantRole.readWriteData, lambdaList);
  });

  // setting secretManager for all lambda function using secret
  grantServiceAnServiceReadWriteAListService(secret, env.grantRole.grandRead, lambdaList);

  // Connect main queue to lambda getCsvReadDetailUpdateInProcessingLambda(sqs main trigger lambda function) 
  lambdaAddEventSource(result['getCsvReadDetailUpdateInProcessingLambda'].lambda, queueMain.sqsEventSource);
};
