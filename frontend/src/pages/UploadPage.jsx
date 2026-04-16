import { useState, useRef } from 'react'
import { Upload, FileAudio, CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react'
import { useTranslation } from '../i18n/useTranslation'
import { useApi } from '../hooks/useApi'
import { useToast } from '../hooks/useToast'

export default function UploadPage({ onNavigate }) {
  const { t } = useTranslation()
  const api = useApi()
  const toast = useToast()
  const fileInput = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [dragOver, setDragOver] = useState(false)

  const processFile = async (file) => {
    if (!file) return
    setUploading(true)
    setProgress(0)
    setStage(t('upload.transcribing'))
    setResult(null)
    setError(null)

    try {
      const data = await api.uploadAudio(file, (pct) => {
        setProgress(pct)
        if (pct === 100) setStage(t('upload.analyzing'))
      })
      setResult(data)
      toast.success(t('upload.success'))
    } catch (err) {
      setError(err.message)
      toast.error(`${t('upload.error')}: ${err.message}`)
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer?.files?.[0]
    if (file) processFile(file)
  }

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const sentimentColor = {
    positive: 'text-green-500',
    negative: 'text-red-500',
    neutral: 'text-gray-500',
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-[fadeIn_0.3s_ease-out]">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('upload.title')}</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">{t('upload.subtitle')}</p>
      </div>

      {/* Dropzone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInput.current?.click()}
        className={`
          relative overflow-hidden rounded-2xl border-2 border-dashed p-12 text-center cursor-pointer
          transition-all duration-300
          ${dragOver
            ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10 scale-[1.02]'
            : 'border-gray-300 dark:border-gray-700 hover:border-brand-400 hover:bg-gray-50 dark:hover:bg-gray-900/50'
          }
          ${uploading ? 'pointer-events-none opacity-60' : ''}
        `}
      >
        <input
          ref={fileInput}
          type="file"
          className="hidden"
          accept=".wav,.mp3,.ogg,.flac,.m4a,.webm,audio/*"
          onChange={handleFileSelect}
        />

        {/* Animated wave background */}
        <div className="absolute inset-0 opacity-5 flex items-center justify-center gap-1">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-brand-500 rounded-full wave-animation"
              style={{
                height: `${20 + Math.random() * 40}px`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-brand-100 dark:bg-brand-500/20 flex items-center justify-center">
            {uploading ? (
              <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
            ) : dragOver ? (
              <Sparkles className="w-10 h-10 text-brand-500 animate-pulse" />
            ) : (
              <Upload className="w-10 h-10 text-brand-500" />
            )}
          </div>

          {uploading ? (
            <div className="space-y-4">
              <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">{stage}</p>
              <div className="max-w-xs mx-auto">
                <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full gradient-bg rounded-full transition-all duration-300"
                    style={{ width: progress === 100 ? '100%' : `${progress}%` }}
                  />
                </div>
                {progress < 100 && <p className="text-sm text-gray-400 mt-2">{progress}%</p>}
              </div>
            </div>
          ) : (
            <>
              <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {dragOver ? t('upload.dropHere') : t('upload.selectFile')}
              </p>
              <p className="text-sm text-gray-400">{t('upload.supported')}</p>
            </>
          )}
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="glass-card p-6 space-y-6 animate-[slideIn_0.3s_ease-out]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">{t('upload.success')}</h3>
              <p className="text-sm text-gray-500">{result.file_name}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <p className="text-xs text-gray-400 mb-1">{t('analyses.sentiment')}</p>
              <p className={`font-semibold ${sentimentColor[result.sentiment] || 'text-gray-500'}`}>
                {result.sentiment?.toUpperCase()}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <p className="text-xs text-gray-400 mb-1">{t('analyses.urgency')}</p>
              <p className="font-semibold text-gray-700 dark:text-gray-300">{result.urgency_level?.toUpperCase()}</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <p className="text-xs text-gray-400 mb-1">{t('analyses.language')}</p>
              <p className="font-semibold text-gray-700 dark:text-gray-300">{result.language_detected?.toUpperCase()}</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <p className="text-xs text-gray-400 mb-1">{t('analyses.speakers')}</p>
              <p className="font-semibold text-gray-700 dark:text-gray-300">{result.speaker_count}</p>
            </div>
          </div>

          {result.category_name && (
            <div>
              <p className="text-xs text-gray-400 mb-2">Categoria</p>
              <span className="badge bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400">
                {result.category_name}
              </span>
            </div>
          )}

          {result.summary && (
            <div>
              <p className="text-xs text-gray-400 mb-2">{t('analyses.summary')}</p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{result.summary}</p>
            </div>
          )}

          {result.key_topics?.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 mb-2">{t('analyses.keyTopics')}</p>
              <div className="flex flex-wrap gap-2">
                {result.key_topics.map((topic, i) => (
                  <span key={i} className="badge bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => onNavigate('detail', result.id)}
            className="btn-primary w-full text-center"
          >
            {t('analyses.viewDetails')}
          </button>
        </div>
      )}

      {error && (
        <div className="glass-card p-6 border-red-200 dark:border-red-500/20 animate-[slideIn_0.3s_ease-out]">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
          </div>
        </div>
      )}
    </div>
  )
}
