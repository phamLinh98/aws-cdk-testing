import { connectToDynamoDb, getItemFromDynamoDB } from "../create-update-detele-search-dynamo-sqs-s3/connectAndUpdateDynamoDb";
import { getSecretOfKey } from "../get-secret-key-from-manager";

export const getStatusHandler = async (event:any) => {
      //Get id from params path
      const getIdFromParams = event.queryStringParameters?.id;
      console.log('getIdFromParams >>>',getIdFromParams);

      //Connect to DynamoDB
      const dynamodb = await connectToDynamoDb();

      //Get the table name from the secret manager
      const uploadCsvTable = await getSecretOfKey("uploadCsvTableName");

      console.log('uploadCsvTable >>>',uploadCsvTable);
      //Get the item from DynamoDB
      try {
            console.log('LOG1');
            const data = await getItemFromDynamoDB(dynamodb, uploadCsvTable, getIdFromParams);
            console.log('data>>>', data.length);
            console.log('LOG2')
            if (data.length > 0) {
                  return {
                        statusCode: 200,
                        body: JSON.stringify(data[0]),
                  };
            } else {
                  return {
                        statusCode: 404,
                        body: JSON.stringify({ message: "No records found" }),
                  };
            }
      } catch (error:any) {
            return {
                  statusCode: 500,
                  body: JSON.stringify({ error: error.message }),
            };
      }
}