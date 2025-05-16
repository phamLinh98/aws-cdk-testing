import {
  grantServiceAnServiceReadWriteAListService,
  grantServiceListServiceReadWriteAnService,
  settingNewPolicy,
} from '../custom-constracts/csv-upload-resources';

import * as cdk from 'aws-cdk-lib';
import { S3SetupType } from './interface/s3';

export const rolesSetup = (
  lambdaFuncList: any[],
  env: any,
  sqsPolicy: cdk.aws_iam.PolicyStatement,
  mainQueue: cdk.aws_sqs.Queue,
  secret: cdk.aws_secretsmanager.ISecret,
  s3Setup: S3SetupType,
  tableList: cdk.aws_dynamodb.Table[],
  policyListLambdaCanAccessDynamoDB: cdk.aws_iam.PolicyStatement[],
) => {

  // Create Role to List Lambda function can access DynamoDB to Read and Write
  lambdaFuncList.forEach((lambdaFunc: any) => {
    grantServiceListServiceReadWriteAnService(tableList, env.grantRole.readWriteData, lambdaFunc);
  });
  
  // Creare Role to List Lambda function can access SQS in List Queue Role
  grantServiceListServiceReadWriteAnService(
    lambdaFuncList,
    env.grantRole.addToRolePolicy,
    settingNewPolicy(['*'], ['*']),
  );

  // Create Policy to List Lambda function can access SQS
  grantServiceListServiceReadWriteAnService(lambdaFuncList, env.grantRole.addToRolePolicy, sqsPolicy);

  // Create Policy to List Lambda function can access DynamoDB to Read and Write
  policyListLambdaCanAccessDynamoDB.forEach((tablePolicy) => {
    grantServiceListServiceReadWriteAnService(lambdaFuncList, env.grantRole.addToRolePolicy, tablePolicy);
  });

  // Create Role to List Lambda function can access S3
  Object.keys(s3Setup).forEach((key) => {
    const s3SetupItem = s3Setup[key];
    grantServiceListServiceReadWriteAnService(
      lambdaFuncList,
      env.grantRole.addToRolePolicy,
      s3SetupItem.policy,
    );

    grantServiceAnServiceReadWriteAListService(
      s3SetupItem.bucket,
      env.grantRole.grantReadWrite,
      lambdaFuncList,
    );
  });

  // Create Role to List Lambda function can access SQS in Main Queue Roles
  grantServiceAnServiceReadWriteAListService(
    mainQueue,
    env.grantRole.grantSendMessages,
    lambdaFuncList,
  );

  // Create Role to table dynamoDB can access ListLambda function
  tableList.forEach((table) => {
    grantServiceAnServiceReadWriteAListService(table, env.grantRole.readWriteData, lambdaFuncList);
  });

  // setting secretManager for all lambda function using secret
  grantServiceAnServiceReadWriteAListService(secret, env.grantRole.grandRead, lambdaFuncList);
};
