const data = '["sqs:SendMessage","sqs:ReceiveMessage","sqs:DeleteMessage","sqs:GetQueueAttributes","sqs:ListQueues"]';
const parsedData = JSON.parse(data);
console.log('meme', parsedData);