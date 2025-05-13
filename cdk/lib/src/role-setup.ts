import { grantServiceAnServiceReadWriteAListService, grantServiceListServiceReadWriteAnService, settingNewPolicy } from "../custom-constracts/csv-upload-resources";

export const rolesSetup = (
  lambdaList:any, 
  env:any, 
  listTableInDynamoDB:any,
  sqsPolicy:any,
  dynamoDbPolicy:any,
  s3ImagePolicy:any,
  s3Policy:any,
  mainQueue:any,
  usersTable:any,
  uploadCsvTable:any,
  csvBucket:any,
  imageBucket:any,
  secret:any,
) => {
   
  lambdaList.forEach((lambdaFunc:any) => {
    grantServiceListServiceReadWriteAnService(
      listTableInDynamoDB,
      env.grantRole.readWriteData,
      lambdaFunc,
    );
  });
  
  // Creare Role to List Lambda function can access SQS in List Queue Role
  grantServiceListServiceReadWriteAnService(
    lambdaList,
    env.grantRole.addToRolePolicy,
    settingNewPolicy(['*'], ['*']),
  );

  // // Create Role to List Lambda function can access SQS
  grantServiceListServiceReadWriteAnService(
    lambdaList, 
    env.grantRole.addToRolePolicy, 
    sqsPolicy
  );

  // // Create Role to List Lambda function can access DynamoDB
  grantServiceListServiceReadWriteAnService(
    lambdaList,
    env.grantRole.addToRolePolicy,
    dynamoDbPolicy,
  );

  // // Create Role to List Lambda function can access S3
  grantServiceListServiceReadWriteAnService(
    lambdaList, 
    env.grantRole.addToRolePolicy, 
    s3Policy
  );

  // // Create Role to List Lambda function can access S3 Image
  grantServiceListServiceReadWriteAnService(
    lambdaList,
    env.grantRole.addToRolePolicy,
    s3ImagePolicy,
  );
  grantServiceAnServiceReadWriteAListService(
    mainQueue,
    env.grantRole.grantSendMessages,
    lambdaList,
  );

  // Create Role to UserTable can access ListLambda function
  grantServiceAnServiceReadWriteAListService(
    usersTable, 
    env.grantRole.readWriteData, 
    lambdaList
  );

  // Create Role to UploadCsvTable can access ListLambda function
  grantServiceAnServiceReadWriteAListService(
    uploadCsvTable,
    env.grantRole.readWriteData,
    lambdaList,
  );

  // Create role to Csv read List Lambda function
  grantServiceAnServiceReadWriteAListService(
    csvBucket, 
    env.grantRole.grantReadWrite, 
    lambdaList
  );

  // Create role to S3 Image Bucket
  grantServiceAnServiceReadWriteAListService(
    imageBucket,
    env.grantRole.grantReadWrite,
    lambdaList,
  );

  // setting secretManager for all lambda function using secret
  grantServiceAnServiceReadWriteAListService(
    secret, 
    env.grantRole.grandRead, 
    lambdaList
  );
}