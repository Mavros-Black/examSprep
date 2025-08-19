import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { createS3Client } from '@/lib/supabase-s3'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { prisma } from '@/lib/prisma'
import { OCRProcessor } from '@/lib/ocr-processor'

export async function POST(request: NextRequest) {
  try {
    console.log('Complete upload endpoint called')
    
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
        content: '', // Will be populated after OCR
        fileType: file.type,
        fileSize: file.size,
        subject: subject || 'General',
        tags,
        creatorId: session.user.id,
        processingStatus: 'PROCESSING'
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

    // Centralized OCR/text extraction
    console.log('Starting OCR/text extraction...')
    const processed = await OCRProcessor.processFile(fileBuffer, file.type, file.name)
    console.log('OCR completed. Confidence:', processed.confidence, 'Text length:', processed.text.length)
    
    // Log the extracted text content
    console.log('=== EXTRACTED TEXT CONTENT ===')
    console.log('File:', file.name)
    console.log('Type:', file.type)
    console.log('Text Length:', processed.text.length, 'characters')
    console.log('Confidence:', processed.confidence)
    console.log('Number of Sections:', processed.sections.length)
    console.log('--- FULL EXTRACTED TEXT ---')
    console.log(processed.text)
    console.log('--- END EXTRACTED TEXT ---')
    
    // Log each section separately
    console.log('=== DOCUMENT SECTIONS ===')
    processed.sections.forEach((section, index) => {
      console.log(`Section ${index + 1} (${section.type}):`)
      console.log('Content:', section.content.substring(0, 200) + (section.content.length > 200 ? '...' : ''))
      console.log('Metadata:', section.metadata)
      console.log('---')
    })
    
    const meta = OCRProcessor.extractMetadata(processed.text)
    console.log('=== EXTRACTED METADATA ===')
    console.log('Word Count:', meta.wordCount)
    console.log('Estimated Reading Time:', meta.estimatedReadingTime, 'minutes')
    console.log('Language:', meta.language)
    console.log('Topics:', meta.topics)
    console.log('========================')

    // Update document with processed content
    await prisma.document.update({
      where: { id: document.id },
      data: {
        content: processed.text,
        processingStatus: 'COMPLETED',
        metadata: {
          ...meta,
          ocrConfidence: processed.confidence,
          originalFileName: file.name,
          processingDate: new Date().toISOString()
        }
      }
    })
    console.log('Document content updated')

    // Create document sections
    console.log('Creating document sections...')
    for (let i = 0; i < processed.sections.length; i++) {
      const section = processed.sections[i]
      await prisma.documentSection.create({
        data: {
          documentId: document.id,
          type: section.type,
          content: section.content,
          order: i,
          metadata: section.metadata
        }
      })
    }
    console.log(`Created ${processed.sections.length} sections`)

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        title: document.title,
        fileUrl: publicUrl,
        processingStatus: 'COMPLETED',
        sectionCount: processed.sections.length,
        contentLength: processed.text.length,
        wordCount: meta.wordCount,
        confidence: processed.confidence,
        estimatedReadingTime: meta.estimatedReadingTime
      }
    })

  } catch (error) {
    console.error('Complete upload error:', error)
    return NextResponse.json({ 
      error: 'Upload failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
