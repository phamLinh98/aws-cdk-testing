import { Construct } from 'constructs';
import {
  createNewBucketS3,
  settingNewPolicy,
  settingS3Notification,
} from '../custom-constracts/csv-upload-resources';
import * as cdk from 'aws-cdk-lib';
import { envConfig } from '../config/env';

export type S3SetupItemType = {
  bucket: cdk.aws_s3.Bucket;
  policy: cdk.aws_iam.PolicyStatement;
};

export type S3SetupType = {
  [key: string]: S3SetupItemType;
};

type EnvS3Type = {
  [key: string]: {
    idBucket: string;
    bucketName: string;
    triggerLambda: string;
  };
};

export const s3Setup = (scope: Construct, lambdaTrigger: any) => {
  const envS3 = envConfig.aws.s3 as EnvS3Type;
  const result = {} as S3SetupType;

  // Create S3 buckets and policies based on environment variables
  Object.keys(envS3).forEach((key) => {
    const bucketInfo = envS3[key];
    const s3Bucket = createNewBucketS3(scope, bucketInfo.idBucket, bucketInfo.bucketName);
    const s3Policy = settingNewPolicy(JSON.parse(envConfig.aws.policyActionList.s3RoleList), [
      s3Bucket.arnForObjects('*'),
    ]);
    s3Bucket.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);

    result[key] = {
      bucket: s3Bucket,
      policy: s3Policy,
    };

    if (bucketInfo.triggerLambda) {
      const bucketS3Notification = settingS3Notification(s3Bucket, '.csv');
      lambdaTrigger.addEventSource(bucketS3Notification);
    }
  });

  return result;
};
