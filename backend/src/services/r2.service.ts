import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { r2Client, R2_BUCKET } from '../config/r2';

/** Upload a file buffer to R2. The bucket is kept private. */
export async function uploadToR2(
  key: string,
  buffer: Buffer,
  mimeType: string,
): Promise<void> {
  await r2Client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    }),
  );
}

/**
 * Generate a short-lived presigned URL for a private R2 object.
 * @param key       Object key inside the bucket
 * @param expiresIn TTL in seconds (default 10 minutes)
 */
export async function getPresignedUrl(
  key: string,
  expiresIn = 600,
): Promise<string> {
  const command = new GetObjectCommand({ Bucket: R2_BUCKET, Key: key });
  return getSignedUrl(r2Client, command, { expiresIn });
}

/** Delete an object from R2. */
export async function deleteFromR2(key: string): Promise<void> {
  await r2Client.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }));
}
