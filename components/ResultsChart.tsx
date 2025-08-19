'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Target, Calendar } from 'lucide-react'

interface PerformanceData {
  subject: string
  score: number
  questionsAnswered: number
  accuracy: number
  trend: 'up' | 'down' | 'stable'
}

interface WeeklyProgress {
  week: string
  score: number
  questions: number
}

export default function ResultsChart() {
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([])
  const [weeklyProgress, setWeeklyProgress] = useState<WeeklyProgress[]>([])
  const [selectedSubject, setSelectedSubject] = useState<string>('all')

  useEffect(() => {
    // Mock data - replace with actual API calls
    setPerformanceData([
      {
        subject: 'Mathematics',
        score: 85,
        questionsAnswered: 245,
        accuracy: 78,
        trend: 'up'
      },
      {
        subject: 'Physics',
        score: 72,
        questionsAnswered: 189,
        accuracy: 65,
        trend: 'down'
      },
      {
        subject: 'Chemistry',
        score: 91,
        questionsAnswered: 156,
        accuracy: 88,
        trend: 'up'
      },
      {
        subject: 'Biology',
        score: 68,
        questionsAnswered: 203,
        accuracy: 62,
        trend: 'stable'
      }
    ])

    setWeeklyProgress([
      { week: 'Week 1', score: 65, questions: 45 },
      { week: 'Week 2', score: 72, questions: 52 },
      { week: 'Week 3', score: 78, questions: 48 },
      { week: 'Week 4', score: 81, questions: 55 },
      { week: 'Week 5', score: 85, questions: 61 },
      { week: 'Week 6', score: 88, questions: 58 },
      { week: 'Week 7', score: 91, questions: 63 }
    ])
  }, [])

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-5 h-5 text-green-600" />
      case 'down':
        return <TrendingDown className="w-5 h-5 text-red-600" />
      default:
        return <Target className="w-5 h-5 text-gray-600" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600'
      case 'down':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 80) return 'text-blue-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const filteredData = selectedSubject === 'all' 
    ? performanceData 
    : performanceData.filter(item => item.subject === selectedSubject)

  const overallScore = Math.round(
    performanceData.reduce((sum, item) => sum + item.score, 0) / performanceData.length
  )

  const totalQuestions = performanceData.reduce((sum, item) => sum + item.questionsAnswered, 0)

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Overall Score</p>
              <p className={`text-2xl font-semibold ${getScoreColor(overallScore)}`}>
                {overallScore}%
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Questions</p>
              <p className="text-2xl font-semibold text-gray-900">
                {totalQuestions.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Best Subject</p>
              <p className="text-2xl font-semibold text-gray-900">
                {performanceData.reduce((best, current) => 
                  current.score > best.score ? current : best
                ).subject}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingDown className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Needs Improvement</p>
              <p className="text-2xl font-semibold text-gray-900">
                {performanceData.reduce((worst, current) => 
                  current.score < worst.score ? current : worst
                ).subject}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Subject Filter */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Subject Performance</h2>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="input-field w-auto"
          >
            <option value="all">All Subjects</option>
            {performanceData.map((subject) => (
              <option key={subject.subject} value={subject.subject}>
                {subject.subject}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-4">
          {filteredData.map((subject) => (
            <div key={subject.subject} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-lg font-semibold text-primary-600">
                    {subject.subject.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{subject.subject}</h3>
                  <p className="text-sm text-gray-500">
                    {subject.questionsAnswered} questions answered
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Accuracy</p>
                  <p className="text-lg font-semibold text-gray-900">{subject.accuracy}%</p>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-gray-500">Score</p>
                  <p className={`text-lg font-semibold ${getScoreColor(subject.score)}`}>
                    {subject.score}%
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  {getTrendIcon(subject.trend)}
                  <span className={`text-sm font-medium ${getTrendColor(subject.trend)}`}>
                    {subject.trend === 'up' ? 'Improving' : 
                     subject.trend === 'down' ? 'Declining' : 'Stable'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Progress Chart */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Weekly Progress</h2>
        
        <div className="space-y-4">
          {weeklyProgress.map((week, index) => (
            <div key={week.week} className="flex items-center space-x-4">
              <div className="w-20 text-sm font-medium text-gray-600">{week.week}</div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">{week.questions} questions</span>
                  <span className="text-sm font-medium text-gray-900">{week.score}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${week.score}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Insights */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Insights</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-green-900 mb-2">Strengths</h3>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Strong performance in Chemistry (91%)</li>
              <li>• Consistent improvement over 7 weeks</li>
              <li>• High accuracy in Mathematics (78%)</li>
            </ul>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-yellow-900 mb-2">Areas for Improvement</h3>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Biology accuracy needs work (62%)</li>
              <li>• Physics performance declining</li>
              <li>• Focus on weak topics</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
