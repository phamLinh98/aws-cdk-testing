import { grantServiceAnServiceReadWriteAListService, grantServiceListServiceReadWriteAnService, settingNewPolicy } from "../custom-constracts/csv-upload-resources";

export const rolesSetup = (
  lambdaList:any, 
  env:any, 
  listTableInDynamoDB:any,
  sqsPolicy:any,
  dynamoDbPolicy:any,
  mainQueue:any,
  usersTable:any,
  uploadCsvTable:any,
  secret:any,
  s3Setup:any[]
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
  
  //DO IT HERE 
  s3Setup.forEach(({bucket, policy}) => { 
    grantServiceListServiceReadWriteAnService(
      lambdaList,
      env.grantRole.addToRolePolicy,
      policy,
    );

    grantServiceAnServiceReadWriteAListService(
      bucket, 
      env.grantRole.grantReadWrite, 
      lambdaList
    )
  });

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

  // setting secretManager for all lambda function using secret
  grantServiceAnServiceReadWriteAListService(
    secret, 
    env.grantRole.grandRead, 
    lambdaList
  );
}