import * as cdk from 'aws-cdk-lib';

export type EnvApiGatewaySetupLambdaType = {
  [key: string]: {
    idLambda: string;
    api: string;
    method: string;
  };
};

export type ApiGatewaySetupItemType = {
  apiGateway: cdk.aws_apigateway.RestApi;
};

export type ApiGatewaySetupType = {
  [key: string]: ApiGatewaySetupItemType;
};
