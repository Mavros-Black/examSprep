import DashboardLayout from '@/components/DashboardLayout'
import QuestionGenerator from '@/components/QuestionGenerator'
import { Brain, Zap, BookOpen, Target } from 'lucide-react'

export default function AIGeneratorPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
              <Brain className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">AI Question Generator</h1>
              <p className="text-purple-100">Transform your documents into intelligent practice questions</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Zap className="w-6 h-6 text-yellow-300" />
                <div>
                  <h3 className="font-semibold">Smart Extraction</h3>
                  <p className="text-sm text-purple-100">Automatically extract text from PDFs and images</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Target className="w-6 h-6 text-green-300" />
                <div>
                  <h3 className="font-semibold">Customizable</h3>
                  <p className="text-sm text-purple-100">Choose subject, difficulty, and question count</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <BookOpen className="w-6 h-6 text-blue-300" />
                <div>
                  <h3 className="font-semibold">Multiple Types</h3>
                  <p className="text-sm text-purple-100">Generate MCQs, True/False, Short Answer, and Essays</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Generator Component */}
        <QuestionGenerator />

        {/* How It Works */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-soft">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">How It Works</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Upload Document</h4>
              <p className="text-sm text-gray-600">Upload your PDF or image file to the system</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Configure Settings</h4>
              <p className="text-sm text-gray-600">Set subject, difficulty, and number of questions</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 font-bold">3</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">AI Processing</h4>
              <p className="text-sm text-gray-600">AI extracts content and generates questions</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-orange-600 font-bold">4</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Practice Ready</h4>
              <p className="text-sm text-gray-600">Questions are saved and ready for practice</p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Key Features</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Intelligent Content Analysis</h4>
                  <p className="text-sm text-gray-600">AI analyzes your document and identifies key concepts for question generation</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Section-Based Processing</h4>
                  <p className="text-sm text-gray-600">Content is split into logical sections for targeted question generation</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mt-0.5">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Multiple Question Types</h4>
                  <p className="text-sm text-gray-600">Generate multiple choice, true/false, short answer, and essay questions</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mt-0.5">
                  <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Difficulty Control</h4>
                  <p className="text-sm text-gray-600">Choose from easy, medium, or hard difficulty levels</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mt-0.5">
                  <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Subject-Specific Content</h4>
                  <p className="text-sm text-gray-600">AI generates content relevant to your chosen subject area</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center mt-0.5">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Instant Results</h4>
                  <p className="text-sm text-gray-600">Get your questions immediately with explanations and correct answers</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
