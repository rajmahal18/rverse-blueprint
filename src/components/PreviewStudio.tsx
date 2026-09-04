import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle, Check, ChevronRight, Eye, Image as ImageIcon, Monitor, RotateCcw, Save,
  Smartphone, Sparkles, Tablet, TriangleAlert,
} from 'lucide-react'
import { fontFamilyFor, normalizeDna, type Dna, type NavigationVariant, type SectionStrategy, type TypographyCharacter } from '../data/visualDna'
import type { DirectionRecommendation, PatternExplorerIntelligence } from '../data/patternIntelligence'
import type { PageComposition, PageCompositionIntelligence } from '../data/pageComposition'
import type { VisualDirectorOutput } from '../data/visualDirector'
import { previewStudioIntelligence, responsivePreviewPlan, type PlaceholderMedia, type PreviewDevice } from '../data/previewStudio'
import { approvalInteractionStates, type VisualApprovalEvaluation } from '../data/visualApproval'
import { ConceptInfo, TldrSummary, VerboseOnly, useGuidanceMode } from './Guidance'

const typographyOptions: TypographyCharacter[] = ['Neo-grotesk', 'Humanist sans', 'Geometric sans', 'Rounded sans', 'Editorial serif', 'Display / expressive']
const navOptions: NavigationVariant[] = ['Auto / Recommended', 'Top bar', 'Compact header', 'Sidebar', 'Bottom dock']
const sectionOptions: SectionStrategy[] = ['Uniform', 'Alternating subtle sections', 'Strong separated sections', 'Tonal layering', 'Editorial blocks', 'Mixed']

function clamp(value: number, min: number, max: number) { return Math.min(max, Math.max(min, value)) }

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="preview-control-field"><span>{label}</span>{children}</label>
}

function Range({ label, value, min, max, step = 1, suffix = '', onChange }: { label: string; value: number; min: number; max: number; step?: number; suffix?: string; onChange: (value: number) => void }) {
  return <label className="preview-control-range"><div><span>{label}</span><b>{value}{suffix}</b></div><input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))}/></label>
}

function MediaPlaceholder({ media, dna, compact = false }: { media: PlaceholderMedia; dna: Dna; compact?: boolean }) {
  if (!media.enabled) return <div className={`preview-media preview-media-disabled ${compact ? 'compact' : ''}`}><div><ImageIcon size={compact ? 11 : 14}/><span>Placeholder imagery disabled</span><small>Media Assistance is Off</small></div></div>
  return <div className={`preview-media preview-media-${media.kind} ${compact ? 'compact' : ''}`}>
    <div className="preview-media-art" aria-hidden="true"><i/><i/><i/><i/></div>
    <div><ImageIcon size={compact ? 11 : 14}/><span>{media.label}</span><small>{dna.imageCharacter} · {dna.imageTreatment}</small></div>
  </div>
}

function SectionLabel({ section }: { section?: PageComposition['sections'][number] }) {
  if (!section) return null
  return <div className="preview-section-label"><span>{section.label}</span><small>{section.role}</small></div>
}

function PreviewNav({ dna, device, projectName, domain, interactionId }: { dna: Dna; device: PreviewDevice; projectName: string; domain: string; interactionId: string }) {
  const resolved = dna.navigationVariant === 'Auto / Recommended'
    ? domain === 'government-workforce' ? 'Sidebar' : domain === 'booking-consumer' && device === 'mobile' ? 'Bottom dock' : 'Compact header'
    : dna.navigationVariant
  if (resolved === 'Sidebar' && device !== 'mobile') return <aside className={`render-sidebar ${interactionId === 'nav-active' ? 'interaction-active' : ''}`}><div className="render-brand">{projectName.slice(0, 2).toUpperCase()}</div><span className={interactionId === 'nav-active' ? 'active' : ''}>Overview</span><span>Records</span><span>Activity</span><i/><small>Workspace</small></aside>
  return <header className={`render-topnav nav-${resolved.toLowerCase().replaceAll(' ', '-')} ${interactionId === 'nav-active' ? 'interaction-active' : ''}`}><strong>{projectName}</strong><div><span className={interactionId === 'nav-active' ? 'active' : ''}>Overview</span><span>Details</span><button>Primary action</button></div></header>
}

