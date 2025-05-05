import { connectToDynamoDb, updateAllRecordsInTableWithEmail } from "../create-update-detele-search-dynamo-sqs-s3/connectAndUpdateDynamoDb";
import { getSecretOfKey } from "../get-secret-key-from-manager";

export const setMailDemo = async () => {
      try {
            console.log('Bat dau set new mail record');
            const dynamoDBClient = await connectToDynamoDb();
            const usersTableName = await getSecretOfKey('usersTableName');
            const updateMail  =  await updateAllRecordsInTableWithEmail(dynamoDBClient, usersTableName);
            console.log('updateMail', updateMail);
            return true;
      } catch (error) {
            console.error('Error setting email:', error);
            throw error;
      }
}