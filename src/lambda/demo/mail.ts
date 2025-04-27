import { connectToDynamoDb, updateAllRecordsInTableWithEmail } from "../create-update-detele-search-dynamo-sqs-s3/connectAndUpdateDynamoDb";
import { getSecretOfKey } from "../get-secret-key-from-manager";

export const setMailDemo = async () => {
      try {
            const dynamoDBClient = await connectToDynamoDb();
            const usersTableName = await getSecretOfKey('usersTableName');
            await updateAllRecordsInTableWithEmail(dynamoDBClient, usersTableName);
            console.log('Update Mail thanh cong');
      } catch (error) {
            console.error('Error setting email:', error);
            throw error;
      }
}