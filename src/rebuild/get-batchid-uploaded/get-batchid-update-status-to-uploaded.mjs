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

// src/lambda/create-update-detele-search-dynamo-sqs-s3/connectAndUpdateSQS.ts
import { SQSClient, ListQueuesCommand, CreateQueueCommand, SendMessageCommand, DeleteMessageCommand } from "@aws-sdk/client-sqs";
var connectToSQS = async () => {
  return new SQSClient({ region: "ap-northeast-1" });
};
var getAnSpecificItemFromListSQS = async (sqsClient) => {
  return await sqsClient.send(new ListQueuesCommand({}));
};
var createNewSQSQueue = async (sqsClient, sqsName) => {
  try {
    await sqsClient.send(new CreateQueueCommand({ QueueName: sqsName }));
  } catch (error) {
    if (error.Code === "AWS.SimpleQueueService.QueueDeletedRecently") {
      console.log("Queue was recently deleted. Waiting 60 seconds before retrying...");
      await new Promise((resolve) => setTimeout(resolve, 6e4));
      await sqsClient.send(new CreateQueueCommand({ QueueName: sqsName }));
    } else {
      console.log("Error creating SQS queue:", error);
      throw error;
    }
  }
};
var sendNewMessageToSQS = async (sqsClient, sqsParams) => {
  try {
    const sendMessageCommand = new SendMessageCommand(sqsParams);
    const sqsResponse = await sqsClient.send(sendMessageCommand);
    console.log(`Message sent to SQS with ID: ${sqsResponse.MessageId}`);
  } catch (error) {
    console.error("Error sending message to SQS:", error);
    throw new Error("Failed to send message to SQS");
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

// src/lambda/get-batchid-update-status-to-uploaded/index.ts
var handler = async (event) => {
  try {
    const uploadCsvTable = await getSecretOfKey("uploadCsvTableName");
    const sqsName = await getSecretOfKey("sqsName");
    const prefixQueueUrl = await getSecretOfKey("prefixQueueURL");
    const dynamoDb = await connectToDynamoDb();
    const sqsClient = await connectToSQS();
    const bucketName = event.Records[0].s3.bucket.name;
    const fileNameSavedInS3CsvBucket = event.Records[0].s3.object.key;
    if (!fileNameSavedInS3CsvBucket.endsWith(".csv")) {
      console.log("Not a CSV file.  Exiting.");
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Not a CSV file.  No action taken." })
      };
    }
    const fileId = fileNameSavedInS3CsvBucket.split("/").pop().split(".")[0];
    console.log("fileId>>>", fileId);
    await updateTableInDynamoDB(dynamoDb, uploadCsvTable, fileId, "Uploaded");
    const checkItemSpecificItemInSQSList = await getAnSpecificItemFromListSQS(sqsClient);
    const exitstingQueueUrl = checkItemSpecificItemInSQSList.QueueUrls || [];
    const queueExists = exitstingQueueUrl.some((queueUrl) => queueUrl.endsWith(`/${sqsName}`));
    console.log("queueExists>>", queueExists);
    if (!queueExists) {
      await createNewSQSQueue(sqsClient, sqsName);
      console.log(`Queue ${sqsName} created successfully.`);
    }
    const queryUrl = prefixQueueUrl + sqsName;
    console.log("queryUrl>>", queryUrl);
    const sqsParams = {
      QueueUrl: queryUrl,
      MessageBody: JSON.stringify({ fileId })
    };
    console.log("sqsParams>>>", sqsParams);
    await sendNewMessageToSQS(sqsClient, sqsParams);
    console.log("Message sent to SQS successfully.");
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Message sent to SQS successfully." })
    };
  } catch (error) {
    console.error("Error in handler:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Cannot Call this lambda" })
    };
  }
};
export {
  handler
};
