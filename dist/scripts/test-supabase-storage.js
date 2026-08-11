"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_s3_1 = require("@aws-sdk/client-s3");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const supabaseUrl = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const bucket = process.env.SUPABASE_STORAGE_BUCKET || '';
const accessKeyId = process.env.SUPABASE_ACCESS_KEY_ID || '';
const secretAccessKey = process.env.SUPABASE_SECRET_ACCESS_KEY || '';
const explicitS3Endpoint = process.env.SUPABASE_S3_ENDPOINT;
const region = process.env.SUPABASE_REGION || 'auto';
const s3Endpoint = explicitS3Endpoint
    ? explicitS3Endpoint.replace(/\/$/, '')
    : `${supabaseUrl.replace('.supabase.co', '.storage.supabase.co')}/storage/v1/s3`;
console.log('Supabase URL:', supabaseUrl);
console.log('Bucket:', bucket);
console.log('S3 Endpoint:', s3Endpoint);
console.log('Region:', region);
const client = new client_s3_1.S3Client({
    region,
    endpoint: s3Endpoint,
    forcePathStyle: true,
    credentials: { accessKeyId, secretAccessKey },
});
const key = `test/${Date.now()}-test.txt`;
client.send(new client_s3_1.PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: Buffer.from('test content'),
    ContentType: 'text/plain',
}))
    .then(() => {
    console.log('OK - uploaded to:', key);
    const publicUrl = process.env.SUPABASE_PUBLIC_URL
        ? `${process.env.SUPABASE_PUBLIC_URL.replace(/\/$/, '')}/${key}`
        : `${supabaseUrl}/storage/v1/object/public/${bucket}/${key}`;
    console.log('Public URL:', publicUrl);
    process.exit(0);
})
    .catch((err) => {
    console.error('ERROR:', err.name, err.message);
    process.exit(1);
});
//# sourceMappingURL=test-supabase-storage.js.map