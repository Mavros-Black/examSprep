import { NextRequest, NextResponse } from 'next/server'
import { createS3Client } from '@/lib/supabase-s3'
import { ListBucketsCommand } from '@aws-sdk/client-s3'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing S3 connection...')
    
    // Check if S3 credentials are available
    const hasS3Keys = !!(
      process.env.SUPABASE_S3_ACCESS_KEY_ID && 
      process.env.SUPABASE_S3_SECRET_ACCESS_KEY
    )
    
    if (!hasS3Keys) {
      return NextResponse.json({
        error: 'S3 credentials not configured',
        message: 'Please generate S3 access keys from your Supabase project settings',
        setupRequired: true,
        guide: 'See S3_SETUP_GUIDE.md for instructions'
      }, { status: 400 })
    }
    
    // Create S3 client
    const s3Client = createS3Client()
    
    // Test S3 connection by listing buckets
    const command = new ListBucketsCommand({})
    const response = await s3Client.send(command)
    
    console.log('S3 connection successful:', response)
    
    return NextResponse.json({
      message: 'S3 connection successful',
      buckets: response.Buckets?.map(bucket => ({
        name: bucket.Name,
        creationDate: bucket.CreationDate
      })),
      endpoint: s3Client.config.endpoint,
      region: s3Client.config.region
    })
    
  } catch (error) {
    console.error('S3 test error:', error)
    return NextResponse.json({ 
      error: 'S3 connection failed', 
      details: error instanceof Error ? error.message : 'Unknown error',
      setupRequired: true
    }, { status: 500 })
  }
}
