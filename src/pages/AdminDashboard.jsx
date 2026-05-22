import { useState, useMemo, useEffect, useCallback } from 'react'
import { FiUsers, FiShield, FiAlertTriangle, FiCamera, FiDownload, FiAlertOctagon, FiRefreshCw } from 'react-icons/fi'
import WorkerForm from '../components/WorkerForm'
import WorkerList from '../components/WorkerList'
import { getWorkers, deleteWorker } from '../utils/workerStorage'
import { getTodayLogs } from '../utils/entryLogStorage'
import { getReports as getCleaningReports, exportReportsToCsv as exportCleaningCsv } from '../utils/cleaningStorage'
import { getReports as getDiseaseReports, getRiskLevel, exportReportsToCsv as exportDiseaseCsv } from '../utils/diseaseStorage'

function AdminDashboard() {
  const [workers, setWorkers] = useState([])
  const [workersLoading, setWorkersLoading] = useState(true)
  const [workersError, setWorkersError] = useState('')
  const [reportKey, setReportKey] = useState(0)

  const cleaningReports = useMemo(() => getCleaningReports(), [reportKey])
  const diseaseReports = useMemo(() => getDiseaseReports(), [reportKey])
  const scansToday = useMemo(() => getTodayLogs().length, [reportKey])

  const highRiskZones = diseaseReports
    .filter((r) => r.riskLevel === 'HIGH RISK')
    .reduce((acc, r) => {
      if (!acc.find((z) => z.area === r.assignedArea)) {
        acc.push({ area: r.assignedArea, score: r.riskScore, date: r.date, monitor: r.monitorName })
      }
      return acc
    }, [])

  const loadWorkers = useCallback(async () => {
    setWorkersLoading(true)
    setWorkersError('')
    try {
      const data = await getWorkers()
      setWorkers(data)
    } catch (err) {
      setWorkersError(err.message || 'Failed to load workers')
    } finally {
      setWorkersLoading(false)
    }
  }, [])

  useEffect(() => { loadWorkers() }, [loadWorkers])

  async function handleWorkerCreated() {
    await loadWorkers()
    setReportKey((k) => k + 1)
  }

  async function handleDeleteWorker(id) {
    try {
      const updated = await deleteWorker(id)
      setWorkers(updated)
    } catch (err) {
      setWorkersError(err.message || 'Failed to delete worker')
    }
  }

  function handleRefresh() {
    setReportKey((k) => k + 1)
    loadWorkers()
  }

  const cleanerCount = workers.filter((w) => w.role === 'cleaner').length
  const diseaseCount = workers.filter((w) => w.role === 'disease').length

  const stats = [
    { label: 'Active Workers', value: String(workers.length), icon: FiUsers, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Cleaners', value: String(cleanerCount), icon: FiShield, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Disease Staff', value: String(diseaseCount), icon: FiAlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Scans Today', value: String(scansToday), icon: FiCamera, color: 'text-purple-600', bg: 'bg-purple-50' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Farm operational overview</p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 px-3 py-2 rounded-md transition-colors"
          title="Refresh data"
        >
          <FiRefreshCw />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
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

      {highRiskZones.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <FiAlertOctagon className="text-red-600 text-lg" />
            <h2 className="text-sm font-semibold text-red-700">Zones in Danger</h2>
          </div>
          <div className="space-y-2">
            {highRiskZones.map((zone) => (
              <div key={zone.area} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white rounded-md border border-red-100 px-4 py-2.5">
                <div>
                  <p className="text-sm font-medium text-red-700">{zone.area}</p>
                  <p className="text-xs text-red-500">Risk Score: {zone.score} — Reported by {zone.monitor} on {zone.date}</p>
                </div>
                <span className="text-xs font-bold text-white bg-red-600 px-2.5 py-1 rounded-full">HIGH RISK</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Worker Management</h2>
        </div>
        <div className="p-5">
          {workersError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{workersError}</p>
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-4">Create New Worker</h3>
              <WorkerForm onWorkerCreated={handleWorkerCreated} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-700">All Workers ({workers.length})</h3>
              </div>
              {workersLoading ? (
                <div className="flex items-center justify-center py-12 text-gray-400">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Loading workers...
                </div>
              ) : (
                <WorkerList workers={workers} onDelete={handleDeleteWorker} refreshKey={reportKey} />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">
              <FiShield className="inline mr-1.5 -mt-0.5" />
              Cleaning Reports
            </h2>
            {cleaningReports.length > 0 && (
              <button
                onClick={() => exportCleaningCsv(cleaningReports)}
                className="flex items-center gap-1.5 text-xs text-emerald-600 hover:bg-emerald-50 px-2.5 py-1.5 rounded-md transition-colors"
              >
                <FiDownload />
                Export CSV
              </button>
            )}
          </div>
          <div className="divide-y divide-gray-100 sm:max-h-64 overflow-y-auto">
            {cleaningReports.length > 0 ? (
              cleaningReports.slice(0, 8).map((r) => {
                const status = r.compliancePercentage >= 80 ? 'Safe' : r.compliancePercentage >= 50 ? 'Warning' : 'Critical'
                const statusColor = r.compliancePercentage >= 80 ? 'text-emerald-600 bg-emerald-50' : r.compliancePercentage >= 50 ? 'text-amber-600 bg-amber-50' : 'text-red-600 bg-red-50'
                return (
                  <div key={r.id} className="px-5 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-800">{r.cleanerName} — {r.assignedArea}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{r.date} · {r.compliancePercentage}% compliance</p>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor}`}>{status}</span>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-8 text-gray-400 text-sm">No cleaning reports yet</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">
              <FiAlertTriangle className="inline mr-1.5 -mt-0.5" />
              Disease Reports
            </h2>
            {diseaseReports.length > 0 && (
              <button
                onClick={() => exportDiseaseCsv(diseaseReports)}
                className="flex items-center gap-1.5 text-xs text-emerald-600 hover:bg-emerald-50 px-2.5 py-1.5 rounded-md transition-colors"
              >
                <FiDownload />
                Export CSV
              </button>
            )}
          </div>
          <div className="divide-y divide-gray-100 sm:max-h-64 overflow-y-auto">
            {diseaseReports.length > 0 ? (
              diseaseReports.slice(0, 8).map((r) => {
                const rRisk = getRiskLevel(r.riskScore)
                return (
                  <div key={r.id} className="px-5 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-800">{r.monitorName} — {r.assignedArea}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{r.date} · Score: {r.riskScore} · Dead: {r.totalDead}</p>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${rRisk.bg} ${rRisk.color}`}>{r.riskLevel}</span>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-8 text-gray-400 text-sm">No disease reports yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
