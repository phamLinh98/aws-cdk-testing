import { createNewLambdaFunction } from '../custom-constracts/csv-upload-resources';
import * as cdk from 'aws-cdk-lib';
import { EnvLambdaSetupType, LambdaSetUpItemType, LambdaSetUpType } from './interface/lambda';

export const lambdaListSetup = (scope: any, env: any) => {
  const envLambda = env.lambda as EnvLambdaSetupType;
  const result = {} as LambdaSetUpType;

  for (const key of Object.keys(envLambda)) {
    const lambdaInfo = envLambda[key];
    const lambdaSetupItem = {} as LambdaSetUpItemType;

    lambdaSetupItem.lambda = createNewLambdaFunction(
      scope,
      lambdaInfo.idLambda,
      lambdaInfo.lambdaName,
      lambdaInfo.path,
      lambdaInfo.excludeFunction,
      lambdaInfo.lambdaHander,
    );

    result[key] = lambdaSetupItem;
  }

  return result;
};

export const lambdaAddEventSource = (lambdaFunc: cdk.aws_lambda.Function, eventSource: any) => {
  lambdaFunc.addEventSource(eventSource);
};
