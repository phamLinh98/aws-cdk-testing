import * as cdk from 'aws-cdk-lib';

export type EnvLambdaSetupType = {
  [key: string]: {
    idLambda: string;
    lambdaName: string;
    path: string;
    excludeFunction: string;
    lambdaHander: string;
  };
};

export type LambdaSetUpItemType = {
  lambda: cdk.aws_lambda.Function;
};

export type LambdaSetUpType = {
  [key: string]: LambdaSetUpItemType;
};
