import { useState } from 'react'
import { FiUser, FiBriefcase, FiMapPin, FiPlus } from 'react-icons/fi'
import { saveWorker } from '../utils/workerStorage'

const AREAS = ['Poultry Area A', 'Poultry Area B', 'Pig Shed A', 'Pig Shed B']
const ROLES = [
  { value: 'cleaner', label: 'Cleaner' },
  { value: 'disease', label: 'Disease' },
]

function WorkerForm({ onWorkerCreated }) {
  const [name, setName] = useState('')
  const [role, setRole] = useState('cleaner')
  const [assignedArea, setAssignedArea] = useState(AREAS[0])

  function handleSubmit(e) {
    e.preventDefault()
    const worker = saveWorker({ name, role, assignedArea })
    setName('')
    setRole('cleaner')
    setAssignedArea(AREAS[0])
    if (onWorkerCreated) onWorkerCreated(worker)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
        <div className="relative">
          <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter full name"
            required
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
        <div className="relative">
          <FiBriefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm z-10" />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white"
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Area</label>
        <div className="relative">
          <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm z-10" />
          <select
            value={assignedArea}
            onChange={(e) => setAssignedArea(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white"
          >
            {AREAS.map((area) => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-emerald-600 text-white py-2.5 rounded-md text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
      >
        <FiPlus />
        Create Worker
      </button>
    </form>
  )
}

export default WorkerForm
