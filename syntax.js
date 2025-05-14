const s3 = {
  csvBucket: {
    idBucket: process.env.AWS_CSV_ID_BUCKET || "LinhClassCsvBucket",
    bucketName: process.env.AWS_CSV_BUCKET_NAME || "linhclass-csv-bucket",
    bucketArn:
      process.env.AWS_CSV_BUCKET_ARN || "arn:aws:s3:::linhclass-csv-bucket",
    triggerLambda: process.env.AWS_CSV_TRIGGER_LAMBDA || true,
  },
  // S3 Image bucket configuration
  imageBucket1: {
    idBucket: process.env.AWS_IMAGE_ID_BUCKET || "LinhClassImageBucket",
    bucketName: process.env.AWS_IMAGE_BUCKET_NAME || "linhclass-avatar-bucket",
    bucketArn:
      process.env.AWS_IMAGE_BUCKET_ARN ||
      "arn:aws:s3:::linhclass-avatar-bucket",
    triggerLambda: process.env.AWS_IMAGE_TRIGGER_LAMBDA || false,
  },

  imageBucket2: {
    idBucket: process.env.AWS_IMAGE_ID_BUCKET || "LinhClassImageBucket",
    bucketName: process.env.AWS_IMAGE_BUCKET_NAME || "linhclass-avatar-bucket",
    bucketArn:
      process.env.AWS_IMAGE_BUCKET_ARN ||
      "arn:aws:s3:::linhclass-avatar-bucket",
    triggerLambda: process.env.AWS_IMAGE_TRIGGER_LAMBDA || false,
  },

  imageBucket3: {
    idBucket: process.env.AWS_IMAGE_ID_BUCKET || "LinhClassImageBucket",
    bucketName: process.env.AWS_IMAGE_BUCKET_NAME || "linhclass-avatar-bucket",
    bucketArn:
      process.env.AWS_IMAGE_BUCKET_ARN ||
      "arn:aws:s3:::linhclass-avatar-bucket",
    triggerLambda: process.env.AWS_IMAGE_TRIGGER_LAMBDA || false,
  },
};

const listBucket = Object.values(s3).map((bucket) => ({
  idBucket: bucket.idBucket,
  bucketName: bucket.bucketName,
  bucketArn: bucket.bucketArn,
  triggerLambda: bucket.triggerLambda,
}));

console.log("listBucket:", listBucket);
