import ResultsChart from '@/components/ResultsChart'

export default function ResultsPage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Results & Analytics</h1>
        <p className="text-gray-600 mt-2">Track your performance and identify areas for improvement.</p>
      </div>

      <div className="max-w-6xl">
        <ResultsChart />
      </div>
    </div>
  )
}
