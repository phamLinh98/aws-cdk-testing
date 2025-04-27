// src/lambda/create-update-detele-search-dynamo-sqs-s3/connectAndUpdateDynamoDb.ts
import { DynamoDBClient, ScanCommand, CreateTableCommand, PutItemCommand, GetItemCommand, ListTablesCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
var connectToDynamoDb = async () => {
  return new DynamoDBClient({ region: "ap-northeast-1" });
};
var getItemFromDynamoDB = async (dynamoDBClient, tableName, id) => {
  try {
    const command = new ScanCommand({
      TableName: tableName,
      FilterExpression: "#id = :id",
      ExpressionAttributeNames: {
        "#id": "id"
      },
      ExpressionAttributeValues: {
        ":id": { S: id }
      }
    });
    const data = await dynamoDBClient.send(command);
    return data.Items;
  } catch (error) {
    console.error("Error getting item from DynamoDB:", error);
    throw error;
  }
};

// src/lambda/get-secret-key-from-manager/index.ts
import {
  SecretsManagerClient,
  GetSecretValueCommand
} from "@aws-sdk/client-secrets-manager";
var secret_name = "HitoEnvSecret";
var secretsClient = new SecretsManagerClient({ region: "ap-northeast-1" });
var getSecrets = async () => {
  try {
    const response = await secretsClient.send(
      new GetSecretValueCommand({
        SecretId: secret_name,
        VersionStage: "AWSCURRENT"
        // VersionStage defaults to AWSCURRENT if unspecified
      })
    );
    return JSON.parse(response.SecretString);
  } catch (error) {
    console.error("Error fetching secrets:", error);
    throw error;
  }
};
var getSecretOfKey = async (key) => {
  try {
    const secrets = await getSecrets();
    return secrets[key];
  } catch (error) {
    console.error("Error fetching secret of key:", error);
    throw error;
  }
};

// src/lambda/get-status-from-dynamodb-lambda/index.ts
var handler = async (event) => {
  const getIdFromParams = event.queryStringParameters?.id;
  console.log("getIdFromParams >>>", getIdFromParams);
  const dynamodb = await connectToDynamoDb();
  const uploadCsvTable = await getSecretOfKey("uploadCsvTableName");
  console.log("uploadCsvTable >>>", uploadCsvTable);
  try {
    console.log("LOG1");
    const data = await getItemFromDynamoDB(dynamodb, uploadCsvTable, getIdFromParams);
    console.log("data>>>", data.length);
    console.log("LOG2");
    if (data.length > 0) {
      return {
        statusCode: 200,
        body: JSON.stringify(data[0])
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "No records found" })
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
export {
  handler
};
