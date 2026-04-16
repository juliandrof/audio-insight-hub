import { useState } from 'react'
import {
  LayoutDashboard, Headphones, FileText, Settings,
  Menu, X, AudioWaveform, Globe, Moon, Sun
} from 'lucide-react'
import { useTranslation } from './i18n/useTranslation'
import { ToastProvider } from './hooks/useToast'
import Dashboard from './pages/Dashboard'
import ProcessPage from './pages/ProcessPage'
import AnalysesPage from './pages/AnalysesPage'
import AnalysisDetail from './pages/AnalysisDetail'
import SettingsPage from './pages/SettingsPage'

const LANGUAGES = [
  { code: 'pt', label: 'PT', flag: '\u{1F1E7}\u{1F1F7}' },
  { code: 'en', label: 'EN', flag: '\u{1F1FA}\u{1F1F8}' },
  { code: 'es', label: 'ES', flag: '\u{1F1EA}\u{1F1F8}' },
]

export default function App() {
  const { t, locale, changeLocale } = useTranslation()
  const [page, setPage] = useState('dashboard')
  const [detailId, setDetailId] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('aih-dark')
    if (saved === 'true') {
      document.documentElement.classList.add('dark')
      return true
    }
    return false
  })

  const toggleDark = () => {
    const next = !dark
    setDark(next)
    localStorage.setItem('aih-dark', String(next))
    document.documentElement.classList.toggle('dark', next)
  }

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: t('nav.dashboard') },
    { id: 'process', icon: Headphones, label: 'Processar' },
    { id: 'analyses', icon: FileText, label: t('nav.analyses') },
    { id: 'settings', icon: Settings, label: t('nav.settings') },
  ]

  const navigate = (p, id) => {
    setPage(p)
    if (id !== undefined) setDetailId(id)
    setSidebarOpen(false)
  }

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard />
      case 'process': return <ProcessPage onNavigate={navigate} />
      case 'analyses': return <AnalysesPage onNavigate={navigate} />
      case 'detail': return <AnalysisDetail id={detailId} onBack={() => navigate('analyses')} />
      case 'settings': return <SettingsPage />
      default: return <Dashboard />
    }
  }

  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-out
          lg:relative lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl
          border-r border-gray-200/50 dark:border-gray-800/50
          flex flex-col
        `}>
          {/* Logo */}
          <div className="p-6 border-b border-gray-200/50 dark:border-gray-800/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-brand-500/25">
                <AudioWaveform className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold gradient-text">{t('app.title')}</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('app.subtitle')}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => navigate(id)}
                className={`sidebar-link w-full text-left ${page === id ? 'sidebar-link-active' : ''}`}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </button>
            ))}
          </nav>

          {/* Bottom controls */}
          <div className="p-4 border-t border-gray-200/50 dark:border-gray-800/50 space-y-3">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-gray-400" />
              <div className="flex gap-1">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLocale(lang.code)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      locale === lang.code
                        ? 'bg-brand-500 text-white shadow-sm'
                        : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {lang.flag} {lang.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={toggleDark}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span>{dark ? t('settings.light') : t('settings.dark')}</span>
            </button>
          </div>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50">
            <div className="flex items-center justify-between px-4 lg:px-8 h-16">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div className="flex items-center gap-2 ml-auto">
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-500/10">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-medium text-green-600 dark:text-green-400">AI Online</span>
                </div>
              </div>
            </div>
          </header>

          <div className="p-4 lg:p-8 animate-[fadeIn_0.3s_ease-out]" key={page + (detailId || '')}>
            {renderPage()}
          </div>
        </main>
      </div>
    </ToastProvider>
  )
}
