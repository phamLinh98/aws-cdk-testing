import { connectToDynamoDb, updateTableInDynamoDB } from "../create-update-detele-search-dynamo-sqs-s3/connectAndUpdateDynamoDb";
import { connectToS3Bucket, createPreUrlUpdateS3 } from "../create-update-detele-search-dynamo-sqs-s3/connectAndUpdateS3";
import { getSecretOfKey } from "../get-secret-key-from-manager";

export const handler = async (event:any) => {
     try {
       // Get the bucket name and table name from Secrets Manager
       const bucketName = await getSecretOfKey('bucketCsvName') as any;
       console.log('bucketName >>>', bucketName);
       const uploadCsvTable = await getSecretOfKey('uploadCsvTableName') as any;
       console.log('uploadCsvTable >>>', uploadCsvTable)
 
       // Connect to the S3 bucket
       const s3Client = await connectToS3Bucket();
 
       const dynamoDB = await connectToDynamoDb();
 
       console.log('Connect S3 and DB success >>');
 
       // Create a random UUID
       const generateUUID = () => {
             return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                   const r = Math.random() * 16 | 0;
                   const v = c === 'x' ? r : (r & 0x3 | 0x8);
                   return v.toString(16);
             });
       };
 
       const fileName = generateUUID();
 
       console.log('fileName >>>', fileName);
 
       // Create new Table 'Upload-csv' In DynamoDB
       //await createTableInDynamoDB(dynamoDB, uploadCsvTable);
 
       // Update Table 'Upload-csv' In DynamoDB tobe 'Uploading'
       await updateTableInDynamoDB(dynamoDB, uploadCsvTable, fileName, 'Uploading');
 
       // Set name csv saved in S3 bucket
       const nameCsvSaveIntoS3Bucket = 'csv/' + fileName + '.csv';
 
       console.log('nameCsvSaveIntoS3Bucket >>>');
 
       // Set the time expired for the presigned URL
       const timeExpired = 3600;
 
       // Create new Presigned URL to Access S3 bucket
       const data = await createPreUrlUpdateS3(s3Client, bucketName, nameCsvSaveIntoS3Bucket, timeExpired, fileName);
 
       return data;
     }
     catch (error) {
       console.error('Call Lambda Fail');
       return {
         statusCode: 500,
         body: JSON.stringify({ message: 'Call Lambda PreURL fail' }),
       };
     }

}