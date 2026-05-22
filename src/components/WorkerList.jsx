import Barcode from 'react-barcode'
import JsBarcode from 'jsbarcode'
import { FiDownload, FiTrash2, FiClock } from 'react-icons/fi'

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
    <div className="space-y-3">
      {workers.map((worker) => (
        <div key={worker.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
          <div className="flex items-start gap-4">
            <div className="shrink-0 bg-white p-1.5 rounded border border-gray-200">
              <Barcode value={worker.workerCode} format="CODE128" width={1.5} height={40} displayValue={false} />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{worker.name}</p>
              <p className="text-xs text-gray-500 font-mono">{worker.workerCode}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs capitalize bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">
                  {worker.role}
                </span>
                <span className="text-xs text-gray-400 truncate">{worker.assignedArea}</span>
              </div>
              <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                <FiClock />
                {new Date(worker.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div className="flex flex-col gap-1 shrink-0">
              <button
                onClick={() => downloadBarcode(worker.workerCode)}
                className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                title="Download Barcode"
              >
                <FiDownload size={14} />
              </button>
              <button
                onClick={() => onDelete(worker.id)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                title="Delete Worker"
              >
                <FiTrash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default WorkerList
