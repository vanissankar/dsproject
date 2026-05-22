import { useState, useEffect, useRef, useCallback } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { FiCamera, FiCameraOff, FiCheckCircle, FiDownload, FiAlertCircle, FiMaximize } from 'react-icons/fi'
import { getTodayLogs, addLog, exportLogsToCsv } from '../utils/entryLogStorage'

function ScannerPage() {
  const scannerRef = useRef(null)
  const isScannerActive = useRef(false)
  const lastCodeRef = useRef('')
  const lastCodeTimeRef = useRef(0)

  const [scanning, setScanning] = useState(false)
  const [starting, setStarting] = useState(false)
  const [scanResult, setScanResult] = useState(null)
  const [error, setError] = useState('')
  const [initError, setInitError] = useState(false)
  const [scanSuccessFlash, setScanSuccessFlash] = useState(false)
  const [popupResult, setPopupResult] = useState(null)
  const [todayLogs, setTodayLogs] = useState(getTodayLogs)
  const [manualCode, setManualCode] = useState('')

  useEffect(() => {
    try {
      scannerRef.current = new Html5Qrcode('reader')
    } catch {
      setInitError(true)
      setError('Camera scanner failed to initialize')
    }

    return () => {
      if (scannerRef.current && isScannerActive.current) {
        scannerRef.current.stop().catch(() => {})
      }
      scannerRef.current = null
      isScannerActive.current = false
    }
  }, [])

  const onScanSuccess = useCallback((decodedText) => {
    const code = decodedText.trim()
    const now = Date.now()

    if (code === lastCodeRef.current && now - lastCodeTimeRef.current < 2000) return

    lastCodeRef.current = code
    lastCodeTimeRef.current = now

    const log = addLog({ workerCode: code })
    if (log) {
      setScanResult(log)
      setPopupResult(log)
      setScanSuccessFlash(true)
      setTodayLogs(getTodayLogs())
      setError('')
      setTimeout(() => { setScanSuccessFlash(false); setPopupResult(null) }, 1800)
    } else {
      setError('Unknown worker code: ' + code)
    }
  }, [])

  async function startScanner() {
    setError('')
    setScanResult(null)
    setStarting(true)

    try {
      await scannerRef.current.start(
        { facingMode: 'environment' },
        { fps: 30 },
        onScanSuccess,
        () => {}
      )

      isScannerActive.current = true
      setScanning(true)
      setStarting(false)
    } catch (err) {
      const msg = err?.toString() || ''
      if (msg.includes('Permission') || msg.includes('NotAllowed')) {
        setError('Camera permission denied. Use manual entry below.')
      } else if (msg.includes('NotFoundError')) {
        setError('No camera found on this device.')
      } else {
        setError('Could not start camera: ' + (err?.message || err || 'Unknown error'))
      }
      setStarting(false)
    }
  }

  async function stopScanner() {
    if (!scannerRef.current || !isScannerActive.current) return

    try {
      await scannerRef.current.stop()
    } catch {
      // ignore
    }

    isScannerActive.current = false
    setScanning(false)
  }

  function handleManualSubmit(e) {
    e.preventDefault()
    if (!manualCode.trim()) return

    const log = addLog({ workerCode: manualCode.trim() })
    if (log) {
      setScanResult(log)
      setTodayLogs(getTodayLogs())
      setError('')
      setManualCode('')
    } else {
      setError('Unknown worker code')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Barcode Scanner</h1>
        <p className="text-sm text-gray-500 mt-1">Scan worker barcode badges</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          {!initError ? (
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">
                <FiMaximize className="inline mr-1.5 -mt-0.5" />
                Camera Scanner
              </h2>

              {error && !scanning && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-2">
                  <FiAlertCircle className="text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-amber-700">{error}</p>
                </div>
              )}

              <div id="reader" className={`w-full bg-gray-100 rounded-lg overflow-hidden mb-4 scanner-container transition-all duration-300 ${scanSuccessFlash ? 'ring-2 ring-emerald-500 ring-offset-2' : ''}`} style={{ minHeight: '240px' }}>

                {popupResult && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/30 rounded-lg">
                    <div className="bg-white rounded-lg shadow-lg px-6 py-4 text-center animate-in">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <FiCheckCircle className="text-emerald-600 text-lg" />
                      </div>
                      <p className="text-sm font-semibold text-gray-800">{popupResult.workerName}</p>
                      <p className="text-xs text-gray-500 font-mono">{popupResult.workerCode}</p>
                      <p className="text-xs text-emerald-600 font-medium mt-1">Entry Logged</p>
                    </div>
                  </div>
                )}
              </div>

              {scanning && (
                <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-xs text-green-700 text-center flex items-center justify-center gap-1.5">
                    <span className="w-2 h-2 bg-green-500 rounded-full inline-block animate-pulse" />
                    Scanner active — point camera at a barcode
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                {!scanning ? (
                  <button
                    onClick={startScanner}
                    disabled={starting}
                    className="flex-1 bg-emerald-600 text-white py-2.5 rounded-md text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {starting ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Starting...
                      </>
                    ) : (
                      <>
                        <FiCamera />
                        Start Scanner
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={stopScanner}
                    className="flex-1 bg-red-600 text-white py-2.5 rounded-md text-sm font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <FiCameraOff />
                    Stop Scanner
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex flex-col items-center text-center">
                <div className="bg-red-50 p-3 rounded-full mb-3">
                  <FiAlertCircle className="text-red-400 text-2xl" />
                </div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">Scanner Unavailable</h3>
                <p className="text-xs text-gray-500 mb-4">Camera scanner could not initialize in this browser.</p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Manual Entry</h2>
            <p className="text-xs text-gray-400 mb-3">Enter worker code manually.</p>
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                placeholder="e.g. CLN-001"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <button
                type="submit"
                className="bg-emerald-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-emerald-700 transition-colors"
              >
                Log
              </button>
            </form>
          </div>

          {scanResult && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <FiCheckCircle className="text-emerald-600" />
                <span className="text-sm font-medium text-emerald-800">Entry Logged</span>
              </div>
              <div className="text-sm text-emerald-700 space-y-1">
                <p><span className="text-emerald-600">Worker:</span> {scanResult.workerName}</p>
                <p><span className="text-emerald-600">Code:</span> {scanResult.workerCode}</p>
                <p><span className="text-emerald-600">Time:</span> {new Date(scanResult.entryTime).toLocaleTimeString()}</p>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">
              Today's Entry Logs ({todayLogs.length})
            </h2>
            {todayLogs.length > 0 && (
              <button
                onClick={() => exportLogsToCsv(todayLogs)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
              >
                <FiDownload />
                Export CSV
              </button>
            )}
          </div>

          {todayLogs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Worker Code</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Area</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Entry Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {todayLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 text-gray-800 font-mono text-xs">{log.workerCode}</td>
                      <td className="px-5 py-3 text-gray-800">{log.workerName}</td>
                      <td className="px-5 py-3">
                        <span className="text-xs capitalize bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">
                          {log.role}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-600">{log.assignedArea}</td>
                      <td className="px-5 py-3 text-gray-500 text-xs">
                        {new Date(log.entryTime).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400 text-sm">
              No entries recorded today
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ScannerPage
