import { connectToDynamoDb, updateAllRecordsInTableWithAvatar } from "../create-update-detele-search-dynamo-sqs-s3/connectAndUpdateDynamoDb";
import { connectToS3Bucket, copyItemToNewBucket } from "../create-update-detele-search-dynamo-sqs-s3/connectAndUpdateS3";
import { getSecretOfKey } from "../get-secret-key-from-manager";

export const setAvatarDemo = async () => {
      try {
            const newBucket = await getSecretOfKey("bucketAvatar");
            const usersTable = await getSecretOfKey("usersTableName");
            const path = "picture/linh123.jpg";
            //TODO: 
            const newImageUrl = `avatar_${Date.now()}.jpg`;
            console.log('newImageUrl', newImageUrl);

            const s3 = await connectToS3Bucket();
            const dynamoDb = await connectToDynamoDb();

            // Update avatar for all users 
            const updateAvatar = await updateAllRecordsInTableWithAvatar(dynamoDb, newImageUrl, usersTable);
            console.log('Update Avatar 1',updateAvatar);

            //TODO: save newImage vào bucket newBucket
            const copyCsvToNewBucket = await copyItemToNewBucket(s3, newBucket, newImageUrl, path);
            console.log('copyCsvToNewBucket123', copyCsvToNewBucket);
            return true;

      } catch (error) {
            console.error('Call Lambda Avatar Fail', error);
            throw error;
      }
};