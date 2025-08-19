import { DeepSeekService } from './deepseek-service'
import { EmbeddingService } from './embeddings'
import { prisma } from './prisma'
import { Question, QuestionType } from '@prisma/client'
import { z } from 'zod'

const questionSchema = z.object({
  questions: z.array(
    z.object({
      text: z.string(),
      type: z.enum(['MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER', 'ESSAY']),
      options: z.array(z.string()).optional(),
      correctAnswer: z.string(),
      explanation: z.string().optional(),
      difficulty: z.enum(['easy', 'medium', 'hard']),
      points: z.number().min(1).max(10),
      subject: z.string(),
      tags: z.array(z.string())
    })
  )
})

export class QuestionGenerator {
  static async generateQuestionsWithAI(
    content: string,
    request: {
      count: number
      subject: string
      difficulty: 'easy' | 'medium' | 'hard'
      questionTypes: QuestionType[]
      topics?: string[]
      learningObjectives?: string[]
    }
  ): Promise<Question[]> {
    const prompt = `
You are an expert exam question generator. Generate ${request.count} high-quality questions based on the following content and requirements.
Ensure the questions are directly derived from the provided content and are relevant to the specified subject.

Content:
${content}

Requirements:
- Subject: ${request.subject}
- Difficulty: ${request.difficulty}
- Question Types: ${request.questionTypes.join(', ')}
- Topics: ${request.topics?.join(', ') || 'General'}
- Learning Objectives: ${request.learningObjectives?.join(', ') || 'Understanding and application'}

Guidelines:
- Questions must be clear, concise, and unambiguous.
- For MULTIPLE_CHOICE questions, provide 4 options (A, B, C, D) and clearly indicate the correct answer.
- For TRUE_FALSE questions, provide 'True' or 'False' as the correct answer.
- For SHORT_ANSWER questions, provide a concise correct answer.
- For ESSAY questions, provide a comprehensive correct answer.
- Assign a difficulty (easy, medium, hard) and points (1-10) appropriate for the question.
- Include relevant tags for each question.
- The response MUST be a JSON object matching the following schema. Do NOT include any other text, markdown, or comments outside the JSON.
`

    const response = await DeepSeekService.generateStructuredResponse(
      prompt,
      questionSchema
    )

    return this.validateAndFormatQuestions(response.questions, request)
  }

  private static validateAndFormatQuestions(
    questions: any[],
    request: {
      subject: string
      difficulty: 'easy' | 'medium' | 'hard'
    }
  ): Question[] {
    return questions.map((q, index) => ({
      id: `temp-${Date.now()}-${index}`,
      text: q.text,
      type: q.type as QuestionType,
      options: q.options || [],
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || '',
      difficulty: this.mapDifficultyToNumber(q.difficulty),
      points: q.points,
      subject: request.subject,
      tags: q.tags || [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      documentId: null,
      creatorId: ''
    }))
  }

  private static mapDifficultyToNumber(
    difficulty: 'easy' | 'medium' | 'hard'
  ): number {
    switch (difficulty) {
      case 'easy':
        return 1
      case 'medium':
        return 3
      case 'hard':
        return 5
      default:
        return 3
    }
  }

  static async retrieveRelevantContent(
    subject: string,
    topics: string[],
    maxLength = 5000
  ): Promise<string> {
    // First try to get content from embeddings
    const embeddingContent = await EmbeddingService.searchSimilarContent(
      topics.join(' '),
      subject,
      3
    )

    if (embeddingContent) {
      return embeddingContent.substring(0, maxLength)
    }

    // Fallback to document content
    const documents = await prisma.document.findMany({
      where: {
        subject,
        tags: { hasSome: topics }
      },
      orderBy: { createdAt: 'desc' },
      take: 2
    })

    return documents
      .map(doc => doc.content)
      .join('\n\n')
      .substring(0, maxLength)
  }

  static async saveQuestions(questions: Question[], creatorId: string) {
    return prisma.$transaction(
      questions.map(q =>
        prisma.question.create({
          data: {
            text: q.text,
            type: q.type,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            difficulty: q.difficulty,
            points: q.points,
            subject: q.subject,
            tags: q.tags,
            creatorId,
            isActive: true
          }
        })
      )
    )
  }

  static async getQuestions(
    subject: string,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium',
    limit = 10
  ) {
    const difficultyRange = this.getDifficultyRange(difficulty)
    return prisma.question.findMany({
      where: {
        subject,
        difficulty: { gte: difficultyRange.min, lte: difficultyRange.max },
        isActive: true
      },
      take: limit,
      orderBy: { createdAt: 'desc' }
    })
  }

  private static getDifficultyRange(
    level: 'easy' | 'medium' | 'hard'
  ): { min: number; max: number } {
    switch (level) {
      case 'easy':
        return { min: 1, max: 2 }
      case 'medium':
        return { min: 3, max: 4 }
      case 'hard':
        return { min: 5, max: 5 }
      default:
        return { min: 3, max: 4 }
    }
  }
}
