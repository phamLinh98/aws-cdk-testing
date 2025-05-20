import { Construct } from 'constructs';
import {
  settingApiGatewayRoleCors,
  setupApiGatewayForLambdaFn,
} from '../custom-constracts/csv-upload-resources';
import { LambdaSetUpType } from './interface/lambda';

export const apiGatewaySetup = (scope: Construct, env: any, lamda: LambdaSetUpType) => {
  const envApiGateway = env.apiGateway;
  const apiName = settingApiGatewayRoleCors(scope, env.constants.API_GATE_WAY_ID);

  for (const key of Object.keys(envApiGateway)) {
    const apiInfo = envApiGateway[key];

    const integration = setupApiGatewayForLambdaFn(lamda[key].lambda);

    const resource = apiName.root.addResource(apiInfo.api);
    resource.addMethod(apiInfo.method, integration);
  }
};
