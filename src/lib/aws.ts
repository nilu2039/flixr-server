import {
  GetObjectCommand,
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import env from "../env";

const s3Client = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

const AWSManager = {
  async getSignedUrlForUpload(key: string, contentType: string) {
    const params: PutObjectCommandInput = {
      Bucket: env.AWS_VIDEO_UPLOAD_BUCKET,
      Key: key,
      ContentType: contentType,
    };
    const command = new PutObjectCommand(params);
    const uploadUrl = await getSignedUrl(s3Client, command);

    return uploadUrl;
  },

  async getSignedUrlForDownload(key: string) {
    const params = {
      Bucket: env.AWS_VIDEO_UPLOAD_BUCKET,
      Key: key,
    };
    const command = new GetObjectCommand(params);
    const downloadUrl = await getSignedUrl(s3Client, command);

    return downloadUrl;
  },
};

export default AWSManager;
