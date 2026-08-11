import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

export interface UploadedFileResult {
    key: string;
    url: string;
}

@Injectable()
export class StorageService {
    private readonly logger = new Logger(StorageService.name);
    private readonly client: S3Client;
    private readonly bucket: string;
    private readonly publicUrl: string;

    constructor(private readonly config: ConfigService) {
        const supabaseUrl = this.config
            .getOrThrow<string>('SUPABASE_URL')
            .replace(/\/$/, '');
        this.bucket = this.config.getOrThrow<string>('SUPABASE_STORAGE_BUCKET');
        const accessKeyId = this.config.getOrThrow<string>('SUPABASE_ACCESS_KEY_ID');
        const secretAccessKey = this.config.getOrThrow<string>('SUPABASE_SECRET_ACCESS_KEY');

        // Public URL: prefer explicit override, otherwise default Supabase public URL pattern
        const explicitPublicUrl = this.config.get<string>('SUPABASE_PUBLIC_URL');
        this.publicUrl = explicitPublicUrl
            ? explicitPublicUrl.replace(/\/$/, '')
            : `${supabaseUrl}/storage/v1/object/public/${this.bucket}`;

        // S3-compatible endpoint: prefer explicit override, otherwise default Supabase S3 endpoint
        const explicitS3Endpoint = this.config.get<string>('SUPABASE_S3_ENDPOINT');
        const s3Endpoint = explicitS3Endpoint
            ? explicitS3Endpoint.replace(/\/$/, '')
            : `${supabaseUrl.replace('.supabase.co', '.storage.supabase.co')}/storage/v1/s3`;

        const region = this.config.get<string>('SUPABASE_REGION', 'auto');

        this.client = new S3Client({
            region,
            endpoint: s3Endpoint,
            forcePathStyle: true,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
        });
    }

    async uploadImage(
        file: Express.Multer.File,
        folder = 'menu',
    ): Promise<UploadedFileResult> {
        const ext = file.originalname.split('.').pop()?.toLowerCase() || 'jpg';
        const key = `${folder}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

        await this.client.send(
            new PutObjectCommand({
                Bucket: this.bucket,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
            }),
        );

        const url = `${this.publicUrl}/${key}`;
        this.logger.log(`Uploaded image to Supabase Storage: ${key}`);
        return { key, url };
    }

    async deleteImage(key: string): Promise<void> {
        await this.client.send(
            new DeleteObjectCommand({
                Bucket: this.bucket,
                Key: key,
            }),
        );
        this.logger.log(`Deleted image from Supabase Storage: ${key}`);
    }

    extractKeyFromUrl(url: string): string | null {
        if (!url?.startsWith(this.publicUrl)) return null;
        return url.replace(`${this.publicUrl}/`, '');
    }
}
