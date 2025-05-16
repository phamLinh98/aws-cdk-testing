import * as cdk from 'aws-cdk-lib';

export type EnvSqsSetupType = {
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
