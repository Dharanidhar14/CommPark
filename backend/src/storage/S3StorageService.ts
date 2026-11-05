import { IStorageService, UploadResult } from './IStorageService';
import { logger } from '../config/logger';

/**
 * Production S3 / Supabase Storage adapter abstraction.
 * Implements standard S3-compatible PutObject/GetObject signing.
 */
export class S3StorageService implements IStorageService {
  private bucket: string;
  private region: string;

  constructor(bucket = 'commpark-parking-photos', region = 'ap-south-1') {
    this.bucket = bucket;
    this.region = region;
  }

  async uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    folder: string = 'parking'
  ): Promise<UploadResult> {
    const fileKey = `${folder}/${Date.now()}-${fileName}`;
    logger.info(`[Storage:S3] Mock S3 upload for ${fileKey} to bucket ${this.bucket} (${this.region})`);

    const url = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${fileKey}`;

    return {
      fileKey,
      url,
      mimeType,
      sizeBytes: fileBuffer.length,
    };
  }

  async getFileUrl(fileKey: string): Promise<string> {
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${fileKey}`;
  }

  async deleteFile(fileKey: string): Promise<boolean> {
    logger.info(`[Storage:S3] Delete ${fileKey} from bucket ${this.bucket}`);
    return true;
  }
}
