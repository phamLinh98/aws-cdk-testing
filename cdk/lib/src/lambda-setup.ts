import { createNewLambdaFunction } from '../custom-constracts/csv-upload-resources';

export const lambdaListSetup = (scope: any, env: any, BUILD_PATH: any) => {
  const CREATE_PRESIGNED_URL_LAMBDA_INFO = {
    path: BUILD_PATH + '/create-preurl',
    excludeFunction: 'create-preurl-s3-update-status-uploading-lambda.mjs',
    lambdaHander: 'create-preurl-s3-update-status-uploading-lambda.handler',
  };
  const GET_STATUS_FROM_DYNAMODB = {
    path: BUILD_PATH + '/get-status',
    excludeFunction: 'get-status-from-dynamodb-lambda.mjs',
    lambdaHander: 'get-status-from-dynamodb-lambda.handler',
  };
  const GET_BATCH_ID_UPDATE_STATUS_TO_UPLOADED = {
    path: BUILD_PATH + '/get-batchid-uploaded',
    excludeFunction: 'get-batchid-update-status-to-uploaded.mjs',
    lambdaHander: 'get-batchid-update-status-to-uploaded.handler',
  };

  const GET_CSV_READ_DETAIL_UPDATE_IN_PROCESSING_LAMBDA = {
    path: BUILD_PATH + '/get-csv-read-detail',
    excludeFunction: 'get-csv-read-detail-update-inprocessing-lambda.mjs',
    lambdaHander: 'get-csv-read-detail-update-inprocessing-lambda.handler',
  };

  const createPresignedUrlLambda = createNewLambdaFunction(
    scope,
    env.createPresignedUrlLambda.idLambda,
    env.createPresignedUrlLambda.lambdaName,
    CREATE_PRESIGNED_URL_LAMBDA_INFO.path,
    CREATE_PRESIGNED_URL_LAMBDA_INFO.excludeFunction,
    CREATE_PRESIGNED_URL_LAMBDA_INFO.lambdaHander,
  );

  const getStatusFromDynamoDBLambda = createNewLambdaFunction(
    scope,
    env.getStatusFromDynamoDBLambda.idLambda,
    env.getStatusFromDynamoDBLambda.lambdaName,
    GET_STATUS_FROM_DYNAMODB.path,
    GET_STATUS_FROM_DYNAMODB.excludeFunction,
    GET_STATUS_FROM_DYNAMODB.lambdaHander,
  );
  const getBatchIdUpdateStatusToUploadedLambda = createNewLambdaFunction(
    scope,
    env.getBatchIdUpdateStatusToUploadedIdLambda.idLambda,
    env.getBatchIdUpdateStatusToUploadedIdLambda.lambdaName,
    GET_BATCH_ID_UPDATE_STATUS_TO_UPLOADED.path,
    GET_BATCH_ID_UPDATE_STATUS_TO_UPLOADED.excludeFunction,
    GET_BATCH_ID_UPDATE_STATUS_TO_UPLOADED.lambdaHander,
  );

  const getCsvReadDetailUpdateInProcessingLambda = createNewLambdaFunction(
    scope,
    env.getCsvReadDetailUpdateInProcessingLambda.idLambda,
    env.getCsvReadDetailUpdateInProcessingLambda.lambdaName,
    GET_CSV_READ_DETAIL_UPDATE_IN_PROCESSING_LAMBDA.path,
    GET_CSV_READ_DETAIL_UPDATE_IN_PROCESSING_LAMBDA.excludeFunction,
    GET_CSV_READ_DETAIL_UPDATE_IN_PROCESSING_LAMBDA.lambdaHander,
  );

  return [
    createPresignedUrlLambda,
    getStatusFromDynamoDBLambda,
    getBatchIdUpdateStatusToUploadedLambda,
    getCsvReadDetailUpdateInProcessingLambda,
  ];
};

export const lambdaAddEventSource = (lambdaFunc: any, eventSource: any) => {
  lambdaFunc.addEventSource(eventSource);
};
