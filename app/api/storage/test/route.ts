import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing Supabase Storage connection...')
    
    // Test bucket listing
    const { data: buckets, error: bucketError } = await supabaseAdmin
      .storage
      .listBuckets()
    
    if (bucketError) {
      console.error('Bucket listing error:', bucketError)
      return NextResponse.json({ 
        error: 'Storage connection failed', 
        details: bucketError.message 
      }, { status: 500 })
    }
    
    console.log('Available buckets:', buckets)
    
    // Check if documents bucket exists
    const documentsBucket = buckets?.find(bucket => bucket.name === 'documents')
    
    if (!documentsBucket) {
      return NextResponse.json({ 
        message: 'Storage connected but documents bucket not found',
        availableBuckets: buckets?.map(b => b.name),
        setupRequired: true
      })
    }
    
    return NextResponse.json({
      message: 'Supabase Storage connected successfully',
      documentsBucket: documentsBucket,
      availableBuckets: buckets?.map(b => b.name)
    })
    
  } catch (error) {
    console.error('Storage test error:', error)
    return NextResponse.json({ 
      error: 'Storage test failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
