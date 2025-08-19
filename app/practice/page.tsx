'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@/contexts/UserContext'
import QuestionCard from '@/components/QuestionCard'
import { demoQuestions } from '@/data/demoData'
import { 
  BookOpen, 
  Target, 
  Trophy, 
  RefreshCw,
  BarChart3,
  Clock
} from 'lucide-react'

interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  subject: string
  difficulty: 'easy' | 'medium' | 'hard'
}

export default function PracticePage() {
  const { user } = useUser()
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [endTime, setEndTime] = useState<Date | null>(null)

  useEffect(() => {
    // Use demo questions for enhanced experience
    setQuestions(demoQuestions)
    setStartTime(new Date())
  }, [])

  const handleAnswer = (selectedAnswer: number) => {
    if (questions[currentQuestionIndex].correctAnswer === selectedAnswer) {
      setScore(score + 1)
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      setEndTime(new Date())
      setShowResults(true)
    }
  }

  const getTimeElapsed = () => {
    if (!startTime || !endTime) return 0
    return Math.round((endTime.getTime() - startTime.getTime()) / 1000)
  }

  const getAccuracy = () => {
    return Math.round((score / questions.length) * 100)
  }

  const getPerformanceMessage = () => {
    const accuracy = getAccuracy()
    if (accuracy >= 90) return 'Outstanding! You\'re a master of this material! 🎉'
    if (accuracy >= 80) return 'Excellent work! You have a strong understanding! 🌟'
    if (accuracy >= 70) return 'Good job! Keep practicing to improve further! 👍'
    if (accuracy >= 60) return 'Not bad! Review the explanations and try again! 📚'
    return 'Keep studying! Practice makes perfect! 💪'
  }

  const resetQuiz = () => {
    setCurrentQuestionIndex(0)
    setScore(0)
    setShowResults(false)
    setStartTime(new Date())
    setEndTime(null)
  }

  if (questions.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading questions...</p>
        </div>
      </div>
    )
  }

  if (showResults) {
    return (
      <div className="space-y-8">
        {/* Results Header */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-6">
            <Trophy className="w-4 h-4" />
            <span>Quiz Complete!</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Great Job!</h1>
          <p className="text-lg text-gray-600">Here's how you performed</p>
        </div>

        {/* Results Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="stat-card text-center">
            <div className="p-4 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl mb-4 mx-auto w-20 h-20 flex items-center justify-center">
              <Target className="w-10 h-10 text-primary-600" />
            </div>
            <div className="text-4xl font-bold text-primary-600 mb-2">{getAccuracy()}%</div>
            <div className="text-gray-600">Accuracy</div>
          </div>

          <div className="stat-card text-center">
            <div className="p-4 bg-gradient-to-br from-success-100 to-success-200 rounded-2xl mb-4 mx-auto w-20 h-20 flex items-center justify-center">
              <BarChart3 className="w-10 h-10 text-success-600" />
            </div>
            <div className="text-4xl font-bold text-success-600 mb-2">{score}/{questions.length}</div>
            <div className="text-gray-600">Correct Answers</div>
          </div>

          <div className="stat-card text-center">
            <div className="p-4 bg-gradient-to-br from-warning-100 to-warning-200 rounded-2xl mb-4 mx-auto w-20 h-20 flex items-center justify-center">
              <Clock className="w-10 h-10 text-warning-600" />
            </div>
            <div className="text-4xl font-bold text-warning-600 mb-2">{getTimeElapsed()}s</div>
            <div className="text-gray-600">Time Taken</div>
          </div>
        </div>

        {/* Performance Message */}
        <div className="card p-8 text-center max-w-2xl mx-auto">
          <p className="text-xl text-gray-700 mb-6">{getPerformanceMessage()}</p>
          
          {user?.isDemo && (
            <div className="bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-primary-700">
                <strong>Demo Mode:</strong> This is sample data. In a real application, your results would be saved and tracked over time.
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={resetQuiz}
              className="btn-primary inline-flex items-center"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Try Again
            </button>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="btn-outline inline-flex items-center"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4">
          <BookOpen className="w-4 h-4" />
          <span>Practice Mode</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Practice Questions</h1>
        <p className="text-lg text-gray-600">Test your knowledge across multiple subjects</p>
      </div>

      {/* Progress Section */}
      <div className="max-w-4xl mx-auto">
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Question {currentQuestionIndex + 1} of {questions.length}
              </h2>
              <p className="text-gray-600">Keep going! You're doing great!</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary-600">
                {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%
              </div>
              <div className="text-sm text-gray-500">Complete</div>
            </div>
          </div>
          
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <QuestionCard
          question={questions[currentQuestionIndex]}
          onAnswer={handleAnswer}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={questions.length}
        />
      </div>

      {/* Demo Mode Info */}
      {user?.isDemo && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">Demo Mode Active</h3>
                <p className="text-sm text-blue-700">
                  You're experiencing the full platform with sample questions. In a real application, 
                  questions would be personalized based on your study history and performance.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
