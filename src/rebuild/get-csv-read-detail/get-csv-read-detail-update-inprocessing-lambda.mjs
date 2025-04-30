// src/lambda/create-update-detele-search-dynamo-sqs-s3/connectAndUpdateDynamoDb.ts
import { DynamoDBClient, ScanCommand, CreateTableCommand, PutItemCommand, GetItemCommand, ListTablesCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
var connectToDynamoDb = async () => {
  return new DynamoDBClient({ region: "ap-northeast-1" });
};
var findTableExists = async (tableName, dynamoDbClient) => {
  try {
    const listTablesCommand = new ListTablesCommand({});
    const tables = await dynamoDbClient.send(listTablesCommand);
    console.log("tables", tables);
    return tables.TableNames.includes(tableName);
  } catch (error) {
    console.error("Error checking if table exists:", error);
    throw error;
  }
};
var createTableInDynamoDB = async (connectToDynamoDb2, tableName) => {
  const params = {
    TableName: tableName,
    KeySchema: [
      { AttributeName: "id", KeyType: "HASH" }
    ],
    AttributeDefinitions: [
      { AttributeName: "id", AttributeType: "S" }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 1,
      WriteCapacityUnits: 1
    }
  };
  try {
    await connectToDynamoDb2.send(new CreateTableCommand(params));
    console.log("Tao bang thanh cong", tableName);
  } catch (err) {
    console.log("Tao bang that bai");
    if (err.name !== "ResourceInUseException") {
      throw err;
    }
  }
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
var updateUsersTableWitInfoFromCSV = async (dynamoDbClient, userData, fileId, tableName) => {
  try {
    const getUserCommand = new GetItemCommand({
      TableName: tableName,
      Key: {
        id: { S: fileId }
      }
    });
    const getUserResponse = await dynamoDbClient.send(getUserCommand);
    if (getUserResponse.Item) {
      const updateParams = {
        TableName: tableName,
        Key: {
          id: { S: fileId }
        },
        UpdateExpression: "SET #name = :name, #age = :age, #avatar = :avatar, #position = :position, #salary = :salary, #uuid = :uuid",
        ExpressionAttributeNames: {
          "#name": "name",
          "#age": "age",
          "#avatar": "avatar",
          "#position": "position",
          "#salary": "salary",
          "#uuid": "uuid"
        },
        ExpressionAttributeValues: {
          ":name": { S: userData.userName },
          ":age": { N: userData.userAge !== null ? userData.userAge.toString() : "0" },
          ":avatar": { S: userData.userAvatar },
          ":position": { S: userData.userPosition },
          ":salary": { N: userData.userSalary !== null ? userData.userSalary.toString() : "0" },
          ":uuid": { S: fileId }
        }
      };
      const updateCommand = new UpdateItemCommand(updateParams);
      await dynamoDbClient.send(updateCommand);
    } else {
      const putParams = {
        TableName: tableName,
        Item: {
          id: { S: fileId },
          uuid: { S: fileId },
          ...Object.entries(userData).reduce((acc, [key, value]) => {
            acc[key] = typeof value === "number" ? { N: value.toString() } : { S: value || "" };
            return acc;
          }, {})
        }
      };
      const putCommand = new PutItemCommand(putParams);
      await dynamoDbClient.send(putCommand);
    }
  } catch (dynamoError) {
    console.error("Cap nhat Users that bai", dynamoError);
    throw dynamoError;
  }
};
var findAllRecordsHaveStatusInsertSuccess = async (dynamoDbClient, tableName, status) => {
  try {
    const scanCommand = new ScanCommand({
      TableName: tableName,
      FilterExpression: "#status = :status",
      ExpressionAttributeNames: {
        "#status": "status"
      },
      ExpressionAttributeValues: {
        ":status": { S: status }
      }
    });
    const scanResponse = await dynamoDbClient.send(scanCommand);
    return scanResponse;
  } catch (error) {
    console.error("Error finding records with status InsertSuccess:", error);
    throw error;
  }
};
var updateAllRecordsInTableWithEmail = async (dynamoDBClient, tableName) => {
  try {
    const scanCommand = new ScanCommand({ TableName: tableName });
    const scanResult = await dynamoDBClient.send(scanCommand);
    const items = scanResult.Items;
    console.log("items>>>", items);
    if (!items || items.length === 0) {
      console.log("No items found in the table.");
      return;
    }
    for (const item of items) {
      const primaryKey = item.id;
      console.log("primaryKey>>>", primaryKey);
      if (!primaryKey) {
        console.error("Item missing primary key:", item);
        continue;
      }
      const updateCommand = new UpdateItemCommand({
        TableName: tableName,
        Key: { id: primaryKey },
        // Replace 'id' with your actual primary key attribute name
        UpdateExpression: "SET email = :email",
        ExpressionAttributeValues: {
          ":email": { S: "automail@gmail.com" }
        }
      });
      await dynamoDBClient.send(updateCommand);
      console.log(`C\u1EADp nh\u1EADt email th\xE0nh c\xF4ng: ${primaryKey.S}`);
    }
  } catch (error) {
    console.error("Error finding records with status InsertSuccess:", error);
    throw error;
  }
};
var updateAllRecordsInTableWithAvatar = async (dynamoDBClient, imageUrl, usersTable) => {
  try {
    const scanCommand = new ScanCommand({ TableName: usersTable });
    const scanResult = await dynamoDBClient.send(scanCommand);
    const items = scanResult.Items;
    console.log("items>>>", items);
    if (!items || items.length === 0) {
      console.log("No items found in the table.");
      return;
    }
    for (const item of items) {
      const primaryKey = item.id;
      if (!primaryKey) {
        console.error("Item missing primary key:", item);
        continue;
      }
      const updateCommand = new UpdateItemCommand({
        TableName: usersTable,
        Key: { id: primaryKey },
        UpdateExpression: "SET avatar = :avatar",
        ExpressionAttributeValues: {
          ":avatar": { S: imageUrl }
        }
      });
      await dynamoDBClient.send(updateCommand);
      console.log(`C\u1EADp nh\u1EADt avatar th\xE0nh c\xF4ng: ${primaryKey.S}`);
    }
  } catch (error) {
    console.error("Error updating records with avatar:", error);
    throw error;
  }
};

// src/lambda/create-update-detele-search-dynamo-sqs-s3/connectAndUpdateS3.ts
import { S3Client, CreateBucketCommand, PutObjectCommand, GetObjectCommand, HeadBucketCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
var connectToS3Bucket = async () => {
  return new S3Client({ region: "ap-northeast-1" });
};
var getAllContentFromS3Uploaded = async (params, s3) => {
  try {
    const command = new GetObjectCommand(params);
    const data = await s3.send(command);
    const streamToString = (stream) => new Promise((resolve, reject) => {
      const chunksData = [];
      stream.on("data", (chunk) => chunksData.push(chunk));
      stream.on("error", reject);
      stream.on("end", () => resolve(Buffer.concat(chunksData).toString("utf-8")));
    });
    const csvString = await streamToString(data.Body);
    const lines = csvString.split("\n");
    const headers = lines[0].split(",");
    const jsonData = lines.slice(1).map((line) => {
      const values = line.split(",");
      const obj = {};
      for (let i = 0; i < headers.length; i++) {
        obj[headers[i].trim()] = values[i] ? values[i].trim() : null;
      }
      return obj;
    });
    console.log("Doc noi dung thanh cong");
    return jsonData;
  } catch (error) {
    console.error("read noi dung csv thanh cong:", error);
    throw error;
  }
};
var createNewBucketS3 = async (s3, bucketDestination) => {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: bucketDestination }));
    console.log(`Bucket ${bucketDestination} already exists.`);
  } catch (error) {
    if (error.$metadata?.httpStatusCode === 404) {
      const createBucketParams = {
        Bucket: bucketDestination,
        CreateBucketConfiguration: {
          LocationConstraint: "ap-northeast-1"
        }
      };
      await s3.send(new CreateBucketCommand(createBucketParams));
      console.log(`Bucket ${bucketDestination} created successfully.`);
    } else {
      console.error("Error creating new bucket S3:", error);
      throw error;
    }
  }
};
var copyItemToNewBucket = async (s3, newBucket, newImageUrl, path) => {
  try {
    const params = {
      Bucket: newBucket,
      Key: newImageUrl,
      Body: path
    };
    const command = new PutObjectCommand(params);
    await s3.send(command);
    console.log("Upload new image to S3 bucket successfully");
  } catch (error) {
    console.error("Copy file from one bucket to another error:", error);
    throw error;
  }
};