function AutomotivePreview({ page, dna, media, device, interactionId }: { page: PageComposition; dna: Dna; media: PlaceholderMedia; device: PreviewDevice; interactionId: string }) {
  const mobile = device === 'mobile'
  return <div className="domain-preview automotive-preview">
    <section className={`auto-hero ${mobile ? 'mobile-order' : ''}`}>
      <div className="auto-copy"><small>AUTOMOTIVE ACCESSORIES</small><h1>{page.name === 'Homepage' ? 'Built for the road. Chosen for your car.' : page.name}</h1><p>{page.purpose}</p><button className={interactionId === 'cta-pressed' ? 'interaction-pressed' : ''}>View upgrades <ChevronRight size={11}/></button></div>
      <MediaPlaceholder media={media} dna={dna}/>
    </section>
    <section className="auto-category-rail">{page.sections.slice(0, 4).map((section, index) => <div key={section.id}><b>0{index + 1}</b><SectionLabel section={section}/></div>)}</section>
    <section className="auto-story"><MediaPlaceholder media={media} dna={dna} compact/><div><small>PRODUCT DETAIL</small><h2>{page.visualAnchor}</h2><p>{page.contentRhythm}</p></div></section>
    <section className="auto-location"><div><small>VISIT / CONTACT</small><strong>{page.primaryInteraction}</strong></div><button>Directions</button></section>
  </div>
}

function ClinicPreview({ page, dna, media, device, interactionId }: { page: PageComposition; dna: Dna; media: PlaceholderMedia; device: PreviewDevice; interactionId: string }) {
  const rows = page.sections.slice(0, 4)
  return <div className="domain-preview clinic-preview">
    <section className="clinic-status"><div><small>{page.name}</small><strong>{device === 'mobile' ? 'Today’s priority work' : page.purpose}</strong></div><span>Operational</span></section>
    <section className={`clinic-work ${device === 'mobile' ? 'mobile-stack' : ''}`}>
      <div className="clinic-queue"><div className="mini-heading"><span>Current queue</span><b>{rows.length + 3} active</b></div>{rows.map((section, index) => <div className={`clinic-row ${interactionId === 'selected-patient' && index === 0 ? 'interaction-selected' : ''}`} key={section.id}><i>{index + 1}</i><SectionLabel section={section}/><span>{index === 0 ? 'Next' : index === 1 ? 'Review' : 'Open'}</span></div>)}</div>
      <div className="clinic-timeline"><div className="mini-heading"><span>Clinical timeline</span><small>Current patient</small></div>{rows.slice(0, 3).map((section) => <div key={section.id}><i/><span>{section.label}</span><small>{section.composition}</small></div>)}</div>
    </section>
    {dna.imageryMode !== 'None' && <MediaPlaceholder media={media} dna={dna} compact/>}
  </div>
}

function GovernmentPreview({ page, device, interactionId }: { page: PageComposition; device: PreviewDevice; interactionId: string }) {
  return <div className="domain-preview government-preview">
    <section className="gov-context"><div><small>OFFICE / WORKFORCE</small><h1>{page.name}</h1><p>{page.purpose}</p></div><div className="gov-seal-grid" aria-hidden="true"><i/><i/><i/><i/></div></section>
    <section className={`gov-work ${device === 'mobile' ? 'mobile-stack' : ''}`}>
      <div className="gov-priority"><div className="mini-heading"><span>Priority work</span><b>Role-aware</b></div>{page.sections.slice(0, 4).map((section, index) => <div className={`gov-row ${interactionId === 'selected-record' && index === 0 ? 'interaction-selected' : ''}`} key={section.id}><span>0{index + 1}</span><SectionLabel section={section}/><button>Open</button></div>)}</div>
      <div className="gov-directory"><div className="mini-heading"><span>Directory / records</span><small>Search + filter</small></div>{['Personnel record','Pending review','Recent change'].map((item) => <div key={item}><i/><span>{item}</span><small>Institutional record</small></div>)}</div>
    </section>
  </div>
}

