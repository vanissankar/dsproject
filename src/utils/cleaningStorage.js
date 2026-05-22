const STORAGE_KEY = 'biosecure_cleaning_reports'

export const POULTRY_TASKS = [
  { id: 'footbath', label: 'Footbath cleaned' },
  { id: 'feed_trays', label: 'Feed trays sanitized' },
  { id: 'cage', label: 'Cage disinfected' },
  { id: 'waste', label: 'Waste removed' },
]

export const PIG_SHED_TASKS = [
  { id: 'pen', label: 'Pen cleaned' },
  { id: 'water', label: 'Water area sanitized' },
  { id: 'disinfectant', label: 'Disinfectant sprayed' },
  { id: 'waste', label: 'Waste removed' },
]

export function getTasksForArea(area) {
  if (!area) return POULTRY_TASKS
  const lower = area.toLowerCase()
  if (lower.includes('pig')) return PIG_SHED_TASKS
  return POULTRY_TASKS
}

export function calculateCompliance(completed, total) {
  if (!total) return 0
  return Math.round((completed / total) * 100)
}

export function getComplianceStatus(percentage) {
  if (percentage >= 80) return { label: 'Safe', color: 'text-emerald-600', bg: 'bg-emerald-50', bar: 'bg-emerald-500' }
  if (percentage >= 50) return { label: 'Warning', color: 'text-amber-600', bg: 'bg-amber-50', bar: 'bg-amber-500' }
  return { label: 'Critical', color: 'text-red-600', bg: 'bg-red-50', bar: 'bg-red-500' }
}

export function getReports() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)) : []
  } catch {
    return []
  }
}

export function getTodayReport(cleanerCode) {
  const reports = getReports()
  const today = new Date().toISOString().split('T')[0]
  return reports.find((r) => r.cleanerCode === cleanerCode && r.date === today) || null
}

export function saveReport({ cleanerName, cleanerCode, assignedArea, completedTaskIds, compliancePercentage }) {
  const reports = getReports()
  const report = {
    id: crypto.randomUUID(),
    cleanerName,
    cleanerCode,
    assignedArea,
    completedTaskIds,
    compliancePercentage,
    date: new Date().toISOString().split('T')[0],
    submittedAt: new Date().toISOString(),
  }
  reports.unshift(report)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports))
  return report
}

export function exportReportsToCsv(reports) {
  if (!reports.length) return

  const headers = ['Date', 'Cleaner', 'Area', 'Compliance %', 'Status']
  const rows = reports.map((r) => [
    r.date,
    r.cleanerName,
    r.assignedArea,
    `${r.compliancePercentage}%`,
    r.compliancePercentage >= 80 ? 'Safe' : r.compliancePercentage >= 50 ? 'Warning' : 'Critical',
  ])

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `cleaning_reports_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(link.href)
}
