export const grantServiceReadWriteRole = (listService, lambdaFn) => {
  return lambdaFn.forEach((lambdaFn) => {
    console.log(`listService_${lambdaFn}`);
});
}

grantServiceReadWriteRole(123,[1,2,3,4,5]);

