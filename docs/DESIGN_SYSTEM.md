# ZeroHour Design System: Color Psychology, Typography, Accessibility and Emergency UI

**Project:** ZeroHour (`zerohour-ai`)
**Design system:** Daylight Clinical EHR — Calm Clinical
**Status:** Proposed implementation specification
**Primary goal:** Reduce visual confusion and help people identify and follow appropriate emergency-response instructions quickly, without weakening the visibility of critical warnings.

---

## 1. DESIGN OBJECTIVE

ZeroHour is a multilingual emergency-response research prototype built for situations in which the user may be frightened, overwhelmed, distracted or unable to read a lengthy explanation.

The interface must support two user groups:

1. **Citizen or bystander:** Needs to capture the situation, identify the next applicable action, follow short first-aid guidance and coordinate help.
2. **Clinical or command-center operator:** Needs to interpret the incident, review uncertainty, inspect medication information, evaluate facility suggestions and prepare a handoff.

The design must prioritize the following, in order:

1. Correct and immediately visible emergency actions.
2. Legible instructions under stress and on mobile screens.
3. Clear separation between routine information, urgent information and critical warnings.
4. Predictable navigation and consistent meaning for colors and typography.
5. Support for English, Tamil, Hindi, Telugu and Malayalam, including code-mixed text.
6. A restrained, calm visual identity suitable for an academic clinical research prototype.

**Scientific limitation:** Do not claim that the selected colors or fonts treat anxiety, stop panic or produce a guaranteed psychological response. Treat calmness as a design objective and validate the interface with realistic usability testing.

---

# 2. COLOR RESEARCH AND DESIGN RATIONALE

## 2.1 Blue

Wikipedia's Color psychology article discusses associations between blue and relaxation, alongside research with conflicting results. Color associations depend on context, culture and individual experience.

Design decision:

- Use blue as a restrained informational and clinical-structure color.
- Prefer a muted or pale blue for information panels.
- Use a darker, sufficiently contrasting blue for links and clinical-data emphasis.
- Do not use blue gradients, neon blue, large saturated blue backgrounds or glowing effects.

