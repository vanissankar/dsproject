import { getWorkers } from './workerStorage'

const ADMIN = { userId: 'ADMIN', password: 'admin123', role: 'admin' }

export const ROLE_DEFAULT_ROUTE = {
  admin: '/admin',
  cleaner: '/cleaning',
  disease: '/disease',
}

export const ROLE_ALLOWED_ROUTES = {
  admin: ['/admin', '/scanner'],
  cleaner: ['/cleaning'],
  disease: ['/disease'],
}

export function login(userId, password) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (userId.toUpperCase() === ADMIN.userId && password === ADMIN.password) {
        const session = { userId: ADMIN.userId, role: ADMIN.role, name: 'Administrator' }
        localStorage.setItem('biosecure_user', JSON.stringify(session))
        resolve(session)
        return
      }

      const workers = getWorkers()
      const worker = workers.find((w) => w.userId.toUpperCase() === userId.toUpperCase() && w.password === password)
      if (worker) {
        const session = { userId: worker.userId, role: worker.role, name: worker.name }
        localStorage.setItem('biosecure_user', JSON.stringify(session))
        resolve(session)
        return
      }

      reject(new Error('Invalid User ID or password'))
    }, 800)
  })
}

export function logout() {
  localStorage.removeItem('biosecure_user')
}

export function getUser() {
  try {
    const raw = localStorage.getItem('biosecure_user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}
