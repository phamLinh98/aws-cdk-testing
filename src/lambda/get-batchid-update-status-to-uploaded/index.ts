import { addCorsHeaders } from "../../utils/cors";
import { connectToDynamoDb, updateTableInDynamoDB } from "../create-update-detele-search-dynamo-sqs-s3/connectAndUpdateDynamoDb";
import { connectToSQS, createNewSQSQueue, getAnSpecificItemFromListSQS, sendNewMessageToSQS } from "../create-update-detele-search-dynamo-sqs-s3/connectAndUpdateSQS";
import { getSecretOfKey } from "../get-secret-key-from-manager";

export const handler = async (event:any) => {
      try {
            // Get the secret key from AWS Secrets Manager
            const uploadCsvTable = await getSecretOfKey("uploadCsvTableName");
            const sqsName = await getSecretOfKey("sqsName");
            const prefixQueueUrl = await getSecretOfKey("prefixQueueURL");

            // Connect to DynamoDB and SQS
            const dynamoDb = await connectToDynamoDb();
            const sqsClient = await connectToSQS();

            // Get the bucket name and file name from the S3 event
            const bucketName = event.Records[0].s3.bucket.name;
            const fileNameSavedInS3CsvBucket = event.Records[0].s3.object.key;

            //if Not CSV file, exit
            if (!fileNameSavedInS3CsvBucket.endsWith('.csv')) {
                  console.log('Not a CSV file.  Exiting.');
                  return {
                        statusCode: 200,
                        body: JSON.stringify({ message: 'Not a CSV file.  No action taken.' }),
                  };
            }

            // Get the file name without the path and extension
            const fileId = fileNameSavedInS3CsvBucket.split('/').pop().split('.')[0];
            console.log('fileId>>>', fileId);

            //Update the status in DynamoDB tobe 'Uploaded'
            await updateTableInDynamoDB(dynamoDb, uploadCsvTable, fileId, 'Uploaded');

            // Check SQS Queue is Exist or Not
            const checkItemSpecificItemInSQSList = await getAnSpecificItemFromListSQS(sqsClient);
            const exitstingQueueUrl = checkItemSpecificItemInSQSList.QueueUrls || [];
            const queueExists = exitstingQueueUrl.some((queueUrl: string) => queueUrl.endsWith(`/${sqsName}`));
            console.log('queueExists>>', queueExists);

            // If the queue does not exist, create it
            if (!queueExists) {
                  // Create a new SQS queue
                  await createNewSQSQueue(sqsClient, sqsName);
                  console.log(`Queue ${sqsName} created successfully.`);
            }

            // Send a new message to the SQS queue
            const queryUrl = prefixQueueUrl + sqsName;
            console.log('queryUrl>>', queryUrl);
            const sqsParams = {
                  QueueUrl: queryUrl,
                  MessageBody: JSON.stringify({ fileId }),
            };

            console.log('sqsParams>>>', sqsParams);

            await sendNewMessageToSQS(sqsClient, sqsParams);

            console.log('Message sent to SQS successfully.');

            return addCorsHeaders({
                  statusCode: 200,
                  body: JSON.stringify({ message: 'Message sent to SQS successfully.' }),
            })

      } catch (error) {
            console.error('Error in handler:', error);
            return {
                  statusCode: 500,
                  body: JSON.stringify({ message: 'Cannot Call this lambda' }),
            }
      }

}