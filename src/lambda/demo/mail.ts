import { connectToDynamoDb, updateAllRecordsInTableWithEmail } from "../create-update-detele-search-dynamo-sqs-s3/connectAndUpdateDynamoDb";
import { getSecretOfKey } from "../get-secret-key-from-manager";

export const setMailDemo = async (dynamoDb:any, s3:any, usersTable:any) => {
      try {
            console.log('Bat dau set new mail record');
            const updateMail  =  await updateAllRecordsInTableWithEmail(dynamoDb, usersTable);
            console.log('updateMail thanh cong', updateMail);
            return true;
      } catch (error) {
            console.error('Error setting email:', error);
            throw error;
      }
}