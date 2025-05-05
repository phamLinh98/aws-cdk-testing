import { updateAllRecordsInTableWithRole } from "../create-update-detele-search-dynamo-sqs-s3/connectAndUpdateDynamoDb";

export const setRoleDemo = async (dynamoDb:any, s3:any, usersTable:any) => {
      try {
            console.log('Set new role record');
            const updateRole = await updateAllRecordsInTableWithRole(dynamoDb, usersTable);
            console.log('Update Role thanh cong',updateRole);
            return true;
      } catch (error) {
            console.error('Error setting role:', error);
            throw error;
      }
}