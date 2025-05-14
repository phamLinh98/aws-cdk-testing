import { Construct } from 'constructs';
import {
  createNewBucketS3,
  settingNewPolicy,
  settingS3Notification,
} from '../custom-constracts/csv-upload-resources';
import * as cdk from 'aws-cdk-lib';

export const s3BucketSetup = (scope: Construct, env: any, lambdaTrigger: any) => {
  let s3Policy: cdk.aws_iam.PolicyStatement | undefined;
  let s3Bucket: cdk.aws_s3.Bucket | undefined;
  let s3Setup = [] as any[];

  const listBucket = Object.values(env.s3).map((bucket:any) => ({
    idBucket: bucket.idBucket,
    bucketName: bucket.bucketName,
    bucketArn: bucket.bucketArn,
    triggerLambda: bucket.triggerLambda,
  }));
  
  listBucket.forEach((bucketInfo) => {
    const s3 = createNewBucketS3(scope, bucketInfo.idBucket, bucketInfo.bucketName);
    const policy = settingNewPolicy(JSON.parse(env.policyActionList.s3RoleList), [
      s3.arnForObjects('*'),
    ]);

    s3Policy = policy;
    s3Bucket = s3;
    s3.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);

    s3Setup.push({
      bucket: s3,
      policy: policy,
    });

    if (bucketInfo.triggerLambda) {
      const bucketS3Notification = settingS3Notification(s3, '.csv');
      lambdaTrigger.addEventSource(bucketS3Notification);
    }
  });
  return s3Setup;
};
