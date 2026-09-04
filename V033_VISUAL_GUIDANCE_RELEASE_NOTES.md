# v0.33.0 — Visual Guidance / TL;DR Mode

v0.33 strengthens Blueprint's **recognition-first usability**. The goal is not to add more intelligence; it is to make the intelligence that already exists easier to see, understand, and act on.

## What changed

### 1. Persistent TL;DR mode

Blueprint now has an explicit **TL;DR mode** available from both desktop and mobile navigation.

TL;DR mode:
- shortens dense page introductions;
- replaces explanatory anatomy with purpose-written summaries where appropriate;
- folds secondary detail in Core Flows, Roadmap, Pattern Intelligence, Capabilities, Docs, Visual Studio, and Preview Studio;
- replaces the long Review & Build anatomy with a concise handoff dashboard;
- never hides build blockers, readiness status, required decisions, approval state, or primary actions.

It is a display preference only. It defaults Off and is persisted independently from project scope.

### 2. Contextual concept explainers

Unfamiliar concepts can now expose a circular **ⓘ** explainer using a reusable `ConceptInfo` component.

The explainer uses native `<details>/<summary>` semantics, has an accessible `What is …?` label, works with keyboard focus, and switches to a mobile-safe fixed popover on narrow screens.

Coverage includes important Blueprint concepts such as:
- Smart baseline
- Operational scale
- Guided setup
- Context-aware gap filling
- Readiness coherence
- App-type fit
- Core Flow
- Derived implementation roadmap
- Visual Contract
- Visual Director
- Design autonomy
- Visual originality
- Information density
- Section strategy
- Preview authority
- Visual approval

Standard/Advanced or obviously technical App Setup settings can also receive explainers automatically from their existing description/caution metadata.

### 3. Stronger visual cues

Setup now presents a visible three-step path:

**Describe → Resolve → Tune if needed**

Required and recommended decisions receive stronger severity rails, blocked/attention banners have clearer visual weight, page headers receive a stronger orientation cue, and TL;DR summaries use a consistent accent treatment.

The intent is to improve scanability without converting the UI into a noisy tutorial.

### 4. Visual Studio guidance

Visual Studio now explains visual-authority terms from a reusable concept vocabulary rather than assuming the user already understands design-system terminology.

In TL;DR mode, the synthesized direction remains visible, high-impact visual controls remain editable, and detailed suggestion anatomy is folded. Functional scope authority is unchanged.

### 5. Preview / approval guidance

Preview Studio now explains **Preview authority** and **Visual approval** directly where those concepts matter. TL;DR mode preserves the page/device/refinement/approval loop while shortening explanatory copy.

## Authority guarantees preserved

v0.33 is a presentation/usability release. It does **not** change:
- `Suggested != On`
- explicit Include / Not needed authority
- hard dependency semantics
- Visual Contract approval authority
- backup schema
- structured JSON contract version

TL;DR and concept explainers cannot activate settings, packs, capabilities, or scope.

## Validation

- Historical regression chain through v0.32: **213 / 213**
- Dedicated v0.33 Visual Guidance suite: **16 / 16**
- Total named regression checks: **229 / 229**
- TS/TSX source syntax sanity: passed across the full `src` tree
- Dependency-independent TypeScript sanity compile with temporary React/Lucide declarations: passed

Package version: **0.33.0**  
Structured JSON: **v20**  
Backup schema: **v14**
