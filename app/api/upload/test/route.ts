import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('Test upload endpoint called')
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    console.log('File received:', {
      name: file.name,
      size: file.size,
      type: file.type
    })

    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000))

    return NextResponse.json({
      success: true,
      message: 'Test upload successful',
      file: {
        name: file.name,
        size: file.size,
        type: file.type
      }
    })

  } catch (error) {
    console.error('Test upload error:', error)
    return NextResponse.json({ 
      error: 'Test upload failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
