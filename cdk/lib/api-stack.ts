import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //TODO: create mySecret get from secrets manager name HitoEnvSecret 
    const mySecret = cdk.aws_secretsmanager.Secret.fromSecretNameV2(this, 'HitoEnvSecret', 'HitoEnvSecret');

    //TODO: create an new bucket name linhclass-csv-bucket with cors policy
    const bucketCsvS3 = new cdk.aws_s3.Bucket(this, 'LinhClassCsvBucket', {
      bucketName: 'linhclass-csv-bucket',
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      cors: [
      {
        allowedHeaders: [
        "Content-Type",
        "Authorization"
        ],
        allowedMethods: [
        cdk.aws_s3.HttpMethods.GET,
        cdk.aws_s3.HttpMethods.PUT,
        cdk.aws_s3.HttpMethods.POST,
        cdk.aws_s3.HttpMethods.DELETE,
        cdk.aws_s3.HttpMethods.HEAD
        ],
        allowedOrigins: [
        "http://localhost:5173"
        ],
        exposedHeaders: [
        "ETag"
        ]
      }
      ]
    });


    //TODO: create an new SQS name linhclass-lambda-call-to-queue
    const queueSQS = new cdk.aws_sqs.Queue(this, 'LinhClassLambdaCallToQueue', {
      queueName: 'linhclass-lambda-call-to-queue',
      retentionPeriod: cdk.Duration.days(14),
    });

    //TODO: create 2 dynamoDB table name Users and upload-csv
    const usersTable = new cdk.aws_dynamodb.Table(this, 'UsersTable', {
      tableName: 'Users',
      partitionKey: { name: 'id', type: cdk.aws_dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    const uploadCsvTable = new cdk.aws_dynamodb.Table(this, 'UploadCsvTable', {
      tableName: 'upload-csv',
      partitionKey: { name: 'id', type: cdk.aws_dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    //TODO: create a new lambda function name create-presigned-url-uploading-lambda get source from src/rebuild/create-preurl
    const createPresignedUrlLambda = new cdk.aws_lambda.Function(this, 'CreatePresignedUrlLambda', {
      functionName: 'create-presigned-url-uploading-lambda',
      runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
      code: cdk.aws_lambda.Code.fromAsset('./src/rebuild/create-preurl',{
        exclude: ["**", "!create-preurl-s3-update-status-uploading-lambda.mjs"],
      }),
      handler: 'create-preurl-s3-update-status-uploading-lambda.handler'
    });

    //create role for lambda function createPresignedUrlLambda to access s3 and dynamoDB
    bucketCsvS3.grantReadWrite(createPresignedUrlLambda);
    usersTable.grantReadWriteData(createPresignedUrlLambda);
    uploadCsvTable.grantReadWriteData(createPresignedUrlLambda);
    mySecret.grantRead(createPresignedUrlLambda);

    //TODO: create a new lambda function name get-status-from-dynamodb-lambda get source from src/rebuild/get-status 
    const getStatusFromDynamoDBLambda = new cdk.aws_lambda.Function(this, 'GetStatusFromDynamoDBLambda', {
      functionName: 'get-status-from-dynamodb-lambda',
      runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
      code: cdk.aws_lambda.Code.fromAsset('./src/rebuild/get-status',{
        exclude: ["**", "!get-status-from-dynamodb-lambda.mjs"],
      }),
      handler: 'get-status-from-dynamodb-lambda.handler'
    });

    // getStatusFromDynamoDBLambda can read and write dynamoDb 
    usersTable.grantReadWriteData(getStatusFromDynamoDBLambda);
    bucketCsvS3.grantReadWrite(getStatusFromDynamoDBLambda);
    uploadCsvTable.grantReadWriteData(getStatusFromDynamoDBLambda);
    mySecret.grantRead(getStatusFromDynamoDBLambda);

    //TODO: create a new lambda function name get-batchid-update-status-to-uploaded get source from src/rebuild/get-batchid-uploaded
    const getBatchIdUpdateStatusToUploadedLambda = new cdk.aws_lambda.Function(this, 'GetBatchIdUpdateStatusToUploadedLambda', {
      functionName: 'get-batchid-update-status-to-uploaded',
      runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
      code: cdk.aws_lambda.Code.fromAsset('./src/rebuild/get-batchid-uploaded',{
        exclude: ["**", "!get-batchid-update-status-to-uploaded.mjs"],
      }),
      handler: 'get-batchid-update-status-to-uploaded.handler'
    });

    uploadCsvTable.grantReadWriteData(getBatchIdUpdateStatusToUploadedLambda);
    usersTable.grantReadWriteData(getBatchIdUpdateStatusToUploadedLambda);
    bucketCsvS3.grantReadWrite(getBatchIdUpdateStatusToUploadedLambda);
    mySecret.grantRead(getBatchIdUpdateStatusToUploadedLambda);

    //TODO: create a new lambda function name get-csv-read-detail-update-inprocessing-lambda get source from src/rebuild/get-batchid-uploaded
    const getCsvReadDetailUpdateInProcessingLambda = new cdk.aws_lambda.Function(this, 'GetCsvReadDetailUpdateInProcessingLambda', {
      functionName: 'get-csv-read-detail-update-inprocessing-lambda',
      runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
      code: cdk.aws_lambda.Code.fromAsset('./src/rebuild/get-csv-read-detail',{
        exclude: ["**", "!get-csv-read-detail-update-inprocessing-lambda.mjs"],
      }),
      handler: 'get-csv-read-detail-update-inprocessing-lambda.handler'
    });
    uploadCsvTable.grantReadWriteData(getCsvReadDetailUpdateInProcessingLambda);
    bucketCsvS3.grantReadWrite(getCsvReadDetailUpdateInProcessingLambda);
    usersTable.grantReadWriteData(getCsvReadDetailUpdateInProcessingLambda);
    mySecret.grantRead(getCsvReadDetailUpdateInProcessingLambda);

    //TODO: khi sqs queueSQS có message trong queue thì sẽ trigger lambda getCsvReadDetailUpdateInProcessingLambda
    const queueSQSTrigger = new cdk.aws_lambda_event_sources.SqsEventSource(queueSQS, {
      batchSize: 10,
      maxConcurrency: 5,
    });
    getCsvReadDetailUpdateInProcessingLambda.addEventSource(queueSQSTrigger);

    // TODO: thiết lập, khi có 1 file csv upload lên s3 bucketCsvS3 thì sẽ trigger lambda getBatchIdUpdateStatusToUploadedLambda
    const bucketCsvS3Notification = new cdk.aws_lambda_event_sources.S3EventSource(bucketCsvS3, {
      events: [cdk.aws_s3.EventType.OBJECT_CREATED],
      filters: [{ suffix: '.csv' }],
    });
    getBatchIdUpdateStatusToUploadedLambda.addEventSource(bucketCsvS3Notification);

    //TODO: create apigate way , create API method GET get-url for lambda createPresignedUrlLambda with cors policy
    const apiPresignURL = new cdk.aws_apigateway.RestApi(this, 'LinhClassApi', {
      restApiName: 'LinhClassService',
      description: 'This service serves LinhClass.',
      defaultCorsPreflightOptions: {
      allowOrigins: ['http://localhost:5173'],
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token'],
      },
    });

    const getUrlIntegration = new cdk.aws_apigateway.LambdaIntegration(createPresignedUrlLambda, {
      requestTemplates: { 'application/json': '{"statusCode": 200}' },
      integrationResponses: [
        {
          statusCode: '200',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': "'http://localhost:5173'",
          },
        },
      ],
    });

    // Create a dedicated resource for "get-url"
    const getUrlResource = apiPresignURL.root.addResource('get-url');
    getUrlResource.addMethod('GET', getUrlIntegration, {
      methodResponses: [
        {
          statusCode: '200',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true,
          },
        },
      ],
    }); // GET /get-url

    //TODO: create API method GET get-status for lambda getStatusFromDynamoDBLambda with cors policy
    const getStatusIntegration = new cdk.aws_apigateway.LambdaIntegration(getStatusFromDynamoDBLambda, {
      requestTemplates: { 'application/json': '{"statusCode": 200}' },
    });

    // Create a dedicated resource for "get-status"
    const getStatusResource = apiPresignURL.root.addResource('get-status');
    getStatusResource.addMethod('GET', getStatusIntegration, {
      methodResponses: [
        {
          statusCode: '200',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true,
          },
        },
      ],
    }); // GET /get-status
  }
}


