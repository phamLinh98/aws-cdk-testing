const apiGateway = {
  createPresignedUrlLambda: {
    api: 'get-url',
    method: 'GET',
  },
  getStatusFromDynamoDBLambda: {
    api: 'get-status',
    method: 'GET',
  }
}
  for (const key of Object.keys(apiGateway)) {
    console.log('key', key)
  }