import { useState, useMemo, useEffect } from 'react'
import { FiAlertTriangle, FiActivity, FiThermometer, FiUsers, FiSend, FiAlertCircle, FiXCircle, FiClipboard, FiDownload, FiUser, FiMapPin } from 'react-icons/fi'
import { getUser } from '../utils/auth'
import { getWorkers } from '../utils/workerStorage'
import {
  getSymptomsForArea,
  calculateRiskScore,
  getRiskLevel,
  getReports,
  getTodayReport,
  saveReport,
  exportReportsToCsv,
} from '../utils/diseaseStorage'

function DiseasePage() {
  const user = getUser()
  const [worker, setWorker] = useState(null)

  useEffect(() => {
    getWorkers().then((workers) => {
      const found = workers.filter((w) => w.role === 'disease')
      setWorker(found.length > 0 ? found[0] : null)
    }).catch(() => setWorker(null))
  }, [])

  const monitorName = worker?.name || user?.name || 'Disease Monitor'
  const assignedArea = worker?.assignedArea || 'Not assigned'
  const symptomDefs = useMemo(() => getSymptomsForArea(assignedArea), [assignedArea])

  const todayReport = useMemo(() => getTodayReport(user?.userId), [user?.userId])

  const [symptoms, setSymptoms] = useState(() => {
    const init = {}
    symptomDefs.forEach((s) => { init[s.id] = todayReport?.symptoms?.[s.id] || 0 })
    return init
  })
  const [totalDead, setTotalDead] = useState(todayReport?.totalDead || 0)
  const [submitted, setSubmitted] = useState(!!todayReport)
  const [showSuccess, setShowSuccess] = useState(false)

  function handleChange(id, value) {
    if (submitted) return
    const num = Math.max(0, parseInt(value) || 0)
    setSymptoms((prev) => ({ ...prev, [id]: num }))
  }

  const riskScore = calculateRiskScore(symptoms, symptomDefs)
  const risk = getRiskLevel(riskScore)
  const totalSymptoms = symptomDefs.reduce((sum, s) => sum + (Number(symptoms[s.id]) || 0), 0)

  const allReports = getReports()
  const myReports = allReports.filter((r) => r.monitorCode === user?.userId)

  const alerts = []
  if (totalDead > 2) alerts.push({ type: 'danger', icon: FiXCircle, msg: `High mortality: ${totalDead} total animals dead today` })
  if (risk.label === 'HIGH RISK') alerts.push({ type: 'danger', icon: FiAlertTriangle, msg: `Risk score is ${riskScore} — immediate attention required` })
  if (risk.label === 'WARNING') alerts.push({ type: 'warning', icon: FiAlertCircle, msg: `Risk score is ${riskScore} — monitor closely` })

  function handleSubmit() {
    saveReport({
      monitorName,
      monitorCode: user?.userId || '',
      assignedArea,
      symptoms,
      riskScore,
      riskLevel: risk.label,
      totalDead,
    })
    setSubmitted(true)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Disease Monitoring</h1>
        <p className="text-sm text-gray-500 mt-1">Track and report disease symptoms</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Monitor</p>
              <p className="text-sm font-semibold text-gray-800 mt-1 truncate">{monitorName}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg"><FiUser className="text-blue-500 text-lg" /></div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Area</p>
              <p className="text-sm font-semibold text-gray-800 mt-1 truncate">{assignedArea}</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg"><FiMapPin className="text-purple-500 text-lg" /></div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Risk Level</p>
              <p className={`text-sm font-bold mt-1 ${risk.color}`}>{risk.label}</p>
            </div>
            <div className={`${risk.bg} p-3 rounded-lg`}><FiActivity className={`${risk.color} text-lg`} /></div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Symptoms</p>
              <p className="text-lg font-bold text-gray-800 mt-1">{totalSymptoms}</p>
            </div>
            <div className="bg-amber-50 p-3 rounded-lg"><FiThermometer className="text-amber-500 text-lg" /></div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Total Dead Today</p>
              <p className={`text-lg font-bold mt-1 ${totalDead > 2 ? 'text-red-600' : 'text-gray-800'}`}>{totalDead}</p>
            </div>
            <div className={`p-3 rounded-lg ${totalDead > 2 ? 'bg-red-50' : 'bg-gray-50'}`}>
              <FiXCircle className={totalDead > 2 ? 'text-red-500 text-lg' : 'text-gray-400 text-lg'} />
            </div>
          </div>
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, i) => (
            <div key={i} className={`p-3 rounded-md border flex items-center gap-2 ${
              alert.type === 'danger' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-amber-50 border-amber-200 text-amber-700'
            }`}>
              <alert.icon className="shrink-0" />
              <p className="text-sm">{alert.msg}</p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-700">
              <FiUsers className="inline mr-1.5 -mt-0.5" />
              Daily Symptom Report — {assignedArea}
            </h2>
          </div>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${risk.bg} ${risk.color}`}>
            Score: {riskScore} — {risk.label}
          </span>
        </div>

        <div className="p-5">
          {submitted && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-sm text-amber-700 flex items-center gap-2">
                <FiAlertCircle className="shrink-0" />
                Today's report already submitted.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            {symptomDefs.map((s) => (
              <div key={s.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-2">{s.label}</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={symptoms[s.id] || 0}
                  onChange={(e) => handleChange(s.id, e.target.value.replace(/\D/g, ''))}
                  disabled={submitted}
                  className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${submitted ? 'opacity-60 cursor-not-allowed' : ''}`}
                />
                <p className="text-xs text-gray-400 mt-1">Multiplier: {s.multiplier}x</p>
              </div>
            ))}
          </div>

          <div className="mb-5 p-4 bg-red-50 rounded-lg border border-red-100">
            <label className="block text-sm font-medium text-gray-700 mb-2">Total Animals Dead Today</label>
            <input
              type="text"
              inputMode="numeric"
              value={totalDead}
              onChange={(e) => { if (!submitted) { const v = e.target.value.replace(/\D/g, ''); setTotalDead(v ? parseInt(v) : 0) } }}
              disabled={submitted}
              className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${submitted ? 'opacity-60 cursor-not-allowed' : ''}`}
              placeholder="Enter total dead count for today"
            />
            <p className="text-xs text-gray-400 mt-1">Total number of animals that died today across all causes</p>
          </div>

          <div className="mb-5 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Calculated Risk Score</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {symptomDefs.map((s) => `${s.label}: ${Number(symptoms[s.id]) || 0} × ${s.multiplier}`).join(' + ')}
                </p>
              </div>
              <div className={`text-right px-4 py-2 rounded-md ${risk.bg} ${risk.color} font-bold text-lg`}>
                {riskScore}
              </div>
            </div>
          </div>

          {!submitted && (
            <button
              onClick={handleSubmit}
              disabled={totalSymptoms === 0 && totalDead === 0}
              className="w-full bg-emerald-600 text-white py-2.5 rounded-md text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <FiSend />
              Submit Daily Disease Report
            </button>
          )}
        </div>
      </div>

      {showSuccess && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-3">
          <FiActivity className="text-white text-lg" />
          <div>
            <p className="text-sm font-medium">Report Submitted</p>
            <p className="text-xs text-emerald-100">Disease report saved successfully</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">
            <FiClipboard className="inline mr-1.5 -mt-0.5" />
            Recent Reports
          </h2>
          {myReports.length > 0 && (
            <button
              onClick={() => exportReportsToCsv(myReports)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
            >
              <FiDownload />
              Export CSV
            </button>
          )}
        </div>

        {myReports.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Area</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Score</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Risk</th>
                  {symptomDefs.map((s) => (
                    <th key={s.id} className="text-left px-3 py-3 text-xs font-medium text-gray-500 uppercase">{s.label}</th>
                  ))}
                  <th className="text-left px-3 py-3 text-xs font-medium text-gray-500 uppercase">Total Dead</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {myReports.slice(0, 10).map((r) => {
                  const rRisk = getRiskLevel(r.riskScore)
                  return (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 text-gray-800 text-xs">{r.date}</td>
                      <td className="px-5 py-3 text-gray-600 text-xs">{r.assignedArea}</td>
                      <td className="px-5 py-3 text-gray-800 font-semibold">{r.riskScore}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${rRisk.bg} ${rRisk.color}`}>
                          {r.riskLevel}
                        </span>
                      </td>
                      {symptomDefs.map((s) => (
                        <td key={s.id} className="px-3 py-3 text-gray-600 text-xs">{r.symptoms?.[s.id] || 0}</td>
                      ))}
                      <td className="px-3 py-3 text-gray-600 text-xs font-semibold">{r.totalDead || 0}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 text-gray-400 text-sm">
            No disease reports submitted yet
          </div>
        )}
      </div>
    </div>
  )
}

export default DiseasePage
