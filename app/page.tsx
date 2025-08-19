'use client'

import Link from 'next/link'
import { useUser } from '@/contexts/UserContext'
import { 
  BookOpen, 
  TrendingUp, 
  Upload, 
  BarChart3, 
  Play,
  Sparkles,
  ArrowRight,
  CheckCircle
} from 'lucide-react'

export default function Home() {
  const { user, isAuthenticated, demoLogin } = useUser()

  if (isAuthenticated) {
    return (
      <div className="min-h-screen gradient-bg">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              Welcome back, {user?.firstName}!
            </div>
            <h1 className="text-6xl font-bold text-gradient mb-6">
              Ready to Study?
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Continue your learning journey with personalized practice questions and progress tracking.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard" className="btn-primary inline-flex items-center">
                <Play className="w-5 h-5 mr-2" />
                Go to Dashboard
              </Link>
              <Link href="/practice" className="btn-outline inline-flex items-center">
                Start Practice
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-bg overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-bounce-gentle"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-bounce-gentle" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gradient">ExamPrep</span>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/login" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="btn-primary">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm border border-white/20 rounded-full text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4 mr-2 text-primary-600" />
            AI-Powered Learning Platform
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold text-gradient mb-8 leading-tight">
            Master Your Exams
            <br />
            <span className="text-gray-900">With Confidence</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Transform your study experience with our comprehensive exam preparation platform. 
            Practice with intelligent questions, track your progress, and achieve your academic goals.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button onClick={demoLogin} className="btn-primary inline-flex items-center text-lg px-8 py-4">
              <Play className="w-6 h-6 mr-2" />
              Try Demo
            </button>
            <Link href="/register" className="btn-secondary inline-flex items-center text-lg px-8 py-4">
              Create Account
              <ArrowRight className="w-6 h-6 ml-2" />
            </Link>
          </div>

          {/* Demo User Info */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 max-w-md mx-auto">
            <div className="flex items-center justify-center space-x-3 mb-3">
              <img 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face" 
                alt="Demo User" 
                className="w-10 h-10 rounded-full"
              />
              <div className="text-left">
                <p className="font-semibold text-gray-900">Alex Chen</p>
                <p className="text-sm text-gray-600">Demo Student</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 text-center">
              Experience the full platform with pre-loaded data and sample content
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 container mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="card card-hover p-8 text-center group">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <BookOpen className="w-10 h-10 text-primary-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Smart Practice</h3>
            <p className="text-gray-600 leading-relaxed">
              Access thousands of practice questions with AI-powered difficulty adjustment and personalized learning paths.
            </p>
          </div>
          
          <div className="card card-hover p-8 text-center group">
            <div className="w-20 h-20 bg-gradient-to-br from-success-100 to-success-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="w-10 h-10 text-success-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Progress Tracking</h3>
            <p className="text-gray-600 leading-relaxed">
              Monitor your performance with detailed analytics, progress charts, and insights to identify areas for improvement.
            </p>
          </div>
          
          <div className="card card-hover p-8 text-center group">
            <div className="w-20 h-20 bg-gradient-to-br from-warning-100 to-warning-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <Upload className="w-10 h-10 text-warning-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Study Materials</h3>
            <p className="text-gray-600 leading-relaxed">
              Upload and organize your study materials, notes, and resources in one centralized location.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-20 grid md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600 mb-2">10K+</div>
            <div className="text-gray-600">Practice Questions</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-success-600 mb-2">95%</div>
            <div className="text-gray-600">Success Rate</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-warning-600 mb-2">50+</div>
            <div className="text-gray-600">Subjects</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-error-600 mb-2">24/7</div>
            <div className="text-gray-600">Available</div>
          </div>
        </div>
      </div>
    </div>
  )
}
