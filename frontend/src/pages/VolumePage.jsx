import { useState } from 'react'
import { Database, Play, Loader2, CheckCircle2, FileAudio, FolderOpen } from 'lucide-react'
import { useTranslation } from '../i18n/useTranslation'
import { useApi } from '../hooks/useApi'
import { useToast } from '../hooks/useToast'

export default function VolumePage() {
  const { t } = useTranslation()
  const api = useApi()
  const toast = useToast()
  const [volumePath, setVolumePath] = useState('')
  const [processing, setProcessing] = useState(false)
  const [results, setResults] = useState(null)

  const handleProcess = async () => {
    if (!volumePath.trim()) {
      toast.error('Please enter a volume path')
      return
    }
    setProcessing(true)
    setResults(null)
    try {
      const data = await api.processVolume(volumePath.trim())
      setResults(data)
      toast.success(`${data.processed} ${t('volume.found')}`)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-[fadeIn_0.3s_ease-out]">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('volume.title')}</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">{t('volume.subtitle')}</p>
      </div>

      <div className="glass-card p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-500/20 flex items-center justify-center">
            <FolderOpen className="w-6 h-6 text-brand-500" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-800 dark:text-gray-200">Databricks Volume</h2>
            <p className="text-sm text-gray-500">{t('volume.pathLabel')}</p>
          </div>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            value={volumePath}
            onChange={(e) => setVolumePath(e.target.value)}
            placeholder={t('volume.pathPlaceholder')}
            className="input-field text-lg"
            disabled={processing}
            onKeyDown={(e) => e.key === 'Enter' && handleProcess()}
          />

          <button
            onClick={handleProcess}
            disabled={processing || !volumePath.trim()}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {processing ? (
              <><Loader2 className="w-5 h-5 animate-spin" />{t('volume.processing')}</>
            ) : (
              <><Play className="w-5 h-5" />{t('volume.process')}</>
            )}
          </button>
        </div>

        {processing && (
          <div className="mt-8 flex flex-col items-center gap-4">
            <div className="flex items-center gap-1">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 bg-brand-500 rounded-full wave-animation"
                  style={{ height: `${15 + Math.random() * 25}px`, animationDelay: `${i * 0.12}s` }}
                />
              ))}
            </div>
            <p className="text-sm text-gray-500 animate-pulse">{t('volume.processing')}</p>
          </div>
        )}
      </div>

      {results && (
        <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
          <div className="glass-card p-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                {results.processed} {t('volume.found')}
              </p>
            </div>
          </div>

          {results.results?.map((r, i) => (
            <div key={i} className="glass-card-hover p-5" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-500/20 flex items-center justify-center flex-shrink-0">
                  <FileAudio className="w-5 h-5 text-brand-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">{r.file_name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {r.category_name && (
                      <span className="badge bg-brand-100 dark:bg-brand-500/20 text-brand-600 text-xs">{r.category_name}</span>
                    )}
                    <span className={`badge text-xs ${
                      r.sentiment === 'positive' ? 'bg-green-100 text-green-700' :
                      r.sentiment === 'negative' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>{r.sentiment}</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-500 line-clamp-2">{r.summary}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
