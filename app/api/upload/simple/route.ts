import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { createS3Client } from '@/lib/supabase-s3'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('Simple upload endpoint called')
    
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.log('User authenticated:', session.user.email)

    const formData = await request.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const subject = formData.get('subject') as string
    const tags = (formData.get('tags') as string)?.split(',').map(tag => tag.trim()) || []

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

    console.log('File validation passed:', { name: file.name, size: file.size, type: file.type })

    // Create document record in database
    const document = await prisma.document.create({
      data: {
        title: title || file.name,
        description: `Uploaded ${file.name}`,
        content: 'File uploaded successfully - OCR processing pending',
        fileType: file.type,
        fileSize: file.size,
        subject: subject || 'General',
        tags,
        creatorId: session.user.id,
        processingStatus: 'COMPLETED'
      }
    })

    console.log('Document created in database:', document.id)

    // Upload file to S3
    const s3Client = createS3Client()
    const fileName = `${document.id}-${Date.now()}-${file.name}`
    const fileBuffer = Buffer.from(await file.arrayBuffer())

    const uploadCommand = new PutObjectCommand({
      Bucket: 'documents',
      Key: fileName,
      Body: fileBuffer,
      ContentType: file.type,
      Metadata: {
        'original-name': file.name,
        'document-id': document.id,
        'user-id': session.user.id
      }
    })

    await s3Client.send(uploadCommand)
    console.log('File uploaded to S3:', fileName)

    // Generate public URL
    const publicUrl = `https://alqeccfxzjhwgrgyunwn.storage.supabase.co/storage/v1/object/public/documents/${fileName}`

    // Update document with file URL
    await prisma.document.update({
      where: { id: document.id },
      data: { fileUrl: publicUrl }
    })

    console.log('Document updated with file URL')

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        title: document.title,
        fileUrl: publicUrl,
        processingStatus: 'COMPLETED',
        message: 'File uploaded successfully (OCR processing will be added later)'
      }
    })

  } catch (error) {
    console.error('Simple upload error:', error)
    return NextResponse.json({ 
      error: 'Upload failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
