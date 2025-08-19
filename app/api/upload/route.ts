import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { supabaseAdmin } from '@/lib/supabase'
import { prisma } from '@/lib/prisma'
import Tesseract from 'tesseract.js'
import * as pdfjsLib from 'pdfjs-dist'
import sharp from 'sharp'

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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

    // Upload file to Supabase Storage
    const fileName = `${document.id}-${Date.now()}-${file.name}`
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('documents')
      .upload(fileName, file)

    if (uploadError) {
      await prisma.document.update({
        where: { id: document.id },
        data: { processingStatus: 'FAILED' }
      })
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('documents')
      .getPublicUrl(fileName)

    // Update document with file URL
    await prisma.document.update({
      where: { id: document.id },
      data: { fileUrl: publicUrl }
    })

    // Process file content (OCR for images, text extraction for PDFs)
    let extractedText = ''
    
    if (file.type === 'application/pdf') {
      extractedText = await extractTextFromPDF(file)
    } else {
      extractedText = await extractTextFromImage(file)
    }

    // Process and chunk the text
    const sections = processTextIntoSections(extractedText)

    // Save sections to database
    await Promise.all(
      sections.map((section, index) =>
        prisma.documentSection.create({
          data: {
            documentId: document.id,
            type: section.type,
            content: section.content,
            order: index,
            metadata: section.metadata
          }
        })
      )
    )

    // Update document with processed content
    await prisma.document.update({
      where: { id: document.id },
      data: {
        content: extractedText,
        processingStatus: 'COMPLETED'
      }
    })

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        title: document.title,
        fileUrl: publicUrl,
        processingStatus: 'COMPLETED'
      }
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  let text = ''

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ')
    text += pageText + '\n'
  }

  return text
}

async function extractTextFromImage(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // Convert image to PNG for better OCR
  const processedImage = await sharp(buffer)
    .png()
    .toBuffer()

  const result = await Tesseract.recognize(processedImage, 'eng', {
    logger: m => console.log(m)
  })

  return result.data.text
}

function processTextIntoSections(text: string) {
  const sections = []
  const lines = text.split('\n').filter(line => line.trim())

  let currentSection = {
    type: 'PARAGRAPH' as const,
    content: '',
    metadata: {}
  }

  for (const line of lines) {
    const trimmedLine = line.trim()
    
    if (!trimmedLine) continue

    // Detect headings (lines with few words, all caps, or ending with numbers)
    const isHeading = (
      trimmedLine.split(' ').length <= 5 ||
      trimmedLine === trimmedLine.toUpperCase() ||
      /^[A-Z\s]+\d*$/.test(trimmedLine) ||
      /^\d+\.\s/.test(trimmedLine)
    )

    if (isHeading && currentSection.content) {
      // Save current section
      sections.push({ ...currentSection })
      currentSection = {
        type: 'HEADING',
        content: trimmedLine,
        metadata: {}
      }
    } else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('• ')) {
      // List item
      if (currentSection.type !== 'LIST') {
        if (currentSection.content) {
          sections.push({ ...currentSection })
        }
        currentSection = {
          type: 'LIST',
          content: trimmedLine,
          metadata: {}
        }
      } else {
        currentSection.content += '\n' + trimmedLine
      }
    } else {
      // Regular paragraph
      if (currentSection.type !== 'PARAGRAPH') {
        if (currentSection.content) {
          sections.push({ ...currentSection })
        }
        currentSection = {
          type: 'PARAGRAPH',
          content: trimmedLine,
          metadata: {}
        }
      } else {
        currentSection.content += '\n' + trimmedLine
      }
    }
  }

  // Add the last section
  if (currentSection.content) {
    sections.push(currentSection)
  }

  return sections
}
