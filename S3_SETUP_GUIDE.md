# Supabase S3 Access Keys Setup Guide

## Overview
To use Supabase Storage S3 API, you need to generate S3 access keys from your Supabase project settings.

## Step 1: Generate S3 Access Keys

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**: `alqeccfxzjhwgrgyunwn`
3. **Navigate to Settings** → **API**
4. **Scroll down to "Storage S3 Access keys"**
5. **Click "Generate new key pair"**
6. **Copy both the Access Key ID and Secret Access Key**

## Step 2: Add Environment Variables

Add these to your `.env` file:

```bash
# Supabase S3 Access Keys (for server-side uploads)
SUPABASE_S3_ACCESS_KEY_ID="your_access_key_id_here"
SUPABASE_S3_SECRET_ACCESS_KEY="your_secret_access_key_here"
```

## Step 3: Update Environment File

Run this command to add the S3 keys to your environment:

```bash
echo 'SUPABASE_S3_ACCESS_KEY_ID="your_access_key_id_here"' >> .env
echo 'SUPABASE_S3_SECRET_ACCESS_KEY="your_secret_access_key_here"' >> .env
```

## Step 4: Restart Development Server

After adding the environment variables, restart your development server:

```bash
npm run dev
```

## Authentication Methods

### Method 1: S3 Access Keys (Server-side)
- **Use case**: Server-side uploads (recommended for your use case)
- **Security**: Full access to all S3 operations
- **Bypasses**: RLS policies

### Method 2: Session Token (Client-side)
- **Use case**: Client-side uploads with user authentication
- **Security**: Limited access via RLS policies
- **Requires**: User JWT token

## Important Notes

⚠️ **Security Warning**: S3 access keys provide full access to all S3 operations across all buckets and bypass RLS policies. These are meant to be used only on the server.

🔗 **Direct Storage Hostname**: For optimal performance when uploading large files, use the direct storage hostname:
- Instead of: `https://project-id.supabase.co`
- Use: `https://project-id.storage.supabase.co`

## Testing

After setup, test the S3 connection:

```bash
curl http://localhost:3000/api/storage/test
```

## Troubleshooting

### Common Issues:
1. **"Invalid credentials"**: Check that S3 access keys are correctly set
2. **"Access denied"**: Ensure the keys have proper permissions
3. **"Endpoint not found"**: Verify the project reference is correct

### References:
- [Supabase S3 Authentication Docs](https://supabase.com/docs/guides/storage/s3/authentication)
- [Supabase Storage S3 API](https://supabase.com/docs/guides/storage/s3/api)
