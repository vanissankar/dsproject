const STORAGE_KEY = 'biosecure_disease_reports'

export const POULTRY_SYMPTOMS = [
  { id: 'weak', label: 'Sick Birds', multiplier: 1 },
  { id: 'coughing', label: 'Coughing', multiplier: 2 },
  { id: 'not_eating', label: 'Not Eating', multiplier: 2 },
  { id: 'dead', label: 'Found Dead', multiplier: 5 },
]

export const PIG_SYMPTOMS = [
  { id: 'weak', label: 'Sick Pigs', multiplier: 1 },
  { id: 'fever', label: 'Fever', multiplier: 2 },
  { id: 'skin', label: 'Skin Sores', multiplier: 2 },
  { id: 'dead', label: 'Found Dead', multiplier: 5 },
]

export function getSymptomsForArea(area) {
  if (!area) return POULTRY_SYMPTOMS
  if (area.toLowerCase().includes('pig')) return PIG_SYMPTOMS
  return POULTRY_SYMPTOMS
}

export function calculateRiskScore(symptoms, symptomDefs) {
  return symptomDefs.reduce((total, s) => total + (Number(symptoms[s.id]) || 0) * s.multiplier, 0)
}

export function getRiskLevel(score) {
  if (score <= 3) return { label: 'SAFE', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' }
  if (score <= 8) return { label: 'WARNING', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' }
  return { label: 'HIGH RISK', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' }
}

export function getReports() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)) : []
  } catch {
    return []
  }
}

export function getTodayReport(monitorCode) {
  const reports = getReports()
  const today = new Date().toISOString().split('T')[0]
  return reports.find((r) => r.monitorCode === monitorCode && r.date === today) || null
}

export function saveReport({ monitorName, monitorCode, assignedArea, symptoms, riskScore, riskLevel, totalDead }) {
  const reports = getReports()
  const report = {
    id: crypto.randomUUID(),
    monitorName,
    monitorCode,
    assignedArea,
    symptoms,
    riskScore,
    riskLevel,
    totalDead: totalDead || 0,
    date: new Date().toISOString().split('T')[0],
    submittedAt: new Date().toISOString(),
  }
  reports.unshift(report)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports))
  return report
}

export function exportReportsToCsv(reports) {
  if (!reports.length) return

  const headers = ['Date', 'Monitor', 'Area', 'Risk Score', 'Risk Level', 'Sick', 'Coughing/Fever', 'Not Eating/Sores', 'Found Dead', 'Total Dead']
  const rows = reports.map((r) => {
    const syms = r.symptoms || {}
    return [
      r.date,
      r.monitorName,
      r.assignedArea,
      r.riskScore,
      r.riskLevel,
      syms['weak'] || 0,
      syms['coughing'] || syms['fever'] || 0,
      syms['not_eating'] || syms['skin'] || 0,
      syms['dead'] || 0,
      r.totalDead || 0,
    ]
  })

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `disease_reports_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(link.href)
}
