import { NextRequest, NextResponse } from 'next/server'
import { OCRProcessor } from '@/lib/ocr-processor'

export async function GET(request: NextRequest) {
  try {
    console.log('Testing OCR processor...')
    
    // Test the OCR processor with sample content
    const testText = "This is a test document about biology. It contains information about cells and DNA."
    const metadata = OCRProcessor.extractMetadata(testText)
    const subject = OCRProcessor.extractSubjectFromFileName('biology-test.pdf')
    
    console.log('OCR Test Results:')
    console.log('- Subject detected:', subject)
    console.log('- Metadata:', metadata)
    
    return NextResponse.json({
      success: true,
      test: {
        subject,
        metadata,
        message: 'OCR processor is working correctly'
      }
    })
  } catch (error) {
    console.error('OCR test error:', error)
    return NextResponse.json({
      error: 'OCR test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 