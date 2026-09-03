import type { CSSProperties, ReactNode } from 'react'

type Props = { type: string; compact?: boolean; annotated?: boolean }

type Callout = { label: string; x: string; y: string; side?: 'left' | 'right' }

const icon = <span className="preview-dot" />
const base = <><div className="preview-topline"/><div className="preview-line wide"/><div className="preview-line"/></>

const callouts: Record<string, Callout[]> = {
  'bottom-full': [
    { label: 'screen edge', x: '8%', y: '83%', side: 'left' },
    { label: 'persistent destinations', x: '78%', y: '88%', side: 'right' },
  ],
  'bottom-dock': [
    { label: 'visible side margin', x: '12%', y: '84%', side: 'left' },
    { label: 'detached dock', x: '79%', y: '85%', side: 'right' },
  ],
  'bottom-pill': [
    { label: 'compact footprint', x: '18%', y: '84%', side: 'left' },
    { label: 'expanded active item', x: '72%', y: '85%', side: 'right' },
  ],
  'side-rail': [
    { label: 'global rail', x: '7%', y: '52%', side: 'left' },
    { label: 'context content', x: '78%', y: '32%', side: 'right' },
  ],
  'master-detail': [
    { label: 'master list', x: '17%', y: '34%', side: 'left' },
    { label: 'selected detail', x: '76%', y: '44%', side: 'right' },
  ],
  'bento': [
    { label: 'priority by area', x: '17%', y: '26%', side: 'left' },
    { label: 'supporting modules', x: '80%', y: '66%', side: 'right' },
  ],
  'command-center': [
    { label: 'status strip', x: '60%', y: '16%', side: 'right' },
    { label: 'operational regions', x: '78%', y: '58%', side: 'right' },
  ],
  'wizard': [
    { label: 'visible progress', x: '20%', y: '18%', side: 'left' },
    { label: 'one decision cluster', x: '76%', y: '48%', side: 'right' },
  ],
  'sticky-cta': [
    { label: 'scrolling content', x: '20%', y: '48%', side: 'left' },
    { label: 'persistent action', x: '78%', y: '85%', side: 'right' },
  ],
  'data-table-sticky': [
    { label: 'sticky header', x: '70%', y: '24%', side: 'right' },
    { label: 'scan rows', x: '72%', y: '60%', side: 'right' },
  ],
  'bottom-sheet': [
    { label: 'page context remains', x: '18%', y: '32%', side: 'left' },
    { label: 'thumb-zone sheet', x: '78%', y: '72%', side: 'right' },
  ],
}

function Frame({ children, compact, annotated, type }: { children: ReactNode; compact: boolean; annotated: boolean; type: string }) {
  const style = { '--preview-scale': compact ? '.82' : '1' } as CSSProperties
  return <div className={`pattern-preview ${annotated ? 'is-annotated' : ''}`} style={style}>
    {children}
    {annotated && (callouts[type] ?? []).map((c, i) => <span key={`${c.label}-${i}`} className={`anatomy-callout ${c.side === 'left' ? 'left' : 'right'}`} style={{ left: c.x, top: c.y }}>{c.label}</span>)}
  </div>
}

