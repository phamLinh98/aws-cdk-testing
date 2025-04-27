import { connectToDynamoDb, createTableInDynamoDB, findAllRecordsHaveStatusInsertSuccess, findTableExists, updateTableInDynamoDB, updateUsersTableWitInfoFromCSV } from "../create-update-detele-search-dynamo-sqs-s3/connectAndUpdateDynamoDb";
import { connectToS3Bucket, getAllContentFromS3Uploaded } from "../create-update-detele-search-dynamo-sqs-s3/connectAndUpdateS3";
import { connectToSQS, removeMessageFromSQS } from "../create-update-detele-search-dynamo-sqs-s3/connectAndUpdateSQS";
import { setAvatarDemo } from "../demo/avatar";
import { setMailDemo } from "../demo/mail";
import { getSecretOfKey } from "../get-secret-key-from-manager";

export const handler = async (event:any) => {
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

                  console.log('Records >>> ', records)
                  if (records && records.Items.length > 0) {
                        console.log('Record Debug', records);
                        for (const item of records.Items) {
                              console.log('Bat dau xu ly logic batch processing', item.id.S);
                              // Update the table in DynamoDB status to BatchRunning
                              await updateTableInDynamoDB(dynamoDb, updateCsvTable, item.id.S, 'BatchRunning');
                        }
                        // Remove message from SQS
                        await removeMessageFromSQS(event, queueUrl, sqs);
                        console.log('Xoa message khoi SQS queue thanh cong');

                        // Set Avatar for all users
                        await setAvatarDemo();

                        // Set mail for all users
                        await setMailDemo();
                        
                        console.log('Set mail thanh cong');

                        // Set role for all users
                        // await setRoleDemo();
                        // console.log('Set role thanh cong');

                        // Update the table in DynamoDB status to Success
                        await updateTableInDynamoDB(dynamoDb, updateCsvTable, fileId, 'Success');
                        console.log('Hoan tat');
                  }
            }


      } catch (error) {
            console.error("Error in Lambda function:", error);
            throw error;
      }
}