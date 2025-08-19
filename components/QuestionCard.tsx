'use client'

import { useState } from 'react'
import { BookOpen, CheckCircle, XCircle } from 'lucide-react'

interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  subject: string
  difficulty: 'easy' | 'medium' | 'hard'
}

interface QuestionCardProps {
  question: Question
  onAnswer: (selectedAnswer: number) => void
  questionNumber: number
  totalQuestions: number
}

export default function QuestionCard({ question, onAnswer, questionNumber, totalQuestions }: QuestionCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)

  const handleOptionClick = (optionIndex: number) => {
    if (selectedAnswer !== null) return // Prevent multiple selections
    
    setSelectedAnswer(optionIndex)
    setShowExplanation(true)
    
    // Auto-advance after showing explanation
    setTimeout(() => {
      onAnswer(optionIndex)
      setSelectedAnswer(null)
      setShowExplanation(false)
    }, 2000)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'hard':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getOptionStyle = (optionIndex: number) => {
    if (selectedAnswer === null) {
      return 'hover:bg-gray-50 cursor-pointer'
    }

    if (optionIndex === question.correctAnswer) {
      return 'bg-green-100 border-green-300 cursor-default'
    }

    if (optionIndex === selectedAnswer && optionIndex !== question.correctAnswer) {
      return 'bg-red-100 border-red-300 cursor-default'
    }

    return 'bg-gray-50 cursor-default'
  }

  const getOptionIcon = (optionIndex: number) => {
    if (selectedAnswer === null) return null

    if (optionIndex === question.correctAnswer) {
      return <CheckCircle className="w-5 h-5 text-green-600" />
    }

    if (optionIndex === selectedAnswer && optionIndex !== question.correctAnswer) {
      return <XCircle className="w-5 h-5 text-red-600" />
    }

    return null
  }

  return (
    <div className="card p-6">
      {/* Question Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-primary-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Question {questionNumber} of {totalQuestions}</p>
            <p className="text-sm font-medium text-gray-900">{question.subject}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
          {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
        </span>
      </div>

      {/* Question Text */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 leading-relaxed">
          {question.question}
        </h3>
      </div>

      {/* Answer Options */}
      <div className="space-y-3 mb-6">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleOptionClick(index)}
            disabled={selectedAnswer !== null}
            className={`w-full p-4 text-left border-2 rounded-lg transition-all duration-200 ${getOptionStyle(index)}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-gray-900">{option}</span>
              {getOptionIcon(index)}
            </div>
          </button>
        ))}
      </div>

      {/* Explanation */}
      {showExplanation && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Explanation:</h4>
          <p className="text-sm text-blue-800">{question.explanation}</p>
        </div>
      )}

      {/* Progress Indicator */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Question {questionNumber} of {totalQuestions}</span>
          <span>{Math.round((questionNumber / totalQuestions) * 100)}% Complete</span>
        </div>
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  )
}
