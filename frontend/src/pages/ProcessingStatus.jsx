import {
  Loader2, CheckCircle2, AlertCircle, Clock, FolderOpen,
  Headphones, Sparkles, Database, ChevronRight, Trash2, Activity
} from 'lucide-react'
import { useProcessing } from '../hooks/useProcessing'

const STAGES = {
  downloading:  { icon: FolderOpen,   color: 'text-blue-500',   bg: 'bg-blue-100 dark:bg-blue-500/20',   label: 'Baixando',       pct: 10 },
  transcribing: { icon: Headphones,   color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-500/20', label: 'Transcrevendo',  pct: 40 },
  analyzing:    { icon: Sparkles,     color: 'text-amber-500',  bg: 'bg-amber-100 dark:bg-amber-500/20',  label: 'Analisando IA',  pct: 75 },
  saving:       { icon: Database,     color: 'text-cyan-500',   bg: 'bg-cyan-100 dark:bg-cyan-500/20',    label: 'Salvando',       pct: 90 },
  done:         { icon: CheckCircle2, color: 'text-green-500',  bg: 'bg-green-100 dark:bg-green-500/20',  label: 'Concluido',      pct: 100 },
  error:        { icon: AlertCircle,  color: 'text-red-500',    bg: 'bg-red-100 dark:bg-red-500/20',      label: 'Erro',           pct: 100 },
}

export default function ProcessingStatus({ onNavigate }) {
  const { queue, isRunning, summary, clearQueue } = useProcessing()

  const doneCount = queue.filter(q => q.status === 'done').length
  const errorCount = queue.filter(q => q.status === 'error').length
  const totalCount = queue.length
  const globalPct = totalCount > 0 ? Math.round(((doneCount + errorCount) / totalCount) * 100) : 0

  if (queue.length === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center max-w-md animate-[fadeIn_0.5s_ease-out]">
          <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <Activity className="w-12 h-12 text-gray-300 dark:text-gray-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Nenhum processamento</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Inicie o processamento de audios na tela "Processar" para acompanhar o progresso aqui.
          </p>
          <button onClick={() => onNavigate('process')} className="btn-primary">
            Ir para Processar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-[fadeIn_0.3s_ease-out]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            {isRunning && <Loader2 className="w-7 h-7 animate-spin text-brand-500" />}
            Processamento
          </h1>
          <p className="text-gray-500 mt-1">
            {isRunning ? 'Processando audios em tempo real...' : summary ? 'Processamento finalizado' : ''}
          </p>
        </div>
        {!isRunning && queue.length > 0 && (
          <button onClick={clearQueue} className="btn-secondary flex items-center gap-2 text-sm">
            <Trash2 className="w-4 h-4" /> Limpar
          </button>
        )}
      </div>

      {/* Global progress card */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="3"
                  className="text-gray-200 dark:text-gray-800" />
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="3"
                  strokeDasharray={`${globalPct * 0.974} 97.4`} strokeLinecap="round"
                  className="text-brand-500 transition-all duration-700" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{globalPct}%</span>
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{doneCount}/{totalCount}</p>
              <p className="text-sm text-gray-500">audios concluidos</p>
            </div>
          </div>
          <div className="flex gap-6 text-center">
            <div>
              <p className="text-xl font-bold text-green-500">{doneCount}</p>
              <p className="text-xs text-gray-400">Sucesso</p>
            </div>
            <div>
              <p className="text-xl font-bold text-red-500">{errorCount}</p>
              <p className="text-xs text-gray-400">Erros</p>
            </div>
            <div>
              <p className="text-xl font-bold text-gray-400">{totalCount - doneCount - errorCount}</p>
              <p className="text-xs text-gray-400">Pendentes</p>
            </div>
          </div>
        </div>

        {/* Full progress bar */}
        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${globalPct}%`,
              background: errorCount > 0 && !isRunning
                ? 'linear-gradient(90deg, #22c55e, #22c55e 80%, #ef4444)'
                : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%)',
            }} />
        </div>
      </div>

      {/* Stage legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(STAGES).filter(([k]) => k !== 'error').map(([key, s]) => (
          <div key={key} className="flex items-center gap-1.5 text-xs text-gray-500">
            <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      {/* File queue */}
      <div className="space-y-2">
        {queue.map((q, i) => {
          const stage = STAGES[q.stage] || STAGES.downloading
          const filePct = q.status === 'done' ? 100 : q.status === 'error' ? 100 :
            q.status === 'processing' ? (STAGES[q.stage]?.pct || 5) : 0

          return (
            <div key={i}
              className={`glass-card p-4 transition-all
                ${q.status === 'processing' ? 'ring-2 ring-brand-500/30 shadow-lg shadow-brand-500/10' : ''}
                ${q.result ? 'cursor-pointer hover:shadow-lg hover:-translate-y-0.5' : ''}`}
              onClick={() => q.result && onNavigate('detail', q.result.id)}
            >
              <div className="flex items-center gap-4">
                {/* Status icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  q.status === 'processing' ? 'bg-brand-100 dark:bg-brand-500/20' :
                  q.status === 'done' ? STAGES.done.bg :
                  q.status === 'error' ? STAGES.error.bg :
                  'bg-gray-100 dark:bg-gray-800'
                }`}>
                  {q.status === 'processing'
                    ? <Loader2 className="w-5 h-5 text-brand-500 animate-spin" />
                    : q.status === 'done' ? <CheckCircle2 className="w-5 h-5 text-green-500" />
                    : q.status === 'error' ? <AlertCircle className="w-5 h-5 text-red-500" />
                    : <Clock className="w-5 h-5 text-gray-400" />
                  }
                </div>

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className={`text-sm font-semibold truncate ${
                      q.status === 'processing' ? 'text-brand-700 dark:text-brand-300' :
                      q.status === 'done' ? 'text-gray-800 dark:text-gray-200' :
                      q.status === 'error' ? 'text-red-600 dark:text-red-400' :
                      'text-gray-500'
                    }`}>{q.name}</p>

                    {q.result?.category_name && (
                      <span className="badge text-xs bg-brand-100 dark:bg-brand-500/20 text-brand-600">
                        {q.result.category_name}
                      </span>
                    )}
                    {q.result?.sentiment && (
                      <span className={`badge text-xs ${
                        q.result.sentiment === 'positive' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' :
                        q.result.sentiment === 'negative' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' :
                        'bg-gray-100 text-gray-600'
                      }`}>{q.result.sentiment}</span>
                    )}
                  </div>

                  {/* Stage description */}
                  <p className={`text-xs ${q.status === 'processing' ? 'text-brand-500 font-medium' : 'text-gray-400'}`}>
                    {q.status === 'processing' && q.stage && (
                      <span className="inline-flex items-center gap-1">
                        {(() => { const S = STAGES[q.stage]?.icon || Clock; return <S className="w-3 h-3" /> })()}
                        {q.message}
                      </span>
                    )}
                    {q.status === 'done' && q.result?.summary && q.result.summary.slice(0, 100) + (q.result.summary.length > 100 ? '...' : '')}
                    {q.status === 'pending' && 'Aguardando na fila...'}
                    {q.status === 'error' && q.message}
                  </p>

                  {/* Per-file progress bar */}
                  <div className="mt-2 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${
                      q.status === 'error' ? 'bg-red-500' :
                      q.status === 'done' ? 'bg-green-500' :
                      q.status === 'processing' ? 'bg-brand-500' : 'bg-gray-300 dark:bg-gray-700'
                    }`} style={{ width: `${filePct}%` }} />
                  </div>
                  <div className="flex justify-between mt-0.5">
                    <span className="text-[10px] text-gray-400">
                      {q.status === 'processing' ? STAGES[q.stage]?.label || '' : q.status === 'done' ? 'Completo' : q.status === 'error' ? 'Falhou' : ''}
                    </span>
                    <span className="text-[10px] font-medium text-gray-400">{filePct}%</span>
                  </div>
                </div>

                {/* Wave animation or chevron */}
                {q.status === 'processing' && (
                  <div className="flex gap-0.5 flex-shrink-0">
                    {[...Array(5)].map((_, j) => (
                      <div key={j} className="w-1 bg-brand-500 rounded-full wave-animation"
                        style={{ height: `${8 + Math.random() * 14}px`, animationDelay: `${j * 0.12}s` }} />
                    ))}
                  </div>
                )}
                {q.result && <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />}
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary */}
      {summary && (
        <div className="glass-card p-5 flex items-center justify-between animate-[slideIn_0.3s_ease-out]">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-500" />
            <div>
              <p className="font-semibold text-gray-800 dark:text-gray-200">Processamento finalizado</p>
              <p className="text-sm text-gray-500">
                {summary.processed} processados
                {summary.errors > 0 && <span className="text-red-500 ml-1">| {summary.errors} erros</span>}
              </p>
            </div>
          </div>
          <button onClick={() => onNavigate('analyses')} className="btn-primary !py-2 text-sm">
            Ver Analises
          </button>
        </div>
      )}
    </div>
  )
}
