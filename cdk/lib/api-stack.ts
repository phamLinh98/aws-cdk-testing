import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { envConfig } from './config/env';
import { s3Setup } from './src/s3-setup';
import { secretSetup } from './src/secret-setup';
import { sqsSetup } from './src/sqs-setup';
import { dynamoDBSetup } from './src/dynamodb-setup';
import { lambdaListSetup } from './src/lambda-setup';
import { rolesSetup } from './src/role-setup';
import { apiGatewaySetup } from './src/api-gateway-setup';

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    const env = envConfig.aws;

    const { secret } = secretSetup(this, env);

    const queue = sqsSetup(this, env);

    const table = dynamoDBSetup(this, env);

    const result = lambdaListSetup(this, env);

    const s3 = s3Setup(this, result['getBatchIdUpdateStatusToUploadedIdLambda'].lambda);

    rolesSetup(
      result,
      env,
      queue['main'],
      secret,
      s3,
      Object.values(table).map((table) => table.table),
      Object.values(table).map((table) => table.policy),
    );

    apiGatewaySetup(this, env, [
      {
        lambdaFunc: result['createPresignedUrlLambda'].lambda,
        api: envConfig.aws.apiGateway['createPresignedUrlLambda'].api,
        method: envConfig.aws.apiGateway['createPresignedUrlLambda'].method,
      },
      {
        lambdaFunc: result['getStatusFromDynamoDBLambda'].lambda,
        api: envConfig.aws.apiGateway['getStatusFromDynamoDBLambda'].api,
        method: envConfig.aws.apiGateway['getStatusFromDynamoDBLambda'].method,
      },
    ]);
  }
}
