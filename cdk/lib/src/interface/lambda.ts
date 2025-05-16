import * as cdk from 'aws-cdk-lib';

export type LambdaSetUpItemType = {
  lambda: cdk.aws_lambda.Function;
};

export type LambdaSetUpType = {
  [key: string]: LambdaSetUpItemType;
};

export type EnvLambdaType = {
  [key: string]: {
    idLambda: string;
    lambdaName: string;
    path: string;
    excludeFunction: string;
    lambdaHander: string;
  };
};
