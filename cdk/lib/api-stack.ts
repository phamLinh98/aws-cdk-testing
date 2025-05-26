import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { envConfig } from './config/env';
import { apiGatewaySetup } from './src/api-gateway-setup';
import { dynamoDBSetup } from './src/dynamodb-setup';
import { lambdaListSetup } from './src/lambda-setup';
import { roleSetup } from './src/role-setup';
import { s3Setup } from './src/s3-setup';
import { secretSetup } from './src/secret-setup';
import { sqsSetup } from './src/sqs-setup';

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const env = envConfig.aws;
    const { secret } = secretSetup(this, env);
    const queue = sqsSetup(this, env);
    const table = dynamoDBSetup(this, env);
    const lamda = lambdaListSetup(this, env);
    const s3 = s3Setup(this, lamda[env.constants.BATCH_FUNCTION_NAME].lambda);
    roleSetup(lamda, queue, table, s3, secret);
    apiGatewaySetup(this, env, lamda);
  }
}
