import fs from 'fs';
import path from 'path';
import { IStorageService, UploadResult } from './IStorageService';
import { env } from '../config/env';

export class LocalStorageService implements IStorageService {
  private baseDir: string;

  constructor(baseDir?: string) {
    this.baseDir = path.resolve(baseDir || env.STORAGE_LOCAL_DIR);
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  async uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    folder: string = 'general'
  ): Promise<UploadResult> {
    const targetFolder = path.join(this.baseDir, folder);
    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder, { recursive: true });
    }

    const uniqueName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = path.join(targetFolder, uniqueName);
    await fs.promises.writeFile(filePath, fileBuffer);

    const fileKey = `${folder}/${uniqueName}`;
    const url = `/uploads/${fileKey}`;

    return {
      fileKey,
      url,
      mimeType,
      sizeBytes: fileBuffer.length,
    };
  }

  async getFileUrl(fileKey: string): Promise<string> {
    return `/uploads/${fileKey}`;
  }

  async deleteFile(fileKey: string): Promise<boolean> {
    const filePath = path.join(this.baseDir, fileKey);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      return true;
    }
    return false;
  }
}
