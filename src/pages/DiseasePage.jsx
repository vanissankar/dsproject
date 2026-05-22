import { FiAlertTriangle, FiActivity, FiThermometer, FiUsers } from 'react-icons/fi'

const alerts = [
  { disease: 'Avian Influenza', location: 'Poultry House A', severity: 'High', date: '2026-05-22' },
  { disease: 'Foot & Mouth', location: 'Cattle Shed B', severity: 'Medium', date: '2026-05-21' },
  { disease: 'Mastitis', location: 'Milking Parlor', severity: 'Low', date: '2026-05-20' },
]

const severityColor = {
  High: 'text-red-600 bg-red-50',
  Medium: 'text-amber-600 bg-amber-50',
  Low: 'text-emerald-600 bg-emerald-50',
}

const metrics = [
  { label: 'Active Outbreaks', value: '2', icon: FiAlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
  { label: 'Under Observation', value: '5', icon: FiActivity, color: 'text-amber-600', bg: 'bg-amber-50' },
  { label: 'Avg Temperature', value: '38.2°C', icon: FiThermometer, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Quarantined', value: '12', icon: FiUsers, color: 'text-purple-600', bg: 'bg-purple-50' },
]

function DiseasePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Disease Monitoring</h1>
        <p className="text-sm text-gray-500 mt-1">Track and manage disease outbreaks</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{m.label}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{m.value}</p>
              </div>
              <div className={`${m.bg} p-3 rounded-lg`}>
                <m.icon className={`${m.color} text-xl`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Active Alerts</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {alerts.map((alert) => (
            <div key={alert.disease} className="px-5 py-4 flex items-center justify-between">
              <div className="flex items-start gap-3">
                <FiAlertTriangle className="text-amber-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-800">{alert.disease}</p>
                  <p className="text-xs text-gray-400">{alert.location} — {alert.date}</p>
                </div>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${severityColor[alert.severity]}`}>
                {alert.severity}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DiseasePage
