import { Construct } from 'constructs';
import {
  settingApiGatewayRoleCors,
  setupApiGatewayForLambdaFn,
} from '../custom-constracts/csv-upload-resources';

export const apiGatewaySetup = (
  scope: Construct, 
  env: any, 
  lambdaAddingApiList: any[]) => {
  // Create an API Gateway name linhclass-api-gateway
  const apiName = settingApiGatewayRoleCors(
    scope, 
    env.apiGateway.idLambda
  );
  lambdaAddingApiList.forEach((item) => {
    const integrationFunc = setupApiGatewayForLambdaFn(item.lambdaFunc);
    apiName.root.addResource(item.api).addMethod(item.method, integrationFunc);
  });
};
