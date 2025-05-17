import * as cdk from 'aws-cdk-lib';

export type EnvDynamoDBSetupType = {
  [key: string]: {
    idTable: string;
    tableName: string;
  };
};

export type DynamoDBSetupItemType = {
  table: cdk.aws_dynamodb.Table;
  policy: cdk.aws_iam.PolicyStatement;
};

export type DynamoDBSetupType = {
  [key: string]: DynamoDBSetupItemType;
};
