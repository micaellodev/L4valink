import { ConfigService } from '@nestjs/config';
export interface UploadedFileResult {
    key: string;
    url: string;
}
export declare class StorageService {
    private readonly config;
    private readonly logger;
    private readonly client;
    private readonly bucket;
    private readonly publicUrl;
    constructor(config: ConfigService);
    uploadImage(file: Express.Multer.File, folder?: string): Promise<UploadedFileResult>;
    deleteImage(key: string): Promise<void>;
    extractKeyFromUrl(url: string): string | null;
}
