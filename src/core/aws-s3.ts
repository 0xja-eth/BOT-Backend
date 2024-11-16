const AwsS3Config = {
  accessKeyId: process.env.AWS_S3_ACCESS_KEY,
  secretAccessKey: process.env.AWS_S3_SECRET_KEY,
  endpoint: process.env.AWS_S3_ENDPOINT,
  s3ForcePathStyle: true,
};

import AWS from "aws-sdk";

const s3 = new AWS.S3(AwsS3Config);

export default s3;

// import { S3Client } from "@aws-sdk/client-s3";
//
// const s3Client = new S3Client([{
//   region: process.env.AWS_S3_REGION,
//   endpoint: process.env.AWS_S3_ENDPOINT,
//   credentials: {
//     accessKeyId: process.env.AWS_S3_ACCESS_KEY,
//     secretAccessKey: process.env.AWS_S3_SECRET_KEY,
//   },
//   forcePathStyle: true,
// }]);
//
// export default s3Client;
