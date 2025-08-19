import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const attempts = await prisma.attempt.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        attemptQuestions: {
          include: {
            question: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ attempts })
  } catch (error) {
    console.error('Error fetching attempts:', error)
    return NextResponse.json({ error: 'Failed to fetch attempts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { topicName, questions, isMockExam = false } = body

    // Calculate score
    let score = 0
    let totalPoints = 0
    const answers = []

    for (const questionData of questions) {
      const { questionId, selectedAnswer, timeSpent } = questionData
      const question = await prisma.question.findUnique({
        where: { id: questionId }
      })

      if (question) {
        totalPoints += question.points
        const isCorrect = selectedAnswer === question.correctAnswer
        if (isCorrect) {
          score += question.points
        }

        answers.push({
          questionId,
          selectedAnswer,
          correctAnswer: question.correctAnswer,
          isCorrect,
          timeSpent
        })
      }
    }

    const percentage = totalPoints > 0 ? (score / totalPoints) * 100 : 0

    // Create attempt
    const attempt = await prisma.attempt.create({
      data: {
        userId: session.user.id,
        topicName,
        score,
        totalPoints,
        percentage,
        timeSpent: answers.reduce((total, ans) => total + (ans.timeSpent || 0), 0),
        isMockExam,
        answers: answers as any,
        metadata: {
          totalQuestions: questions.length,
          correctAnswers: answers.filter(a => a.isCorrect).length,
          createdAt: new Date().toISOString()
        }
      }
    })

    // Create attempt questions
    for (const answer of answers) {
      await prisma.attemptQuestion.create({
        data: {
          attemptId: attempt.id,
          questionId: answer.questionId,
          selectedAnswer: answer.selectedAnswer,
          isCorrect: answer.isCorrect,
          timeSpent: answer.timeSpent || 0
        }
      })
    }

    return NextResponse.json({ 
      success: true, 
      attempt: {
        id: attempt.id,
        score,
        totalPoints,
        percentage,
        topicName
      }
    })
  } catch (error) {
    console.error('Error creating attempt:', error)
    return NextResponse.json({ error: 'Failed to create attempt' }, { status: 500 })
  }
} 