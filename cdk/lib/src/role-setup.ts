import {
  grantServiceAnServiceReadWriteAListService,
  grantServiceListServiceReadWriteAnService,
  settingNewPolicy,
} from '../custom-constracts/csv-upload-resources';
import { S3SetupType } from './s3-setup';
import * as cdk from 'aws-cdk-lib';

export const rolesSetup = (
  lambdaList: any,
  env: any,
  sqsPolicy: cdk.aws_iam.PolicyStatement,
  mainQueue: cdk.aws_sqs.Queue,
  secret: cdk.aws_secretsmanager.ISecret,
  s3Setup: S3SetupType,
  tableList: cdk.aws_dynamodb.Table[],
  policyList: cdk.aws_iam.PolicyStatement[],
) => {
  lambdaList.forEach((lambdaFunc: any) => {
    grantServiceListServiceReadWriteAnService(tableList, env.grantRole.readWriteData, lambdaFunc);
  });

  // Creare Role to List Lambda function can access SQS in List Queue Role
  grantServiceListServiceReadWriteAnService(
    lambdaList,
    env.grantRole.addToRolePolicy,
    settingNewPolicy(['*'], ['*']),
  );

  // // Create Role to List Lambda function can access SQS
  grantServiceListServiceReadWriteAnService(lambdaList, env.grantRole.addToRolePolicy, sqsPolicy);

  // Create Role to List Lambda function can access DynamoDB
  grantServiceListServiceReadWriteAnService(lambdaList, env.grantRole.addToRolePolicy, policyList);

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
    mainQueue,
    env.grantRole.grantSendMessages,
    lambdaList,
  );

  // Create Role to table dynamoDB can access ListLambda function
  tableList.forEach((table) => {
    grantServiceAnServiceReadWriteAListService(table, env.grantRole.readWriteData, lambdaList);
  });

  // setting secretManager for all lambda function using secret
  grantServiceAnServiceReadWriteAListService(secret, env.grantRole.grandRead, lambdaList);
};
