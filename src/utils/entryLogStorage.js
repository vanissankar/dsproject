import { getWorkers } from './workerStorage'

const STORAGE_KEY = 'biosecure_entry_logs'

export function getTodayLogs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const logs = raw ? JSON.parse(raw) : []
    const today = new Date().toISOString().split('T')[0]
    return logs
      .filter((log) => log.entryTime.startsWith(today))
      .sort((a, b) => new Date(b.entryTime) - new Date(a.entryTime))
  } catch {
    return []
  }
}

export function getAllLogs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function addLog({ workerCode }) {
  const workers = getWorkers()
  const worker = workers.find((w) => w.workerCode === workerCode)
  if (!worker) return null

  const logs = getAllLogs()
  const entry = {
    id: crypto.randomUUID(),
    workerCode: worker.workerCode,
    workerName: worker.name,
    role: worker.role,
    assignedArea: worker.assignedArea,
    entryTime: new Date().toISOString(),
  }
  logs.push(entry)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs))
  return entry
}

export function exportLogsToCsv(logs) {
  if (!logs.length) return

  const headers = ['Worker Code', 'Worker Name', 'Role', 'Assigned Area', 'Entry Time']
  const rows = logs.map((log) => [
    log.workerCode,
    log.workerName,
    log.role,
    log.assignedArea,
    new Date(log.entryTime).toLocaleString(),
  ])

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `entry_logs_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(link.href)
}
