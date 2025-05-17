import { Construct } from 'constructs';
import {
  createNewTableDynamoDB,
  settingNewPolicy,
} from '../custom-constracts/csv-upload-resources';
import * as cdk from 'aws-cdk-lib';
import { envConfig } from '../config/env';
import { DynamoDBSetupItemType, DynamoDBSetupType, EnvDynamoDBSetupType } from './interface/dynamo';

export const dynamoDBSetup = (scope: Construct, env: any) => {
  const envDynamoDB = env.table as EnvDynamoDBSetupType;
  const result = {} as DynamoDBSetupType;

  for (const key of Object.keys(envDynamoDB)) {
    const tableInfo = envDynamoDB[key];
    const dynamoDBSetupItem = {} as DynamoDBSetupItemType;

    dynamoDBSetupItem.table = createNewTableDynamoDB(scope, tableInfo.idTable, tableInfo.tableName);
    dynamoDBSetupItem.policy = settingNewPolicy(
      JSON.parse(envConfig.aws.policyActionList.dynamoRoleList),
      [dynamoDBSetupItem.table.tableArn],
    );
    dynamoDBSetupItem.table.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);

    result[key] = dynamoDBSetupItem;
  }

  return result;
};
