import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';

const connectDynamoDB = new DynamoDBClient({
  endpoint: 'http://localhost:8000',
  region: 'us-west-2',
});

export const handler = async () => {
  const params = { TableName: 'UserList' };
  try {
    const command = new ScanCommand(params);
    const data = await connectDynamoDB.send(command);
    return {
      statusCode: 200,
      body: JSON.stringify(data.Items),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Could not retrieve users' }),
    };
  }
};
