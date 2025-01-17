import { S3Client } from '@aws-sdk/client-s3'

const AWS_REGION = process.env.AWS_REGION || "your aws s3 region";
const AWS_ACCESS_ID = process.env.AWS_ACCESS_ID || "your aws access id";
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || "your aws secret access key";

const AWS_S3 = new S3Client({
    region: AWS_REGION,
    credentials: {
        accessKeyId: AWS_ACCESS_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
    }
});

export default AWS_S3;
