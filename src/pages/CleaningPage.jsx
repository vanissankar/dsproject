import { FiShield, FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi'

const zones = [
  { name: 'Zone A - Poultry House', status: 'Completed', icon: FiCheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { name: 'Zone B - Feed Storage', status: 'In Progress', icon: FiClock, color: 'text-amber-600', bg: 'bg-amber-50' },
  { name: 'Zone C - Milking Parlor', status: 'Pending', icon: FiXCircle, color: 'text-gray-400', bg: 'bg-gray-50' },
  { name: 'Zone D - Quarantine', status: 'Completed', icon: FiCheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
]

function CleaningPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Cleaning Operations</h1>
        <p className="text-sm text-gray-500 mt-1">Monitor and manage cleaning schedules</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {zones.map((zone) => (
          <div key={zone.name} className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className={`${zone.bg} p-2.5 rounded-lg mt-0.5`}>
                  <zone.icon className={`${zone.color} text-lg`} />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-800">{zone.name}</h3>
                  <p className="text-xs text-gray-400 mt-1">Last cleaned: 12 hours ago</p>
                </div>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                zone.status === 'Completed' ? 'text-emerald-600 bg-emerald-50' :
                zone.status === 'In Progress' ? 'text-amber-600 bg-amber-50' :
                'text-gray-500 bg-gray-50'
              }`}>
                {zone.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Cleaning Checklist</h2>
        <div className="space-y-2">
          {['Disinfect surfaces', 'Sanitize equipment', 'Wash floors', 'Replace bedding', 'Check ventilation'].map((item) => (
            <label key={item} className="flex items-center gap-3 py-1.5">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
              <span className="text-sm text-gray-700">{item}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CleaningPage
