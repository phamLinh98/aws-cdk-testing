import { Duration, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as iam from "aws-cdk-lib/aws-iam";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { EventType } from "aws-cdk-lib/aws-s3";
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';


export class ApiStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    //Read secret for HitoEnvSecret
    const hitoEnvSecret = secretsmanager.Secret.fromSecretNameV2(this, 'HitoEnvSecret', 'HitoEnvSecret');

    // Create an S3 bucket named linhclass-csv-bucket
    const existingBucket = s3.Bucket.fromBucketName(this, "ExistingLinhclassCsvBucket", "linhclass-csv-bucket");

    const csvBucket = existingBucket || new s3.Bucket(this, "linhclassCsvBucket", {
      bucketName: "linhclass-csv-bucket",
      removalPolicy: RemovalPolicy.RETAIN,
      cors: [
        {
          allowedOrigins: ["http://localhost:5173"],
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.POST,
            s3.HttpMethods.PUT,
            s3.HttpMethods.DELETE,
          ],
          allowedHeaders: [
            "Content-Type",
            "X-Amz-Date",
            "Authorization",
            "X-Api-Key",
            "X-Amz-Security-Token",
          ],
          exposedHeaders: [],
          maxAge: 3000,
        },
      ],
    });

    /* DynamoDB tables */

    // Create a DynamoDB table named upload-csv
    const uploadCsvTable = new dynamodb.Table(this, "UploadCsvTable", {
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.RETAIN,
      tableName: "upload-csv",
    });

    // Create a DynamoDB table named Users
    const usersTable = new dynamodb.Table(this, "UsersTable", {
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.RETAIN,
      tableName: "Users",
    });

    //Check role IAM 
    const lambdaFullAccessRole = new iam.Role(this, "LinhclassLambdaFullAccessRole", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole"),
        iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonS3FullAccess"),
        iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonDynamoDBFullAccess"),
        iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonSQSFullAccess"),
        iam.ManagedPolicy.fromAwsManagedPolicyName("SecretsManagerReadWrite"),
      ],
      inlinePolicies: {
        AdditionalDynamoDBPermissions: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: [
                "dynamodb:GetShardIterator",
                "dynamodb:PutItem",
              ],
              resources: ["*"],
            }),
          ],
        }),
      },
      roleName: `linhclass-lambda-full-access-role-${this.stackName}`,
    });

    //Lambda functions
    const getUrlUpdateLambda = new lambda.Function(this, "getUrlUpdateLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "create-preurl-s3-update-status-uploading-lambda.handler",
      code: lambda.Code.fromAsset("src/rebuild/create-preurl"),
      memorySize: 128,
      timeout: Duration.seconds(5),
      functionName: "create-preurl-s3-update-status-uploading-lambda",
      role: lambdaFullAccessRole,
    });

    const getUploadStatusLambda = new lambda.Function(this, "getUploadStatusLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "get-status-from-dynamodb-lambda.handler",
      code: lambda.Code.fromAsset("src/rebuild/get-status"),
      memorySize: 128,
      timeout: Duration.seconds(5),
      functionName: "get-status-from-dynamodb-lambda",
      role: lambdaFullAccessRole,
    });

    const getBatchIdUpdateStatusUploadedLambda = new lambda.Function(this, "getBatchIdUpdateStatusUploadedLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "get-batchid-update-status-to-uploaded.handler",
      code: lambda.Code.fromAsset("src/rebuild/get-batchid-uploaded"),
      memorySize: 128,
      timeout: Duration.seconds(5),
      functionName: "get-batchid-update-status-to-uploaded-lambda",
      role: lambdaFullAccessRole,
    });

    const getCsvReadContentAndInProcessingLambda = new lambda.Function(this, "getCsvReadContentAndInProcessingLambda", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "get-csv-read-detail-update-inprocessing-lambda.handler",
      code: lambda.Code.fromAsset("src/rebuild/get-csv-read-detail"),
      memorySize: 128,
      timeout: Duration.seconds(5),
      functionName: "get-csv-read-detail-update-inprocessing-lambda",
      role: lambdaFullAccessRole,
    });

    // Create an SQS queue named linhclass-lambda-call-to-queue
    const lambdaCallQueue = new sqs.Queue(this, "linhclassLambdaCallQueue", {
      queueName: "linhclass-lambda-call-to-queue",
      visibilityTimeout: Duration.seconds(30),
      retentionPeriod: Duration.days(4),
    });

    // SQS lambdaCallQueue trigger lambda getCsvReadContentAndInProcessingLambda
    getCsvReadContentAndInProcessingLambda.addEventSource(
      new SqsEventSource(lambdaCallQueue, {
        batchSize: 10, // Number of messages to process in a batch
        enabled: true,
      })
    );

    // S3 linhclass-csv-bucket trigger lambda getBatchIdUpdateStatusUploadedLambda
    csvBucket.addEventNotification(
      EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(getBatchIdUpdateStatusUploadedLambda),
      { suffix: ".csv" } // chỉ trigger nếu file là .csv
    );

    // Grant permission cho lambda đọc bucket
    csvBucket.grantRead(getBatchIdUpdateStatusUploadedLambda);

    // Grant permissions for the Lambda function to consume messages from the queue
    lambdaCallQueue.grantConsumeMessages(getCsvReadContentAndInProcessingLambda);

    // Grant permissions for the Lambda function to send messages to the queue
    lambdaCallQueue.grantSendMessages(getUrlUpdateLambda);

    /* Grant R/W */
    uploadCsvTable.grantReadWriteData(getUrlUpdateLambda);
    uploadCsvTable.grantReadWriteData(getUploadStatusLambda);
    uploadCsvTable.grantReadWriteData(getBatchIdUpdateStatusUploadedLambda);
    uploadCsvTable.grantReadWriteData(getCsvReadContentAndInProcessingLambda);


    usersTable.grantReadWriteData(getUrlUpdateLambda);
    usersTable.grantReadWriteData(getUploadStatusLambda);
    usersTable.grantReadWriteData(getBatchIdUpdateStatusUploadedLambda);
    usersTable.grantReadWriteData(getCsvReadContentAndInProcessingLambda);

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
    getUrl.addMethod("GET", new apigateway.LambdaIntegration(getUrlUpdateLambda));

    //get-status
    const getStatus = api.root.addResource("get-status");
    getStatus.addMethod(
      "GET",
      new apigateway.LambdaIntegration(getUploadStatusLambda),
    );

    hitoEnvSecret.grantRead(getUrlUpdateLambda);
    hitoEnvSecret.grantRead(getUploadStatusLambda);
  }
}


