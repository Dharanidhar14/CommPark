import { IStorageService } from './IStorageService';
import { LocalStorageService } from './LocalStorageService';
import { S3StorageService } from './S3StorageService';
import { env } from '../config/env';

export * from './IStorageService';
export * from './LocalStorageService';
export * from './S3StorageService';

export const createStorageService = (): IStorageService => {
  if (env.STORAGE_PROVIDER === 's3') {
    return new S3StorageService();
  }
  return new LocalStorageService();
};
