import type { Pattern } from './catalog'
import { normalizeDna, type Dna } from './visualDna'
import { projectContextEntries, type ProjectContext } from './projectContext'

export type VisualContradictionSignal = {
  id: string
  title: string
  detail: string
  affectedPatterns: string[]
}

/** Deterministic Phase-1 contradictions only. Broader visual-quality scoring belongs to later phases. */
export function visualContradictionSignals(rawDna: Dna, selectedPatterns: Pattern[] = [], context?: ProjectContext): VisualContradictionSignal[] {
  const dna = normalizeDna(rawDna)
  const ids = new Set(selectedPatterns.map((pattern) => pattern.id))
  const signals: VisualContradictionSignal[] = []
  const add = (id: string, detail: string, affectedPatterns: string[] = []) => signals.push({ id, title: 'Visual contradiction', detail, affectedPatterns })

  if (dna.visualAntiPatterns.includes('Glassmorphism') && (dna.glassUsage !== 'None' || dna.backgroundTreatment === 'Glass' || ids.has('glass-panel'))) {
    add('visual-conflict-glass-exclusion', 'Glassmorphism is explicitly excluded while a glass treatment or Localized Glass Panel is still selected. Remove the glass direction or relax the exclusion.', ids.has('glass-panel') ? ['glass-panel'] : [])
  }
  if (dna.visualAntiPatterns.includes('Gradient-heavy UI') && dna.gradientUsage === 'Frequent') {
    add('visual-conflict-gradient-exclusion', 'Gradient-heavy UI is explicitly excluded while gradient usage is set to Frequent. Reduce gradient usage or relax the exclusion.')
  }
  if (dna.visualAntiPatterns.includes('Excessive pills') && dna.pillUsage === 'Frequent') {
    add('visual-conflict-pill-exclusion', 'Excessive pills are explicitly excluded while pill usage is set to Frequent. Reserve pills for compact semantic controls or relax the exclusion.')
  }

  const typographyPatterns = ['editorial-type', 'technical-type', 'display-sans'].filter((id) => ids.has(id))
  if (typographyPatterns.length > 1) {
    add('visual-conflict-competing-type-patterns', 'Multiple competing typography patterns are selected. Resolve them into one hierarchy instead of asking implementation to satisfy unrelated type directions simultaneously.', typographyPatterns)
  }
  if (ids.has('editorial-type') && !dna.headingTypography.includes('serif') && !dna.bodyTypography.includes('serif')) {
    add('visual-conflict-editorial-type', 'Editorial Type Pairing is selected, but neither heading nor body typography currently uses a serif character. Align the typography settings or remove the pattern.', ['editorial-type'])
  }
  if (ids.has('display-sans') && dna.headingTypography.includes('serif')) {
    add('visual-conflict-display-sans', 'Bold Display Sans is selected while the heading character is serif-led. Choose which direction is authoritative instead of compiling both.', ['display-sans'])
  }

  if (context) {
    const text = projectContextEntries(context).map((entry) => entry.value).join(' ').toLowerCase()
    const physicalRetail = /\b(car accessories|automotive|physical shop|physical store|shop location|store location|visit the shop|products? in store)\b/.test(text)
    if (physicalRetail && dna.imageryMode === 'Product screenshots') {
      add('visual-conflict-physical-retail-screenshots', 'Product screenshots are selected for a physical retail/product context. Prefer real products, installation details, storefront/location imagery, or another domain-appropriate media direction.')
    }
  }

  return signals
}
