import { Duration, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as apigateway from "aws-cdk-lib/aws-apigateway";

export class ApiStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    /* DynamoDB tables */
    // const userTable = new dynamodb.Table(this, "UserTable", {
    //   partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
    //   billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    //   removalPolicy: RemovalPolicy.RETAIN,
    //   tableName: "user",
    // });

    // const uploadTable = new dynamodb.Table(this, "UploadTable", {
    //   partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
    //   billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    //   removalPolicy: RemovalPolicy.RETAIN,
    //   tableName: "upload-status",
    // });

    /* Lambda layers / common env can go here */

    const getUrlUpdateUploading = new lambda.Function(this, "getUrlHandler", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "getUrlHandler.handler",
      code: lambda.Code.fromAsset("src/build/lambda/create-preurl-s3-update-status-uploading-lambda"), // folder
      memorySize: 128,
      timeout: Duration.seconds(5),
      // environment: {
      //   USER_TABLE: userTable.tableName,
      // },
      functionName: "create-preurl-s3-update-status-uploading-lambda",
    });

    const getUploadStatusFn = new lambda.Function(this, "getStatusHandler", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "getStatusHandler.handler",
      code: lambda.Code.fromAsset("src/build/lambda/get-status-from-dynamodb-lambda"), // folder
      memorySize: 128,
      timeout: Duration.seconds(5),
      // environment: {
      //   UPLOAD_TABLE: uploadTable.tableName,
      // },
      functionName: "get-status-from-dynamodb-lambda",
    });

    /* Grant R/W */
    // userTable.grantReadData(getUserFn);
    // uploadTable.grantReadData(getUploadStatusFn);

    /* API Gateway (REST) */
    const api = new apigateway.RestApi(this, "linhclass", {
      restApiName: "linhclass",
      deployOptions: { stageName: "prod" },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    // get-url
    const getUrl = api.root.addResource("get-url");
    getUrl.addMethod("GET", new apigateway.LambdaIntegration(getUrlUpdateUploading));

    //get-status
    const getStatus = api.root.addResource("get-status");
    getStatus.addMethod(
      "GET",
      new apigateway.LambdaIntegration(getUploadStatusFn)
    );
  }
}