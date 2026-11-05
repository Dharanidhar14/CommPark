export interface UploadResult {
  fileKey: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
}

export interface IStorageService {
  uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    folder?: string
  ): Promise<UploadResult>;

  getFileUrl(fileKey: string): Promise<string>;

  deleteFile(fileKey: string): Promise<boolean>;
}
