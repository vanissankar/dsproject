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

export function saveWorker({ name, mobile, role, assignedArea, userId, password }) {
  const workers = getWorkers()

  if (workers.some((w) => w.userId === userId)) {
    return null
  }

  const workerCode = generateWorkerCode(role)
  const worker = {
    id: crypto.randomUUID(),
    workerCode,
    name,
    mobile,
    role,
    assignedArea,
    userId,
    password,
    createdAt: new Date().toISOString(),
  }
  workers.push(worker)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workers))
  return worker
}

export function deleteWorker(id) {
  const workers = getWorkers().filter((w) => w.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workers))
  return workers
}
