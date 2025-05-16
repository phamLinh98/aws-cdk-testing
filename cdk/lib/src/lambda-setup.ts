import { createNewLambdaFunction } from '../custom-constracts/csv-upload-resources';
import * as cdk from 'aws-cdk-lib';

export type LambdaSetUpItemType = {
  lambda: cdk.aws_lambda.Function
};

export type LambdaSetUpType = {
  [key: string]: LambdaSetUpItemType;
};

type EnvLambdaType = {
  [key:string]: {
  idLambda: string;
  lambdaName: string;
  path: string;
  excludeFunction: string;
  lambdaHander: string;
  }
}

export const lambdaListSetup = (scope: any, env: any) => {
  const envLambda = env.lambda as EnvLambdaType;

  const result = {} as LambdaSetUpType;

  Object.keys(envLambda).forEach((key) => {
    const lambdaInfo = envLambda[key];
    const lambdaFunc = createNewLambdaFunction(
      scope,
      lambdaInfo.idLambda,
      lambdaInfo.lambdaName,
      lambdaInfo.path,
      lambdaInfo.excludeFunction,
      lambdaInfo.lambdaHander
    );

    result[key] = {
      lambda: lambdaFunc   
    };
  });

  return result;
};

export const lambdaAddEventSource = (lambdaFunc: cdk.aws_lambda.Function, eventSource: any) => {
  lambdaFunc.addEventSource(eventSource);
};
