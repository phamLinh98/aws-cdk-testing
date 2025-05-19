import {
  grantServiceAnServiceReadWriteAListService,
  grantServiceListServiceReadWriteAnService,
  settingNewPolicy,
} from '../custom-constracts/csv-upload-resources';

import * as cdk from 'aws-cdk-lib';
import { S3SetupItemType, S3SetupType } from './interface/s3';
import { lambdaAddEventSource } from './lambda-setup';
import { LambdaSetUpType } from './interface/lambda';
import { SqsSetupType } from './interface/sqs';
import { DynamoDBSetupType } from './interface/dynamo';
import { envConfig } from '../config/env';

export const roleSetup = (
  lambdaSetUp: LambdaSetUpType,
  sqsSetup: SqsSetupType,
  dynamoDBSetup: DynamoDBSetupType,
  s3Setup: S3SetupType,
  secret: cdk.aws_secretsmanager.ISecret,
) => {
  const env = envConfig.aws;

  const lambdaList = Object.keys(lambdaSetUp).map((key) => {
    return lambdaSetUp[key].lambda;
  }) as cdk.aws_lambda.IFunction[];

  const tableList = Object.keys(dynamoDBSetup).map((key) => {
    return dynamoDBSetup[key].table;
  }) as cdk.aws_dynamodb.Table[];

  const policyListLambdaCanAccessDynamoDB = Object.keys(dynamoDBSetup).map((key) => {
    return dynamoDBSetup[key].policy;
  }) as cdk.aws_iam.PolicyStatement[];

  const s3List = Object.keys(s3Setup).map((key) => {
    return s3Setup[key];
  }) as S3SetupItemType[];

  lambdaList.forEach((lambdaFunc: cdk.aws_lambda.IFunction) => {
    grantServiceListServiceReadWriteAnService(tableList, env.grantRole.readWriteData, lambdaFunc);
  });

  grantServiceListServiceReadWriteAnService(
    lambdaList,
    env.grantRole.addToRolePolicy,
    settingNewPolicy(['*'], ['*']),
  );

  const MAIN_QUEUE_NAME = env.constants.MAIN_QUEUE_NAME;
  grantServiceListServiceReadWriteAnService(
    lambdaList,
    env.grantRole.addToRolePolicy,
    sqsSetup[MAIN_QUEUE_NAME].policy,
  );

  policyListLambdaCanAccessDynamoDB.forEach((tablePolicy: cdk.aws_iam.PolicyStatement) => {
    grantServiceListServiceReadWriteAnService(
      lambdaList,
      env.grantRole.addToRolePolicy,
      tablePolicy,
    );
  });

  s3List.forEach((s3SetupItem: S3SetupItemType) => {
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

  grantServiceAnServiceReadWriteAListService(
    sqsSetup[MAIN_QUEUE_NAME].queue,
    env.grantRole.grantSendMessages,
    lambdaList,
  );

  tableList.forEach((table: cdk.aws_dynamodb.Table) => {
    grantServiceAnServiceReadWriteAListService(table, env.grantRole.readWriteData, lambdaList);
  });

  grantServiceAnServiceReadWriteAListService(secret, env.grantRole.grandRead, lambdaList);

  const CSV_FUNCTION_NAME = env.constants.CSV_FUNCTION_NAME;
  lambdaAddEventSource(
    lambdaSetUp[CSV_FUNCTION_NAME].lambda,
    sqsSetup[MAIN_QUEUE_NAME].sqsEventSource,
  );
};
