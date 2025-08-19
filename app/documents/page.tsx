'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import DocumentViewer from '@/components/DocumentViewer'
import { FileText, Search, Filter, Eye, Download, Calendar, Tag } from 'lucide-react'

interface Document {
  id: string
  title: string
  description?: string
  fileType?: string
  fileSize?: number
  subject: string
  tags: string[]
  processingStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  createdAt: string
  updatedAt: string
  fileUrl?: string
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterSubject, setFilterSubject] = useState<string>('all')

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/documents')
      
      if (!response.ok) {
        throw new Error('Failed to fetch documents')
      }

      const data = await response.json()
      setDocuments(data.documents)
    } catch (error) {
      console.error('Error fetching documents:', error)
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
      month: 'short',
      day: 'numeric',
      year: 'numeric'
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return '✓'
      case 'PROCESSING':
        return '⟳'
      case 'FAILED':
        return '✗'
      default:
        return '⏳'
    }
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = filterStatus === 'all' || doc.processingStatus === filterStatus
    const matchesSubject = filterSubject === 'all' || doc.subject === filterSubject

    return matchesSearch && matchesStatus && matchesSubject
  })

  const subjects = Array.from(new Set(documents.map(doc => doc.subject)))

  if (selectedDocument) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <button
              onClick={() => setSelectedDocument(null)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <span>←</span>
              <span>Back to Documents</span>
            </button>
          </div>
          <DocumentViewer documentId={selectedDocument} />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Documents</h1>
              <p className="text-gray-600">View and manage your uploaded documents</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-soft mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="PROCESSING">Processing</option>
                <option value="COMPLETED">Completed</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>

            {/* Subject Filter */}
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Subjects</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Documents Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="ml-3 text-gray-600">Loading documents...</span>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterStatus !== 'all' || filterSubject !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Upload your first document to get started'
              }
            </p>
            {!searchTerm && filterStatus === 'all' && filterSubject === 'all' && (
              <a
                href="/upload"
                className="btn-primary"
              >
                Upload Document
              </a>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-xl border border-gray-200 shadow-soft overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedDocument(doc.id)}
              >
                {/* Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary-600" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.processingStatus)}`}>
                        {getStatusIcon(doc.processingStatus)} {doc.processingStatus}
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {doc.title}
                  </h3>
                  
                  {doc.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {doc.description}
                    </p>
                  )}
                </div>

                {/* Details */}
                <div className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Subject:</span>
                      <span className="font-medium text-gray-900">{doc.subject}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">File Type:</span>
                      <span className="font-medium text-gray-900">
                        {doc.fileType?.split('/')[1]?.toUpperCase() || 'Unknown'}
                      </span>
                    </div>
                    
                    {doc.fileSize && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Size:</span>
                        <span className="font-medium text-gray-900">{formatFileSize(doc.fileSize)}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Created:</span>
                      <span className="font-medium text-gray-900">{formatDate(doc.createdAt)}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  {doc.tags.length > 0 && (
                    <div className="mt-4">
                      <div className="flex flex-wrap gap-1">
                        {doc.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                        {doc.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            +{doc.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-4 flex items-center justify-between">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedDocument(doc.id)
                      }}
                      className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                    
                    {doc.fileUrl && (
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center space-x-1 text-gray-600 hover:text-gray-700 text-sm"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
