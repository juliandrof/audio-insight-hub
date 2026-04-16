import { useState, useEffect } from 'react'
import {
  Search, Download, Trash2, ThumbsUp, ThumbsDown, Minus, FileAudio
} from 'lucide-react'
import { useTranslation } from '../i18n/useTranslation'
import { useApi } from '../hooks/useApi'
import { useToast } from '../hooks/useToast'

const sentimentIcons = {
  positive: { icon: ThumbsUp, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-500/20' },
  negative: { icon: ThumbsDown, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-500/20' },
  neutral: { icon: Minus, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-500/20' },
}

const urgencyColors = {
  low: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
  normal: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
  high: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400',
  critical: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
}

export default function AnalysesPage({ onNavigate }) {
  const { t } = useTranslation()
  const api = useApi()
  const toast = useToast()
  const [analyses, setAnalyses] = useState([])
  const [categories, setCategories] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [filterSent, setFilterSent] = useState('')

  const loadData = async () => {
    setLoading(true)
    try {
      const [analysesRes, catsRes] = await Promise.all([
        api.fetchAnalyses({
          search: search || undefined,
          category_id: filterCat || undefined,
          sentiment: filterSent || undefined,
        }),
        api.fetchCategories(),
      ])
      setAnalyses(analysesRes.items)
      setTotal(analysesRes.total)
      setCategories(catsRes)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [search, filterCat, filterSent])

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    if (!confirm('Confirm delete?')) return
    await api.deleteAnalysis(id)
    toast.success('Deleted')
    loadData()
  }

  const handleExportPdf = async (e, id) => {
    e.stopPropagation()
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

  const handleExportAll = async () => {
    try {
      const blob = await api.exportAllPdf()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'relatorio_completo.pdf'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Export failed')
    }
  }

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('analyses.title')}</h1>
          <p className="text-gray-500 mt-1">{total} {total === 1 ? 'resultado' : 'resultados'}</p>
        </div>
        <button onClick={handleExportAll} className="btn-secondary flex items-center gap-2">
          <Download className="w-4 h-4" />
          {t('analyses.exportAll')}
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('analyses.search')}
              className="input-field pl-10"
            />
          </div>
          <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="input-field w-full sm:w-48">
            <option value="">{t('analyses.filterCategory')}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select value={filterSent} onChange={(e) => setFilterSent(e.target.value)} className="input-field w-full sm:w-48">
            <option value="">{t('analyses.filterSentiment')}</option>
            <option value="positive">{t('sentiment.positive')}</option>
            <option value="negative">{t('sentiment.negative')}</option>
            <option value="neutral">{t('sentiment.neutral')}</option>
          </select>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-6 shimmer h-32" />
          ))}
        </div>
      ) : analyses.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <FileAudio className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-700 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">{t('analyses.noResults')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {analyses.map((a, i) => {
            const sent = sentimentIcons[a.sentiment] || sentimentIcons.neutral
            const SentIcon = sent.icon
            return (
              <div
                key={a.id}
                className="glass-card-hover p-5 cursor-pointer animate-[fadeIn_0.3s_ease-out]"
                style={{ animationDelay: `${i * 30}ms` }}
                onClick={() => onNavigate('detail', a.id)}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl ${sent.bg} flex items-center justify-center flex-shrink-0`}>
                    <SentIcon className={`w-5 h-5 ${sent.color}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200 truncate">{a.file_name}</h3>
                      {a.category_name && (
                        <span className="badge text-xs" style={{ backgroundColor: `${a.category_color}20`, color: a.category_color }}>
                          {a.category_name}
                        </span>
                      )}
                      <span className={`badge text-xs ${urgencyColors[a.urgency_level] || urgencyColors.normal}`}>
                        {a.urgency_level}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{a.summary}</p>
                    {a.key_topics?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {a.key_topics.slice(0, 4).map((topic, j) => (
                          <span key={j} className="text-xs px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-500">
                            {topic}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={(e) => handleExportPdf(e, a.id)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-brand-500 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, a.id)}
                      className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
