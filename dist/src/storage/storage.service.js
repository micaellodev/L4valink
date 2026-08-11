"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var StorageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_s3_1 = require("@aws-sdk/client-s3");
let StorageService = StorageService_1 = class StorageService {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(StorageService_1.name);
        const supabaseUrl = this.config
            .getOrThrow('SUPABASE_URL')
            .replace(/\/$/, '');
        this.bucket = this.config.getOrThrow('SUPABASE_STORAGE_BUCKET');
        const accessKeyId = this.config.getOrThrow('SUPABASE_ACCESS_KEY_ID');
        const secretAccessKey = this.config.getOrThrow('SUPABASE_SECRET_ACCESS_KEY');
        const explicitPublicUrl = this.config.get('SUPABASE_PUBLIC_URL');
        this.publicUrl = explicitPublicUrl
            ? explicitPublicUrl.replace(/\/$/, '')
            : `${supabaseUrl}/storage/v1/object/public/${this.bucket}`;
        const explicitS3Endpoint = this.config.get('SUPABASE_S3_ENDPOINT');
        const s3Endpoint = explicitS3Endpoint
            ? explicitS3Endpoint.replace(/\/$/, '')
            : `${supabaseUrl.replace('.supabase.co', '.storage.supabase.co')}/storage/v1/s3`;
        const region = this.config.get('SUPABASE_REGION', 'auto');
        this.client = new client_s3_1.S3Client({
            region,
            endpoint: s3Endpoint,
            forcePathStyle: true,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
        });
    }
    async uploadImage(file, folder = 'menu') {
        const ext = file.originalname.split('.').pop()?.toLowerCase() || 'jpg';
        const key = `${folder}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
        await this.client.send(new client_s3_1.PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
        }));
        const url = `${this.publicUrl}/${key}`;
        this.logger.log(`Uploaded image to Supabase Storage: ${key}`);
        return { key, url };
    }
    async deleteImage(key) {
        await this.client.send(new client_s3_1.DeleteObjectCommand({
            Bucket: this.bucket,
            Key: key,
        }));
        this.logger.log(`Deleted image from Supabase Storage: ${key}`);
    }
    extractKeyFromUrl(url) {
        if (!url?.startsWith(this.publicUrl))
            return null;
        return url.replace(`${this.publicUrl}/`, '');
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = StorageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], StorageService);
//# sourceMappingURL=storage.service.js.map