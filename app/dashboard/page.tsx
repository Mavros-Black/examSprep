'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@/contexts/UserContext'
import { 
  BookOpen, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  Calendar,
  Target,
  Trophy,
  Zap,
  Star,
  TrendingDown
} from 'lucide-react'

interface DashboardStats {
  totalQuestions: number
  questionsAnswered: number
  accuracy: number
  studyTime: number
  upcomingExams: number
  targetScore: number
  streak: number
  rank: string
}

interface RecentActivity {
  id: string
  type: string
  subject: string
  score?: number
  timestamp: string
  improvement?: number
}

export default function DashboardPage() {
  const { user } = useUser()
  const [stats, setStats] = useState<DashboardStats>({
    totalQuestions: 0,
    questionsAnswered: 0,
    accuracy: 0,
    studyTime: 0,
    upcomingExams: 0,
    targetScore: 0,
    streak: 0,
    rank: ''
  })

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])

  useEffect(() => {
    // Enhanced mock data with demo user specifics
    if (user?.isDemo) {
      setStats({
        totalQuestions: 2500,
        questionsAnswered: 1847,
        accuracy: 82,
        studyTime: 67,
        upcomingExams: 2,
        targetScore: 90,
        streak: 12,
        rank: 'Gold'
      })

      setRecentActivity([
        {
          id: '1',
          type: 'Advanced Practice',
          subject: 'Mathematics',
          score: 89,
          timestamp: '2 hours ago',
          improvement: 7
        },
        {
          id: '2',
          type: 'Mock Exam',
          subject: 'Physics',
          score: 91,
          timestamp: '1 day ago',
          improvement: 12
        },
        {
          id: '3',
          type: 'Quick Quiz',
          subject: 'Chemistry',
          score: 94,
          timestamp: '3 days ago',
          improvement: 5
        },
        {
          id: '4',
          type: 'Practice Test',
          subject: 'Biology',
          score: 87,
          timestamp: '1 week ago',
          improvement: 3
        }
      ])
    } else {
      setStats({
        totalQuestions: 1250,
        questionsAnswered: 847,
        accuracy: 78,
        studyTime: 42,
        upcomingExams: 3,
        targetScore: 85,
        streak: 5,
        rank: 'Silver'
      })

      setRecentActivity([
        {
          id: '1',
          type: 'Practice Test',
          subject: 'Mathematics',
          score: 82,
          timestamp: '2 hours ago',
          improvement: 3
        },
        {
          id: '2',
          type: 'Question Set',
          subject: 'Physics',
          score: 75,
          timestamp: '1 day ago',
          improvement: -2
        },
        {
          id: '3',
          type: 'Mock Exam',
          subject: 'Chemistry',
          score: 88,
          timestamp: '3 days ago',
          improvement: 8
        }
      ])
    }
  }, [user])

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-3xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Welcome back, {user?.firstName}! 👋
            </h1>
            <p className="text-primary-100 text-lg">
              {user?.isDemo ? 'Demo Mode - Explore the full platform experience' : 'Ready to continue your learning journey?'}
            </p>
          </div>
          {user?.isDemo && (
            <div className="hidden md:flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              <Star className="w-5 h-5 text-yellow-300" />
              <span className="font-medium">Demo User</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{stats.totalQuestions.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Questions</div>
            </div>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(stats.questionsAnswered / stats.totalQuestions) * 100}%` }}></div>
          </div>
        </div>

        <div className="stat-card group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-success-100 to-success-200 rounded-2xl">
              <CheckCircle className="w-6 h-6 text-success-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{stats.accuracy}%</div>
              <div className="text-sm text-gray-600">Accuracy</div>
            </div>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${stats.accuracy}%` }}></div>
          </div>
        </div>

        <div className="stat-card group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-warning-100 to-warning-200 rounded-2xl">
              <Clock className="w-6 h-6 text-warning-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{stats.studyTime}h</div>
              <div className="text-sm text-gray-600">Study Time</div>
            </div>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(stats.studyTime / 100) * 100}%` }}></div>
          </div>
        </div>

        <div className="stat-card group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl">
              <Trophy className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{stats.rank}</div>
              <div className="text-sm text-gray-600">Current Rank</div>
            </div>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${stats.rank === 'Gold' ? 90 : stats.rank === 'Silver' ? 70 : 50}%` }}></div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stat-card">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl">
              <Zap className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.streak}</div>
              <div className="text-sm text-gray-600">Day Streak</div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-error-100 to-error-200 rounded-2xl">
              <Calendar className="w-6 h-6 text-error-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.upcomingExams}</div>
              <div className="text-sm text-gray-600">Upcoming Exams</div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-2xl">
              <Target className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.targetScore}%</div>
              <div className="text-sm text-gray-600">Target Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
          <button className="btn-outline text-sm px-4 py-2">
            View All
          </button>
        </div>
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl hover:shadow-soft transition-all duration-300">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">{activity.type}</p>
                  <p className="text-gray-600">{activity.subject}</p>
                </div>
              </div>
              <div className="text-right">
                {activity.score && (
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="text-xl font-bold text-gray-900">{activity.score}%</p>
                    {activity.improvement && (
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                        activity.improvement > 0 
                          ? 'bg-success-100 text-success-700' 
                          : 'bg-error-100 text-error-700'
                      }`}>
                        {activity.improvement > 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        <span>{Math.abs(activity.improvement)}%</span>
                      </div>
                    )}
                  </div>
                )}
                <p className="text-sm text-gray-500">{activity.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
