import { supabase } from '../services/supabase'

function normalizeWorker(data) {
  return {
    id: data.id,
    workerCode: data.worker_code,
    name: data.name,
    mobile: data.mobile,
    role: data.role,
    assignedArea: data.assigned_area,
    userId: data.user_id,
    password: data.password,
    createdAt: data.created_at,
  }
}

export async function getWorkers() {
  const { data, error } = await supabase
    .from('workers')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[Supabase] getWorkers error:', error)
    throw new Error('Failed to load workers')
  }
  return (data || []).map(normalizeWorker)
}

export async function saveWorker({ name, mobile, role, assignedArea, userId, password }) {
  const { data: existing, error: checkError } = await supabase
    .from('workers')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle()

  if (checkError) {
    console.error('[Supabase] saveWorker duplicate check error:', checkError)
    throw new Error('Failed to create worker')
  }

  if (existing) return null

  const { data: areaTaken, error: areaCheckError } = await supabase
    .from('workers')
    .select('id, name')
    .eq('assigned_area', assignedArea)
    .maybeSingle()

  if (areaCheckError) {
    console.error('[Supabase] saveWorker area check error:', areaCheckError)
    throw new Error('Failed to create worker')
  }

  if (areaTaken) {
    throw new Error(`Area "${assignedArea}" is already assigned to ${areaTaken.name}`)
  }

  const { count, error: countError } = await supabase
    .from('workers')
    .select('*', { count: 'exact', head: true })
    .eq('role', role)

  if (countError) {
    console.error('[Supabase] saveWorker count error:', countError)
    throw new Error('Failed to create worker')
  }

  const prefix = role === 'cleaner' ? 'CLN' : 'DIS'
  const nextNum = (count || 0) + 1
  const workerCode = `${prefix}-${String(nextNum).padStart(3, '0')}`

  const { data, error } = await supabase
    .from('workers')
    .insert({
      worker_code: workerCode,
      name,
      mobile,
      role,
      assigned_area: assignedArea,
      user_id: userId,
      password,
    })
    .select()
    .single()

  if (error) {
    console.error('[Supabase] saveWorker insert error:', error)
    throw new Error('Failed to create worker')
  }
  return normalizeWorker(data)
}

export async function deleteWorker(id) {
  const { error } = await supabase
    .from('workers')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('[Supabase] deleteWorker error:', error)
    throw new Error('Failed to delete worker')
  }
  return getWorkers()
}
