import { useState, useEffect } from 'react'
import {
  BarChart3, TrendingUp, AudioWaveform, ThumbsUp, ThumbsDown
} from 'lucide-react'
import { useTranslation } from '../i18n/useTranslation'
import { useApi } from '../hooks/useApi'

export default function Dashboard() {
  const { t } = useTranslation()
  const api = useApi()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.fetchStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-brand-200 dark:border-brand-800" />
            <div className="absolute inset-0 rounded-full border-4 border-brand-500 border-t-transparent animate-spin" />
          </div>
          <p className="text-gray-500 font-medium">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  if (!stats || stats.total_analyses === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center max-w-md animate-[fadeIn_0.5s_ease-out]">
          <div className="w-24 h-24 mx-auto mb-6 rounded-2xl gradient-bg flex items-center justify-center animate-float">
            <AudioWaveform className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">{t('dashboard.title')}</h2>
          <p className="text-gray-500 dark:text-gray-400">{t('dashboard.noData')}</p>
        </div>
      </div>
    )
  }

  const sentimentPercent = Math.round((stats.avg_sentiment_score || 0.5) * 100)
  const pos = stats.sentiments?.positive || 0
  const neg = stats.sentiments?.negative || 0
  const neu = stats.sentiments?.neutral || 0
  const sentTotal = pos + neg + neu || 1

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('dashboard.title')}</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-500/20 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            </div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('dashboard.totalAnalyses')}</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total_analyses}</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('dashboard.avgSentiment')}</span>
          </div>
          <div className="flex items-end gap-2">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{sentimentPercent}%</p>
            <span className={`text-sm font-medium mb-1 ${sentimentPercent >= 60 ? 'text-green-500' : sentimentPercent >= 40 ? 'text-yellow-500' : 'text-red-500'}`}>
              {sentimentPercent >= 60 ? t('sentiment.positive') : sentimentPercent >= 40 ? t('sentiment.neutral') : t('sentiment.negative')}
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
              <ThumbsUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('dashboard.positive')}</span>
          </div>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">{pos}</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
              <ThumbsDown className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('dashboard.negative')}</span>
          </div>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">{neg}</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sentiment donut chart (CSS) */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6">{t('dashboard.sentimentOverview')}</h3>
          <div className="flex items-center justify-center gap-8">
            <div className="relative w-48 h-48">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e5e7eb" strokeWidth="3" className="dark:stroke-gray-800" />
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="#22c55e" strokeWidth="3"
                  strokeDasharray={`${(pos / sentTotal) * 97.4} 97.4`} strokeDashoffset="0" strokeLinecap="round"
                  className="transition-all duration-1000" />
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="#ef4444" strokeWidth="3"
                  strokeDasharray={`${(neg / sentTotal) * 97.4} 97.4`}
                  strokeDashoffset={`${-(pos / sentTotal) * 97.4}`} strokeLinecap="round"
                  className="transition-all duration-1000" />
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="#94a3b8" strokeWidth="3"
                  strokeDasharray={`${(neu / sentTotal) * 97.4} 97.4`}
                  strokeDashoffset={`${-((pos + neg) / sentTotal) * 97.4}`} strokeLinecap="round"
                  className="transition-all duration-1000" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{stats.total_analyses}</p>
                  <p className="text-xs text-gray-400">Total</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">{t('dashboard.positive')} ({pos})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">{t('dashboard.negative')} ({neg})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">{t('dashboard.neutral')} ({neu})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6">{t('dashboard.categoryDistribution')}</h3>
          <div className="space-y-3">
            {stats.categories?.filter(c => c.count > 0).map((cat, i) => {
              const maxCount = Math.max(...stats.categories.map(c => c.count), 1)
              return (
                <div key={i} className="group">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{cat.name}</span>
                    <span className="text-sm font-bold" style={{ color: cat.color }}>{cat.count}</span>
                  </div>
                  <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${(cat.count / maxCount) * 100}%`,
                        background: `linear-gradient(90deg, ${cat.color}, ${cat.color}cc)`,
                      }}
                    />
                  </div>
                </div>
              )
            })}
            {(!stats.categories || stats.categories.every(c => c.count === 0)) && (
              <p className="text-sm text-gray-400 text-center py-8">{t('dashboard.noData')}</p>
            )}
          </div>
        </div>
      </div>

      {/* Timeline and Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline bar chart */}
        <div className="glass-card p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6">{t('dashboard.timeline')}</h3>
          {stats.timeline?.length > 0 ? (
            <div className="flex items-end gap-1 h-40">
              {stats.timeline.map((t, i) => {
                const maxC = Math.max(...stats.timeline.map(x => x.count), 1)
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group" title={`${t.date}: ${t.count}`}>
                    <span className="text-xs font-medium text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      {t.count}
                    </span>
                    <div
                      className="w-full rounded-t-lg gradient-bg transition-all duration-500 group-hover:opacity-80 min-h-[4px]"
                      style={{ height: `${(t.count / maxC) * 100}%` }}
                    />
                    <span className="text-[9px] text-gray-400 -rotate-45 origin-top-left mt-1">{t.date.slice(5)}</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-12">{t('dashboard.noData')}</p>
          )}
        </div>

        {/* Top Topics */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">{t('dashboard.topTopics')}</h3>
          <div className="space-y-3">
            {stats.top_topics?.slice(0, 8).map((topic, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-lg bg-brand-100 dark:bg-brand-500/20 flex items-center justify-center text-xs font-bold text-brand-600">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{topic.topic}</span>
                    <span className="text-xs font-medium text-gray-400 ml-2">{topic.count}</span>
                  </div>
                  <div className="mt-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full gradient-bg transition-all duration-700"
                      style={{ width: `${Math.min(100, (topic.count / (stats.top_topics[0]?.count || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
            {(!stats.top_topics || stats.top_topics.length === 0) && (
              <p className="text-sm text-gray-400 text-center py-4">{t('dashboard.noData')}</p>
            )}
          </div>
        </div>
      </div>

      {/* Urgency levels */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">{t('dashboard.urgencyLevels')}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { key: 'low', label: t('urgency.low'), color: 'bg-green-500', bg: 'bg-green-50 dark:bg-green-500/10' },
            { key: 'normal', label: t('urgency.normal'), color: 'bg-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
            { key: 'high', label: t('urgency.high'), color: 'bg-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-500/10' },
            { key: 'critical', label: t('urgency.critical'), color: 'bg-red-500', bg: 'bg-red-50 dark:bg-red-500/10' },
          ].map((u) => (
            <div key={u.key} className={`${u.bg} rounded-xl p-4 text-center`}>
              <div className={`w-3 h-3 rounded-full ${u.color} mx-auto mb-2`} />
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{stats.urgency?.[u.key] || 0}</p>
              <p className="text-xs text-gray-500 mt-1">{u.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
