import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

export const secretSetup = (scope: Construct, env: any) => {
  const secret = cdk.aws_secretsmanager.Secret.fromSecretNameV2(
    scope,
    env.secretName,
    env.secretName,
  );
  return { secret };
};
