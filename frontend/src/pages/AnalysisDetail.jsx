import { useState, useEffect } from 'react'
import {
  ArrowLeft, Download, ThumbsUp, ThumbsDown, Minus,
  Clock, Users, Globe, AlertTriangle, Tag, Lightbulb,
  CheckSquare, FileText
} from 'lucide-react'
import { useTranslation } from '../i18n/useTranslation'
import { useApi } from '../hooks/useApi'
import { useToast } from '../hooks/useToast'

export default function AnalysisDetail({ id, onBack }) {
  const { t } = useTranslation()
  const api = useApi()
  const toast = useToast()
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.fetchAnalysis(id)
      .then(setAnalysis)
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false))
  }, [id])

  const handleExport = async () => {
    try {
      const blob = await api.exportPdf(id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analise_${id}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Export failed')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-brand-200 dark:border-brand-800" />
          <div className="absolute inset-0 rounded-full border-4 border-brand-500 border-t-transparent animate-spin" />
        </div>
      </div>
    )
  }

  if (!analysis) return null

  const sentimentConfig = {
    positive: { icon: ThumbsUp, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-500/20', label: t('sentiment.positive') },
    negative: { icon: ThumbsDown, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-500/20', label: t('sentiment.negative') },
    neutral: { icon: Minus, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-500/20', label: t('sentiment.neutral') },
  }
  const sent = sentimentConfig[analysis.sentiment] || sentimentConfig.neutral
  const SentIcon = sent.icon
  const sentScore = Math.round((analysis.sentiment_score || 0.5) * 100)

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-[fadeIn_0.3s_ease-out]">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-brand-500 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          {t('common.back')}
        </button>
        <button onClick={handleExport} className="btn-primary flex items-center gap-2">
          <Download className="w-4 h-4" />
          {t('analyses.exportPdf')}
        </button>
      </div>

      {/* Title */}
      <div className="glass-card p-6">
        <div className="flex items-start gap-4">
          <div className={`w-14 h-14 rounded-2xl ${sent.bg} flex items-center justify-center`}>
            <SentIcon className={`w-7 h-7 ${sent.color}`} />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{analysis.file_name}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              {analysis.category_name && (
                <span className="badge" style={{ backgroundColor: `${analysis.category_color}20`, color: analysis.category_color }}>
                  <Tag className="w-3 h-3 mr-1" />
                  {analysis.category_name}
                </span>
              )}
              <span className={`badge ${sent.bg} ${sent.color}`}>{sent.label} ({sentScore}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: Globe, label: t('analyses.language'), value: analysis.language_detected?.toUpperCase() },
          { icon: Users, label: t('analyses.speakers'), value: analysis.speaker_count },
          { icon: AlertTriangle, label: t('analyses.urgency'), value: analysis.urgency_level?.toUpperCase() },
          { icon: Clock, label: t('analyses.processedAt'), value: analysis.processed_at ? new Date(analysis.processed_at).toLocaleDateString() : 'N/A' },
        ].map(({ icon: Icon, label, value }, i) => (
          <div key={i} className="glass-card p-4 text-center">
            <Icon className="w-5 h-5 mx-auto text-brand-500 mb-2" />
            <p className="text-xs text-gray-400">{label}</p>
            <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{value}</p>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-brand-500" />
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{t('analyses.summary')}</h2>
        </div>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{analysis.summary}</p>
      </div>

      {/* Topics */}
      {analysis.key_topics?.length > 0 && (
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-5 h-5 text-brand-500" />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{t('analyses.keyTopics')}</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {analysis.key_topics.map((topic, i) => (
              <span key={i} className="badge bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400">{topic}</span>
            ))}
          </div>
        </div>
      )}

      {/* Action Items */}
      {analysis.action_items?.length > 0 && (
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckSquare className="w-5 h-5 text-brand-500" />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{t('analyses.actionItems')}</h2>
          </div>
          <div className="space-y-2">
            {analysis.action_items.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <div className="w-6 h-6 rounded-lg gradient-bg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-gray-700 dark:text-gray-300">{item}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transcription */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-brand-500" />
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{t('analyses.transcription')}</h2>
        </div>
        <div className="max-h-96 overflow-y-auto p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{analysis.transcription}</p>
        </div>
      </div>

      {/* Sentiment gauge */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">{t('analyses.sentiment')} Score</h2>
        <div className="relative h-4 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full overflow-hidden">
          <div
            className="absolute top-0 bottom-0 w-1 bg-white shadow-lg rounded-full transition-all duration-500"
            style={{ left: `${sentScore}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-400">
          <span>{t('sentiment.negative')}</span>
          <span>{t('sentiment.neutral')}</span>
          <span>{t('sentiment.positive')}</span>
        </div>
      </div>
    </div>
  )
}