// src/lambda/create-update-detele-search-dynamo-sqs-s3/connectAndUpdateSQS.ts
import { SQSClient, ListQueuesCommand, CreateQueueCommand, SendMessageCommand, DeleteMessageCommand } from "@aws-sdk/client-sqs";
var connectToSQS = async () => {
  return new SQSClient({ region: "ap-northeast-1" });
};
var removeMessageFromSQS = async (event, queueUrl, sqs) => {
  try {
    const handle = event.Records[0].receiptHandle;
    const deleteMessageCommand = new DeleteMessageCommand({
      QueueUrl: queueUrl,
      ReceiptHandle: handle
    });
    await sqs.send(deleteMessageCommand);
  } catch (error) {
    console.error("Error removing message from SQS:", error);
    throw new Error("Failed to remove message from SQS");
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

// src/lambda/demo/avatar.ts
var setAvatarDemo = async () => {
  try {
    const newBucket = await getSecretOfKey("bucketAvatar");
    const usersTable = await getSecretOfKey("usersTableName");
    const createNewBucket = await connectToS3Bucket();
    await createNewBucketS3(createNewBucket, newBucket);
    const path = "picture/linh123.jpg";
    const randomSequence = "-demo123";
    console.log("Random Sequence:", randomSequence);
    const newImageUrl = `avatar${randomSequence}.jpg`;
    const s3 = await connectToS3Bucket();
    const dynamoDb = await connectToDynamoDb();
    await updateAllRecordsInTableWithAvatar(dynamoDb, newImageUrl, usersTable);
    console.log("cap nhat avatar thanh cong");
    await copyItemToNewBucket(s3, newBucket, newImageUrl, path);
  } catch (error) {
    console.error("Call Lambda Avatar Fail", error);
    throw error;
  }
};

// src/lambda/demo/mail.ts
var setMailDemo = async () => {
  try {
    const dynamoDBClient = await connectToDynamoDb();
    const usersTableName = await getSecretOfKey("usersTableName");
    await updateAllRecordsInTableWithEmail(dynamoDBClient, usersTableName);
    console.log("Update Mail thanh cong");
  } catch (error) {
    console.error("Error setting email:", error);
    throw error;
  }
};

// src/lambda/get-csv-read-detail-update-inprocessing-lambda/index.ts
var handler = async (event) => {
  try {
    const usersTable = await getSecretOfKey("usersTableName");
    const updateCsvTable = await getSecretOfKey("uploadCsvTableName");
    const bucketCsvName = await getSecretOfKey("bucketCsvName");
    const sqsName = await getSecretOfKey("sqsName");
    const apiGateway = await getSecretOfKey("apiGateway");
    const prefixQueueURL = await getSecretOfKey("prefixQueueURL");
    const queueUrl = prefixQueueURL + sqsName;
    const dynamoDb = await connectToDynamoDb();
    const s3 = await connectToS3Bucket();
    const sqs = await connectToSQS();
    const checkTableUserExits = await findTableExists(usersTable, dynamoDb);
    console.log("checkTableUserExits>>>", checkTableUserExits);
    if (!checkTableUserExits) {
      await createTableInDynamoDB(dynamoDb, usersTable);
    }
    for (const record of event.Records) {
      const body = JSON.parse(record.body);
      const fileId = body.fileId;
      await updateTableInDynamoDB(dynamoDb, updateCsvTable, fileId, "inProcessing");
      const keyName = `csv/${fileId}.csv`;
      const jsonData = await getAllContentFromS3Uploaded({
        Bucket: bucketCsvName,
        Key: keyName
      }, s3);
      console.log("jsonData >>>", jsonData);
      for (const userData of jsonData) {
        await updateUsersTableWitInfoFromCSV(dynamoDb, userData, fileId, usersTable);
      }
      await updateTableInDynamoDB(dynamoDb, updateCsvTable, fileId, "InsertSuccess");
      console.log("cap nhat insert success >>>");
      const records = await findAllRecordsHaveStatusInsertSuccess(dynamoDb, updateCsvTable, "InsertSuccess");
      console.log("Records >>> ", records);
      if (records && records.Items.length > 0) {
        console.log("Record Debug", records);
        for (const item of records.Items) {
          console.log("Bat dau xu ly logic batch processing", item.id.S);
          await updateTableInDynamoDB(dynamoDb, updateCsvTable, item.id.S, "BatchRunning");
        }
        await removeMessageFromSQS(event, queueUrl, sqs);
        console.log("Xoa message khoi SQS queue thanh cong");
        await setAvatarDemo();
        await setMailDemo();
        console.log("Set mail thanh cong");
        await updateTableInDynamoDB(dynamoDb, updateCsvTable, fileId, "Success");
        console.log("Hoan tat");
      }
    }
  } catch (error) {
    console.error("Error in Lambda function:", error);
    throw error;
  }
};
export {
  handler
};
