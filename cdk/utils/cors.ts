import * as cdk from 'aws-cdk-lib';
export const configCors = (domain: any) => {
      return [
            {
                  allowedHeaders: ["Content-Type", "Authorization"],
                  allowedMethods: [
                        cdk.aws_s3.HttpMethods.GET,
                        cdk.aws_s3.HttpMethods.PUT,
                        cdk.aws_s3.HttpMethods.POST,
                        cdk.aws_s3.HttpMethods.DELETE,
                        cdk.aws_s3.HttpMethods.HEAD
                  ],
                  allowedOrigins: [domain],
                  exposedHeaders: ["ETag"]
            }
      ]
}

export const configCorsApiGateway = (domain:any, allowsHeadList:any) => {
      return {
            allowOrigins: [domain],
            allowMethods: cdk.aws_apigateway.Cors.ALL_METHODS,
            allowHeaders: allowsHeadList,
            allowCredentials: true,
      }
}