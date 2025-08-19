import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createS3Client } from '@/lib/supabase-s3'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('=== SIMPLE FILE PARSING ENDPOINT CALLED ===')
    
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.log('User authenticated:', session.user.email)

    const formData = await request.formData()
    const file = formData.get('file') as File
    const documentId = formData.get('documentId') as string

    if (!file && !documentId) {
      return NextResponse.json({ error: 'No file or document ID provided' }, { status: 400 })
    }

    let fileBuffer: Buffer
    let fileName: string
    let fileType: string

    if (file) {
      // Parse uploaded file directly
      console.log('=== PARSING UPLOADED FILE ===')
      fileName = file.name
      fileType = file.type
      fileBuffer = Buffer.from(await file.arrayBuffer())
      
      console.log('File Details:')
      console.log('- Name:', fileName)
      console.log('- Type:', fileType)
      console.log('- Size:', fileBuffer.length, 'bytes')
    } else {
      // Parse file from database using document ID
      console.log('=== PARSING FILE FROM DATABASE ===')
      console.log('Document ID:', documentId)
      
      const document = await prisma.document.findUnique({
        where: { id: documentId }
      })
      
      if (!document) {
        return NextResponse.json({ error: 'Document not found' }, { status: 404 })
      }
      
      console.log('Document found:', document.title)
      
      // Download file from S3
      const s3Client = createS3Client()
      const s3Key = document.fileUrl?.split('/').pop()
      
      if (!s3Key) {
        return NextResponse.json({ error: 'File URL not found' }, { status: 404 })
      }
      
      console.log('Downloading from S3:', s3Key)
      
      const getCommand = new GetObjectCommand({
        Bucket: 'documents',
        Key: s3Key
      })
      
      const s3Response = await s3Client.send(getCommand)
      const s3Buffer = await s3Response.Body?.transformToByteArray()
      
      if (!s3Buffer) {
        return NextResponse.json({ error: 'Failed to download file from S3' }, { status: 500 })
      }
      
      fileBuffer = Buffer.from(s3Buffer)
      fileName = document.title
      fileType = document.fileType || 'application/pdf'
      
      console.log('Downloaded file:')
      console.log('- Name:', fileName)
      console.log('- Type:', fileType)
      console.log('- Size:', fileBuffer.length, 'bytes')
    }

    // Simple parsing without heavy libraries
    console.log('=== SIMPLE PARSING ===')
    
    let parsedContent: any = {
      type: fileType.startsWith('image/') ? 'image' : 'document',
      text: 'File content will be extracted with full OCR processing',
      wordCount: 0,
      pages: 1,
      pageContent: ['File content will be extracted with full OCR processing'],
      metadata: {
        fileName,
        fileType,
        fileSize: fileBuffer.length,
        processingNote: 'This is a simple parse. Full OCR processing is available in the complete endpoint.'
      },
      confidence: 0.5,
      images: []
    }

    // For PDFs, try to extract basic info
    if (fileType === 'application/pdf') {
      console.log('PDF detected - basic info extraction')
      parsedContent.text = `PDF file: ${fileName}\nSize: ${fileBuffer.length} bytes\nFull text extraction requires pdf-parse library`
      parsedContent.wordCount = fileName.split(/\s+/).length
      parsedContent.metadata.pdfInfo = {
        fileName,
        size: fileBuffer.length,
        note: 'Full PDF parsing requires pdf-parse library'
      }
    }

    // For images, try to extract basic info
    if (fileType.startsWith('image/')) {
      console.log('Image detected - basic info extraction')
      parsedContent.text = `Image file: ${fileName}\nSize: ${fileBuffer.length} bytes\nFull OCR requires Tesseract.js library`
      parsedContent.wordCount = fileName.split(/\s+/).length
      parsedContent.metadata.imageInfo = {
        fileName,
        size: fileBuffer.length,
        type: fileType,
        note: 'Full OCR requires Tesseract.js library'
      }
    }

    console.log('=== SIMPLE PARSING COMPLETED ===')
    console.log('Parsed content summary:')
    console.log('- Text length:', parsedContent.text?.length || 0, 'characters')
    console.log('- Word count:', parsedContent.wordCount || 0)
    console.log('- Pages:', parsedContent.pages || 1)
    console.log('- Type:', parsedContent.type)

    return NextResponse.json({
      success: true,
      parsedContent,
      fileName,
      fileType,
      note: 'This is a simple parse. Use the full parse endpoint for complete OCR processing.'
    })

  } catch (error) {
    console.error('=== SIMPLE PARSING ERROR ===')
    console.error('Error type:', typeof error)
    console.error('Error message:', error instanceof Error ? error.message : 'No message')
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack')
    
    return NextResponse.json({ 
      error: 'Simple parsing failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
