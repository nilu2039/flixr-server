import {
  GetObjectCommand,
  HeadObjectCommand,
  HeadObjectCommandOutput,
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import env from "../env";
import { Readable } from "stream";

const s3Client = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

const AWSManager = {
  async getSignedUrlForUpload({
    key,
    contentType,
    BucketName,
  }: {
    key?: string | null;
    contentType?: string | null;
    BucketName?: string;
  }): Promise<string | null> {
    if (!key || !contentType || !BucketName) return null;
    const params: PutObjectCommandInput = {
      Bucket: BucketName,
      Key: key.trim(),
      ContentType: contentType.trim(),
    };
    const command = new PutObjectCommand(params);
    const uploadUrl = await getSignedUrl(s3Client, command);

    return uploadUrl;
  },

  async getSignedUrlForDownload(
    key: string | null,
    BucketName: string
  ): Promise<string | null> {
    if (!key) return null;

    const params = {
      Bucket: BucketName,
      Key: key,
    };

    const objectDetails = await this.getObjectDetails(key, BucketName);

    if (!objectDetails || !objectDetails.exists) {
      return null;
    }

    const command = new GetObjectCommand(params);
    const downloadUrl = await getSignedUrl(s3Client, command);

    return downloadUrl;
  },

  async getObjectDetails(key: string, BucketName: string) {
    try {
      const command = new HeadObjectCommand({
        Bucket: BucketName,
        Key: key,
      });
      const response: HeadObjectCommandOutput = await s3Client.send(command);
      return {
        exists: true,
        size: response.ContentLength,
      };
    } catch (error) {
      return null;
    }
  },

  async createReadStream(key: string | null, BucketName: string) {
    if (!key) return null;
    const params = {
      Bucket: BucketName,
      Key: key,
    };
    const command = new GetObjectCommand(params);
    const response = await s3Client.send(command);
    if (!response.Body) return null;
    return Readable.from(response.Body as Readable);
  },
};

export default AWSManager;
