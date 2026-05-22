import Barcode from 'react-barcode'
import JsBarcode from 'jsbarcode'
import { FiDownload, FiTrash2, FiSmartphone, FiMapPin, FiKey } from 'react-icons/fi'

function downloadBarcode(workerCode) {
  const canvas = document.createElement('canvas')
  JsBarcode(canvas, workerCode, { format: 'CODE128', width: 2, height: 60, displayValue: false })
  const url = canvas.toDataURL('image/png')
  const link = document.createElement('a')
  link.href = url
  link.download = `${workerCode}-barcode.png`
  link.click()
}

function WorkerList({ workers, onDelete, refreshKey }) {
  if (!workers.length) {
    return (
      <div className="text-center py-12 text-gray-400 text-sm">
        No workers created yet
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Worker</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Area</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Barcode</th>
            <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {workers.map((worker) => (
            <tr key={worker.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <p className="text-sm font-medium text-gray-800">{worker.name}</p>
              </td>
              <td className="px-4 py-3 text-xs font-mono text-gray-500">{worker.workerCode}</td>
              <td className="px-4 py-3">
                <span className="text-xs capitalize bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">
                  {worker.role}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <FiMapPin className="text-gray-400" />
                  {worker.assignedArea}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <FiSmartphone className="text-gray-400" />
                  {worker.mobile}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <FiKey className="text-gray-400" />
                  {worker.userId}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="bg-white rounded border border-gray-200 inline-block">
                  <Barcode value={worker.workerCode} format="CODE128" width={1.2} height={28} displayValue={false} />
                </div>
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => downloadBarcode(worker.workerCode)}
                    className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                    title="Download Barcode"
                  >
                    <FiDownload size={14} />
                  </button>
                  <button
                    onClick={() => onDelete(worker.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete Worker"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default WorkerList
