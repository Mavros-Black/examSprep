'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { FileText, Image, Loader2 } from 'lucide-react'

interface ParsedContent {
  type: string
  text: string
  wordCount: number
  pages: number
  pageContent: string[]
  metadata: any
  confidence: number
  images: any[]
  ocrDetails?: any
}

export default function FileParser() {
  const { user } = useAuth()
  const [isParsing, setIsParsing] = useState(false)
  const [parsedContent, setParsedContent] = useState<ParsedContent | null>(null)
  const [error, setError] = useState<string | null>(null)

  const parseUploadedFile = async () => {
    if (!user) {
      alert('Please log in to parse files')
      return
    }

    setIsParsing(true)
    setError(null)
    setParsedContent(null)

    try {
      // Create a test file (you can modify this to use a real file)
      const testText = 'This is a test document for parsing. It contains sample text to demonstrate the parsing functionality.'
      const blob = new Blob([testText], { type: 'text/plain' })
      const file = new File([blob], 'test-document.txt', { type: 'text/plain' })

      const formData = new FormData()
      formData.append('file', file)

      console.log('=== SENDING FILE FOR PARSING ===')
      console.log('File:', file.name, file.size, 'bytes')

      const response = await fetch('/api/upload/parse-simple', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Parsing failed')
      }

      const result = await response.json()
      console.log('=== PARSING RESULT ===')
      console.log('Result:', result)

      setParsedContent(result.parsedContent)

    } catch (error) {
      console.error('Parsing error:', error)
      setError(error instanceof Error ? error.message : 'Parsing failed')
    } finally {
      setIsParsing(false)
    }
  }

  const parseExistingDocument = async (documentId: string) => {
    if (!user) {
      alert('Please log in to parse files')
      return
    }

    setIsParsing(true)
    setError(null)
    setParsedContent(null)

    try {
      const formData = new FormData()
      formData.append('documentId', documentId)

      console.log('=== PARSING EXISTING DOCUMENT ===')
      console.log('Document ID:', documentId)

      const response = await fetch('/api/upload/parse-simple', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Parsing failed')
      }

      const result = await response.json()
      console.log('=== PARSING RESULT ===')
      console.log('Result:', result)

      setParsedContent(result.parsedContent)

    } catch (error) {
      console.error('Parsing error:', error)
      setError(error instanceof Error ? error.message : 'Parsing failed')
    } finally {
      setIsParsing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-soft">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">File Parser Test</h3>
        
        <div className="space-y-4">
          <button
            onClick={parseUploadedFile}
            disabled={isParsing}
            className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isParsing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Parsing File...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Parse Test File
              </>
            )}
          </button>

          <button
            onClick={() => parseExistingDocument('cmeisa51l0001w4b4d2dfbxia')}
            disabled={isParsing}
            className="w-full bg-white text-primary-600 border border-primary-600 px-4 py-2 rounded-lg hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isParsing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Parsing Document...
              </>
            ) : (
              <>
                <Image className="w-4 h-4 mr-2" />
                Parse Uploaded PDF
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {parsedContent && (
          <div className="mt-6 space-y-4">
            <h4 className="text-md font-medium text-gray-900">Parsing Results</h4>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-medium text-gray-700">Type</p>
                <p className="text-gray-900">{parsedContent.type}</p>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-medium text-gray-700">Word Count</p>
                <p className="text-gray-900">{parsedContent.wordCount}</p>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-medium text-gray-700">Pages</p>
                <p className="text-gray-900">{parsedContent.pages}</p>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-medium text-gray-700">Confidence</p>
                <p className="text-gray-900">{(parsedContent.confidence * 100).toFixed(1)}%</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium text-gray-700 mb-2">Extracted Text (First 500 chars)</p>
              <p className="text-sm text-gray-900 font-mono bg-white p-3 rounded border">
                {parsedContent.text.substring(0, 500)}
                {parsedContent.text.length > 500 && '...'}
              </p>
            </div>

            {parsedContent.ocrDetails && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="font-medium text-blue-700 mb-2">OCR Details</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p><span className="font-medium">Total Words:</span> {parsedContent.ocrDetails.totalWords}</p>
                  <p><span className="font-medium">High Confidence:</span> {parsedContent.ocrDetails.highConfidenceWords}</p>
                  <p><span className="font-medium">Medium Confidence:</span> {parsedContent.ocrDetails.mediumConfidenceWords}</p>
                  <p><span className="font-medium">Low Confidence:</span> {parsedContent.ocrDetails.lowConfidenceWords}</p>
                </div>
              </div>
            )}

            {parsedContent.metadata && (
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="font-medium text-green-700 mb-2">Metadata</p>
                <pre className="text-xs text-green-900 bg-white p-3 rounded border overflow-auto">
                  {JSON.stringify(parsedContent.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
