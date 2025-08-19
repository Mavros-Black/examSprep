import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const subject = searchParams.get('subject')
    const search = searchParams.get('search')

    // Build where clause
    const where: any = {
      OR: [
        { creatorId: session.user.id },
        { isPublic: true }
      ]
    }

    if (status && status !== 'all') {
      where.processingStatus = status
    }

    if (subject && subject !== 'all') {
      where.subject = subject
    }

    if (search) {
      where.OR = [
        ...where.OR,
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search] } }
      ]
    }

    // Get documents
    const documents = await prisma.document.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        _count: {
          select: {
            sections: true,
            questions: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      documents: documents.map(doc => ({
        id: doc.id,
        title: doc.title,
        description: doc.description,
        content: doc.content,
        fileUrl: doc.fileUrl,
        fileType: doc.fileType,
        fileSize: doc.fileSize,
        subject: doc.subject,
        tags: doc.tags,
        isPublic: doc.isPublic,
        processingStatus: doc.processingStatus,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        creator: doc.creator,
        sectionCount: doc._count.sections,
        questionCount: doc._count.questions
      }))
    })

  } catch (error) {
    console.error('Documents fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
