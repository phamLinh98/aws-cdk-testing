import { createNewLambdaFunction } from '../custom-constracts/csv-upload-resources';

export const lambdaListSetup = (scope: any, env: any) => {
  const listLambdaInfo = Object.values(env.lambda).map((bucket: any) => ({
    idLambda: bucket.idLambda,
    lambdaName: bucket.lambdaName,
    triggerSQS: bucket.triggerSQS,
    triggerS3: bucket.triggerS3,
    path: bucket.path,
    excludeFunction: bucket.excludeFunction,
    lambdaHander: bucket.lambdaHander,
    createAPI: bucket.createAPI,
  }));

  let listTriggerSqs = [] as any[];
  let listTriggerS3 = [] as any[];
  let listSetApi = [] as any[];
  let listLambda = [] as any[];

  listLambdaInfo.forEach((lambdaInfo) => {
    const lambdaFunc = createNewLambdaFunction(
      scope,
      lambdaInfo.idLambda,
      lambdaInfo.lambdaName,
      lambdaInfo.path,
      lambdaInfo.excludeFunction,
      lambdaInfo.lambdaHander
    );

    if (lambdaInfo.triggerSQS) {
      // Add SQS trigger here
      listTriggerSqs.push(lambdaFunc);
    }

    if (lambdaInfo.triggerS3) {
      // Add S3 trigger here
      listTriggerS3.push(lambdaFunc);
    }
    if (lambdaInfo.createAPI) {
      // Add API here
      listSetApi.push(lambdaFunc);
    }
  });

  return {
    listTriggerSqs: listTriggerSqs,
    listTriggerS3: listTriggerS3,
    listSetApi: listSetApi,
    listLambda: listLambda,
  }
};

export const lambdaAddEventSource = (lambdaFunc: any, eventSource: any) => {
  lambdaFunc.addEventSource(eventSource);
};
