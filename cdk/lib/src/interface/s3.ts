import * as cdk from 'aws-cdk-lib';

export type EnvS3SetupType = {
  [key: string]: {
    idBucket: string;
    bucketName: string;
    triggerLambda: string;
    s3RoleList: string;
  };
};

export type S3SetupItemType = {
  bucket: cdk.aws_s3.Bucket;
  policy: cdk.aws_iam.PolicyStatement;
};

export type S3SetupType = {
  [key: string]: S3SetupItemType;
};
