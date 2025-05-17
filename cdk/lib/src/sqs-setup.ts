import { Construct } from 'constructs';
import { envConfig } from '../config/env';
import {
  createNewDeadLetterQueue,
  createNewSQS,
  settingNewPolicy,
  settingSqsEventSource,
} from '../custom-constracts/csv-upload-resources';
import { EnvSqsSetupType, SqsSetupItemType, SqsSetupType } from './interface/sqs';

export const sqsSetup = (scope: Construct, env: any) => {
  const envQueue = env.queue as EnvSqsSetupType;
  const keys = Object.keys(envQueue).sort(
    (a, b) => +envQueue[a].isDeadLeterQueue - +envQueue[b].isDeadLeterQueue,
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
      case 1:
      default: {
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
