'use client'

import { useState, useEffect } from 'react'
import { FileText, Download, Eye, EyeOff, Tag, Calendar, User } from 'lucide-react'

interface DocumentSection {
  id: string
  type: 'HEADING' | 'PARAGRAPH' | 'LIST' | 'TABLE' | 'IMAGE' | 'EQUATION'
  content: string
  order: number
  metadata?: any
}

interface Document {
  id: string
  title: string
  description?: string
  content: string
  fileUrl?: string
  fileType?: string
  fileSize?: number
  subject: string
  tags: string[]
  isPublic: boolean
  processingStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  createdAt: string
  updatedAt: string
  creator: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  sections: DocumentSection[]
}

interface DocumentViewerProps {
  documentId: string
}

export default function DocumentViewer({ documentId }: DocumentViewerProps) {
  const [document, setDocument] = useState<Document | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showMetadata, setShowMetadata] = useState(false)

  useEffect(() => {
    fetchDocument()
  }, [documentId])

  const fetchDocument = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/documents/status/${documentId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch document')
      }

      const data = await response.json()
      setDocument(data.document)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load document')
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-600 bg-green-100'
      case 'PROCESSING':
        return 'text-yellow-600 bg-yellow-100'
      case 'FAILED':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const renderSection = (section: DocumentSection) => {
    switch (section.type) {
      case 'HEADING':
        return (
          <h3 key={section.id} className="text-xl font-bold text-gray-900 mt-6 mb-3">
            {section.content}
          </h3>
        )
      case 'LIST':
        return (
          <ul key={section.id} className="list-disc list-inside space-y-1 text-gray-700 mb-4">
            {section.content.split('\n').map((item, index) => (
              <li key={index}>{item.replace(/^[-•]\s*/, '')}</li>
            ))}
          </ul>
        )
      case 'PARAGRAPH':
        return (
          <p key={section.id} className="text-gray-700 leading-relaxed mb-4">
            {section.content}
          </p>
        )
      default:
        return (
          <div key={section.id} className="text-gray-700 mb-4">
            {section.content}
          </div>
        )
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-gray-600">Loading document...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <div className="text-red-600 mb-2">Error loading document</div>
        <div className="text-sm text-red-500">{error}</div>
      </div>
    )
  }

  if (!document) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
        <div className="text-gray-600">Document not found</div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-soft overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-50 to-secondary-50 p-6 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{document.title}</h1>
                <div className="flex items-center space-x-4 mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(document.processingStatus)}`}>
                    {document.processingStatus}
                  </span>
                  <span className="text-sm text-gray-500">
                    {document.fileType} • {document.fileSize ? formatFileSize(document.fileSize) : 'Unknown size'}
                  </span>
                </div>
              </div>
            </div>
            
            {document.description && (
              <p className="text-gray-600 mt-2">{document.description}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowMetadata(!showMetadata)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {showMetadata ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            
            {document.fileUrl && (
              <a
                href={document.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Metadata Panel */}
      {showMetadata && (
        <div className="bg-gray-50 p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  Created by {document.creator.firstName} {document.creator.lastName}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  Created {formatDate(document.createdAt)}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Tag className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  Subject: {document.subject}
                </span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-700">Tags:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {document.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Sections:</span>
                <span className="text-sm text-gray-600 ml-2">{document.sections.length}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {document.processingStatus === 'COMPLETED' ? (
          <div className="prose prose-gray max-w-none">
            {document.sections.length > 0 ? (
              document.sections.map(renderSection)
            ) : (
              <div className="text-gray-500 italic">
                No sections found. The document may not have been processed correctly.
              </div>
            )}
          </div>
        ) : document.processingStatus === 'PROCESSING' ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Processing document with OCR...</p>
            <p className="text-sm text-gray-500 mt-2">This may take a few minutes for large documents</p>
          </div>
        ) : document.processingStatus === 'FAILED' ? (
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">Processing failed</div>
            <p className="text-gray-600">The document could not be processed. Please try uploading again.</p>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">Document is queued for processing...</p>
          </div>
        )}
      </div>
    </div>
  )
}
