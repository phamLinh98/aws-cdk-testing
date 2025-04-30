import { DynamoDBClient, ScanCommand, CreateTableCommand, PutItemCommand, GetItemCommand, ListTablesCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { send } from 'process';
import { getUserDataMock } from './mocks/get-user-data-mock';

let dynamoDB: DynamoDBClient;

// DynamoDB configuration
export const connectToDynamoDb = async () => {
      return new DynamoDBClient({ region: 'ap-northeast-1' });
}

const connectToDynamoDbOnce = async () => {
      if (!dynamoDB) {
            dynamoDB = await connectToDynamoDb();
      }
      return dynamoDB;
}

const localConnectToDynamoDb = async () => {
      return {
            send: async (command: any) => {
                  console.log('This is mocked DynamoDB local, command:', command);
                  return {
                        Items: getUserDataMock
                  };
            }
      } as DynamoDBClient;
}


export const getInstanceDynamoDB = async () => {
      if (process.env.NODE_ENV === 'Debug') {
            return await localConnectToDynamoDb();
      } else {
            return await connectToDynamoDbOnce();
      }
}