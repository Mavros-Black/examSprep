import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createS3Client } from '@/lib/supabase-s3'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { prisma } from '@/lib/prisma'
import sharp from 'sharp'
import pdf from 'pdf-parse'
import Tesseract from 'tesseract.js'

export async function POST(request: NextRequest) {
  try {
    console.log('=== FILE PARSING ENDPOINT CALLED ===')
    
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

    // Parse file based on type
    let parsedContent: any = {}
    
    if (fileType === 'application/pdf') {
      console.log('=== PARSING PDF FILE ===')
      parsedContent = await parsePDF(fileBuffer, fileName)
    } else if (fileType.startsWith('image/')) {
      console.log('=== PARSING IMAGE FILE ===')
      parsedContent = await parseImage(fileBuffer, fileName)
    } else {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 })
    }

    console.log('=== PARSING COMPLETED ===')
    console.log('Parsed content summary:')
    console.log('- Text length:', parsedContent.text?.length || 0, 'characters')
    console.log('- Word count:', parsedContent.wordCount || 0)
    console.log('- Pages:', parsedContent.pages || 1)
    console.log('- Images found:', parsedContent.images?.length || 0)
    console.log('- Confidence:', parsedContent.confidence || 'N/A')

    return NextResponse.json({
      success: true,
      parsedContent,
      fileName,
      fileType
    })

  } catch (error) {
    console.error('=== PARSING ERROR ===')
    console.error('Error type:', typeof error)
    console.error('Error message:', error instanceof Error ? error.message : 'No message')
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack')
    
    return NextResponse.json({ 
      error: 'Parsing failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function parsePDF(fileBuffer: Buffer, fileName: string) {
  console.log('Starting PDF parsing...')
  
  try {
    // Parse PDF text
    const pdfData = await pdf(fileBuffer, {
      max: 0, // No page limit
      version: 'v2.0.550'
    })
    
    console.log('PDF parsing results:')
    console.log('- Number of pages:', pdfData.numpages)
    console.log('- PDF version:', pdfData.info?.PDFFormatVersion || 'Unknown')
    console.log('- Raw text length:', pdfData.text.length)
    console.log('- First 500 characters:', pdfData.text.substring(0, 500))
    
    // Extract text content
    const text = pdfData.text.trim()
    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length
    
    console.log('Text extraction results:')
    console.log('- Trimmed text length:', text.length)
    console.log('- Word count:', wordCount)
    console.log('- Average words per page:', Math.round(wordCount / pdfData.numpages))
    
    // Split text into pages
    const pages = []
    const lines = text.split('\n')
    let currentPage = []
    let lineCount = 0
    const linesPerPage = Math.ceil(lines.length / pdfData.numpages)
    
    for (const line of lines) {
      currentPage.push(line)
      lineCount++
      
      if (lineCount >= linesPerPage) {
        pages.push(currentPage.join('\n'))
        currentPage = []
        lineCount = 0
      }
    }
    
    if (currentPage.length > 0) {
      pages.push(currentPage.join('\n'))
    }
    
    console.log('Page splitting results:')
    console.log('- Pages created:', pages.length)
    pages.forEach((page, index) => {
      console.log(`  Page ${index + 1}: ${page.length} characters, ${page.split(/\s+/).filter(w => w.length > 0).length} words`)
    })
    
    // Extract metadata
    const metadata = {
      title: pdfData.info?.Title || fileName,
      author: pdfData.info?.Author || 'Unknown',
      subject: pdfData.info?.Subject || 'Unknown',
      creator: pdfData.info?.Creator || 'Unknown',
      producer: pdfData.info?.Producer || 'Unknown',
      creationDate: pdfData.info?.CreationDate || 'Unknown',
      modificationDate: pdfData.info?.ModDate || 'Unknown'
    }
    
    console.log('PDF metadata:')
    console.log('- Title:', metadata.title)
    console.log('- Author:', metadata.author)
    console.log('- Subject:', metadata.subject)
    console.log('- Creator:', metadata.creator)
    console.log('- Producer:', metadata.producer)
    console.log('- Creation date:', metadata.creationDate)
    console.log('- Modification date:', metadata.modificationDate)
    
    return {
      type: 'pdf',
      text,
      wordCount,
      pages: pages.length,
      pageContent: pages,
      metadata,
      confidence: 1.0, // High confidence for direct text extraction
      images: [] // PDF text extraction doesn't capture images
    }
    
  } catch (error) {
    console.error('PDF parsing error:', error)
    throw new Error(`PDF parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

async function parseImage(fileBuffer: Buffer, fileName: string) {
  console.log('Starting image parsing with OCR...')
  
  try {
    // Process image with Sharp
    const processedImage = await sharp(fileBuffer)
      .png()
      .toBuffer()
    
    console.log('Image processing results:')
    console.log('- Original size:', fileBuffer.length, 'bytes')
    console.log('- Processed size:', processedImage.length, 'bytes')
    
    // Get image metadata
    const imageInfo = await sharp(fileBuffer).metadata()
    console.log('Image metadata:')
    console.log('- Format:', imageInfo.format)
    console.log('- Width:', imageInfo.width, 'px')
    console.log('- Height:', imageInfo.height, 'px')
    console.log('- Channels:', imageInfo.channels)
    console.log('- Color space:', imageInfo.space)
    
    // Perform OCR
    console.log('Starting OCR processing...')
    const ocrResult = await Tesseract.recognize(processedImage, 'eng', {
      logger: m => {
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`)
        } else {
          console.log(`OCR Status: ${m.status}`)
        }
      }
    })
    
    console.log('OCR results:')
    console.log('- Confidence:', ocrResult.data.confidence, '%')
    console.log('- Raw text length:', ocrResult.data.text.length)
    console.log('- First 500 characters:', ocrResult.data.text.substring(0, 500))
    
    // Extract text content
    const text = ocrResult.data.text.trim()
    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length
    
    console.log('Text extraction results:')
    console.log('- Trimmed text length:', text.length)
    console.log('- Word count:', wordCount)
    console.log('- Average confidence:', ocrResult.data.confidence)
    
    // Extract words with confidence scores
    const words = ocrResult.data.words || []
    console.log('Word-level OCR results:')
    console.log('- Total words detected:', words.length)
    
    const highConfidenceWords = words.filter(w => w.confidence > 80)
    const mediumConfidenceWords = words.filter(w => w.confidence > 60 && w.confidence <= 80)
    const lowConfidenceWords = words.filter(w => w.confidence <= 60)
    
    console.log('- High confidence words (>80%):', highConfidenceWords.length)
    console.log('- Medium confidence words (60-80%):', mediumConfidenceWords.length)
    console.log('- Low confidence words (≤60%):', lowConfidenceWords.length)
    
    // Log some example words with their confidence
    if (words.length > 0) {
      console.log('Sample words with confidence:')
      words.slice(0, 10).forEach(word => {
        console.log(`  "${word.text}": ${word.confidence}%`)
      })
    }
    
    return {
      type: 'image',
      text,
      wordCount,
      pages: 1,
      pageContent: [text],
      metadata: {
        format: imageInfo.format,
        width: imageInfo.width,
        height: imageInfo.height,
        channels: imageInfo.channels,
        colorSpace: imageInfo.space
      },
      confidence: ocrResult.data.confidence / 100,
      images: [{
        type: 'original',
        format: imageInfo.format,
        width: imageInfo.width,
        height: imageInfo.height,
        size: fileBuffer.length
      }],
      ocrDetails: {
        totalWords: words.length,
        highConfidenceWords: highConfidenceWords.length,
        mediumConfidenceWords: mediumConfidenceWords.length,
        lowConfidenceWords: lowConfidenceWords.length,
        averageConfidence: ocrResult.data.confidence
      }
    }
    
  } catch (error) {
    console.error('Image parsing error:', error)
    throw new Error(`Image parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
