import { useState } from 'react'
import { FiUsers, FiShield, FiAlertTriangle, FiCamera } from 'react-icons/fi'
import WorkerForm from '../components/WorkerForm'
import WorkerList from '../components/WorkerList'
import { getWorkers, saveWorker as saveWorkerToStorage } from '../utils/workerStorage'
import { getTodayLogs } from '../utils/entryLogStorage'

const stats = [
  { label: 'Active Workers', value: '24', icon: FiUsers, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Cleaning Tasks', value: '12', icon: FiShield, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Disease Alerts', value: '3', icon: FiAlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
  { label: 'Scans Today', value: '0', icon: FiCamera, color: 'text-purple-600', bg: 'bg-purple-50' },
]

const recentItems = [
  { title: 'Zone A cleaning completed', time: '10 min ago', status: 'Completed' },
  { title: 'New disease alert: Avian Flu', time: '1 hour ago', status: 'Active' },
  { title: 'Worker scan: John Doe', time: '2 hours ago', status: 'Verified' },
  { title: 'Cleaning schedule updated', time: '3 hours ago', status: 'Updated' },
]

function AdminDashboard() {
  const [workers, setWorkers] = useState(getWorkers)
  const [refreshKey, setRefreshKey] = useState(0)

  function handleWorkerCreated() {
    setWorkers(getWorkers())
    setRefreshKey((k) => k + 1)
  }

  function handleDeleteWorker(id) {
    const updated = workers.filter((w) => w.id !== id)
    localStorage.setItem('biosecure_workers', JSON.stringify(updated))
    setWorkers(updated)
  }

  const scansToday = getTodayLogs().length
  const liveStats = stats.map((s) =>
    s.label === 'Scans Today' ? { ...s, value: String(scansToday) } : s
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Farm operational overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {liveStats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.bg} p-3 rounded-lg`}>
                <stat.icon className={`${stat.color} text-xl`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Worker QR Management</h2>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-4">Create New Worker</h3>
              <WorkerForm onWorkerCreated={handleWorkerCreated} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-700">Workers ({workers.length})</h3>
              </div>
              <WorkerList
                workers={workers}
                onDelete={handleDeleteWorker}
                refreshKey={refreshKey}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Recent Activity</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {recentItems.map((item) => (
            <div key={item.title} className="px-5 py-3.5 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-800">{item.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.time}</p>
              </div>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
