import { Construct } from 'constructs';
import { envConfig } from '../config/env';
import {
  createNewDeadLetterQueue,
  createNewSQS,
  settingNewPolicy,
  settingSqsEventSource,
} from '../custom-constracts/csv-upload-resources';
import * as cdk from 'aws-cdk-lib';

type EnvSqsSetupType = {
  [key: string]: {
    idQueue: string;
    queueName: string;
    maxTime?: string;
    visibilityTimeout?: string;
    maxReceiveCount?: string;
    batchSize?: string;
    maxCurrency?: string;
    isDeadLeterQueue?: any;
    deadLetterQueueName?: string;
    policyActionList?: string;
  };
};

export type SqsSetupItemType = {
  queue: cdk.aws_sqs.Queue;
  policy: cdk.aws_iam.PolicyStatement;
  sqsEventSource: cdk.aws_lambda_event_sources.SqsEventSource;
};

export type SqsSetupType = {
  [key: string]: SqsSetupItemType;
};

// export const queue = {
//   deadLetter: {
//     idQueue: process.env.AWS_DEAD_LTTER_ID_QUEUE || 'LinhClassDeadLetterQueue',
//     queueName: process.env.AWS_DEAD_LTTER_QUEUE_NAME || 'linhclass-dead-letter-queue',
//     maxTime: process.env.AWS_DEAD_LETTER_QUEUE_MAX_TIME || 14,
//     isDeadLeterQueue: process.env.AWS_DEAD_LETTER_IS_DELETE || 1,
//   },
//   main: {
//     idQueue: process.env.AWS_MAIN_ID_QUEUE || 'LinhClassMainQueue',
//     queueName: process.env.AWS_MAIN_QUEUE_NAME || 'linhclass-lambda-call-to-queue',
//     maxTime: process.env.AWS_MAIN_QUEUE_MAX_TIME || 14,
//     visibilityTimeout: process.env.AWS_MAIN_QUEUE_VISIBILITY_TIMEOUT || 30,
//     maxReceiveCount: process.env.AWS_MAIN_MAX_RETRIES || 5,
//     batchSize: process.env.AWS_BATCH_SIZE || 10,
//     maxCurrency: process.env.AWS_MAX_CURRENTCY || 5,
//     isDeadLeterQueue: process.env.AWS_DEAD_LETTER_IS_DELETE || 0,
//     deadLetterQueueName: 'deadLetter',
//     deadQueue: {
//       idQueue: process.env.AWS_DEAD_LTTER_ID_QUEUE || 'LinhClassDeadLetterQueue',
//       queueName: process.env.AWS_DEAD_LTTER_QUEUE_NAME || 'linhclass-dead-letter-queue',
//       maxTime: process.env.AWS_DEAD_LETTER_QUEUE_MAX_TIME || 14,
//       isDeadLeterQueue: process.env.AWS_DEAD_LETTER_IS_DELETE || 1,
//     },
//     policyActionList: 'sqsNormalPolicy',
//   }
// };

export const sqsSetup = (scope: Construct, env: any) => {
  const envQueue = env.queue as EnvSqsSetupType;
  const keys = Object.keys(envQueue).sort(
    (a, b) => +envQueue[a].isDeadLeterQueue - +envQueue[b].isDeadLeterQueue
  );

  const result = {} as SqsSetupType;
  for (const key of keys) {
    const queueInfo = envQueue[key];
    const sqsSetupItem = {} as SqsSetupItemType;

    switch (+queueInfo.isDeadLeterQueue) {
      case 0: {
        const dlq = queueInfo.deadLetterQueueName
          ? result[queueInfo.deadLetterQueueName]?.queue
          : undefined;
        sqsSetupItem.queue = createNewSQS(
          scope,
          queueInfo.idQueue,
          queueInfo.queueName,
          +(queueInfo.maxTime ?? 14),
          +(queueInfo.visibilityTimeout ?? 30),
          dlq,
          +(queueInfo.maxReceiveCount ?? 5),
        );
        break;
      }
      case 1: {
        sqsSetupItem.queue = createNewDeadLetterQueue(
          scope,
          queueInfo.idQueue,
          queueInfo.queueName,
          +(queueInfo.maxTime ?? 14),
        );
        break;
      }
    }

    const keyPolicy = queueInfo.policyActionList! as keyof typeof envConfig.aws.policyActionList;
    const policyActionString = envConfig.aws.policyActionList[keyPolicy] || '';
    const policyActionList = policyActionString
      .split(',')
      .map((item) => item.trim())
      .filter((action) => action.includes(':'));
    if (policyActionList.length) {
      sqsSetupItem.policy = settingNewPolicy(policyActionList, [sqsSetupItem.queue.queueArn]);
    }

    if (queueInfo.batchSize && queueInfo.maxCurrency) {
      sqsSetupItem.sqsEventSource = settingSqsEventSource(
        sqsSetupItem.queue,
        +queueInfo.batchSize,
        +queueInfo.maxCurrency,
      );
    }

    result[key] = sqsSetupItem;
  }
  return result;
};
