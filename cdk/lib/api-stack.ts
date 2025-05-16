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
import { aws_secretsmanager } from 'aws-cdk-lib';

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const env = envConfig.aws;

    const { secret } = secretSetup(this, env);

    const queue = sqsSetup(this, env);

    const table = dynamoDBSetup(this, env);

    const result = lambdaListSetup(this, env);

    lambdaAddEventSource(result['getCsvReadDetailUpdateInProcessingLambda'].lambda, queue['main'].sqsEventSource);

    
    const s3 = s3Setup(this, result['getBatchIdUpdateStatusToUploadedIdLambda'].lambda);

    const listLambdaSettingRole = [
      result['createPresignedUrlLambda'].lambda,
      result['getStatusFromDynamoDBLambda'].lambda,
      result['getBatchIdUpdateStatusToUploadedIdLambda'].lambda,
      result['getCsvReadDetailUpdateInProcessingLambda'].lambda,
    ]

    rolesSetup(
      listLambdaSettingRole,
      env,
      queue['main'].policy,
      queue['main'].queue,
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
