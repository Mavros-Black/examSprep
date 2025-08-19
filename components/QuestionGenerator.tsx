'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { FileText, Image, Loader2, Brain, Settings, CheckCircle, AlertCircle } from 'lucide-react'

interface ProcessingResult {
  document: {
    id: string
    title: string
    sections: number
    questions: number
    wordCount: number
  }
  questions: any[]
  summary: {
    totalSections: number
    totalQuestions: number
    questionsPerSection: number
    processingTime: string
  }
}

export default function QuestionGenerator() {
  const { user } = useAuth()
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<ProcessingResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Configuration state
  const [config, setConfig] = useState({
    totalQuestions: 50,
    subject: 'General',
    difficulty: 'medium',
    documentId: 'cmeiywjs30001w4h05w9x2g61' // Latest uploaded PDF
  })

  const processFileWithQuestions = async () => {
    if (!user) {
      alert('Please log in to generate questions')
      return
    }

    setIsProcessing(true)
    setError(null)
    setResult(null)

    try {
      console.log('=== STARTING QUESTION GENERATION ===')
      console.log('Configuration:', config)

      const formData = new FormData()
      formData.append('documentId', config.documentId)
      formData.append('totalQuestions', config.totalQuestions.toString())
      formData.append('subject', config.subject)
      formData.append('difficulty', config.difficulty)

      const response = await fetch('/api/upload/process-with-questions-simple', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Processing failed')
      }

      const data = await response.json()
      console.log('=== PROCESSING COMPLETED ===')
      console.log('Result:', data)

      setResult(data)

    } catch (error) {
      console.error('Processing error:', error)
      setError(error instanceof Error ? error.message : 'Processing failed')
    } finally {
      setIsProcessing(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'hard': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'MULTIPLE_CHOICE': return '📝'
      case 'TRUE_FALSE': return '✅'
      case 'SHORT_ANSWER': return '✏️'
      case 'ESSAY': return '📄'
      default: return '❓'
    }
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-soft">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
            <Brain className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">AI Question Generator</h3>
            <p className="text-gray-600">Extract text and generate questions from your uploaded files</p>
          </div>
        </div>

        {/* Configuration Panel */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <Settings className="w-5 h-5 text-gray-600" />
            <h4 className="font-medium text-gray-900">Configuration</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Questions
              </label>
              <input
                type="number"
                min="10"
                max="200"
                value={config.totalQuestions}
                onChange={(e) => setConfig(prev => ({ ...prev, totalQuestions: parseInt(e.target.value) || 50 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <select
                value={config.subject}
                onChange={(e) => setConfig(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="General">General</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Science">Science</option>
                <option value="English">English</option>
                <option value="History">History</option>
                <option value="Geography">Geography</option>
                <option value="Biology">Biology</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Physics">Physics</option>
                <option value="Computer Science">Computer Science</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty
              </label>
              <select
                value={config.difficulty}
                onChange={(e) => setConfig(prev => ({ ...prev, difficulty: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Document ID
              </label>
              <input
                type="text"
                value={config.documentId}
                onChange={(e) => setConfig(prev => ({ ...prev, documentId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Document ID"
              />
            </div>
          </div>
        </div>

        {/* Process Button */}
        <button
          onClick={processFileWithQuestions}
          disabled={isProcessing}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-medium"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Processing File & Generating Questions...</span>
            </>
          ) : (
            <>
              <Brain className="w-5 h-5" />
              <span>Generate AI Questions</span>
            </>
          )}
        </button>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Results Display */}
        {result && (
          <div className="mt-6 space-y-6">
            {/* Summary Card */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
              <div className="flex items-center space-x-3 mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <h4 className="text-lg font-semibold text-gray-900">Processing Complete!</h4>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{result.document.sections}</div>
                  <div className="text-sm text-gray-600">Sections</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{result.summary.totalQuestions}</div>
                  <div className="text-sm text-gray-600">Questions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{result.summary.questionsPerSection}</div>
                  <div className="text-sm text-gray-600">Per Section</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{result.document.wordCount}</div>
                  <div className="text-sm text-gray-600">Words</div>
                </div>
              </div>
            </div>

            {/* Document Info */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h5 className="font-medium text-gray-900 mb-2">Document Information</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Title:</span>
                  <p className="text-gray-900">{result.document.title}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Document ID:</span>
                  <p className="text-gray-900 font-mono text-xs">{result.document.id}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Processing Time:</span>
                  <p className="text-gray-900">{new Date(result.summary.processingTime).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Sample Questions */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h5 className="font-medium text-gray-900 mb-4">Sample Questions (First 5)</h5>
              <div className="space-y-4">
                {result.questions.slice(0, 5).map((question, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getQuestionTypeIcon(question.type)}</span>
                        <span className="text-xs font-medium text-gray-500 uppercase">{question.type.replace('_', ' ')}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                        {question.difficulty}
                      </span>
                    </div>
                    
                    <p className="text-gray-900 mb-3 font-medium">{question.text}</p>
                    
                    {question.options && question.options.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Options:</p>
                        <div className="space-y-1">
                          {question.options.map((option: string, optIndex: number) => (
                            <div key={optIndex} className="text-sm text-gray-600">
                              {String.fromCharCode(65 + optIndex)}. {option}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Correct Answer:</span>
                        <p className="text-green-700">{question.correctAnswer}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Points:</span>
                        <p className="text-gray-900">{question.points}</p>
                      </div>
                    </div>
                    
                    {question.explanation && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-700 mb-1">Explanation:</p>
                        <p className="text-sm text-blue-800">{question.explanation}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {result.questions.length > 5 && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">
                    Showing 5 of {result.questions.length} questions. 
                    All questions have been saved to the database and are available in the practice section.
                  </p>
                </div>
              )}
            </div>
          </div>
                 )}
       </div>
   )
 } 