import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const documentId = params.id

    // Get document with sections
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        sections: {
          orderBy: { order: 'asc' }
        },
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Check if user has access to this document
    if (document.creatorId !== session.user.id && !document.isPublic) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    return NextResponse.json({
      document: {
        id: document.id,
        title: document.title,
        description: document.description,
        content: document.content,
        fileUrl: document.fileUrl,
        fileType: document.fileType,
        fileSize: document.fileSize,
        subject: document.subject,
        tags: document.tags,
        isPublic: document.isPublic,
        processingStatus: document.processingStatus,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
        creator: document.creator,
        sections: document.sections.map(section => ({
          id: section.id,
          type: section.type,
          content: section.content,
          order: section.order,
          metadata: section.metadata
        }))
      }
    })

  } catch (error) {
    console.error('Document status error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
