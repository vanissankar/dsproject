import { supabase } from '../services/supabase'

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

export async function login(userId, password) {
  if (userId.toUpperCase() === ADMIN.userId && password === ADMIN.password) {
    const session = { userId: ADMIN.userId, role: ADMIN.role, name: 'Administrator' }
    localStorage.setItem('biosecure_user', JSON.stringify(session))
    return session
  }

  const { data, error } = await supabase
    .from('workers')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    console.error('[Supabase] login error:', error)
    throw new Error('Connection error. Please try again.')
  }

  if (!data || data.password !== password) {
    throw new Error('Invalid User ID or password')
  }

  const session = {
    userId: data.user_id,
    role: data.role,
    name: data.name,
    assignedArea: data.assigned_area,
    workerCode: data.worker_code,
  }
  localStorage.setItem('biosecure_user', JSON.stringify(session))
  return session
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