Reference:
[https://en.wikipedia.org/wiki/Color_psychology](https://en.wikipedia.org/wiki/Color_psychology)

## 2.2 Green and blue-green

Wikipedia's Green article describes associations between green, calmness, agreeableness and balance. Healthcare-environment design literature has also discussed blue-green and muted green palettes, while warning against monotonous or excessively institutional-looking environments.

Design decision:

- Use muted blue-green as the primary interaction accent.
- Use pale sage-teal for secondary information and supportive panels.
- Avoid using green to imply that a clinical assessment is safe or that a patient is recovering.
- Use green for success only when an actual application operation has succeeded.

References:
[https://en.wikipedia.org/wiki/Green](https://en.wikipedia.org/wiki/Green)
[https://www.healthdesign.org/knowledge-repository/color-healthcare-environments-critical-review-research-literature](https://www.healthdesign.org/knowledge-repository/color-healthcare-environments-critical-review-research-literature)

## 2.3 Neutral backgrounds

Design decision:

- Use warm off-white as the application background.
- Use white for content panels and forms.
- Use deep charcoal for primary text.
- Use restrained slate for secondary text.
- Preserve sufficient contrast. A pale background does not justify pale text.

The neutral foundation reduces decorative competition and keeps attention on the instructions and data.

## 2.4 Red and amber

Red and amber are reserved for urgency, not general decoration.

Design decision:

- Crimson indicates a critical or RED prototype triage state.
- Amber indicates an urgent or ORANGE prototype triage state.
- Use explicit severity labels and explanatory text with these colors.
- Never communicate severity through color alone.
- Do not use red for every main button, icon, border or navigation element.

These colors must remain unmistakable because they communicate information that may require immediate attention.

---

# 3. CANONICAL COLOR PALETTE

Use these color tokens consistently across the Citizen App, Command Center, print views and supporting pages.

## 3.1 Foundation colors

| Token                 | HEX       | Purpose                                     |
| --------------------- | --------- | ------------------------------------------- |
| `--zh-paper`          | `#F4F4F0` | Main application background                 |
| `--zh-surface`        | `#FFFFFF` | Cards, panels, forms and content surfaces   |
| `--zh-text`           | `#111827` | Primary text, headings and important values |
| `--zh-text-secondary` | `#52636A` | Supporting descriptions and metadata        |
| `--zh-border`         | `#D1D5DB` | Borders, separators and panel boundaries    |
| `--zh-border-strong`  | `#9CA3AF` | Stronger boundaries when necessary          |

### Usage rules

- Apply `#F4F4F0` to the page background.
- Apply `#FFFFFF` to content cards and working areas.
- Apply `#111827` to primary text and instructions.
- Apply `#52636A` to secondary text only after checking its actual background.
- Apply borders consistently at approximately `1px`.
- Avoid unnecessary shadows, decorative outlines and floating panels.

## 3.2 Primary interaction colors

| Token                 | HEX       | Purpose                                                              |
| --------------------- | --------- | -------------------------------------------------------------------- |
| `--zh-primary`        | `#315C5D` | Primary buttons, selected navigation and active interaction elements |
| `--zh-primary-hover`  | `#274C4D` | Hover or pressed state                                               |
| `--zh-primary-soft`   | `#E5EFED` | Calm supporting panels and selected informational states             |
| `--zh-primary-border` | `#C7D8D3` | Boundaries around pale blue-green panels                             |

### Usage rules

- Use white text on the dark primary button.
- Use the pale blue-green tint for supporting information, not for critical warnings.
- Use the primary color consistently throughout the app so the interface remains predictable.
- Maintain a visible keyboard focus indicator.
- Do not turn every panel, icon or heading blue-green.

## 3.3 Clinical information colors

| Token            | HEX       | Purpose                                                |
| ---------------- | --------- | ------------------------------------------------------ |
| `--zh-navy`      | `#1E3A8A` | Links, clinical-data emphasis and selected information |
| `--zh-info-bg`   | `#EAF0F8` | Informational panels                                   |
| `--zh-info-text` | `#254C76` | Text on pale informational panels                      |

### Usage rules

- Use navy for structural clinical emphasis, not as a full-screen background.
- Use the pale information background for explanations and neutral notices.
- Do not use navy to imply clinical verification.
- A model-generated result remains provisional regardless of its visual styling.

## 3.4 Emergency severity colors

| Token                | HEX       | Purpose                                |
| -------------------- | --------- | -------------------------------------- |
| `--zh-critical`      | `#B91C1C` | Critical / RED prototype triage state  |
| `--zh-critical-bg`   | `#FEE2E2` | Pale critical-warning background       |
| `--zh-critical-text` | `#991B1B` | Dark red text on pale critical panels  |
| `--zh-urgent`        | `#B45309` | Urgent / ORANGE prototype triage state |
| `--zh-urgent-bg`     | `#FEF3C7` | Pale urgent-warning background         |
| `--zh-urgent-text`   | `#78350F` | Dark amber text on pale urgent panels  |

### Usage rules

- Use crimson for a critical state only when the application logic assigns that state.
- Use amber for an urgent state only when the application logic assigns that state.
- Always display a textual label such as `CRITICAL`, `URGENT`, `RED` or `ORANGE` as appropriate to the prototype.
- Pair the label with meaningful text and an appropriate icon or symbol.
- Never rely on color alone.
- Do not make every screen red during an incident.
- Avoid flashing, rapid pulsing and animated warning backgrounds.

Important: ZeroHour is a research prototype. Do not describe an ESI-style or application-generated severity label as a validated clinical decision or confirmed diagnosis.

## 3.5 Success and neutral states

| Token                | HEX       | Purpose                                    |
| -------------------- | --------- | ------------------------------------------ |
| `--zh-success`       | `#166534` | Confirmed successful application operation |
| `--zh-success-bg`    | `#DCFCE7` | Background for a genuine success message   |
| `--zh-neutral-bg`    | `#F3F4F6` | Neutral status panel                       |
| `--zh-neutral-text`  | `#374151` | Text on a neutral panel                    |
| `--zh-disabled-bg`   | `#E5E7EB` | Disabled control background                |
| `--zh-disabled-text` | `#4B5563` | Disabled control text                      |
| `--zh-focus`         | `#0F766E` | Visible focus indicator                    |

### Usage rules

- Only show success when the underlying operation has actually succeeded.
- Do not show a green success state merely because a model generated a response.
- Clearly distinguish `Processing`, `Completed`, `Unavailable`, `Simulated`, `Unverified` and `Error`.
- Disabled controls must remain understandable and visibly disabled.
- Focus indicators must remain visible against the surrounding background.

## 3.6 Color distribution

Use this as a qualitative layout guideline, not a scientifically established formula.

- Approximately 65–75%: paper, white and other neutral surfaces.
- Approximately 15–20%: primary blue-green and its pale tint.
- Approximately 5–10%: navy, borders and supporting emphasis.
- A small remainder: red, amber, green and other status colors when genuinely required.

Critical severity colors should occupy only the parts of the interface that communicate the relevant critical or urgent information.

---

# 4. COLOR USAGE BY ZEROHOUR SCREEN

## 4.1 Citizen App: Capture

- Background: `#F4F4F0`
- Main content panels: `#FFFFFF`
- Main text: `#111827`
- Secondary text: `#52636A`
- Primary emergency-start control: `#315C5D` with white text
- Active navigation: `#315C5D`
- Informational device-readiness panel: `#EAF0F8`
- Permission denied or unavailable: neutral styling with an explicit label
- API error: neutral or red error styling depending on severity, with a clear retry option

The Start Emergency action must be immediately visible. Do not require the user to complete a form or navigate through multiple setup screens before the initial emergency action.

## 4.2 Citizen App: First Aid

- Keep the background neutral.
- Use deep charcoal for the main instruction.
- Use muted blue-green for supporting controls.
- Use a larger font for the current action.
- Use short, sequential instructions.
- Separate each action visually.
- Display a Speak button when speech is unavailable or autoplay is blocked.
- Use red or amber only when conveying a real warning.

Do not use the calming palette to make an unsafe or uncertain instruction appear more trustworthy.

## 4.3 Citizen App: Crowd Shield

- Use a high-contrast warning panel.
- Show a clear heading and one specific action.
- Keep the rest of the page visually quiet.
- Avoid rapid flashing and strobe effects.
- Show both the selected regional language and English where appropriate.
- Use a readable script-specific font.
- Include a text label and icon for important warnings.

For example, a live electrical hazard must have an explicit instruction not to approach the live wire or enter potentially energized water. The warning must not depend on the user recognising a color.

## 4.4 Citizen App: Med Scan

- Background and cards remain neutral.
- Extracted text uses the regular body font.
- Confirmed, user-corrected, uncertain and unreadable data must have distinct labels.
- Use pale information panels for neutral explanations.
- Use amber or crimson where a potential medication-trauma concern warrants that visual emphasis.
- Explain why a warning is being shown.
- Do not imply that OCR verified a medication or that an empty result proves the absence of a medication, allergy or risk.

## 4.5 Citizen App: ER Handoff

- Use neutral surfaces for the clinical summary.
- Use navy for structural emphasis.
- Use severity colors only for the assigned priority.
- Keep the source and verification status visible.
- Use readable typography in the QR handoff explanation.
- Distinguish a generated QR payload from a handoff successfully received by a real hospital.

## 4.6 Command Center

- Use the paper background, white records, charcoal text and navy emphasis.
- Use crimson and amber consistently for the configured priority categories.
- Keep source labels such as `LIVE GEMINI` and `SYNTHETIC DEMO` textually explicit.
- Use regular typography for transcripts and clinical summaries.
- Use monospace only for technical JSON and structured data.
- Keep uncertainties, unverified information and application errors visible.
- Never use a success color to imply that a real ambulance, hospital or civic service has been contacted without confirmation.

## 4.7 References, Privacy and Terms pages

These are information-reading pages.

- Use the same primary body font as the rest of the app.
- Use neutral backgrounds and readable paragraph spacing.
- Avoid decorative serif typography in long operational instructions.
- An optional editorial serif may be tested for a non-operational page title, but it is not necessary.
- Keep links distinguishable from ordinary text.

---

# 5. FONT RESEARCH AND RECOMMENDED FONT SYSTEM

## 5.1 Why typography matters

Wikipedia's Typography article distinguishes two related concepts:

- **Legibility:** How easily the individual characters can be perceived.
- **Readability:** How easily the text can be read and understood as a whole.

Typography, line length, margins, word spacing, line spacing, contrast and document structure all influence reading. A visually attractive typeface can still be difficult to use if its text is too small, condensed or poorly spaced.

Reference:
[https://en.wikipedia.org/wiki/Typography](https://en.wikipedia.org/wiki/Typography)

Wikipedia's Legibility article discusses the influence of character familiarity, character shapes and spacing. No font family is universally best for every person or every script.

Reference:
[https://en.wikipedia.org/wiki/Legibility](https://en.wikipedia.org/wiki/Legibility)

## 5.2 Primary font family: Noto Sans

**Recommended family:** Noto Sans

Use it as the principal interface family for:

- Navigation labels.
- Main headings.
- Body text.
- Buttons.
- First-aid instructions.
- Device statuses.
- OCR results.
- Hospital information.
- Clinical summaries.
- Tables and forms.

Reasons for the choice:

- A neutral sans-serif appearance.
- A practical family for a dense functional interface.
- A broader multilingual font ecosystem.
- A coordinated visual direction across writing systems.

Noto was developed as a large multilingual family intended to support many scripts and maintain visual harmony across those scripts.

Reference:
[https://en.wikipedia.org/wiki/Noto_fonts](https://en.wikipedia.org/wiki/Noto_fonts)

This selection is based on multilingual implementation and readability considerations. Do not claim that Noto Sans has been scientifically proven to calm users.

## 5.3 Required script-specific font families

| Language  | Font family            | Typical use                                      |
| --------- | ---------------------- | ------------------------------------------------ |
| English   | `Noto Sans`            | English instructions and clinical summaries      |
| Tamil     | `Noto Sans Tamil`      | Tamil instructions and crowd-safety warnings     |
| Hindi     | `Noto Sans Devanagari` | Hindi instructions and crowd-safety warnings     |
| Telugu    | `Noto Sans Telugu`     | Telugu instructions and crowd-safety warnings    |
| Malayalam | `Noto Sans Malayalam`  | Malayalam instructions and crowd-safety warnings |

Use script-specific font loading and fallback rules where necessary.

Do not assume that merely declaring these names automatically makes the fonts available. Check whether each font is loaded by the application or available as an appropriate system fallback.

Use the exact Google Fonts or locally hosted font assets that work with the project's current Next.js setup. Confirm all imports compile and all scripts render correctly.

Reference:
[https://en.wikipedia.org/wiki/Noto_fonts](https://en.wikipedia.org/wiki/Noto_fonts)

## 5.4 Monospace font for technical data

Use a system monospace font for:

- JSON.
- FHIR-related structured output.
- Incident IDs.
- Debuggable technical values shown to authorised users.
- Code and schema views.

Recommended CSS fallback:

`ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace`

Do not use monospace for long first-aid instructions, ordinary paragraphs or spoken guidance.

## 5.5 Serif fonts

An optional editorial serif may be used for a non-operational introduction or selected static page headings.

Serif typography is not required for ZeroHour.

Do not use a decorative serif for:

- Emergency actions.
- Small navigation labels.
- Clinical tables.
- First-aid steps.
- Mobile status text.
- Crowd Shield warnings.

Do not introduce a second major type family merely to make the app appear more sophisticated.

---

# 6. FONT WEIGHTS AND TYPOGRAPHIC HIERARCHY

Use the following weights consistently.

| Weight   | CSS value | Use                                                           |
| -------- | --------: | ------------------------------------------------------------- |
| Regular  |     `400` | Body text and ordinary instructions                           |
| Medium   |     `500` | Navigation, labels and secondary emphasis                     |
| Semibold |     `600` | Headings, primary actions and critical instructional emphasis |
| Bold     |     `700` | Rare use for a high-priority heading or a short alert         |

Avoid ultra-light text and excessive bold styling.

Do not render large paragraphs in bold. Do not put full instructions in italics. Do not uppercase complete sentences to make them appear more urgent.

Typography should make the hierarchy evident without shouting.

---

# 7. EXACT TYPOGRAPHY SCALE

These are starting design values and must be validated on actual desktop and mobile devices.

| UI element                    |                  Font size |  Weight | Suggested line height |
| ----------------------------- | -------------------------: | ------: | --------------------: |
| Citizen app page heading      |                   24–28 px |     600 |             1.25–1.35 |
| Desktop page heading          |                   28–32 px |     600 |             1.25–1.35 |
| Secondary heading             |                   20–24 px |     600 |               1.3–1.4 |
| Small section heading         |                   18–20 px |     600 |             1.35–1.45 |
| Current emergency instruction |                   24–28 px |     600 |             1.35–1.45 |
| First-aid step text           |                   18–20 px | 400–500 |             1.45–1.55 |
| Main body text                |                   17–18 px |     400 |                   1.5 |
| Standard buttons              |                   18–20 px |     600 |              1.25–1.4 |
| Navigation labels             |                   14–16 px |     500 |               1.3–1.4 |
| Clinical table text           |                   15–16 px | 400–500 |               1.4–1.5 |
| Secondary labels              |                   14–16 px | 400–500 |               1.4–1.5 |
| Non-essential metadata        |       14 px minimum target |     400 |               1.4–1.5 |
| JSON and technical output     | 13–15 px where appropriate |     400 |                   1.5 |

Important requirements:

- Do not reduce essential clinical instructions below a comfortable reading size to fit a viewport.
- Avoid 10–12 px operational labels.
- Prefer scrolling over cramming content into one screen.
- Let text wrap naturally.
- Keep buttons large enough to read and activate.
- Increase the size of the current action rather than making every component large.
- Ensure all five languages remain legible at the same default zoom.

---

# 8. LINE SPACING, PARAGRAPHS AND TEXT DENSITY

Use readable spacing as a core part of the typography system.

## 8.1 General recommendations

- Main body line height: approximately `1.5`.
- Emergency instruction line height: approximately `1.45–1.55`.
- Section heading line height: approximately `1.25–1.4`.
- Paragraph spacing: approximately `0.75rem` to `1rem`.
- Maintain enough spacing between numbered actions that users can identify individual steps.
- Use short paragraphs and meaningful subheadings.
- Avoid large, uninterrupted blocks of clinical explanation.
- Use left-aligned text for ordinary paragraphs.
- Avoid justified paragraphs with stretched spacing.
- Avoid excessive letter spacing, especially in Indic scripts.

For an emergency action, prefer a short instruction followed by a clearly separated next step.

Example structure:

1. Check whether the person responds.
2. Call the appropriate emergency service or delegate the call.
3. Follow the next instruction displayed by the application.

This example illustrates the layout structure only. Actual medical advice must use appropriately sourced, reviewed instructions.

## 8.2 WCAG text-spacing resilience

Under WCAG 2.2 Success Criterion 1.4.12, web content must remain usable when users apply the specified text-spacing overrides, including:

- Line height of at least 1.5 times the font size.
- Paragraph spacing of at least 2 times the font size.
- Letter spacing of at least 0.12 times the font size.
- Word spacing of at least 0.16 times the font size.

These are user-override resilience requirements, not mandatory default values for every component. Follow script-appropriate conventions and test the applicable requirements for each writing system.

Reference:
[https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html)

---

# 9. MULTILINGUAL TYPOGRAPHY IMPLEMENTATION

ZeroHour must support:

- English.
- Tamil.
- Hindi.
- Telugu.
- Malayalam.

## 9.1 Font loading

1. Inspect the existing Next.js configuration.
2. Load Noto Sans and the required script-specific families using a compatible and maintainable method.
3. Verify whether locally hosted font assets or the installed Next.js font integration are suitable.
4. Load only what is required for the supported interface.
5. Confirm that the build succeeds.
6. Confirm that fonts appear correctly in the deployed app, not only on the developer's machine.
7. Provide appropriate sans-serif fallbacks.

Avoid blindly pasting imports without checking the available font exports and package versions.

## 9.2 Language selection

Use the correct language metadata where applicable, including `lang` attributes.

Suggested language mappings:

- English: `en-IN`
- Tamil: `ta-IN`
- Hindi: `hi-IN`
- Telugu: `te-IN`
- Malayalam: `ml-IN`

Use the corresponding script-specific fonts for native-language text. Mixed-language sentences must not create missing glyphs, inconsistent line heights or unreadable fallback characters.

## 9.3 Script-specific checks

For each language, test:

- Common words and diacritics.
- Long instructions.
- Mixed native-script and English sentences.
- Numerals, medicine strengths and units.
- Button labels.
- Warning banners.
- Text-to-speech display text.
- Clinical summaries.
- Text wrapping at mobile widths.
- Increased text spacing and browser zoom.

Do not assume that identical CSS values will produce identical visual results across all scripts.

Do not apply aggressive Latin letter spacing to Tamil, Devanagari, Telugu or Malayalam text.

---

# 10. TYPOGRAPHY BY SCREEN

## 10.1 Capture

- One visible page heading.
- A prominent Start Emergency action.
- Clear device-readiness labels.
- Regular body typography.
- Short permission and error messages.
- No lengthy paragraphs before the initial emergency action.

## 10.2 First Aid

- One main action presented prominently.
- A 24–28 px semibold instruction when an action requires immediate attention.
- 18–20 px body text for each instructional step.
- Visible step separation.
- Read aloud, Stop and Repeat controls.
- A clear Speak Now action if automatic speech cannot start.
- No decorative typography, long all-caps messages or irrelevant content.

## 10.3 Crowd Shield

- Large, readable warning heading.
- A specific instruction directly below the heading.
- Regional-language text and English where appropriate.
- Consistent script fonts.
- High contrast, clear iconography and no rapid flashing.
- Short sentences that remain intelligible when spoken aloud.

## 10.4 Med Scan

- Clear headings for medications, dosage text, conditions, allergies and warnings.
- Visually distinct `Extracted`, `Uncertain`, `User corrected` and `User confirmed` labels.
- Ordinary reading typography for extracted text.
- A technical monospace font only when displaying structured JSON.
- No font style that makes uncertain findings look more authoritative than confirmed findings.

## 10.5 ER Handoff

- A clear triage heading and priority label.
- Readable clinical summaries.
- Distinct sections for reported symptoms, visual observations, model inference and unknown information.
- Prominent medication warning text where applicable.
- Legible print layout.
- Sufficient space for regional-language text when included.
- Minimal technical jargon on the citizen-facing handoff screen.

## 10.6 Command Center

- Compact but readable clinical tables.
- Regular text for transcripts and summaries.
- Semibold text for section labels.
- Monospace for JSON and structured technical payloads.
- Clearly labelled uncertainty.
- No reduction of font size to make every record fit above the fold.

---

# 11. ACCESSIBILITY AND CONTRAST REQUIREMENTS

## 11.1 WCAG contrast

Target WCAG 2.2 AA contrast:

- Normal text: at least `4.5:1`.
- Large text: at least `3:1`.
- Necessary non-text interface boundaries and indicators: check the applicable `3:1` contrast requirement.

Reference:
[https://www.w3.org/TR/WCAG22/](https://www.w3.org/TR/WCAG22/)

Some calculated examples for the proposed palette:

| Foreground | Background | Approximate contrast | Normal text |
| ---------- | ---------- | -------------------: | ----------- |
| `#FFFFFF`  | `#315C5D`  |             `7.45:1` | Pass        |
| `#111827`  | `#F4F4F0`  |            `16.09:1` | Pass        |
| `#52636A`  | `#FFFFFF`  |             `6.27:1` | Pass        |
| `#FFFFFF`  | `#B91C1C`  |             `6.47:1` | Pass        |
| `#FFFFFF`  | `#B45309`  |             `5.02:1` | Pass        |
| `#111827`  | `#FFFFFF`  |            `17.74:1` | Pass        |

These are calculated for the listed color pairs. Recheck each actual rendered foreground/background combination before release.

Do not assume that every combination in the palette automatically passes contrast requirements. In particular, test pale backgrounds, muted borders, disabled controls and text that appears over colored panels.

## 11.2 Color is never the only signal

Every critical status must have an explicit text label.

Use combinations such as:

- `CRITICAL · RED`
- `URGENT · ORANGE`
- `PROCESSING`
- `SIMULATED DEMO`
- `UNVERIFIED`
- `UNAVAILABLE`
- `ERROR`

Use meaningful icons or other visual signals where appropriate.

Do not show a green dot alone to indicate success or a red dot alone to indicate danger.

## 11.3 Motion and focus

- Respect `prefers-reduced-motion`.
- Do not use flashing backgrounds or rapid strobe effects.
- Provide a persistent, visible keyboard focus indicator.
- Keep all operational controls keyboard-accessible.
- Keep body text usable at 200% zoom.
- Prevent fixed navigation from covering content.
- Test mobile safe-area insets and touch-target sizes.
- Prefer comfortable targets around 44–48 CSS pixels for primary controls where practical, without treating that figure as a substitute for checking the relevant WCAG criteria.

---

# 12. VISUAL STYLES THAT MUST NOT BE INTRODUCED

Preserve the existing Daylight Clinical EHR direction.

Do not introduce:

- Primary dark backgrounds such as `#09090B`.
- Purple, pink or blue gradients.
- Gradient text.
- Neon outlines.
- Glowing shadows.
- Glassmorphism.
- Grainy or animated mesh backgrounds.
- Decorative AI illustrations.
- Excessive bento-card layouts.
- Floating navigation with heavy blur.
- Pill-shaped buttons everywhere.
- Oversized decorative icons.
- Emoji as structural icons.
- Unnecessary animations.
- Rapid flashing emergency states.
- All-caps paragraphs.
- Condensed or decorative display fonts for operational text.
- Extremely light weights that reduce readability.
- Fake patient counts, success rates or claims of clinical validation.

Use simple borders, intentional spacing and restrained visual hierarchy.

---

# 13. RECOMMENDED CSS DESIGN TOKENS

Integrate these tokens into the existing stylesheet after inspecting the current repository. Do not replace unrelated styles or overwrite functioning app logic.

```css
:root {
  color-scheme: light;

  /* Foundations */
  --zh-paper: #F4F4F0;
  --zh-surface: #FFFFFF;
  --zh-text: #111827;
  --zh-text-secondary: #52636A;
  --zh-border: #D1D5DB;
  --zh-border-strong: #9CA3AF;

  /* Primary interaction */
  --zh-primary: #315C5D;
  --zh-primary-hover: #274C4D;
  --zh-primary-soft: #E5EFED;
  --zh-primary-border: #C7D8D3;

  /* Clinical information */
  --zh-navy: #1E3A8A;
  --zh-info-bg: #EAF0F8;
  --zh-info-text: #254C76;

  /* Critical state */
  --zh-critical: #B91C1C;
  --zh-critical-bg: #FEE2E2;
  --zh-critical-text: #991B1B;

  /* Urgent state */
  --zh-urgent: #B45309;
  --zh-urgent-bg: #FEF3C7;
  --zh-urgent-text: #78350F;

  /* Success and neutral states */
  --zh-success: #166534;
  --zh-success-bg: #DCFCE7;
  --zh-neutral-bg: #F3F4F6;
  --zh-neutral-text: #374151;
  --zh-disabled-bg: #E5E7EB;
  --zh-disabled-text: #4B5563;

  /* Focus */
  --zh-focus: #0F766E;

  /* Typography */
  --zh-font-sans:
    "Noto Sans",
    "Noto Sans Tamil",
    "Noto Sans Devanagari",
    "Noto Sans Telugu",
    "Noto Sans Malayalam",
    Arial,
    sans-serif;

  --zh-font-mono:
    ui-monospace,
    SFMono-Regular,
    Menlo,
    Monaco,
    Consolas,
    "Liberation Mono",
    monospace;

  /* Text sizes */
  --zh-text-xs: 0.875rem;
  --zh-text-sm: 0.9375rem;
  --zh-text-base: 1.0625rem;
  --zh-text-lg: 1.125rem;
  --zh-text-xl: 1.25rem;
  --zh-heading-sm: 1.25rem;
  --zh-heading-md: 1.5rem;
  --zh-heading-lg: 1.75rem;

  /* Spacing */
  --zh-line-body: 1.5;
  --zh-line-instruction: 1.5;
  --zh-line-heading: 1.3;

  /* Modest, structural corners */
  --zh-radius-control: 0.25rem;
  --zh-radius-panel: 0.375rem;

  /* Borders */
  --zh-border-width: 1px;
}
```

Implementation notes:

- Verify that the required font files are actually loaded. A CSS font-family list does not itself download fonts.
- Prefer script-aware font-family rules if needed.
- Existing design tokens should be consolidated rather than duplicated.
- Use `var(--zh-...)` consistently for equivalent styles.
- Check the existing Tailwind configuration before changing it.
- Do not apply the typography scale indiscriminately to every component.
- Ensure all controls remain accessible and functional.

---

# 14. SUGGESTED BASE TYPOGRAPHY CSS

Adapt this to the existing `globals.css`; do not blindly replace the entire stylesheet.

```css
html {
  background: var(--zh-paper);
  color: var(--zh-text);
  font-family: var(--zh-font-sans);
  font-synthesis: none;
  text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
}

body {
  margin: 0;
  background: var(--zh-paper);
  color: var(--zh-text);
  font-family: var(--zh-font-sans);
  font-size: var(--zh-text-base);
  line-height: var(--zh-line-body);
}

h1,
h2,
h3,
h4 {
  color: var(--zh-text);
  font-family: var(--zh-font-sans);
  font-weight: 600;
  line-height: var(--zh-line-heading);
}

p,
li {
  line-height: var(--zh-line-body);
}

button,
input,
select,
textarea {
  font: inherit;
}

button {
  min-height: 44px;
  border-radius: var(--zh-radius-control);
}

:focus-visible {
  outline: 3px solid var(--zh-focus);
  outline-offset: 2px;
}

code,
pre,
.json-output {
  font-family: var(--zh-font-mono);
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

This is a starting point, not a complete application stylesheet. Preserve working component styles, browser permission flows and the existing emergency interactions.

## 14.1 Script-specific typography

Where appropriate, add language-specific rules after loading and verifying the respective font files:

```css
:lang(ta) {
  font-family: "Noto Sans Tamil", "Noto Sans", sans-serif;
}

:lang(hi) {
  font-family: "Noto Sans Devanagari", "Noto Sans", sans-serif;
}

:lang(te) {
  font-family: "Noto Sans Telugu", "Noto Sans", sans-serif;
}

:lang(ml) {
  font-family: "Noto Sans Malayalam", "Noto Sans", sans-serif;
}

:lang(en) {
  font-family: "Noto Sans", Arial, sans-serif;
}
```

Apply language attributes correctly to the actual rendered text. Verify the mixed-language experience rather than relying on selectors alone.

---

# 15. RESEARCH REFERENCES

Use these sources to explain the design rationale. Distinguish the source's findings from the specific HEX values and font sizes selected for ZeroHour.

## Color and emotion

1. Wikipedia — Color psychology
   [https://en.wikipedia.org/wiki/Color_psychology](https://en.wikipedia.org/wiki/Color_psychology)

2. Wikipedia — Blue
   [https://en.wikipedia.org/wiki/Blue](https://en.wikipedia.org/wiki/Blue)

3. Wikipedia — Green
   [https://en.wikipedia.org/wiki/Green](https://en.wikipedia.org/wiki/Green)

4. The Center for Health Design — Color in Healthcare Environments: A Critical Review of the Research Literature
   [https://www.healthdesign.org/knowledge-repository/color-healthcare-environments-critical-review-research-literature](https://www.healthdesign.org/knowledge-repository/color-healthcare-environments-critical-review-research-literature)

## Typography and legibility

5. Wikipedia — Typography
   [https://en.wikipedia.org/wiki/Typography](https://en.wikipedia.org/wiki/Typography)

6. Wikipedia — Legibility
   [https://en.wikipedia.org/wiki/Legibility](https://en.wikipedia.org/wiki/Legibility)

7. Wikipedia — Noto fonts
   [https://en.wikipedia.org/wiki/Noto_fonts](https://en.wikipedia.org/wiki/Noto_fonts)

## Accessibility standards

8. W3C — Web Content Accessibility Guidelines (WCAG) 2.2
   [https://www.w3.org/TR/WCAG22/](https://www.w3.org/TR/WCAG22/)

9. W3C — Understanding Success Criterion 1.4.12: Text Spacing
   [https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html)

10. W3C — Understanding Success Criterion 1.4.3: Contrast (Minimum)
    [https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum)

These references support general design rationale and accessibility requirements. They do not certify the ZeroHour interface, validate medical guidance or establish that this exact palette and font configuration will calm every user.

---

# 16. IMPLEMENTATION AND ACCEPTANCE CHECKLIST

## Color system

- [ ] Existing Daylight Clinical EHR palette preserved.
- [ ] Design tokens consolidated and used consistently.
- [ ] Blue-green used as the primary interaction accent.
- [ ] Crimson and amber reserved for genuine severity states.
- [ ] Success color used only for a successful application operation.
- [ ] No gradient, glass or neon styling introduced.
- [ ] Color is never the sole signal for a critical state.
- [ ] Foreground/background contrast checked for actual rendered components.

## Typography

- [ ] Noto Sans or an appropriate fallback loaded successfully.
- [ ] Script-specific fonts or fallbacks work for all five languages.
- [ ] Body text remains comfortably readable.
- [ ] Primary emergency actions are clearly distinguishable.
- [ ] Line height and paragraph spacing remain comfortable.
- [ ] No extremely small operational labels.
- [ ] No excessive bold, italics, condensed styles or all-caps paragraphs.
- [ ] Text remains readable when enlarged to 200%.
- [ ] Text-spacing overrides do not break functionality.

## Emergency usability

- [ ] Start Emergency is immediately visible.
- [ ] First Aid presents short, actionable instructions.
- [ ] The current action is visually distinct.
- [ ] Crowd Shield warnings remain clear without flashing.
- [ ] Med Scan shows uncertainty and confirmation status.
- [ ] ER Handoff separates confirmed data from unverified information.
- [ ] Command Center remains readable without squeezing every panel into one viewport.
- [ ] Model-generated content is not visually represented as independently verified.
- [ ] Live and synthetic-demo information remain distinct.

## Responsive and multilingual testing

Test at approximately:

- [ ] 1440 px desktop width.
- [ ] 1024 px tablet width.
- [ ] 390 px mobile width.

For each width:

- [ ] No horizontal overflow.
- [ ] No clipped text or buttons.
- [ ] No content hidden behind fixed navigation.
- [ ] Native scripts display correctly.
- [ ] Mixed-language sentences wrap appropriately.
- [ ] Zoom and text spacing remain functional.
- [ ] Keyboard focus remains visible.
- [ ] Reduced-motion settings are respected.

## Evidence and validation

- [ ] No claim that the palette or font treats panic.
- [ ] No claim that the design is clinically validated without an actual validation study.
- [ ] Usability testing checks whether people can identify and follow the correct next action.
- [ ] Research findings and design assumptions are documented separately.

**Final design principle:** Keep the surroundings visually quiet, the typography immediately legible and the most important action unmistakable. Calm presentation must support safe action, not compete with it.
