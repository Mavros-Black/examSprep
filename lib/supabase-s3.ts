import { S3Client } from '@aws-sdk/client-s3'

// S3 Client for Supabase Storage
// You'll need to generate S3 access keys from your Supabase project settings
export const createS3Client = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const projectRef = supabaseUrl.split('//')[1].split('.')[0] // Extract project ref from URL
  
  return new S3Client({
    forcePathStyle: true,
    region: 'us-east-1', // Default region for Supabase
    endpoint: `https://${projectRef}.storage.supabase.co/storage/v1/s3`,
    credentials: {
      accessKeyId: process.env.SUPABASE_S3_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.SUPABASE_S3_SECRET_ACCESS_KEY || '',
    },
  })
}

// For client-side use with session token
export const createS3ClientWithSession = (sessionToken: string) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const projectRef = supabaseUrl.split('//')[1].split('.')[0]
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  return new S3Client({
    forcePathStyle: true,
    region: 'us-east-1',
    endpoint: `https://${projectRef}.storage.supabase.co/storage/v1/s3`,
    credentials: {
      accessKeyId: projectRef,
      secretAccessKey: anonKey,
      sessionToken: sessionToken,
    },
  })
}
