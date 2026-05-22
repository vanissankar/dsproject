import { useState, useMemo, useEffect } from 'react'
import { FiShield, FiCheckCircle, FiClock, FiAlertTriangle, FiCheckSquare, FiSend, FiClipboard, FiUser, FiMapPin } from 'react-icons/fi'
import { getUser } from '../utils/auth'
import { getWorkers } from '../utils/workerStorage'
import {
  getTasksForArea,
  calculateCompliance,
  getComplianceStatus,
  getReports as getAllReports,
  getTodayReport,
  saveReport,
} from '../utils/cleaningStorage'

function CleaningPage() {
  const user = getUser()
  const todayReport = useMemo(() => getTodayReport(user?.userId), [user?.userId])
  const allReports = getAllReports()
  const myReports = allReports.filter((r) => r.cleanerCode === user?.userId)

  const [worker, setWorker] = useState(null)

  useEffect(() => {
    getWorkers().then((workers) => {
      const found = workers.filter((w) => w.role === 'cleaner')
      setWorker(found.length > 0 ? found[0] : null)
    }).catch(() => setWorker(null))
  }, [])

  const cleanerName = worker?.name || user?.name || 'Cleaner'
  const assignedArea = worker?.assignedArea || 'Not assigned'
  const tasks = useMemo(() => getTasksForArea(assignedArea), [assignedArea])
  const totalTasks = tasks.length

  const [checked, setChecked] = useState(() => {
    if (todayReport) {
      const initial = {}
      tasks.forEach((t) => { initial[t.id] = todayReport.completedTaskIds.includes(t.id) })
      return initial
    }
    const initial = {}
    tasks.forEach((t) => { initial[t.id] = false })
    return initial
  })
  const [submitted, setSubmitted] = useState(!!todayReport)
  const [showSuccess, setShowSuccess] = useState(false)

  const completedCount = Object.values(checked).filter(Boolean).length
  const compliance = calculateCompliance(completedCount, totalTasks)
  const status = getComplianceStatus(compliance)

  function handleToggle(id) {
    if (submitted) return
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  function handleSubmit() {
    const completedIds = Object.entries(checked).filter(([, v]) => v).map(([k]) => k)
    saveReport({
      cleanerName,
      cleanerCode: user?.userId || '',
      assignedArea,
      completedTaskIds: completedIds,
      compliancePercentage: compliance,
    })
    setSubmitted(true)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Cleaning Compliance</h1>
        <p className="text-sm text-gray-500 mt-1">Daily cleaning tasks and compliance reporting</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Cleaner</p>
              <p className="text-sm font-semibold text-gray-800 mt-1">{cleanerName}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <FiUser className="text-blue-500 text-lg" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Assigned Area</p>
              <p className="text-sm font-semibold text-gray-800 mt-1">{assignedArea}</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <FiMapPin className="text-purple-500 text-lg" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Compliance</p>
              <p className={`text-lg font-bold mt-1 ${status.color}`}>{compliance}%</p>
            </div>
            <div className={`${status.bg} p-3 rounded-lg`}>
              <FiShield className={`${status.color} text-lg`} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Pending Tasks</p>
              <p className="text-lg font-bold text-gray-800 mt-1">{totalTasks - completedCount}</p>
            </div>
            <div className="bg-amber-50 p-3 rounded-lg">
              <FiClock className="text-amber-500 text-lg" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-700">
              <FiCheckSquare className="inline mr-1.5 -mt-0.5" />
              Cleaning Tasks — {assignedArea}
            </h2>
          </div>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${status.bg} ${status.color}`}>
            {status.label}
          </span>
        </div>

        <div className="p-5">
          <div className="mb-4">
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className={`${status.bar} h-2 rounded-full transition-all duration-300`} style={{ width: `${compliance}%` }} />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">{completedCount} of {totalTasks} tasks completed</p>
          </div>

          {submitted && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-sm text-amber-700 flex items-center gap-2">
                <FiAlertTriangle className="shrink-0" />
                Today's report already submitted. Edit checks disabled.
              </p>
            </div>
          )}

          <div className="space-y-2">
            {tasks.map((task) => (
              <label
                key={task.id}
                className={`flex items-center gap-3 py-2.5 px-3 rounded-md border transition-colors cursor-pointer ${
                  checked[task.id]
                    ? 'bg-emerald-50 border-emerald-200'
                    : 'bg-white border-gray-100 hover:bg-gray-50'
                } ${submitted ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={checked[task.id] || false}
                  onChange={() => handleToggle(task.id)}
                  disabled={submitted}
                  className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="flex items-center gap-2 flex-1">
                  {checked[task.id] ? (
                    <FiCheckCircle className="text-emerald-500 shrink-0" />
                  ) : (
                    <FiClock className="text-gray-300 shrink-0" />
                  )}
                  <span className={`text-sm ${checked[task.id] ? 'text-emerald-700 line-through' : 'text-gray-700'}`}>
                    {task.label}
                  </span>
                </div>
              </label>
            ))}
          </div>

          {!submitted && (
            <button
              onClick={handleSubmit}
              disabled={completedCount === 0}
              className="mt-5 w-full bg-emerald-600 text-white py-2.5 rounded-md text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <FiSend />
              Submit Daily Cleaning Report
            </button>
          )}
        </div>
      </div>

      {showSuccess && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-3">
          <FiCheckCircle className="text-white text-lg" />
          <div>
            <p className="text-sm font-medium">Report Submitted</p>
            <p className="text-xs text-emerald-100">Cleaning report saved successfully</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">
            <FiClipboard className="inline mr-1.5 -mt-0.5" />
            Recent Reports
          </h2>
        </div>

        {myReports.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {myReports.slice(0, 5).map((report) => {
              const repStatus = getComplianceStatus(report.compliancePercentage)
              return (
                <div key={report.id} className="px-5 py-3.5 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-800">{report.date}</p>
                    <p className="text-xs text-gray-400">{report.assignedArea} — {report.completedTaskIds.length} tasks done</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${repStatus.bg} ${repStatus.color}`}>
                      {report.compliancePercentage}% — {repStatus.label}
                    </span>
                    <FiCheckCircle className={`text-sm ${repStatus.color}`} />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-400 text-sm">
            No cleaning reports submitted yet
          </div>
        )}
      </div>
    </div>
  )
}

export default CleaningPage
