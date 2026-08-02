import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

if (
  !process.env.SUPABASE_PROJECT_REF ||
  !process.env.SUPABASE_STORAGE_REGION ||
  !process.env.SUPABASE_STORAGE_ACCESS_KEY_ID ||
  !process.env.SUPABASE_STORAGE_SECRET_ACCESS_KEY ||
  !process.env.SUPABASE_STORAGE_BUCKET_NAME
) {
  throw new Error(
    "SUPABASE_PROJECT_REF, SUPABASE_STORAGE_REGION, SUPABASE_STORAGE_ACCESS_KEY_ID, SUPABASE_STORAGE_SECRET_ACCESS_KEY, and SUPABASE_STORAGE_BUCKET_NAME must all be set"
  );
}

// Supabase Storage is S3-compatible (AWS SigV4), so the same client used for
// R2 works unchanged — only the endpoint/credentials differ.
const s3Client = new S3Client({
  region: process.env.SUPABASE_STORAGE_REGION,
  endpoint: `https://${process.env.SUPABASE_PROJECT_REF}.storage.supabase.co/storage/v1/s3`,
  credentials: {
    accessKeyId: process.env.SUPABASE_STORAGE_ACCESS_KEY_ID,
    secretAccessKey: process.env.SUPABASE_STORAGE_SECRET_ACCESS_KEY,
  },
});

export async function createPresignedUploadUrl(input: {
  key: string;
  contentType: string;
}): Promise<{ uploadUrl: string }> {
  const command = new PutObjectCommand({
    Bucket: process.env.SUPABASE_STORAGE_BUCKET_NAME,
    Key: input.key,
    ContentType: input.contentType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

  return { uploadUrl };
}

export async function deleteObject(key: string): Promise<void> {
  await s3Client.send(
    new DeleteObjectCommand({ Bucket: process.env.SUPABASE_STORAGE_BUCKET_NAME, Key: key })
  );
}

// Short-lived presigned GET URL for a stored object (e.g. an admin viewing a
// resume). Callers MUST authorize access before calling — this only signs.
export async function createPresignedDownloadUrl(input: {
  key: string;
  downloadFilename?: string;
}): Promise<{ downloadUrl: string }> {
  const command = new GetObjectCommand({
    Bucket: process.env.SUPABASE_STORAGE_BUCKET_NAME,
    Key: input.key,
    ...(input.downloadFilename
      ? { ResponseContentDisposition: `attachment; filename="${input.downloadFilename}"` }
      : {}),
  });

  const downloadUrl = await getSignedUrl(s3Client, command, { expiresIn: 120 });
  return { downloadUrl };
}

// Fetches the raw bytes of an object (e.g. to feed a resume to the parser).
// Returns null if the object doesn't exist or can't be read.
export async function getObjectBytes(
  key: string
): Promise<{ bytes: Uint8Array; contentType?: string } | null> {
  try {
    const res = await s3Client.send(
      new GetObjectCommand({ Bucket: process.env.SUPABASE_STORAGE_BUCKET_NAME, Key: key })
    );
    const bytes = await res.Body?.transformToByteArray();
    if (!bytes) return null;
    return { bytes, contentType: res.ContentType };
  } catch {
    return null;
  }
}

// Metadata-only lookup (no download). Returns null if the object doesn't exist.
export async function getObjectSize(key: string): Promise<number | null> {
  try {
    const head = await s3Client.send(
      new HeadObjectCommand({ Bucket: process.env.SUPABASE_STORAGE_BUCKET_NAME, Key: key })
    );
    return head.ContentLength ?? null;
  } catch {
    return null;
  }
}
