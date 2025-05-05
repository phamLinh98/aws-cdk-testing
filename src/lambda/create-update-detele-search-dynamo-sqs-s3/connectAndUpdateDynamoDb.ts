import { DynamoDBClient, ScanCommand, CreateTableCommand, PutItemCommand, GetItemCommand, ListTablesCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';

// DynamoDB configuration
export const connectToDynamoDb = async () => {
      return new DynamoDBClient({ region: 'ap-northeast-1' });
}

// Check Table Exists In DynamoDB or Not
export const findTableExists = async (tableName: any, dynamoDbClient: any) => {
      try {
            const listTablesCommand = new ListTablesCommand({});
            const tables = await dynamoDbClient.send(listTablesCommand);
            console.log('tables', tables)
            return tables.TableNames.includes(tableName);
      } catch (error) {
            console.error('Error checking if table exists:', error);
            throw error;
      }
}

// Query Get Item From DynamoDB
export const getItemFromDynamoDB = async (dynamoDBClient: any, tableName: any, id: any) => {
      try {
            const command = new ScanCommand({
                  TableName: tableName,
                  FilterExpression: "#id = :id",
                  ExpressionAttributeNames: {
                        "#id": "id"
                  },
                  ExpressionAttributeValues: {
                        ":id": { S: id }
                  },
            });
            const data = await dynamoDBClient.send(command);
            return data.Items; // Return the Items array from the response
      } catch (error) {
            console.error("Error getting item from DynamoDB:", error);
            throw error;
      }
};

// Query Create Table In DynamoDB
export const createTableInDynamoDB = async (connectToDynamoDb: any, tableName: any) => {
      const params = {
            TableName: tableName,
            KeySchema: [
                  { AttributeName: 'id', KeyType: 'HASH' },
            ],
            AttributeDefinitions: [
                  { AttributeName: 'id', AttributeType: 'S' },
            ],
            ProvisionedThroughput: {
                  ReadCapacityUnits: 1,
                  WriteCapacityUnits: 1,
            },
      } as any;

      try {
            await connectToDynamoDb.send(new CreateTableCommand(params));
            console.log('Tao bang thanh cong', tableName);
      } catch (err: any) {
            console.log('Tao bang that bai')
            if (err.name !== 'ResourceInUseException') {
                  throw err;
            }
      }
}

// Query Update Table In DynamoDB
export const updateTableInDynamoDB = async (dynamoDbClient: any, tableName: any, fileName: any, status: any) => {
      console.log('tableName', tableName); //upload-csv
      console.log('fileName', fileName); // 
      console.log('status', status)
      // 1000 line for resolve data before update to DynamoDB
      try {
            const params = {
                  TableName: tableName,
                  Key: {
                        id: { S: fileName },
                  },
                  UpdateExpression: "SET #status = :status",
                  ExpressionAttributeNames: {
                        "#status": "status",
                  },
                  ExpressionAttributeValues: {
                        ":status": { S: status },
                  },
            };

            const updateCommand = new UpdateItemCommand(params);
            await dynamoDbClient.send(updateCommand);
            console.log('Table updated successfully');
      } catch (error) {
            console.error('Error updating table:', error);
            throw error;
      }
};


// Query Update Users Table In DynamoDB by CSV info uploaded to S3
export const updateUsersTableWitInfoFromCSV = async (dynamoDbClient: any, userData: any, fileId: any, tableName: any) => {
      try {
            const getUserCommand = new GetItemCommand({
                  TableName: tableName,
                  Key: {
                        id: { S: fileId },
                  },
            });

            // Use the provided dynamoDbClient instead of creating a new one
            const getUserResponse = await dynamoDbClient.send(getUserCommand);

            if (getUserResponse.Item) {
                  //Cập nhật bảng Users tại vị trí userId với dữ liệu từ file csv
                  const updateParams = {
                        TableName: tableName,
                        Key: {
                              id: { S: fileId },
                        },
                        UpdateExpression: 'SET #name = :name, #age = :age, #avatar = :avatar, #position = :position, #salary = :salary, #uuid = :uuid',
                        ExpressionAttributeNames: {
                              '#name': 'name',
                              '#age': 'age',
                              '#avatar': 'avatar',
                              '#position': 'position',
                              '#salary': 'salary',
                              '#uuid': 'uuid',
                        },
                        ExpressionAttributeValues: {
                              ':name': { S: userData.userName },
                              ':age': { N: userData.userAge !== null ? userData.userAge.toString() : '0' },
                              ':avatar': { S: userData.userAvatar },
                              ':position': { S: userData.userPosition },
                              ':salary': { N: userData.userSalary !== null ? userData.userSalary.toString() : '0' },
                              ':uuid': { S: fileId },
                        },
                  };

                  const updateCommand = new UpdateItemCommand(updateParams);
                  await dynamoDbClient.send(updateCommand);
            } else {
                  const putParams = {
                        TableName: tableName,
                        Item: {
                              id: { S: fileId },
                              uuid: { S: fileId },
                              ...Object.entries(userData).reduce((acc: any, [key, value]) => {
                                    acc[key] = typeof value === 'number'
                                          ? { N: value.toString() }
                                          : { S: value || '' };
                                    return acc;
                              }, {}),
                        },
                  };

                  const putCommand = new PutItemCommand(putParams);
                  await dynamoDbClient.send(putCommand);
            }
      } catch (dynamoError: any) {
            console.error('Cap nhat Users that bai', dynamoError);
            throw dynamoError;
      }
}

// Find all records have status InsertSuccess
export const findAllRecordsHaveStatusInsertSuccess = async (dynamoDbClient: any, tableName: any, status: any) => {
      try {
            const scanCommand = new ScanCommand({
                  TableName: tableName,
                  FilterExpression: '#status = :status',
                  ExpressionAttributeNames: {
                        '#status': 'status',
                  },
                  ExpressionAttributeValues: {
                        ':status': { S: status },
                  },
            });

            //Gửi lệnh scan để tìm kiếm các record có status = InsertSuccess
            const scanResponse = await dynamoDbClient.send(scanCommand);
            return scanResponse

      } catch (error) {
            console.error('Error finding records with status InsertSuccess:', error);
            throw error;
      }
}

// Update them with avatar
export const updateAllRecordsInTableWithAvatar = async (dynamoDBClient: any, imageUrl: any, usersTable: any) => {
      try {
            const scanCommand = new ScanCommand({ TableName: usersTable });
            const scanResult = await dynamoDBClient.send(scanCommand);
            const items = scanResult.Items;
            if (!items || items.length === 0) {
                  console.log("No items found in the table.");
                  return;
            }

            for (const item of items) {
                  const primaryKey = item.id; // Assuming 'id' is the primary key of the table

                  if (!primaryKey) {
                        console.error("Item missing primary key:", item);
                        continue;
                  }

                  const updateCommand = new UpdateItemCommand({
                        TableName: usersTable,
                        Key: { id: primaryKey },
                        UpdateExpression: "SET avatar = :avatar",
                        ExpressionAttributeValues: {
                              ":avatar": { S: imageUrl }
                        }
                  });

                  await dynamoDBClient.send(updateCommand);
            }
            return true;
      } catch (error) {
            console.error('Error updating records with avatar:', error);
            throw error;
      }
}

// Update them with email
export const updateAllRecordsInTableWithEmail = async (dynamoDBClient: any, tableName: any) => {
      try {
            console.log('Set Mail LOOP');
            //TODO: tôi cần 1 logic lấy toàn bộ bản ghi có trong bảng tableName
            const scanCommand = new ScanCommand({ TableName: tableName });
            const scanResult = await dynamoDBClient.send(scanCommand);
            const items = scanResult.Items;
            if (!items || items.length === 0) {
                  console.log("No items found in the table.");
                  return true; // Không có gì để update => cũng không lỗi
            }

            for (const item of items) {
                const primaryKey = item.id; // Assuming 'id' is the primary key of the table
                  if (!primaryKey) {
                        console.error("Item missing primary key:", item);
                        continue; // bỏ qua nhưng không thất bại toàn bộ
                  }
                  const updateCommand = new UpdateItemCommand({
                        TableName: tableName,
                        Key: { id: primaryKey },
                        UpdateExpression: "SET email = :email",
                        ExpressionAttributeValues: {
                              ":email": { S: "automail@gmail.com" }
                        }
                  });

                  await dynamoDBClient.send(updateCommand);
            }

            return true; // thành công toàn bộ

      } catch (error) {
            console.error('Error updating records:', error);
            return false; // thất bại
      }
}

// Update them with role
export const updateAllRecordsInTableWithRole = async (dynamoDBClient: any, usersTable: any) => {
      try {
            const scanCommand = new ScanCommand({ TableName: usersTable });
            const scanResult = await dynamoDBClient.send(scanCommand);
            const items = scanResult.Items;

            console.log('items>>>', items);

            if (!items || items.length === 0) {
                  console.log("No items found in the table.");
                  return;
            }

            for (const item of items) {
                  if (!item.id) {
                        console.error("Item missing primary key:", item);
                        continue;
                  }

                  const updateCommand = new UpdateItemCommand({
                        TableName: usersTable,
                        Key: { id: item.id },
                        UpdateExpression: "SET #position = :position",
                        ExpressionAttributeNames: {
                              "#position": "position"
                        },
                        ExpressionAttributeValues: {
                              ":position": { S: 'employees' }
                        }
                  });

                  await dynamoDBClient.send(updateCommand);
                  console.log(`Cập nhật role thành công: ${item.id.S}`);
            }
            return true;
      } catch (error) {
            console.error('Error updating records with role:', error);
            throw error;
      }
}