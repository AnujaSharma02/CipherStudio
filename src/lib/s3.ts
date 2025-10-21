import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || '';

export class S3Service {
  static async uploadFile(key: string, content: string, mimeType: string = 'text/plain'): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: content,
        ContentType: mimeType,
        Metadata: {
          uploadedAt: new Date().toISOString(),
        },
      });

      await s3Client.send(command);
      return key;
    } catch (error) {
      console.error('S3 upload error:', error);
      throw new Error('Failed to upload file to S3');
    }
  }

  static async getFile(key: string): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      const response = await s3Client.send(command);
      const content = await response.Body?.transformToString();
      return content || '';
    } catch (error) {
      console.error('S3 get error:', error);
      throw new Error('Failed to get file from S3');
    }
  }

  static async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      await s3Client.send(command);
    } catch (error) {
      console.error('S3 delete error:', error);
      throw new Error('Failed to delete file from S3');
    }
  }

  static async getPresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      return await getSignedUrl(s3Client, command, { expiresIn });
    } catch (error) {
      console.error('S3 presigned URL error:', error);
      throw new Error('Failed to generate presigned URL');
    }
  }

  static generateKey(projectId: string, fileId: string, fileName: string): string {
    return `projects/${projectId}/files/${fileId}/${fileName}`;
  }
}
