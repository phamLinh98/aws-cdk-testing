import { SQSClient, ListQueuesCommand, CreateQueueCommand, SendMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';

export const connectToSQS = async () => {
      return new SQSClient({ region: 'ap-northeast-1' });
}

export const getAnSpecificItemFromListSQS = async (sqsClient:any) => {
      return await sqsClient.send(new ListQueuesCommand({}));
}

export const createNewSQSQueue = async (sqsClient:any, sqsName:any) => {
      try {
            await sqsClient.send(new CreateQueueCommand({ QueueName: sqsName }));
      } catch (error:any) {
            if (error.Code === 'AWS.SimpleQueueService.QueueDeletedRecently') {
                  console.log('Queue was recently deleted. Waiting 60 seconds before retrying...');
                  await new Promise(resolve => setTimeout(resolve, 60000)); // Wait for 60 seconds
                  await sqsClient.send(new CreateQueueCommand({ QueueName: sqsName }));
            } else {
                  console.log('Error creating SQS queue:', error);
                  throw error; // Re-throw other errors
            }
      }
}

export const sendNewMessageToSQS = async (sqsClient:any, sqsParams:any) => {
      try {
            const sendMessageCommand = new SendMessageCommand(sqsParams);
            const sqsResponse = await sqsClient.send(sendMessageCommand);
            console.log(`Message sent to SQS with ID: ${sqsResponse.MessageId}`);
      } catch (error) {
            console.error('Error sending message to SQS:', error);
            throw new Error('Failed to send message to SQS');
      }
}

export const removeMessageFromSQS = async (event:any, queueUrl:any, sqs:any) => {
      try {
            const handle = event.Records[0].receiptHandle;
            //TODO: Tạo lệnh xóa thông điệp khỏi hàng đợi SQS
            const deleteMessageCommand = new DeleteMessageCommand({
                  QueueUrl: queueUrl,
                  ReceiptHandle: handle,
            });

            // Gửi lệnh xóa thông điệp khỏi hàng đợi SQS
            await sqs.send(deleteMessageCommand);

      } catch (error) {
            console.error('Error removing message from SQS:', error);
            throw new Error('Failed to remove message from SQS');
      }
}