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

export const sqsSetup = (scope: Construct, env: any) => {
  const envQueue = env.queue as EnvSqsSetupType;
  const result = {} as SqsSetupType;

  for (const key of Object.keys(envQueue)) {
    const queueInfo = envQueue[key];
    const sqsSetupItem = {} as SqsSetupItemType;

    // Setup queu
    switch (+envQueue[key].isDeadLeterQueue) {
      // Normal Queue
      case 0: {
        const deadLetterQueue = result[queueInfo.deadLetterQueueName!].queue ?? undefined;
        // const deadLetterQueue = result['deadLetter'].queue ?? undefined;
        sqsSetupItem.queue = createNewSQS(
          scope,
          queueInfo.idQueue,
          queueInfo.queueName,
          +(queueInfo.maxTime ?? 14),
          +(queueInfo.visibilityTimeout ?? 30),
          deadLetterQueue,
          +(queueInfo.maxReceiveCount ?? 5),
        );
        break;
      }
      // Dead Letter Queue
      case 1: {
        sqsSetupItem.queue = createNewDeadLetterQueue(
          scope,
          queueInfo.idQueue,
          queueInfo.queueName,
          +(queueInfo.maxTime ?? 14),
        );
        break;
      }
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
      sqsSetupItem.policy = settingNewPolicy(policyActionList, [sqsSetupItem.queue.queueArn]);
    }

    // Setup Event Source
    // Check if batchSize and maxCurrency are defined then setup SQS Event Source
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
