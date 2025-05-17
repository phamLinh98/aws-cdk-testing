import { Construct } from 'constructs';
import {
  createNewBucketS3,
  settingNewPolicy,
  settingS3Notification,
} from '../custom-constracts/csv-upload-resources';
import * as cdk from 'aws-cdk-lib';
import { envConfig } from '../config/env';
import { EnvS3SetupType, S3SetupItemType, S3SetupType } from './interface/s3';

export const s3Setup = (scope: Construct, lambdaFunction: cdk.aws_lambda.Function) => {
  const envS3 = envConfig.aws.s3 as EnvS3SetupType;
  const result = {} as S3SetupType;

  for (const key of Object.keys(envS3)) {
    const bucketInfo = envS3[key];
    const bucketSetupItem = {} as S3SetupItemType;

    bucketSetupItem.bucket = createNewBucketS3(scope, bucketInfo.idBucket, bucketInfo.bucketName);
    const s3Actions = envConfig.aws.policyActionList.s3RoleList.split(',');
    bucketSetupItem.policy = settingNewPolicy(s3Actions, [
      bucketSetupItem.bucket.arnForObjects('*'),
    ]);
    bucketSetupItem.bucket.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);

    const bucketS3Notification = settingS3Notification(bucketSetupItem.bucket, '.csv');
    lambdaFunction.addEventSource(bucketS3Notification);

    result[key] = bucketSetupItem;
  }

  return result;
};
