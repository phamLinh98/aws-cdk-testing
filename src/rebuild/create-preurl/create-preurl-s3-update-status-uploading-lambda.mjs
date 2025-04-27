// src/lambda/create-update-detele-search-dynamo-sqs-s3/connectAndUpdateDynamoDb.ts
import { DynamoDBClient, ScanCommand, CreateTableCommand, PutItemCommand, GetItemCommand, ListTablesCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
var connectToDynamoDb = async () => {
  return new DynamoDBClient({ region: "ap-northeast-1" });
};
var updateTableInDynamoDB = async (dynamoDbClient, tableName, fileName, status) => {
  console.log("tableName", tableName);
  console.log("fileName", fileName);
  console.log("status", status);
  try {
    const params = {
      TableName: tableName,
      Key: {
        id: { S: fileName }
      },
      UpdateExpression: "SET #status = :status",
      ExpressionAttributeNames: {
        "#status": "status"
      },
      ExpressionAttributeValues: {
        ":status": { S: status }
      }
    };
    const updateCommand = new UpdateItemCommand(params);
    await dynamoDbClient.send(updateCommand);
    console.log("Table updated successfully");
  } catch (error) {
    console.error("Error updating table:", error);
    throw error;
  }
};

// src/lambda/create-update-detele-search-dynamo-sqs-s3/connectAndUpdateS3.ts
import { S3Client, CreateBucketCommand, PutObjectCommand, GetObjectCommand, HeadBucketCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
var connectToS3Bucket = async () => {
  return new S3Client({ region: "ap-northeast-1" });
};
var createPreUrlUpdateS3 = async (s3Client, bucketName, nameCsvSaveIntoS3Bucket, expiration, fileName) => {
  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: nameCsvSaveIntoS3Bucket,
      ContentType: "text/csv"
    });
    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: expiration });
    console.log("4. presignedUrl:", presignedUrl);
    return {
      statusCode: 200,
      body: JSON.stringify({
        presignedUrl,
        id: fileName
      })
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "\u0110\xE3 x\u1EA3y ra l\u1ED7i khi t\u1EA1o presigned URL" })
    };
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

// src/lambda/create-preurl-s3-update-status-uploading-lambda/index.ts
var handler = async (event) => {
  try {
    const bucketName = await getSecretOfKey("bucketCsvName");
    console.log("bucketName >>>", bucketName);
    const uploadCsvTable = await getSecretOfKey("uploadCsvTableName");
    console.log("uploadCsvTable >>>", uploadCsvTable);
    const s3Client = await connectToS3Bucket();
    const dynamoDB = await connectToDynamoDb();
    console.log("Connect S3 and DB success >>");
    const generateUUID = () => {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === "x" ? r : r & 3 | 8;
        return v.toString(16);
      });
    };
    const fileName = generateUUID();
    console.log("fileName >>>", fileName);
    await updateTableInDynamoDB(dynamoDB, uploadCsvTable, fileName, "Uploading");
    const nameCsvSaveIntoS3Bucket = "csv/" + fileName + ".csv";
    console.log("nameCsvSaveIntoS3Bucket >>>");
    const timeExpired = 3600;
    const data = await createPreUrlUpdateS3(s3Client, bucketName, nameCsvSaveIntoS3Bucket, timeExpired, fileName);
    return data;
  } catch (error) {
    console.error("Call Lambda Fail");
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Call Lambda PreURL fail" })
    };
  }
};
export {
  handler
};
