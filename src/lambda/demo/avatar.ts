import { connectToDynamoDb, updateAllRecordsInTableWithAvatar } from "../create-update-detele-search-dynamo-sqs-s3/connectAndUpdateDynamoDb";
import { connectToS3Bucket, copyItemToNewBucket, createNewBucketS3 } from "../create-update-detele-search-dynamo-sqs-s3/connectAndUpdateS3";
import { generateRandomSequence } from '../createUUID';
import { getSecretOfKey } from "../get-secret-key-from-manager";

export const setAvatarDemo = async () => {
      try {
            const newBucket = await getSecretOfKey("bucketAvatar");
            const usersTable = await getSecretOfKey("usersTableName");

            //TODO: create new bucket with name newBucket
            const createNewBucket = await connectToS3Bucket();
            await createNewBucketS3(createNewBucket, newBucket);
            const path = "picture/linh123.jpg";
            //TODO: 
            const randomSequence = generateRandomSequence(10);
            console.log('Random Sequence:', randomSequence);
            const newImageUrl = `avatar${randomSequence}.jpg`;

            const s3 = await connectToS3Bucket();
            const dynamoDb = await connectToDynamoDb();

            // Update avatar for all users 
            await updateAllRecordsInTableWithAvatar(dynamoDb, newImageUrl, usersTable);
            console.log('cap nhat avatar thanh cong');

            //TODO: save newImage vào bucket newBucket
            await copyItemToNewBucket(s3, newBucket, newImageUrl, path);

      } catch (error) {
            console.error('Call Lambda Avatar Fail', error);
            throw error;
      }
};