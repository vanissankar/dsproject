const STORAGE_KEY = 'biosecure_workers'

export function getWorkers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function generateWorkerCode(role) {
  const workers = getWorkers()
  const prefix = role === 'cleaner' ? 'CLN' : 'DIS'
  const existing = workers.filter((w) => w.workerCode.startsWith(prefix))
  const nextNum = existing.length + 1
  return `${prefix}-${String(nextNum).padStart(3, '0')}`
}

export function saveWorker({ name, role, assignedArea }) {
  const workers = getWorkers()
  const workerCode = generateWorkerCode(role)
  const worker = {
    id: crypto.randomUUID(),
    workerCode,
    name,
    role,
    assignedArea,
    createdAt: new Date().toISOString(),
  }
  workers.push(worker)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workers))
  return worker
}
