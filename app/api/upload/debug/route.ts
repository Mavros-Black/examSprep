import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'

export async function POST(request: NextRequest) {
  try {
    console.log('Debug upload endpoint called')
    
    // Check authentication
    console.log('Checking authentication...')
    const session = await getServerSession(authOptions)
    console.log('Session:', session ? 'Found' : 'Not found')
    
    if (!session?.user) {
      console.log('No session found, returning 401')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('User authenticated:', session.user.email)

    const formData = await request.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const subject = formData.get('subject') as string
    const tags = (formData.get('tags') as string)?.split(',').map(tag => tag.trim()) || []

    console.log('Form data received:', {
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      title,
      subject,
      tags
    })

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only PDF and images are allowed.' }, { status: 400 })
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Maximum size is 10MB.' }, { status: 400 })
    }

    console.log('File validation passed')

    // For now, just return success without processing
    return NextResponse.json({
      success: true,
      message: 'Debug upload successful',
      file: {
        name: file.name,
        size: file.size,
        type: file.type
      },
      user: {
        id: session.user.id,
        email: session.user.email
      }
    })

  } catch (error) {
    console.error('Debug upload error:', error)
    return NextResponse.json({ 
      error: 'Debug upload failed', 
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
