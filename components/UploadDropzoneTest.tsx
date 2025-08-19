'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, Image, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  status: 'uploading' | 'processing' | 'completed' | 'failed'
  progress: number
  error?: string
  response?: any
}

export default function UploadDropzoneTest() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsUploading(true)

    for (const file of acceptedFiles) {
      const fileId = `${Date.now()}-${file.name}`
      
      // Add file to list with initial status
      setUploadedFiles(prev => [...prev, {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'uploading',
        progress: 0
      }])

      try {
        // Simulate upload progress
        for (let i = 0; i <= 50; i += 10) {
          await new Promise(resolve => setTimeout(resolve, 200))
          setUploadedFiles(prev => 
            prev.map(f => 
              f.id === fileId 
                ? { ...f, progress: i }
                : f
            )
          )
        }

        // Update status to processing
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === fileId 
              ? { ...f, status: 'processing', progress: 50 }
              : f
          )
        )

        // Test the API endpoint
        const formData = new FormData()
        formData.append('file', file)
        
        console.log('Sending file to test endpoint:', file.name)
        
        const response = await fetch('/api/upload/test', {
          method: 'POST',
          body: formData
        })

        console.log('Response status:', response.status)
        console.log('Response headers:', Object.fromEntries(response.headers.entries()))

        if (!response.ok) {
          const errorText = await response.text()
          console.error('Response error:', errorText)
          throw new Error(`HTTP ${response.status}: ${errorText}`)
        }

        const result = await response.json()
        console.log('Response data:', result)

        // Update file status to completed
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === fileId 
              ? { 
                  ...f, 
                  status: 'completed', 
                  progress: 100,
                  response: result
                }
              : f
          )
        )

      } catch (error) {
        console.error('Upload error:', error)
        
        // Update file status to failed
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === fileId 
              ? { 
                  ...f, 
                  status: 'failed', 
                  progress: 0,
                  error: error instanceof Error ? error.message : 'Upload failed'
                }
              : f
          )
        )
      }
    }

    setIsUploading(false)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true
  })

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
        return <Loader2 className="w-4 h-4 animate-spin" />
      case 'processing':
        return <Loader2 className="w-4 h-4 animate-spin" />
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 cursor-pointer hover:border-primary-400 hover:bg-primary-50 ${
          isDragActive 
            ? 'border-primary-500 bg-primary-100' 
            : 'border-gray-300 bg-white'
        }`}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center">
              <Upload className="w-8 h-8 text-primary-600" />
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {isDragActive ? 'Drop files here' : 'Test Upload (Debug Mode)'}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Testing API endpoint without authentication
            </p>
          </div>

          <div className="text-xs text-gray-400 space-y-1">
            <p>Supported formats: PDF, JPEG, PNG</p>
            <p>Maximum file size: 10MB</p>
            <p className="text-blue-600 font-medium">🔧 Test Mode - Check console for debug info</p>
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Upload Progress (Test)</h3>
          
          <div className="space-y-3">
            {uploadedFiles.map((file) => (
              <div key={file.id} className="bg-white rounded-xl p-4 border border-gray-200 shadow-soft">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                      {file.type === 'application/pdf' ? (
                        <FileText className="w-5 h-5 text-red-500" />
                      ) : (
                        <Image className="w-5 h-5 text-blue-500" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </p>
                        {getStatusIcon(file.status)}
                      </div>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)} • {file.status}
                      </p>
                      {file.error && (
                        <p className="text-xs text-red-500 mt-1">{file.error}</p>
                      )}
                      {file.response && (
                        <p className="text-xs text-green-500 mt-1">✓ {file.response.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Progress Bar */}
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          file.status === 'completed' 
                            ? 'bg-green-500' 
                            : file.status === 'failed'
                            ? 'bg-red-500'
                            : 'bg-primary-500'
                        }`}
                        style={{ width: `${file.progress}%` }}
                      />
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFile(file.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Processing Status */}
                {file.status === 'processing' && (
                  <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin text-yellow-600" />
                      <p className="text-sm text-yellow-700">
                        Testing API endpoint...
                      </p>
                    </div>
                  </div>
                )}

                {/* Success Status */}
                {file.status === 'completed' && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <p className="text-sm text-green-700">
                          Test successful! Check console for details.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Status */}
                {file.status === 'failed' && (
                  <div className="mt-3 p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <p className="text-sm text-red-700">
                        {file.error || 'Test failed'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Debug Info */}
      <div className="bg-blue-50 rounded-xl p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Debug Information</h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• This test bypasses authentication to isolate the issue</li>
          <li>• Check browser console for detailed API response logs</li>
          <li>• If this works, the issue is with authentication</li>
          <li>• If this fails, there's a routing or environment issue</li>
        </ul>
      </div>
    </div>
  )
}
