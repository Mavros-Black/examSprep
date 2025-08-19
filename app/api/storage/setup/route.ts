import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('Setting up Supabase Storage...')
    
    // Create documents bucket
    const { data: bucket, error: bucketError } = await supabaseAdmin
      .storage
      .createBucket('documents', {
        public: true,
        allowedMimeTypes: ['application/pdf', 'image/*'],
        fileSizeLimit: 52428800 // 50MB
      })
    
    if (bucketError) {
      console.error('Bucket creation error:', bucketError)
      return NextResponse.json({ 
        error: 'Failed to create documents bucket', 
        details: bucketError.message 
      }, { status: 500 })
    }
    
    console.log('Documents bucket created:', bucket)
    
    // Set up storage policies
    const policies = [
      {
        name: 'Allow authenticated uploads',
        policy: `CREATE POLICY "Allow authenticated uploads" ON storage.objects FOR INSERT WITH CHECK (auth.role() = 'authenticated');`
      },
      {
        name: 'Allow authenticated reads',
        policy: `CREATE POLICY "Allow authenticated reads" ON storage.objects FOR SELECT USING (auth.role() = 'authenticated');`
      },
      {
        name: 'Allow authenticated updates',
        policy: `CREATE POLICY "Allow authenticated updates" ON storage.objects FOR UPDATE USING (auth.role() = 'authenticated');`
      },
      {
        name: 'Allow authenticated deletes',
        policy: `CREATE POLICY "Allow authenticated deletes" ON storage.objects FOR DELETE USING (auth.role() = 'authenticated');`
      }
    ]
    
    return NextResponse.json({
      message: 'Supabase Storage setup completed',
      bucket: bucket,
      policies: policies,
      nextSteps: [
        'Run the SQL policies in your Supabase SQL editor',
        'Test file upload functionality',
        'Check document processing pipeline'
      ]
    })
    
  } catch (error) {
    console.error('Storage setup error:', error)
    return NextResponse.json({ 
      error: 'Storage setup failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