function BookingPreview({ page, dna, media, device, interactionId }: { page: PageComposition; dna: Dna; media: PlaceholderMedia; device: PreviewDevice; interactionId: string }) {
  const slots = ['08:00','09:00','10:00','11:00','13:00','14:00','15:00','16:00']
  return <div className="domain-preview booking-preview">
    {device !== 'mobile' && <div className="booking-intro"><div><small>BOOK A COURT</small><h1>{page.name}</h1><p>{page.purpose}</p></div><MediaPlaceholder media={media} dna={dna} compact/></div>}
    <section className={`booking-work ${device === 'mobile' ? 'mobile-stack' : ''}`}>
      <div className="booking-calendar"><div className="mini-heading"><span>Friday · Court 01</span><small>Choose a time</small></div><div className="slot-grid">{slots.map((slot, index) => <button className={index === 4 ? 'blocked' : interactionId === 'selected-slot' && (index === 2 || index === 5) ? 'selected' : ''} key={slot}>{slot}</button>)}</div></div>
      <aside className="booking-summary"><small>YOUR SELECTION</small><strong>10:00 – 11:00</strong><span>1 court · 1 hour</span><b>₱500</b><button>Continue</button></aside>
    </section>
    {device === 'mobile' && <div className="booking-mobile-dock"><span>10:00 · ₱500</span><button>Continue</button></div>}
  </div>
}

function SportsPreview({ page, dna, media, device, interactionId }: { page: PageComposition; dna: Dna; media: PlaceholderMedia; device: PreviewDevice; interactionId: string }) {
  return <div className="domain-preview sports-preview">
    <section className="score-hero"><div><small>LIVE EVENT</small><h1>{page.name}</h1><p>{page.purpose}</p></div><div className="scoreboard"><span>TEAM A</span><strong>11</strong><i>LIVE</i><strong>08</strong><span>TEAM B</span></div></section>
    <section className={`sports-grid ${device === 'mobile' ? 'mobile-stack' : ''}`}><div className="sports-list"><div className="mini-heading"><span>Schedule / state</span><b>Live</b></div>{page.sections.slice(0, 4).map((section, index) => <div className={interactionId === 'selected-match' && index === 0 ? 'interaction-selected' : ''} key={section.id}><b>{index + 1}</b><SectionLabel section={section}/><span>{index === 0 ? 'LIVE' : 'NEXT'}</span></div>)}</div><MediaPlaceholder media={media} dna={dna}/></section>
  </div>
}

function PortfolioPreview({ page, dna, media, device, interactionId }: { page: PageComposition; dna: Dna; media: PlaceholderMedia; device: PreviewDevice; interactionId: string }) {
  return <div className="domain-preview portfolio-preview">
    <section className={`portfolio-intro ${device === 'mobile' ? 'mobile-order' : ''}`}><div><small>SELECTED WORK / 2026</small><h1>{page.name}</h1><p>{page.purpose}</p></div><strong>→</strong></section>
    <section className="portfolio-work-grid">{page.sections.slice(0, 4).map((section, index) => <article className={`work-${index + 1} ${interactionId === 'project-hover' && index === 0 ? 'interaction-hover' : ''}`} key={section.id}><MediaPlaceholder media={media} dna={dna} compact/><span>0{index + 1}</span><h2>{section.label}</h2><p>{section.role}</p></article>)}</section>
  </div>
}

function GeneralPreview({ page, interactionId }: { page: PageComposition; interactionId: string }) {
  return <div className="domain-preview general-preview"><section><small>PRIMARY WORKSPACE</small><h1>{page.name}</h1><p>{page.purpose}</p></section><div className="general-work">{page.sections.map((section) => <article className={interactionId === 'focus-control' ? 'interaction-focus' : ''} key={section.id}><SectionLabel section={section}/><p>{section.composition}</p></article>)}</div></div>
}

