'use client'

import { useState } from 'react'
import { User, Bell, Shield, Palette, BookOpen, Save } from 'lucide-react'

interface SettingsData {
  profile: {
    firstName: string
    lastName: string
    email: string
    bio: string
  }
  notifications: {
    emailNotifications: boolean
    pushNotifications: boolean
    weeklyReports: boolean
    practiceReminders: boolean
  }
  study: {
    dailyGoal: number
    preferredSubjects: string[]
    difficultyLevel: 'easy' | 'medium' | 'hard'
    autoAdvance: boolean
  }
  appearance: {
    theme: 'light' | 'dark' | 'auto'
    fontSize: 'small' | 'medium' | 'large'
    compactMode: boolean
  }
}

export default function SettingsForm() {
  const [settings, setSettings] = useState<SettingsData>({
    profile: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      bio: 'Passionate student preparing for exams'
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      weeklyReports: true,
      practiceReminders: false
    },
    study: {
      dailyGoal: 20,
      preferredSubjects: ['Mathematics', 'Physics'],
      difficultyLevel: 'medium',
      autoAdvance: true
    },
    appearance: {
      theme: 'light',
      fontSize: 'medium',
      compactMode: false
    }
  })

  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')

  const handleProfileChange = (field: keyof typeof settings.profile, value: string) => {
    setSettings(prev => ({
      ...prev,
      profile: { ...prev.profile, [field]: value }
    }))
  }

  const handleNotificationChange = (field: keyof typeof settings.notifications, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [field]: value }
    }))
  }

  const handleStudyChange = (field: keyof typeof settings.study, value: any) => {
    setSettings(prev => ({
      ...prev,
      study: { ...prev.study, [field]: value }
    }))
  }

  const handleAppearanceChange = (field: keyof typeof settings.appearance, value: any) => {
    setSettings(prev => ({
      ...prev,
      appearance: { ...prev.appearance, [field]: value }
    }))
  }

  const handleSubjectToggle = (subject: string) => {
    const currentSubjects = settings.study.preferredSubjects
    const newSubjects = currentSubjects.includes(subject)
      ? currentSubjects.filter(s => s !== subject)
      : [...currentSubjects, subject]
    
    handleStudyChange('preferredSubjects', newSubjects)
  }

  const saveSettings = async () => {
    setIsSaving(true)
    
    try {
      // Mock API call - replace with actual save logic
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Settings saved:', settings)
    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'study', name: 'Study Preferences', icon: BookOpen },
    { id: 'appearance', name: 'Appearance', icon: Palette }
  ]

  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History']

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input
                type="text"
                value={settings.profile.firstName}
                onChange={(e) => handleProfileChange('firstName', e.target.value)}
                className="input-field mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input
                type="text"
                value={settings.profile.lastName}
                onChange={(e) => handleProfileChange('lastName', e.target.value)}
                className="input-field mt-1"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={settings.profile.email}
              onChange={(e) => handleProfileChange('email', e.target.value)}
              className="input-field mt-1"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Bio</label>
            <textarea
              value={settings.profile.bio}
              onChange={(e) => handleProfileChange('bio', e.target.value)}
              rows={3}
              className="input-field mt-1"
            />
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
              <p className="text-sm text-gray-500">Receive notifications via email</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.emailNotifications}
              onChange={(e) => handleNotificationChange('emailNotifications', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Push Notifications</h3>
              <p className="text-sm text-gray-500">Receive push notifications in the app</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.pushNotifications}
              onChange={(e) => handleNotificationChange('pushNotifications', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Weekly Reports</h3>
              <p className="text-sm text-gray-500">Get weekly progress summaries</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.weeklyReports}
              onChange={(e) => handleNotificationChange('weeklyReports', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Practice Reminders</h3>
              <p className="text-sm text-gray-500">Daily reminders to practice</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.practiceReminders}
              onChange={(e) => handleNotificationChange('practiceReminders', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
          </div>
        </div>
      )}

      {/* Study Preferences Tab */}
      {activeTab === 'study' && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Daily Goal (questions)</label>
            <input
              type="number"
              min="1"
              max="100"
              value={settings.study.dailyGoal}
              onChange={(e) => handleStudyChange('dailyGoal', parseInt(e.target.value))}
              className="input-field mt-1 w-32"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Preferred Subjects</label>
            <div className="grid grid-cols-2 gap-3">
              {subjects.map((subject) => (
                <label key={subject} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.study.preferredSubjects.includes(subject)}
                    onChange={() => handleSubjectToggle(subject)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{subject}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Difficulty Level</label>
            <select
              value={settings.study.difficultyLevel}
              onChange={(e) => handleStudyChange('difficultyLevel', e.target.value)}
              className="input-field mt-1 w-48"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Auto-advance Questions</h3>
              <p className="text-sm text-gray-500">Automatically move to next question after answering</p>
            </div>
            <input
              type="checkbox"
              checked={settings.study.autoAdvance}
              onChange={(e) => handleStudyChange('autoAdvance', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
          </div>
        </div>
      )}

      {/* Appearance Tab */}
      {activeTab === 'appearance' && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Theme</label>
            <select
              value={settings.appearance.theme}
              onChange={(e) => handleAppearanceChange('theme', e.target.value)}
              className="input-field mt-1 w-48"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto (System)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Font Size</label>
            <select
              value={settings.appearance.fontSize}
              onChange={(e) => handleAppearanceChange('fontSize', e.target.value)}
              className="input-field mt-1 w-48"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Compact Mode</h3>
              <p className="text-sm text-gray-500">Use more compact spacing throughout the app</p>
            </div>
            <input
              type="checkbox"
              checked={settings.appearance.compactMode}
              onChange={(e) => handleAppearanceChange('compactMode', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="pt-6 border-t border-gray-200">
        <button
          onClick={saveSettings}
          disabled={isSaving}
          className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>
    </div>
  )
}
