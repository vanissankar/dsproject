const USERS = [
  { email: 'admin@farm.com', password: '123456', role: 'admin' },
  { email: 'cleaner@farm.com', password: '123456', role: 'cleaner' },
  { email: 'disease@farm.com', password: '123456', role: 'disease' },
]

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

export function login(email, password) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = USERS.find((u) => u.email === email && u.password === password)
      if (user) {
        const session = { email: user.email, role: user.role }
        localStorage.setItem('biosecure_user', JSON.stringify(session))
        resolve(session)
      } else {
        reject(new Error('Invalid email or password'))
      }
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
