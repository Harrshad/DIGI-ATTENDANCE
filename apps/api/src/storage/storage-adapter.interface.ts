export interface IStorageAdapter {
  getPresignedUrl(key: string, expiresInSeconds?: number): Promise<string>;
  uploadFile(key: string, buffer: Buffer, mimeType: string): Promise<string>;
  deleteFile(key: string): Promise<void>;
}