export default function PatternPreview({ type, compact = false, annotated = false }: Props) {
  let content: ReactNode

  switch (type) {
    case 'bottom-full':
      content = <div className="phone-stage">{base}<div className="preview-block"/><div className="bottom-bar">{icon}{icon}{icon}{icon}</div></div>; break
    case 'bottom-dock':
      content = <div className="phone-stage">{base}<div className="preview-block"/><div className="floating-dock">{icon}{icon}{icon}{icon}</div></div>; break
    case 'bottom-pill':
      content = <div className="phone-stage">{base}<div className="preview-block"/><div className="pill-dock">{icon}<span className="active-pill">{icon}<i/></span>{icon}</div></div>; break
    case 'side-rail':
      content = <div className="desktop-stage"><div className="side-rail">{icon}{icon}{icon}<span className="rail-spacer"/>{icon}</div><div className="desktop-content">{base}<div className="preview-grid two"><div/><div/></div></div></div>; break
    case 'full-sidebar':
      content = <div className="desktop-stage"><div className="full-sidebar"><b/><span/><span/><span/><i/><span/><span/></div><div className="desktop-content">{base}<div className="preview-grid two"><div/><div/></div></div></div>; break
    case 'top-tabs':
    case 'segmented-nav':
      content = <div className="desktop-stage tab-stage">{base}<div className="tab-row"><span className="active"/><span/><span/><span/></div><div className="preview-block short"/></div>; break
    case 'command-palette':
      content = <div className="desktop-stage command-palette-stage"><div className="dim-page">{base}<div className="preview-grid two"><div/><div/></div></div><div className="command-pop"><div className="command-input"/><div className="command-result active"/><div className="command-result"/><div className="command-result"/></div></div>; break
    case 'master-detail':
      content = <div className="desktop-stage master"><div className="master-list"><div/><div className="active"/><div/><div/></div><div className="detail-pane">{base}<div className="preview-block short"/></div></div>; break
    case 'bento':
      content = <div className="desktop-stage"><div className="preview-grid bento"><div className="bento-big"/><div/><div/><div className="bento-wide"/></div></div>; break
    case 'split-screen':
      content = <div className="desktop-stage split-stage"><div>{base}<div className="preview-block short"/></div><div>{base}<div className="preview-grid two"><div/><div/></div></div></div>; break
    case 'editorial-grid':
      content = <div className="desktop-stage editorial-grid-stage"><div className="editorial-kicker"/><div className="editorial-display"/><div className="editorial-copy"/><div className="editorial-card a"/><div className="editorial-card b"/></div>; break
    case 'command-center':
      content = <div className="desktop-stage command-center-stage"><div className="status-strip"><span/><span/><span/><span/></div><div className="ops-grid"><div className="wide"/><div/><div/><div/><div className="wide"/></div></div>; break
    case 'single-column':
      content = <div className="desktop-stage single-stage"><div className="single-inner">{base}<div className="field"/><div className="field"/><div className="preview-block short"/></div></div>; break
    case 'no-card':
      content = <div className="desktop-stage clean-sections"><div className="section-title"/><div className="section-copy"/><div className="section-rule"/><div className="section-title small"/><div className="section-copy short"/><div className="section-rule"/></div>; break
    case 'outlined-panels':
      content = <div className="desktop-stage"><div className="outlined-panel">{base}</div><div className="preview-grid two outlined"><div/><div/></div></div>; break
    case 'soft-cards':
      content = <div className="desktop-stage soft-card-stage"><div className="soft-card large">{base}</div><div className="soft-card"/><div className="soft-card"/></div>; break
    case 'glass-panel':
      content = <div className="desktop-stage glass-stage"><div className="glass-bg one"/><div className="glass-bg two"/><div className="glass-surface">{base}</div></div>; break
    case 'wizard':
      content = <div className="phone-stage wizard"><div className="steps"><b/><b className="active"/><b/></div><div className="field"/><div className="field"/><div className="wizard-actions"><span/><span className="primary"/></div></div>; break
    case 'sectioned-form':
      content = <div className="desktop-stage form-stage"><div className="form-section"><b/><span/><span/></div><div className="form-section"><b/><span/><span/></div><div className="form-section short"><b/><span/></div></div>; break
    case 'inline-form':
      content = <div className="desktop-stage inline-edit-stage"><div className="inline-row"><span/><b/><i/></div><div className="inline-row active"><span/><input readOnly/><i/></div><div className="inline-row"><span/><b/><i/></div></div>; break
    case 'sticky-cta':
      content = <div className="phone-stage">{base}<div className="field"/><div className="field"/><div className="sticky-shelf"><span/><strong/></div></div>; break
    case 'fab-cluster':
      content = <div className="phone-stage fab-stage">{base}<div className="fab-menu"><i/><i/><i/><b/></div></div>; break
    case 'row-actions':
      content = <div className="desktop-stage row-action-stage"><div className="table-head"/>{[1,2,3].map(n => <div className="action-row" key={n}><i/><span/><span/><b/><b/></div>)}</div>; break
    case 'shared-element':
      content = <div className="motion-stage"><div className="motion-card origin"/><div className="motion-arrow">→</div><div className="motion-card destination"/></div>; break
    case 'layout-reflow':
      content = <div className="motion-stage reflow"><div className="mini-card one"/><div className="mini-card two"/><div className="mini-card three"/><div className="reflow-arrow">↻</div></div>; break
    case 'spring-feedback':
      content = <div className="motion-stage spring-stage"><div className="spring-track"><span/><span/><span/></div><div className="spring-button">tap</div></div>; break
    case 'mask-reveal':
      content = <div className="motion-stage mask-stage"><div className="mask-before"/><div className="mask-arrow">→</div><div className="mask-after"><span/></div></div>; break
    case 'staggered-enter':
      content = <div className="motion-stage stagger-stage"><span className="s1"/><span className="s2"/><span className="s3"/><span className="s4"/></div>; break
    case 'editorial-type':
      content = <div className="type-stage"><div className="serif-sample">A thoughtful title.</div><div className="sans-sample">Quiet utility text keeps the interface usable.</div><div className="type-rule"/><div className="sans-label">STATUS · UPDATED · OWNER</div></div>; break
    case 'technical-type':
      content = <div className="type-stage technical"><div className="sans-title">System overview</div><div className="mono-sample">NODE_04 · 12:48:03 · HEALTHY</div><div className="type-rule"/><div className="mono-grid"><span>01</span><span>02</span><span>03</span></div></div>; break
    case 'display-sans':
      content = <div className="type-stage display"><div className="big-sans">MATCH<br/>POINT.</div><div className="sans-label">LIVE · COURT 02 · FINAL SET</div></div>; break
    case 'data-table-sticky':
      content = <div className="desktop-stage table-stage"><div className="table-header"><b/><b/><b/><b/></div>{[1,2,3,4].map(n => <div className="table-row" key={n}><span/><span/><span/><span/></div>)}</div>; break
    case 'metric-strip':
      content = <div className="desktop-stage metric-stage">{[1,2,3,4].map(n => <div key={n}><small/><b/><i/></div>)}</div>; break
    case 'timeline':
      content = <div className="desktop-stage timeline-stage">{[1,2,3,4].map(n => <div className="timeline-event" key={n}><i/><span><b/><em/></span></div>)}</div>; break
    case 'toast-stack':
      content = <div className="desktop-stage toast-stage">{base}<div className="toast-mini one"><i/><span/></div><div className="toast-mini two"><i/><span/></div></div>; break
    case 'inline-validation':
      content = <div className="phone-stage validation-stage"><div className="field ok"/><small/><div className="field error"/><p/><div className="field"/></div>; break
    case 'skeleton':
      content = <div className="desktop-stage skeleton-stage"><div className="skeleton-row"><i/><span><b/><em/></span></div><div className="skeleton-row"><i/><span><b/><em/></span></div><div className="skeleton-block"/></div>; break
    case 'bottom-sheet':
      content = <div className="phone-stage sheet-stage">{base}<div className="sheet-dim"/><div className="bottom-sheet"><i/><b/><span/><span/><strong/></div></div>; break
    case 'drawer':
      content = <div className="phone-stage drawer-stage">{base}<div className="drawer-dim"/><div className="side-drawer-preview"><i/><b/><span/><span/><span/></div></div>; break
    case 'swipe-actions':
      content = <div className="phone-stage swipe-stage">{base}<div className="swipe-row"><div className="row-content"><i/><span/></div><div className="swipe-tools"><b/><b/></div></div><div className="swipe-row normal"><div className="row-content"><i/><span/></div></div></div>; break
    case 'compact-header':
      content = <div className="phone-stage compact-header-stage"><div className="compact-head"><i/><b/><span/><span/></div><div className="content-lines">{base}<div className="preview-block"/></div></div>; break
    case 'hero-header':
      content = <div className="desktop-stage hero-header-stage"><div className="hero-kicker"/><div className="hero-lines"><b/><b/><b/></div><div className="hero-meta"><span/><span/></div><div className="hero-lower"/></div>; break
    case 'empty-state':
      content = <div className="desktop-stage empty-stage"><div className="empty-icon"/><div className="empty-title"/><div className="empty-copy"/><div className="empty-action"/></div>; break
    case 'onboarding-checklist':
      content = <div className="desktop-stage checklist-stage"><div className="check-progress"><b/><span/></div>{[1,2,3,4].map((n) => <div className={`check-row ${n < 3 ? 'done' : ''}`} key={n}><i/><span/><b/></div>)}</div>; break
    default:
      content = <div className="desktop-stage">{base}</div>
  }

  return <Frame compact={compact} annotated={annotated} type={type}>{content}</Frame>
}
