import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { envConfig } from './config/env';
import { s3Setup } from './src/s3-setup';
import { secretSetup } from './src/secret-setup';
import { sqsSetup } from './src/sqs-setup';
import { dynamoDBSetup } from './src/dynamodb-setup';
import { lambdaAddEventSource, lambdaListSetup } from './src/lambda-setup';
import { rolesSetup } from './src/role-setup';
import { apiGatewaySetup } from './src/api-gateway-setup';

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const env = envConfig.aws;

    // Setup Secret
    const { secret } = secretSetup(this, env);

    // Setup SQS
    const queue = sqsSetup(this, env);

    // Setup DynamoDB
    const table = dynamoDBSetup(this, env);

    // Setup Lambda
    const { listTriggerSqs, listTriggerS3, listSetApi, listLambda } = lambdaListSetup(this, env);

    // Setup Lambda Event Source for SQS
    listTriggerSqs.forEach((listLambda) => {
      lambdaAddEventSource(listLambda, queue['main'].sqsEventSource);
    });

    // Setup S3
    const s3 = s3Setup(this, listLambda);

    // Setup Role for All Services
    rolesSetup(
      listLambda,
      env,
      queue['main'].policy,
      queue['main'].queue,
      secret,
      s3,
      Object.values(table).map((table) => table.table),
      Object.values(table).map((table) => table.policy),
    );

    const infoForSettingAPIGateway = Object.values(env.apiGateway.lambdaList).map((api: any) => ({
      idLambda: api.idLambda,
      api: api.api,
      method: api.method,
    }));

    const updatedInfo = infoForSettingAPIGateway.map((info, index) => ({
      ...info,
      lambdaFunc: listSetApi[index],
    }));

    // Setup API Gateway
    apiGatewaySetup(this, env, updatedInfo);
  }
}
