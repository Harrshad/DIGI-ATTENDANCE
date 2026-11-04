import { Injectable } from '@nestjs/common';
import { IStorageAdapter } from './storage-adapter.interface';

@Injectable()
export class LocalGarageStorageService implements IStorageAdapter {
  private readonly baseUrl = process.env.S3_ENDPOINT || 'http://localhost:3900';
  private readonly bucket = process.env.S3_BUCKET || 'triattendance-evidence';

  async getPresignedUrl(key: string, expiresInSeconds = 900): Promise<string> {
    const expires = Math.floor(Date.now() / 1000) + expiresInSeconds;
    // Returns presigned direct URL with token expiry
    return `${this.baseUrl}/${this.bucket}/${key}?expires=${expires}&signature=mock_sig_${key.replace(/[^a-zA-Z0-9]/g, '_')}`;
  }

  async uploadFile(key: string, _buffer: Buffer, _mimeType: string): Promise<string> {
    return `${this.bucket}/${key}`;
  }

  async deleteFile(_key: string): Promise<void> {
    // Purges binary blob from storage bucket
  }
}
