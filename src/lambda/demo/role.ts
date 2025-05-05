import { connectToDynamoDb, updateAllRecordsInTableWithRole } from "../create-update-detele-search-dynamo-sqs-s3/connectAndUpdateDynamoDb";
import { getSecretOfKey } from "../get-secret-key-from-manager";

export const setRoleDemo = async () => {
      try {
            console.log('Set new role record');
            const dynamoDBClient = await connectToDynamoDb();
            const usersTable = await getSecretOfKey('usersTableName');
            await updateAllRecordsInTableWithRole(dynamoDBClient, usersTable);
            console.log('Update Role thanh cong');
            return true;
      } catch (error) {
            console.error('Error setting role:', error);
            throw error;
      }
}