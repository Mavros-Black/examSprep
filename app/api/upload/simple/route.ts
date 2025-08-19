import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('Simple upload endpoint called')
    
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
    await new Promise(resolve => setTimeout(resolve, 1000))

    return NextResponse.json({
      success: true,
      message: 'Simple upload successful',
      file: {
        name: file.name,
        size: file.size,
        type: file.type
      }
    })

  } catch (error) {
    console.error('Simple upload error:', error)
    return NextResponse.json({ 
      error: 'Simple upload failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
