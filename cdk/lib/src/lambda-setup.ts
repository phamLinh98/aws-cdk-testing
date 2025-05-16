import { createNewLambdaFunction } from '../custom-constracts/csv-upload-resources';
import * as cdk from 'aws-cdk-lib';
import { EnvLambdaType, LambdaSetUpType } from './interface/lambda';

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