function PreviewCanvas({ projectName, domain, page, dna, media, device, interactionId }: { projectName: string; domain: string; page: PageComposition; dna: Dna; media: PlaceholderMedia; device: PreviewDevice; interactionId: string }) {
  const palette = dna.defaultTheme === 'Dark' && dna.themeMode !== 'Light only' ? dna.darkPalette : dna.palette
  const styles = {
    '--pv-ink': palette.ink,
    '--pv-bg': palette.background,
    '--pv-accent': palette.accent,
    '--pv-accent-fg': palette.accentForeground,
    '--pv-surface': palette.surface,
    '--pv-muted': palette.muted,
    '--pv-border': palette.border,
    '--pv-radius': `${dna.surfaceRadius}px`,
    '--pv-control-radius': `${dna.controlRadius}px`,
    '--pv-section-gap': `${clamp(dna.sectionSpacing / 5, 10, 34)}px`,
    '--pv-heading-scale': `${dna.headingScale / 100}`,
    '--pv-heading-weight': dna.headingWeight,
    '--pv-body-weight': dna.bodyWeight,
    '--pv-heading-font': fontFamilyFor(dna.headingTypography),
    '--pv-body-font': fontFamilyFor(dna.bodyTypography),
  } as React.CSSProperties
  const content = domain === 'automotive-retail' ? <AutomotivePreview page={page} dna={dna} media={media} device={device} interactionId={interactionId}/>
    : domain === 'clinic-operations' ? <ClinicPreview page={page} dna={dna} media={media} device={device} interactionId={interactionId}/>
      : domain === 'government-workforce' ? <GovernmentPreview page={page} device={device} interactionId={interactionId}/>
        : domain === 'booking-consumer' ? <BookingPreview page={page} dna={dna} media={media} device={device} interactionId={interactionId}/>
          : domain === 'sports-event' ? <SportsPreview page={page} dna={dna} media={media} device={device} interactionId={interactionId}/>
            : domain === 'portfolio-creative' ? <PortfolioPreview page={page} dna={dna} media={media} device={device} interactionId={interactionId}/>
              : <GeneralPreview page={page} interactionId={interactionId}/>
  return <div className={`preview-device-frame device-${device}`}><div className={`preview-product-canvas accent-${dna.accentUsage.toLowerCase().replaceAll(' ', '-')} section-${dna.sectionStrategy.toLowerCase().replaceAll(' ', '-')} imagery-${dna.imageTreatment.toLowerCase().replaceAll(' ', '-')} interaction-${interactionId}`} style={styles}>
    <div className="preview-browser-chrome"><div><i/><i/><i/></div><span>{projectName.toLowerCase().replaceAll(' ', '-')}.preview</span><b>{device}</b></div>
    <div className="preview-render-shell"><PreviewNav dna={dna} device={device} projectName={projectName} domain={domain} interactionId={interactionId}/><main>{page.scopeState === 'advisory' && <div className="preview-advisory-badge"><Eye size={11}/> Advisory design preview · scope not active</div>}{content}</main></div>
  </div></div>
}

