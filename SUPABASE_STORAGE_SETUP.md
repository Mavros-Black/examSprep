# Supabase Storage Setup Guide

## Quick Setup for File Uploads

### 1. Create Storage Bucket

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `alqeccfxzjhwgrgyunwn`
3. Navigate to **Storage** in the left sidebar
4. Click **"Create a new bucket"**
5. Set bucket name: `documents`
6. Set bucket as **Public** (for now, we can make it private later)
7. Click **"Create bucket"**

### 2. Set Storage Policies

After creating the bucket, you need to set up policies. In the Storage section:

#### For Uploads (INSERT):
```sql
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

#### For Downloads (SELECT):
```sql
CREATE POLICY "Allow authenticated reads" ON storage.objects
FOR SELECT USING (auth.role() = 'authenticated');
```

### 3. Test Upload

Once the bucket is set up:
1. Start your dev server: `npm run dev`
2. Navigate to `/upload`
3. Try uploading a PDF or image file
4. Check the `/documents` page to see uploaded files

## Troubleshooting

### Common Issues:

1. **"Bucket not found" error**: Make sure the bucket name is exactly `documents`
2. **"Permission denied" error**: Check that the storage policies are set correctly
3. **"File too large" error**: Default limit is 50MB, can be increased in bucket settings

### Environment Variables Check:

Make sure your `.env` file has:
```bash
NEXT_PUBLIC_SUPABASE_URL="https://alqeccfxzjhwgrgyunwn.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

## Next Steps

After setting up storage:
1. Test file uploads
2. Check OCR processing
3. View processed documents in `/documents`
4. Test document viewer functionality
