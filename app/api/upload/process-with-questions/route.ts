import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { createS3Client } from '@/lib/supabase-s3'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { prisma } from '@/lib/prisma'
import { DeepSeekService } from '@/lib/deepseek-service'
import sharp from 'sharp'
import pdf from 'pdf-parse'
import Tesseract from 'tesseract.js'

export async function POST(request: NextRequest) {
  try {
    console.log('=== PROCESS WITH QUESTIONS ENDPOINT CALLED ===')
    
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.log('User authenticated:', session.user.email)

    const formData = await request.formData()
    const file = formData.get('file') as File
    const documentId = formData.get('documentId') as string
    const totalQuestions = parseInt(formData.get('totalQuestions') as string) || 50
    const subject = formData.get('subject') as string || 'General'
    const difficulty = formData.get('difficulty') as string || 'medium'

    if (!file && !documentId) {
      return NextResponse.json({ error: 'No file or document ID provided' }, { status: 400 })
    }

    console.log('Processing parameters:')
    console.log('- Total questions requested:', totalQuestions)
    console.log('- Subject:', subject)
    console.log('- Difficulty:', difficulty)

    let fileBuffer: Buffer
    let fileName: string
    let fileType: string

    if (file) {
      // Process uploaded file directly
      console.log('=== PROCESSING UPLOADED FILE ===')
      fileName = file.name
      fileType = file.type
      fileBuffer = Buffer.from(await file.arrayBuffer())
      
      console.log('File Details:')
      console.log('- Name:', fileName)
      console.log('- Type:', fileType)
      console.log('- Size:', fileBuffer.length, 'bytes')
    } else {
      // Process file from database using document ID
      console.log('=== PROCESSING FILE FROM DATABASE ===')
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

    // Extract text content based on file type
    console.log('=== EXTRACTING TEXT CONTENT ===')
    let extractedContent: any = {}
    
    if (fileType === 'application/pdf') {
      extractedContent = await extractPDFContent(fileBuffer, fileName)
    } else if (fileType.startsWith('image/')) {
      extractedContent = await extractImageContent(fileBuffer, fileName)
    } else {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 })
    }

    console.log('Text extraction completed:')
    console.log('- Total text length:', extractedContent.text.length)
    console.log('- Number of sections:', extractedContent.sections.length)
    console.log('- Word count:', extractedContent.wordCount)

    // Save extracted content to database
    console.log('=== SAVING CONTENT TO DATABASE ===')
    let savedDocument
    
    if (documentId) {
      // Update existing document
      savedDocument = await prisma.document.update({
        where: { id: documentId },
        data: {
          content: extractedContent.text,
          processingStatus: 'COMPLETED',
          metadata: {
            ...extractedContent.metadata,
            extractedAt: new Date().toISOString(),
            totalSections: extractedContent.sections.length,
            wordCount: extractedContent.wordCount
          }
        }
      })
    } else {
      // Create new document
      savedDocument = await prisma.document.create({
        data: {
          title: fileName,
          description: `Processed ${fileName} with AI question generation`,
          content: extractedContent.text,
          fileType,
          fileSize: fileBuffer.length,
          subject,
          tags: ['ai-generated', 'questions'],
          creatorId: session.user.id,
          processingStatus: 'COMPLETED',
          metadata: {
            ...extractedContent.metadata,
            extractedAt: new Date().toISOString(),
            totalSections: extractedContent.sections.length,
            wordCount: extractedContent.wordCount
          }
        }
      })
    }

    console.log('Document saved:', savedDocument.id)

    // Save document sections
    console.log('=== SAVING DOCUMENT SECTIONS ===')
    for (let i = 0; i < extractedContent.sections.length; i++) {
      const section = extractedContent.sections[i]
      await prisma.documentSection.create({
        data: {
          documentId: savedDocument.id,
          type: section.type,
          content: section.content,
          order: i,
          metadata: {
            ...section.metadata,
            sectionIndex: i,
            wordCount: section.content.split(/\s+/).filter(w => w.length > 0).length
          }
        }
      })
    }

    console.log(`Saved ${extractedContent.sections.length} sections`)

    // Generate AI questions from each section
    console.log('=== GENERATING AI QUESTIONS ===')
    const allQuestions = []
    const questionsPerSection = Math.min(10, Math.ceil(totalQuestions / extractedContent.sections.length))
    
    console.log(`Generating ${questionsPerSection} questions per section`)

    for (let i = 0; i < extractedContent.sections.length; i++) {
      const section = extractedContent.sections[i]
      console.log(`Processing section ${i + 1}/${extractedContent.sections.length}: ${section.type}`)
      
      try {
        const sectionQuestions = await generateQuestionsFromSection(
          section.content,
          section.type,
          questionsPerSection,
          subject,
          difficulty,
          i + 1
        )
        
        allQuestions.push(...sectionQuestions)
        console.log(`Generated ${sectionQuestions.length} questions for section ${i + 1}`)
      } catch (error) {
        console.error(`Error generating questions for section ${i + 1}:`, error)
        // Continue with other sections
      }
    }

    // Save generated questions to database
    console.log('=== SAVING GENERATED QUESTIONS ===')
    const savedQuestions = []
    
    for (const question of allQuestions) {
      const savedQuestion = await prisma.question.create({
        data: {
          text: question.text,
          type: question.type,
          options: question.options,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
          difficulty: question.difficulty,
          points: question.points,
          subject: question.subject,
          tags: [...question.tags, 'ai-generated', `section-${question.sectionNumber}`],
          creatorId: session.user.id,
          documentId: savedDocument.id,
          isActive: true
        }
      })
      savedQuestions.push(savedQuestion)
    }

    console.log(`Saved ${savedQuestions.length} questions to database`)

    // Update document with question count
    await prisma.document.update({
      where: { id: savedDocument.id },
      data: {
        metadata: {
          ...savedDocument.metadata,
          totalQuestions: savedQuestions.length,
          questionsGeneratedAt: new Date().toISOString()
        }
      }
    })

    console.log('=== PROCESSING COMPLETED ===')
    console.log('Final summary:')
    console.log('- Document ID:', savedDocument.id)
    console.log('- Sections processed:', extractedContent.sections.length)
    console.log('- Questions generated:', savedQuestions.length)
    console.log('- Total word count:', extractedContent.wordCount)

    return NextResponse.json({
      success: true,
      document: {
        id: savedDocument.id,
        title: savedDocument.title,
        sections: extractedContent.sections.length,
        questions: savedQuestions.length,
        wordCount: extractedContent.wordCount
      },
      questions: savedQuestions.slice(0, 20), // Return first 20 questions for preview
      summary: {
        totalSections: extractedContent.sections.length,
        totalQuestions: savedQuestions.length,
        questionsPerSection,
        processingTime: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('=== PROCESSING ERROR ===')
    console.error('Error type:', typeof error)
    console.error('Error message:', error instanceof Error ? error.message : 'No message')
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack')
    
    return NextResponse.json({ 
      error: 'Processing failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function extractPDFContent(fileBuffer: Buffer, fileName: string) {
  console.log('Extracting PDF content...')
  
  try {
    const pdfData = await pdf(fileBuffer, {
      max: 0,
      version: 'v2.0.550'
    })
    
    console.log('PDF extraction results:')
    console.log('- Pages:', pdfData.numpages)
    console.log('- Raw text length:', pdfData.text.length)
    
    const text = pdfData.text.trim()
    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length
    
    // Split text into sections (by paragraphs or logical breaks)
    const sections = splitTextIntoSections(text, fileName)
    
    const metadata = {
      title: pdfData.info?.Title || fileName,
      author: pdfData.info?.Author || 'Unknown',
      pages: pdfData.numpages,
      pdfVersion: pdfData.info?.PDFFormatVersion || 'Unknown',
      creationDate: pdfData.info?.CreationDate || 'Unknown'
    }
    
    return {
      text,
      wordCount,
      sections,
      metadata
    }
    
  } catch (error) {
    console.error('PDF extraction error:', error)
    throw new Error(`PDF extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

async function extractImageContent(fileBuffer: Buffer, fileName: string) {
  console.log('Extracting image content with OCR...')
  
  try {
    const processedImage = await sharp(fileBuffer).png().toBuffer()
    const imageInfo = await sharp(fileBuffer).metadata()
    
    console.log('Image processing results:')
    console.log('- Format:', imageInfo.format)
    console.log('- Dimensions:', imageInfo.width, 'x', imageInfo.height)
    
    const ocrResult = await Tesseract.recognize(processedImage, 'eng', {
      logger: m => {
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`)
        }
      }
    })
    
    const text = ocrResult.data.text.trim()
    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length
    
    console.log('OCR results:')
    console.log('- Confidence:', ocrResult.data.confidence, '%')
    console.log('- Extracted text length:', text.length)
    
    // Split text into sections
    const sections = splitTextIntoSections(text, fileName)
    
    const metadata = {
      format: imageInfo.format,
      width: imageInfo.width,
      height: imageInfo.height,
      ocrConfidence: ocrResult.data.confidence
    }
    
    return {
      text,
      wordCount,
      sections,
      metadata
    }
    
  } catch (error) {
    console.error('Image extraction error:', error)
    throw new Error(`Image extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

function splitTextIntoSections(text: string, fileName: string) {
  console.log('Splitting text into sections...')
  
  // Split by double newlines (paragraphs)
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 50)
  
  // Group paragraphs into sections (aim for 200-500 words per section)
  const sections = []
  let currentSection = []
  let currentWordCount = 0
  const targetWordsPerSection = 300
  
  for (const paragraph of paragraphs) {
    const wordCount = paragraph.split(/\s+/).filter(w => w.length > 0).length
    
    if (currentWordCount + wordCount > targetWordsPerSection && currentSection.length > 0) {
      // Create section from current paragraphs
      sections.push({
        type: 'CONTENT',
        content: currentSection.join('\n\n'),
        metadata: {
          wordCount: currentWordCount,
          paragraphCount: currentSection.length,
          source: fileName
        }
      })
      
      currentSection = [paragraph]
      currentWordCount = wordCount
    } else {
      currentSection.push(paragraph)
      currentWordCount += wordCount
    }
  }
  
  // Add remaining content as final section
  if (currentSection.length > 0) {
    sections.push({
      type: 'CONTENT',
      content: currentSection.join('\n\n'),
      metadata: {
        wordCount: currentWordCount,
        paragraphCount: currentSection.length,
        source: fileName
      }
    })
  }
  
  console.log(`Created ${sections.length} sections from text`)
  sections.forEach((section, index) => {
    console.log(`Section ${index + 1}: ${section.metadata.wordCount} words, ${section.metadata.paragraphCount} paragraphs`)
  })
  
  return sections
}

async function generateQuestionsFromSection(
  content: string,
  sectionType: string,
  questionCount: number,
  subject: string,
  difficulty: string,
  sectionNumber: number
) {
  console.log(`Generating ${questionCount} questions for section ${sectionNumber}`)
  
  try {
    const prompt = `
You are an expert exam question generator. Generate ${questionCount} high-quality questions based on the following content.

Content from Section ${sectionNumber}:
${content.substring(0, 2000)}${content.length > 2000 ? '...' : ''}

Requirements:
- Subject: ${subject}
- Difficulty: ${difficulty}
- Section: ${sectionNumber}
- Question types: MULTIPLE_CHOICE, TRUE_FALSE, SHORT_ANSWER, ESSAY
- Each question must be directly related to the provided content
- Questions should test understanding, application, and analysis
- Provide clear, unambiguous questions with correct answers
- Include explanations for correct answers

Generate exactly ${questionCount} questions in JSON format.
`

    const response = await DeepSeekService.generateStructuredResponse(
      prompt,
      {
        questions: [
          {
            text: 'string',
            type: 'MULTIPLE_CHOICE | TRUE_FALSE | SHORT_ANSWER | ESSAY',
            options: ['string'] | null,
            correctAnswer: 'string',
            explanation: 'string',
            difficulty: 'easy | medium | hard',
            points: 'number',
            subject: 'string',
            tags: ['string']
          }
        ]
      }
    )

    // Add section information to each question
    const questions = response.questions.map((q: any) => ({
      ...q,
      sectionNumber,
      sectionType,
      tags: [...(q.tags || []), `section-${sectionNumber}`, 'ai-generated']
    }))

    console.log(`Generated ${questions.length} questions for section ${sectionNumber}`)
    return questions

  } catch (error) {
    console.error(`Error generating questions for section ${sectionNumber}:`, error)
    // Return empty array if generation fails
    return []
  }
}
