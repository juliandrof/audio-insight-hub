import { createContext, useContext, useState, useCallback } from 'react'

const ProcessingContext = createContext()

export function ProcessingProvider({ children }) {
  const [queue, setQueue] = useState([])       // [{name, status, stage, message, result, progress}]
  const [isRunning, setIsRunning] = useState(false)
  const [summary, setSummary] = useState(null)  // {processed, errors} when done

  const startProcessing = useCallback((fileNames) => {
    setQueue(fileNames.map(name => ({
      name, status: 'pending', stage: '', message: 'Na fila...', progress: 0, result: null,
    })))
    setIsRunning(true)
    setSummary(null)
  }, [])

  const updateFile = useCallback((fileName, updates) => {
    setQueue(prev => prev.map(q => q.name === fileName ? { ...q, ...updates } : q))
  }, [])

  const finishProcessing = useCallback((done) => {
    setIsRunning(false)
    setSummary(done)
  }, [])

  const clearQueue = useCallback(() => {
    setQueue([])
    setSummary(null)
    setIsRunning(false)
  }, [])

  return (
    <ProcessingContext.Provider value={{
      queue, isRunning, summary,
      startProcessing, updateFile, finishProcessing, clearQueue,
    }}>
      {children}
    </ProcessingContext.Provider>
  )
}

export function useProcessing() {
  return useContext(ProcessingContext)
}
