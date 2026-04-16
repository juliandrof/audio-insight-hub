import { useState, useCallback, createContext, useContext } from 'react'

const ToastContext = createContext()

let toastId = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info') => {
    const id = ++toastId
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const success = useCallback((msg) => addToast(msg, 'success'), [addToast])
  const error = useCallback((msg) => addToast(msg, 'error'), [addToast])

  return (
    <ToastContext.Provider value={{ success, error }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] space-y-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto px-5 py-3 rounded-xl shadow-lg backdrop-blur-xl border text-sm font-medium
              animate-[slideIn_0.3s_ease-out]
              ${t.type === 'success' ? 'bg-green-50/90 border-green-200 text-green-800 dark:bg-green-900/80 dark:border-green-700 dark:text-green-200' : ''}
              ${t.type === 'error' ? 'bg-red-50/90 border-red-200 text-red-800 dark:bg-red-900/80 dark:border-red-700 dark:text-red-200' : ''}
              ${t.type === 'info' ? 'bg-white/90 border-gray-200 text-gray-800 dark:bg-gray-800/80 dark:border-gray-600 dark:text-gray-200' : ''}
            `}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
