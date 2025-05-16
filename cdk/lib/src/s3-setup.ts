import { Construct } from 'constructs';
import {
  createNewBucketS3,
  settingNewPolicy,
  settingS3Notification,
} from '../custom-constracts/csv-upload-resources';

import * as cdk from 'aws-cdk-lib';
import { envConfig } from '../config/env';
import { EnvS3Type, S3SetupType } from './interface/s3';

export const s3Setup = (scope: Construct, lambdaFunction: cdk.aws_lambda.Function) => {
  const envS3 = envConfig.aws.s3 as EnvS3Type;
  
  const result = {} as S3SetupType;

  // Create S3 buckets and policies based on environment variables
  Object.keys(envS3).forEach((key) => {
    const bucketInfo = envS3[key];
    const s3Bucket = createNewBucketS3(scope, bucketInfo.idBucket, bucketInfo.bucketName);
    const s3Actions = envConfig.aws.policyActionList.s3RoleList.split(',');
    const s3Policy = settingNewPolicy(s3Actions, [s3Bucket.arnForObjects('*')]);
    s3Bucket.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);

    result[key] = {
      bucket: s3Bucket,
      policy: s3Policy,
    };
      const bucketS3Notification = settingS3Notification(s3Bucket, '.csv');
      lambdaFunction.addEventSource(bucketS3Notification);
  });

  return result;
};
