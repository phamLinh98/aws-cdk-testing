import * as cdk from 'aws-cdk-lib';

export type S3SetupItemType = {
  bucket: cdk.aws_s3.Bucket;
  policy: cdk.aws_iam.PolicyStatement;
};

export type S3SetupType = {
  [key: string]: S3SetupItemType;
};

export type EnvS3Type = {
  [key: string]: {
    idBucket: string;
    bucketName: string;
    triggerLambda: string;
    s3RoleList: string;
  };
};
