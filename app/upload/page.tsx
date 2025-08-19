import DashboardLayout from '@/components/DashboardLayout'
import UploadDropzone from '@/components/UploadDropzone'
import { Upload, FileText, Image, Zap } from 'lucide-react'

export default function UploadPage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center">
              <Upload className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Upload Documents</h1>
              <p className="text-gray-600">Upload PDFs and images for OCR processing and text extraction</p>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-soft">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">PDF Processing</h3>
            <p className="text-sm text-gray-600">
              Extract text from PDFs with embedded text or scanned documents
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-soft">
            <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center mb-4">
              <Image className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">OCR Technology</h3>
            <p className="text-sm text-gray-600">
              Advanced OCR for images and scanned documents with high accuracy
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-soft">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Processing</h3>
            <p className="text-sm text-gray-600">
              Automatic text chunking, tagging, and metadata extraction
            </p>
          </div>
        </div>

        {/* Upload Zone */}
        <UploadDropzone />

        {/* Processing Information */}
        <div className="mt-8 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-semibold">
                1
              </div>
              <p className="text-sm text-gray-700">Upload File</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-semibold">
                2
              </div>
              <p className="text-sm text-gray-700">OCR Processing</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-semibold">
                3
              </div>
              <p className="text-sm text-gray-700">Text Chunking</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-semibold">
                4
              </div>
              <p className="text-sm text-gray-700">Ready for Practice</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
