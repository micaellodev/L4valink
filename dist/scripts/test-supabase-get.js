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
const client = new client_s3_1.S3Client({
    region,
    endpoint: s3Endpoint,
    forcePathStyle: true,
    credentials: { accessKeyId, secretAccessKey },
});
const key = process.argv[2] || 'test/1785616975009-test.txt';
client.send(new client_s3_1.GetObjectCommand({ Bucket: bucket, Key: key }))
    .then(async (result) => {
    const body = await result.Body?.transformToString();
    console.log('OK - object exists:', key);
    console.log('ContentType:', result.ContentType);
    console.log('Body preview:', body?.slice(0, 100));
})
    .catch((err) => {
    console.error('ERROR:', err.name, err.message);
});
//# sourceMappingURL=test-supabase-get.js.map