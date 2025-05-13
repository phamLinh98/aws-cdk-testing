import { Construct } from 'constructs';
import { createNewTableDynamoDB, settingNewPolicy } from '../custom-constracts/csv-upload-resources';
import * as cdk from 'aws-cdk-lib';

export const dynamoDBSetup = (scope: Construct, env: any) => {
  const usersTable = createNewTableDynamoDB(
    scope,
    env.usersTable.idTable,
    env.usersTable.tableName,
  );

  // Create Upload CSV Table
  const uploadCsvTable = createNewTableDynamoDB(
    scope,
    env.uploadCsvTable.idTable,
    env.uploadCsvTable.tableName,
  );

  const dynamoDbPolicy = settingNewPolicy(
    JSON.parse(env.policyActionList.dynamoRoleList), 
    [usersTable.tableArn, uploadCsvTable.tableArn]
  );

  uploadCsvTable.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);
  usersTable.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);

  return [ usersTable, uploadCsvTable, dynamoDbPolicy ];
};
