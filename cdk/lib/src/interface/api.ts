import * as cdk from 'aws-cdk-lib';

export type apiGatewayType = {
  apiGateway: cdk.aws_apigateway.RestApi;
};

export type apiGatewayListType = {
  [key: string]: apiGatewayType;
};

export type apiGatewayLambdaType = {
  [key: string]: {
    idLambda: string;
    api: string;
    method: string;
  };
};
 