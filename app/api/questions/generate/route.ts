import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { OpenAIService } from '@/lib/openai-service'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { content, count = 5, subject = 'General', difficulty = 'medium' } = body

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    // Generate questions using AI
    const openaiService = OpenAIService.getInstance()
    const prompt = `
Generate ${count} high-quality exam questions based on the following content:

Content:
${content.substring(0, 2000)}${content.length > 2000 ? '...' : ''}

Requirements:
- Subject: ${subject}
- Difficulty: ${difficulty}
- Question types: MULTIPLE_CHOICE, TRUE_FALSE, SHORT_ANSWER
- Each question must be directly related to the provided content
- Questions should test understanding, application, and analysis
- Provide clear, unambiguous questions with correct answers
- Include explanations for correct answers

Generate exactly ${count} questions in JSON format.
`

    const response = await openaiService.generateStructuredResponse(
      prompt,
      {
        questions: [
          {
            text: 'string',
            type: 'MULTIPLE_CHOICE | TRUE_FALSE | SHORT_ANSWER',
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

    return NextResponse.json({
      success: true,
      questions: response.questions || []
    })

  } catch (error) {
    console.error('Question generation error:', error)
    return NextResponse.json({ 
      error: 'Failed to generate questions',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 