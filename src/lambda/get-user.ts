import { APIGatewayProxyEventV2, Context } from "aws-lambda";
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";

const ddb = new DynamoDBClient({});
const TABLE = process.env.USER_TABLE!;

export const handler = async (event: APIGatewayProxyEventV2, _: Context) => {
  const id = event.pathParameters?.id;
  if (!id) return { statusCode: 400, body: "Missing id" };

  const { Item } = await ddb.send(new GetItemCommand({
    TableName: TABLE,
    Key: { id: { S: id } },
  }));

  return {
    statusCode: 200,
    body: JSON.stringify(Item ?? {}),
  };
};