import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';
import { envConfig } from '../config/env';
import {
  createNewDeadLetterQueue,
  createNewSQS,
  settingNewPolicy,
  settingSqsEventSource,
} from '../custom-constracts/csv-upload-resources';

type SQSSetup = {
  queue: {
    [key: string]: Queue;
  };
  policy: {
    [key: string]: PolicyStatement;
  };
  sqsEventSource: {
    [key: string]: SqsEventSource;
  };
};

type SQSInfo = {
  idQueue: string;
  queueName: string;
  maxTime?: string;
  visibilityTimeout?: string;
  maxReceiveCount?: string;
  batchSize?: string;
  maxCurrency?: string;
  isDedleterQueue?: string;
  deadLetterQueueName?: string;
  policyActionList?: string;
};

export const sqsSetup = (scope: Construct) => {
  const queue = envConfig.aws.queue as {
    [key: string]: SQSInfo;
  };
  const listQueue = Object.keys(queue);
  const result: SQSSetup = {
    queue: {},
    policy: {},
    sqsEventSource: {},
  };

  // Setup SQS
  for (const key of listQueue) {
    const queueInfo = queue[key];
    const isDedleterQueue = +(queueInfo.isDedleterQueue ?? 0);

    // Create SQS
    switch (isDedleterQueue) {
      // Normal Queue
      case 0:
        {
          const deadLetterQueue = result.queue[queueInfo.deadLetterQueueName!] ?? undefined;
          const normalQueue = createNewSQS(
            scope,
            queueInfo.idQueue,
            queueInfo.queueName,
            +(queueInfo.maxTime ?? 14),
            +(queueInfo.visibilityTimeout ?? 30),
            deadLetterQueue,
            +(queueInfo.maxReceiveCount ?? 5),
          );
          result.queue[queueInfo.idQueue] = normalQueue;
        }
        break;
      // Dead Letter Queue
      case 1:
        {
          const deadLetterQueue = createNewDeadLetterQueue(
            scope,
            queueInfo.idQueue,
            queueInfo.queueName,
            +(queueInfo.maxTime ?? 14),
          );
          result.queue[queueInfo.idQueue] = deadLetterQueue;
        }
        break;
      // Other Queue Type: 3,4,5...
    }

    // Setup Policy
    const keyPolicy = queueInfo.policyActionList! as keyof typeof envConfig.aws.policyActionList;
    const policyActionString = envConfig.aws.policyActionList[keyPolicy] || '';
    const policyActionList = policyActionString
      .split(',')
      .map((item) => item.trim())
      .filter((action) => action.includes(':')); // Ensure valid action strings
    const isSetPolicy = policyActionList.length > 0;
    if (isSetPolicy) {
      const policy = settingNewPolicy(policyActionList, [result.queue[queueInfo.idQueue].queueArn]);
      result.policy[queueInfo.idQueue] = policy;
    }

    // Setup SQS Event Source
    // Check if batchSize and maxCurrency are defined then setup SQS Event Source
    if (queueInfo.batchSize && queueInfo.maxCurrency) {
      const sqsEventSource = settingSqsEventSource(
        result.queue[queueInfo.idQueue],
        +queueInfo.batchSize,
        +queueInfo.maxCurrency,
      );
      result.sqsEventSource[queueInfo.idQueue] = sqsEventSource;
    }
  }

  return result;
};
