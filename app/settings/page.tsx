import SettingsForm from '@/components/SettingsForm'

export default function SettingsPage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account preferences and study settings.</p>
      </div>

      <div className="max-w-2xl">
        <SettingsForm />
      </div>
    </div>
  )
}