export default function PreviewStudio({ projectName, dna: savedDna, director, patternIntel, pageIntel, visualContradictions, approval, onCommit, onApprove, onRevokeApproval }: {
  projectName: string
  dna: Dna
  director: VisualDirectorOutput
  patternIntel: PatternExplorerIntelligence
  pageIntel: PageCompositionIntelligence
  visualContradictions: string[]
  approval: VisualApprovalEvaluation
  onCommit: (dna: Dna, recommendation?: DirectionRecommendation) => void
  onApprove: (dna: Dna, recommendation?: DirectionRecommendation) => void
  onRevokeApproval: () => void
}) {
  const { tldrMode } = useGuidanceMode()
  const directions = useMemo(() => previewStudioIntelligence({ dna: savedDna, director, patternIntel, pageIntel }).directions, [savedDna, director, patternIntel, pageIntel])
  const [device, setDevice] = useState<PreviewDevice>('desktop')
  const [pageId, setPageId] = useState(pageIntel.pages[0]?.id ?? '')
  const [sourceId, setSourceId] = useState('saved')
  const [draft, setDraft] = useState(() => normalizeDna(savedDna))
  const [dirty, setDirty] = useState(false)
  const interactionStates = useMemo(() => approvalInteractionStates(pageIntel.domain), [pageIntel.domain])
  const [interactionId, setInteractionId] = useState(() => approvalInteractionStates(pageIntel.domain)[0]?.id ?? 'nav-active')
  const selectedPage = pageIntel.pages.find((page) => page.id === pageId) ?? pageIntel.pages[0]
  const selectedDirection = directions.find((direction) => direction.id === sourceId)

  useEffect(() => {
    if (!pageIntel.pages.some((page) => page.id === pageId)) setPageId(pageIntel.pages[0]?.id ?? '')
  }, [pageIntel.pages, pageId])

  useEffect(() => {
    if (sourceId === 'saved' && !dirty) setDraft(normalizeDna(savedDna))
  }, [savedDna, sourceId, dirty])

  useEffect(() => {
    if (!interactionStates.some((item) => item.id === interactionId)) setInteractionId(interactionStates[0]?.id ?? 'nav-active')
  }, [interactionId, interactionStates])

  const selectSource = (id: string) => {
    setSourceId(id)
    const direction = directions.find((item) => item.id === id)
    setDraft(normalizeDna(direction?.dna ?? savedDna))
    setDirty(false)
  }
  const patch = (next: Partial<Dna>) => { setDraft((current) => normalizeDna({ ...current, ...next })); setDirty(true) }
  const setTypography = (value: TypographyCharacter) => patch({ typographyCharacter: value, headingTypography: value, bodyTypography: value, typography: value })
  const setRadius = (value: number) => patch({ radius: clamp(value * 2.5, 0, 100), surfaceRadius: value, controlRadius: clamp(value * .75, 0, 32), buttonRadius: clamp(value * .8, 0, 40) })
  const resetDraft = () => { setDraft(normalizeDna(selectedDirection?.dna ?? savedDna)); setDirty(false) }
  const commit = () => { onCommit(normalizeDna(draft), selectedDirection?.recommendation); setSourceId('saved'); setDirty(false) }
  const approve = () => { onApprove(normalizeDna(draft), selectedDirection?.recommendation); setSourceId('saved'); setDirty(false) }

  if (!selectedPage) return <section className="preview-studio-empty"><Eye size={24}/><h2>No previewable page yet.</h2><p>Complete enough Project Context/App Setup for Page Composition Intelligence to generate a major page.</p></section>

  const intel = previewStudioIntelligence({ dna: draft, director, patternIntel, pageIntel, selectedPage, visualContradictions })
  const responsive = responsivePreviewPlan(selectedPage, device)

  return <div className="preview-studio">
    <header className={`preview-studio-header ${tldrMode ? 'preview-studio-header-tldr' : ''}`}><div><div className="eyebrow"><Sparkles size={13}/> Visual Preview Studio · approval loop <ConceptInfo label="Visual approval">An explicit freeze point for the visual contract. Approval records which visual direction implementation should treat as authoritative.</ConceptInfo></div><h1>See it, refine it, then approve it.</h1><p>{tldrMode ? 'Check the page, make only high-value refinements, then approve the visual contract.' : 'Compare directions, inspect page and interaction states across devices, refine high-value choices, then explicitly approve one stable Visual Contract for implementation.'}</p></div><div className="preview-scope-note"><strong>Preview authority <ConceptInfo label="Preview authority">The preview may demonstrate presentation and responsive behavior, but it cannot invent unselected product scope.</ConceptInfo></strong><span>{intel.scopeGuardrail}</span></div></header>
    <TldrSummary title="Preview loop">Choose a direction → inspect one major page → refine only what matters → approve for implementation.</TldrSummary>

    <div className="preview-studio-layout">
      <aside className="preview-control-panel">
        <section className="preview-control-section"><div className="preview-control-heading"><span>Direction</span><small>Recognition first</small></div><div className="preview-direction-tabs"><button className={sourceId === 'saved' ? 'active' : ''} onClick={() => selectSource('saved')}><b>Saved</b><span>Current Blueprint</span></button>{directions.map((direction) => <button className={sourceId === direction.id ? 'active' : ''} key={direction.id} onClick={() => selectSource(direction.id)}><b>{direction.slot}</b><span>{direction.name}</span></button>)}</div>{selectedDirection && <VerboseOnly><div className="preview-direction-note"><strong>{selectedDirection.name}</strong><p>{selectedDirection.description}</p><small>{selectedDirection.recommendation.originality} · {selectedDirection.recommendation.compatibility}</small></div></VerboseOnly>}</section>

        <section className="preview-control-section"><div className="preview-control-heading"><span>Page</span><small>{pageIntel.pages.length} generated</small></div><select value={selectedPage.id} onChange={(event) => setPageId(event.target.value)}>{pageIntel.pages.map((page) => <option value={page.id} key={page.id}>{page.name}{page.scopeState === 'advisory' ? ' · advisory' : ''}</option>)}</select><div className={`preview-page-scope ${selectedPage.scopeState}`}><strong>{selectedPage.scopeState === 'implementation' ? 'Implementation page' : 'Advisory design page'}</strong><span>{selectedPage.scopeReason}</span></div></section>

        <section className="preview-control-section"><div className="preview-control-heading"><span>Interaction state</span><small>Product-relevant proof</small></div><div className="preview-interaction-tabs">{interactionStates.map((state) => <button key={state.id} className={interactionId === state.id ? 'active' : ''} onClick={() => setInteractionId(state.id)}><strong>{state.label}</strong><span>{state.intent}</span></button>)}</div></section>

        <section className="preview-control-section"><div className="preview-control-heading"><span>Live refinements</span><small>{dirty ? 'Unsaved preview changes' : 'Matches selected source'}</small></div>
          <Field label="Typography character"><select value={draft.typographyCharacter} onChange={(event) => setTypography(event.target.value as TypographyCharacter)}>{typographyOptions.map((option) => <option key={option}>{option}</option>)}</select></Field>
          <div className="preview-control-two"><Field label="Heading weight"><select value={draft.headingWeight} onChange={(event) => patch({ headingWeight: Number(event.target.value), headingWeightPreference: 'Custom' })}>{[400,500,600,700,800,900].map((value) => <option value={value} key={value}>{value}</option>)}</select></Field><Field label="Body weight"><select value={draft.bodyWeight} onChange={(event) => patch({ bodyWeight: Number(event.target.value), bodyWeightPreference: 'Custom' })}>{[300,400,450,500,600].map((value) => <option value={value} key={value}>{value}</option>)}</select></Field></div>
          <Field label="Color behavior"><select value={draft.accentUsage} onChange={(event) => patch({ accentUsage: event.target.value as Dna['accentUsage'] })}>{['Rare','Focused','Balanced','Prominent'].map((option) => <option key={option}>{option}</option>)}</select></Field>
          <Range label="Density" value={draft.density} min={10} max={90} onChange={(density) => patch({ density })}/>
          <Range label="Radius / geometry" value={draft.surfaceRadius} min={0} max={32} suffix="px" onChange={setRadius}/>
          <Range label="Section spacing" value={draft.sectionSpacing} min={40} max={150} suffix="px" onChange={(sectionSpacing) => patch({ sectionSpacing })}/>
          <Field label="Imagery treatment"><select value={draft.imageTreatment} onChange={(event) => patch({ imageTreatment: event.target.value as Dna['imageTreatment'] })}>{['Full color','Muted','Monochrome','Duotone','High contrast'].map((option) => <option key={option}>{option}</option>)}</select></Field>
          <Field label="Section structure"><select value={draft.sectionStrategy} onChange={(event) => patch({ sectionStrategy: event.target.value as SectionStrategy })}>{sectionOptions.map((option) => <option key={option}>{option}</option>)}</select></Field>
          <Field label="Navigation variant"><select value={draft.navigationVariant} onChange={(event) => patch({ navigationVariant: event.target.value as NavigationVariant })}>{navOptions.map((option) => <option key={option}>{option}</option>)}</select></Field>
          <div className="preview-refinement-actions"><button className="secondary-button" onClick={resetDraft}><RotateCcw size={14}/> Reset preview</button><button className="primary-button" onClick={commit}><Save size={14}/> Save refinement to Blueprint</button></div>
        </section>

        <section className={`preview-control-section preview-approval-section ${approval.status}`}><div className="preview-control-heading"><span>Visual approval <ConceptInfo label="Visual approval status">Approved means the current saved visual contract is frozen for implementation. Stale means visual inputs changed after approval and should be reviewed again.</ConceptInfo></span><small>{approval.label}</small></div><div className="preview-approval-status"><div><strong>{approval.label}</strong><p>{approval.detail}</p></div>{approval.status === 'approved' ? <Check size={16}/> : <AlertTriangle size={16}/>}</div>{(dirty || sourceId !== 'saved') && <p className="preview-approval-draft-note">This preview differs from the saved Blueprint. Approving will atomically save this draft and freeze the resulting Visual Contract.</p>}{patternIntel.antiHomogeneity.level !== 'LOW' && <p className="preview-approval-similarity"><strong>{patternIntel.antiHomogeneity.level} similarity warning:</strong> {patternIntel.antiHomogeneity.summary} Approval remains allowed because contextual similarity is not an automatic failure.</p>}<div className="preview-approval-actions"><button className="primary-button" onClick={approve}><Check size={14}/> {approval.status === 'stale' ? 'Re-approve current preview' : approval.status === 'approved' ? 'Approve current preview again' : 'Approve for implementation'}</button>{approval.status !== 'unapproved' && <button className="secondary-button" onClick={onRevokeApproval}>Remove approval</button>}</div><small>Approval provenance: <code>approved_preview</code>. Device/page/interaction tabs are preview-only and never invalidate approval.</small></section>

        <section className="preview-control-section preview-warning-section"><div className="preview-control-heading"><span>Preview warnings</span><small>No fake score</small></div>{intel.warnings.length ? <div className="preview-warning-list">{intel.warnings.map((warning) => <article className={warning.severity} key={warning.id}>{warning.severity === 'risk' ? <TriangleAlert size={14}/> : warning.severity === 'review' ? <AlertTriangle size={14}/> : <Check size={14}/>}<div><strong>{warning.title}</strong><span>{warning.detail}</span></div></article>)}</div> : <div className="preview-warning-clear"><Check size={14}/><span>No current Preview Studio warning.</span></div>}</section>
      </aside>

      <section className="preview-stage">
        <div className="preview-stage-toolbar"><div className="preview-device-tabs"><button className={device === 'desktop' ? 'active' : ''} onClick={() => setDevice('desktop')}><Monitor size={15}/> Desktop</button><button className={device === 'tablet' ? 'active' : ''} onClick={() => setDevice('tablet')}><Tablet size={15}/> Tablet</button><button className={device === 'mobile' ? 'active' : ''} onClick={() => setDevice('mobile')}><Smartphone size={15}/> Mobile</button></div><div className="preview-stage-meta"><span>{selectedPage.name}</span><b>{responsive.mode.replaceAll('-', ' ')}</b></div></div>
        <div className="preview-stage-canvas"><PreviewCanvas projectName={projectName} domain={pageIntel.domain} page={selectedPage} dna={draft} media={intel.media} device={device} interactionId={interactionId}/></div>
        <div className="preview-responsive-note"><strong>{device === 'mobile' ? 'Mobile recomposition being demonstrated' : device === 'tablet' ? 'Tablet adaptation' : 'Desktop composition'}</strong><div>{responsive.rules.slice(0, 3).map((rule) => <span key={rule}>{rule}</span>)}</div></div>
      </section>
    </div>
  </div>
}
