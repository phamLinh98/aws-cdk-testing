import { connectToDynamoDb, createTableInDynamoDB, findAllRecordsHaveStatusInsertSuccess, findTableExists, updateTableInDynamoDB, updateUsersTableWitInfoFromCSV } from "../create-update-detele-search-dynamo-sqs-s3/connectAndUpdateDynamoDb";
import { connectToS3Bucket, getAllContentFromS3Uploaded } from "../create-update-detele-search-dynamo-sqs-s3/connectAndUpdateS3";
import { connectToSQS, removeMessageFromSQS } from "../create-update-detele-search-dynamo-sqs-s3/connectAndUpdateSQS";
import { setAvatarDemo } from "../demo/avatar";
import { setMailDemo } from "../demo/mail";
import { setRoleDemo } from "../demo/role";
import { getSecretOfKey } from "../get-secret-key-from-manager";

export const handler = async (event: any) => {
      try {
            //Get the secret key from AWS Secret Manager
            const usersTable = await getSecretOfKey('usersTableName');
            const updateCsvTable = await getSecretOfKey('uploadCsvTableName');
            const bucketCsvName = await getSecretOfKey('bucketCsvName');
            const sqsName = await getSecretOfKey('sqsName');
            const apiGateway = await getSecretOfKey('apiGateway');
            const prefixQueueURL = await getSecretOfKey('prefixQueueURL');
            const queueUrl = prefixQueueURL + sqsName;

            //Connect to DynamoDB and S3
            const dynamoDb = await connectToDynamoDb();
            const s3 = await connectToS3Bucket();
            const sqs = await connectToSQS();

            //Check if the table exists
            const checkTableUserExits = await findTableExists(usersTable, dynamoDb);

            console.log('checkTableUserExits>>>', checkTableUserExits);

            //Check if the table not exists create the table Users
            if (!checkTableUserExits) {
                  await createTableInDynamoDB(dynamoDb, usersTable);
            }

            for (const record of event.Records) {
                  // xử lý lấy message từ queue
                  const body = JSON.parse(record.body);
                  const fileId = body.fileId;

                  // Update the table in DynamoDB status to inProcessing
                  await updateTableInDynamoDB(dynamoDb, updateCsvTable, fileId, 'inProcessing');

                  // Get the file from S3
                  const keyName = `csv/${fileId}.csv`;

                  const jsonData = await getAllContentFromS3Uploaded({
                        Bucket: bucketCsvName,
                        Key: keyName,
                  }, s3);

                  console.log('jsonData >>>', jsonData)

                  for (const userData of jsonData) {
                        await updateUsersTableWitInfoFromCSV(dynamoDb, userData, fileId, usersTable);
                  }

                  // Update the table in DynamoDB status to InsertSuccess
                  await updateTableInDynamoDB(dynamoDb, updateCsvTable, fileId, 'InsertSuccess');

                  console.log('cap nhat insert success >>>');

                  //Find all records have status InsertSuccess
                  const records = await findAllRecordsHaveStatusInsertSuccess(dynamoDb, updateCsvTable, 'InsertSuccess');
                  console.log('Found records:', records); // Check if records exist
                  // Remove message from SQS
                  await removeMessageFromSQS(event, queueUrl, sqs);

                  if (records && records.Items && records.Items.length > 0) {
                        console.log('Records in InsertSuccess state:', records.Items.length);
                        for (const item of records.Items) {
                              await updateTableInDynamoDB(dynamoDb, updateCsvTable, item.id.S, 'BatchRunning');
                        }
                  }
            }

            // Set Avatar for all users
            const setAvatar = await setAvatarDemo();
            console.log('Cap nhat avatar thanh cong', setAvatar);

            // Set Mail for all users
            const setMail = await setMailDemo();
            console.log('Cap nhat mail thanh cong', setMail);

            // Set Role for all users
            const setRole = await setRoleDemo();
            console.log('Cap nhat role thanh cong', setRole);

      } catch (error) {
            console.error("Error in Lambda function:", error);
            throw error;
      }
}