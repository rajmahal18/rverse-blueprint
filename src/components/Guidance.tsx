import { createContext, useContext, type ReactNode } from 'react'
import { ListChecks } from 'lucide-react'

type GuidanceContextValue = {
  tldrMode: boolean
}

const GuidanceContext = createContext<GuidanceContextValue>({ tldrMode: false })

export function GuidanceProvider({ tldrMode, children }: { tldrMode: boolean; children: ReactNode }) {
  return <GuidanceContext.Provider value={{ tldrMode }}>{children}</GuidanceContext.Provider>
}

export function useGuidanceMode() {
  return useContext(GuidanceContext)
}

export function GuidanceToggle({ active, onToggle, compact = false }: { active: boolean; onToggle: () => void; compact?: boolean }) {
  return <button type="button" className={`tldr-toggle ${active ? 'active' : ''} ${compact ? 'compact' : ''}`} onClick={onToggle} aria-pressed={active} title="Shorten dense explanatory sections without hiding blockers, status, or actions">
    <ListChecks size={compact ? 14 : 15}/><span>{active ? 'TL;DR on' : 'TL;DR mode'}</span>
  </button>
}

export function ConceptInfo({ label, children }: { label: string; children: ReactNode }) {
  return <details className="concept-info">
    <summary aria-label={`What is ${label}?`} title={`What is ${label}?`}><span aria-hidden="true">i</span></summary>
    <div className="concept-popover" role="note"><strong>{label}</strong><p>{children}</p></div>
  </details>
}

export function TldrSummary({ children, label = 'TL;DR', title }: { children: ReactNode; label?: string; title?: string }) {
  const { tldrMode } = useGuidanceMode()
  if (!tldrMode) return null
  return <div className="tldr-summary"><span>{label}</span><p>{title && <strong className="tldr-summary-title">{title}</strong>}{children}</p></div>
}

export function TldrOnly({ children }: { children: ReactNode }) {
  const { tldrMode } = useGuidanceMode()
  return tldrMode ? <>{children}</> : null
}

export function VerboseOnly({ children }: { children: ReactNode }) {
  const { tldrMode } = useGuidanceMode()
  return tldrMode ? null : <>{children}</>
}
