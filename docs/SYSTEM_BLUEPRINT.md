# ZeroHour (`zerohour-ai`): Complete System Blueprint, Product Specification, UI Design System, Security Plan, and Deployment Roadmap

**Document version:** 2.0  
**Updated:** 24 October 2026  
**Primary deployment target:** Vercel  
**Repository identity:** `zerohour-ai`  
**Current reported stack:** Next.js 14+ App Router, TypeScript, Tailwind CSS, Lucide React, `@google/genai`, Gemini 2.5 Flash, `qrcode.react`

> **Source-of-truth rule:** This version supersedes the older instruction to build a dark emergency interface. ZeroHour must now use the Daylight Clinical EHR design system described below. If any older prompt or generated code conflicts with this file, follow this file unless the user explicitly changes the requirement.
>
> **Status rule:** A feature described as part of the original build was reported as implemented in the build walkthrough, but must still be tested against the current repository. New navigation and workstation improvements are planned until implementation and verification are complete. Do not present planned work as already complete.

---

## 1. Product Summary

ZeroHour is a multilingual emergency-response research prototype. It is designed to transform chaotic inputs during an emergency, including code-mixed speech, short camera captures, location information and medical-record images, into structured incident information, accessible first-aid guidance, bystander safety instructions, a capability-aware hospital suggestion and a clinical handoff summary.

The application has two primary operating phases:

1. **Immediate emergency phase:** A citizen starts a one-tap capture, gets concise guidance, and can display crowd-safety warnings in a selected language.
2. **Transit and handoff phase:** A relative or bystander scans medical records, reviews extracted medication information, sees a hospital recommendation based on the supplied directory, and presents a QR handoff card and clinical summary.

ZeroHour is a prototype and decision-support aid. It is not an emergency dispatch service, a hospital EHR, a substitute for professional clinical assessment, or a validated medical device. The UI must never claim that an ambulance was dispatched, a hospital accepted a patient, power was cut off, or a clinical finding was independently verified unless a real integration or evidence confirms it.

### 1.1 Product goals

- Reduce the number of decisions required from a person under stress.
- Support Tamil, Hindi, Telugu, Malayalam and English, including code-mixed speech.
- Make the most urgent action obvious and preserve incident state across the UI.
- Present model-generated information with uncertainty and provenance clearly labeled.
- Demonstrate the flow through reliable synthetic scenarios even when Gemini is unavailable.
- Display hospital suggestions based on the supplied eight-record Chennai dataset without fabricating additional records.
- Keep the interface accessible, legible, responsive and academically credible.
- Deploy the completed research demo to Vercel within the available two-day window, subject to successful testing and external account setup.

### 1.2 Non-goals for the two-day MVP

Do not add these features to the critical path unless the user explicitly prioritizes them after the core flow works:

- Production hospital EHR integration.
- Real ambulance, power utility or civic dispatch integrations.
- Guaranteed live traffic-aware route optimisation.
- Production patient identity management or a multi-hospital clinical database.
- WhatsApp emergency bot.
- QR stickers that open a person's persistent medical vault.
- Payment or UPI features.
- Large-scale dataset acquisition or custom model training.

These can remain future roadmap items. The immediate goal is a credible, functional, clearly labeled demo.

---

## 2. Current Project Baseline and Required Inspection

The reported project has the following structure. Inspect the actual repository before edits and adapt to the paths that exist.

```text
ZeroHour/
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── next.config.js
├── .env.example
├── .gitignore
├── public/
│   ├── manifest.json
│   └── favicon.svg                 # Add if missing
└── src/
    ├── app/
    │   ├── layout.tsx
    │   ├── globals.css
    │   ├── page.tsx                # Citizen app: /
    │   ├── command/
    │   │   └── page.tsx            # Command Center: /command
    │   ├── api/
    │   │   └── triage/
    │   │       └── route.ts        # Gemini server route
    │   ├── references/
    │   │   └── page.tsx            # Add if missing
    │   ├── privacy/
    │   │   └── page.tsx            # Add if missing
    │   └── terms/
    │       └── page.tsx            # Add if missing
    ├── lib/
    │   ├── types.ts                # Current types may exist here
    │   ├── triage-schema.ts        # Canonical schema file to add/use
    │   ├── languages.ts
    │   ├── demo-scenarios.ts
    │   └── broadcast.ts
    └── data/
        └── chennai_trauma_hubs.json
```

The existing build walkthrough reported:

- `/`: 27.3 kB, 114 kB first-load JS.
- `/command`: 10.4 kB, 97.4 kB first-load JS.
- `/api/triage`: API route.
- Production build and strict TypeScript compilation passed in the reported run.
- `/api/triage` returned 503 without a key in the reported run.

These are previous reported results, not a guarantee of the current working tree. Re-run checks before and after modifications.

### 2.1 Rules for code changes

1. Inspect existing files before modifying them.
2. Preserve working features and the current repository structure where practical.
3. Do not rebuild the app from scratch merely to restyle it.
4. Do not replace functional controls with non-functional mock UI.
5. Do not silently change the Gemini model, request format or triage schema contract.
6. If the schema is moved to `src/lib/triage-schema.ts`, update imports and re-export from `src/lib/types.ts` where useful to avoid multiple competing schema definitions.
7. Keep API secrets server-side.
8. Do not claim a check passed unless it was executed.
9. Keep synthetic demo data separate from genuine source material.
10. Where a real external integration is missing, show a truthful “Not integrated”, “Demo only” or “Unavailable” status.

---

## 3. Technology Stack and Architecture

### 3.1 Stack

- **Framework:** Next.js 14+ App Router.
- **Language:** TypeScript with strict checking.
- **Styling:** Tailwind CSS and shared CSS variables/design tokens.
- **Icons:** Lucide React, generally `strokeWidth={1.75}`.
- **AI:** Official Google Gen AI SDK, `@google/genai`.
- **Initial model configuration:** `gemini-2.5-flash`, subject to API access verification before deployment.
- **QR generation:** `qrcode.react`.
- **Browser capabilities:** `getUserMedia`, HTML canvas, Web Audio API, Web Speech API and geolocation.
- **Hosting target:** Vercel.

The application should continue to use the existing installed dependencies unless a confirmed issue requires a change.

**Model access warning:** Google's current Gemini model documentation states that Gemini 2.5 models are not deprecated, but access is being limited to users who have actively used them in the past; new projects are directed toward newer Flash models. Verify the actual model access for the project's API key early. If it is unavailable, make a deliberate, documented model migration and re-test schema output, image/audio input and fallback behavior. Do not silently substitute a model. See the official [Gemini model list](https://ai.google.dev/gemini-api/docs/models) and [deprecation page](https://ai.google.dev/gemini-api/docs/deprecations).

### 3.2 Primary routes

- `/`: Citizen Emergency App.
- `/command`: Hospital ER and Civic Command Center.
- `/api/triage`: server-side triage and OCR endpoint.
- `/references`: research and technical sources.
- `/privacy`: privacy information matching actual data handling.
- `/terms`: usage limitations and prototype terms.

### 3.3 Browser synchronization

The existing same-browser demonstration uses:

```text
BroadcastChannel('zerohour_emergency_bus')
localStorage event fallback
```

Use this to update `/command` when the citizen page starts an incident or an OCR result changes it. Use stable incident IDs and patch existing records instead of creating duplicates.

This mechanism only synchronizes compatible tabs/windows on the same browser and origin. It does not sync data from a phone to a different computer. True cross-device sync requires a backend or real-time service with authentication and access control.

Do not transmit raw private media or unnecessary medical history through persistent `localStorage`. Treat browser messaging as a local demo mechanism, not a secure clinical transport.

### 3.4 Stable incident envelope

The app should wrap model output in an application-owned incident record. At minimum, maintain:

- Stable `incident_id` created by the application.
- `created_at` and `updated_at` timestamps.
- Incident lifecycle state, such as `capturing`, `processing`, `active`, `completed` or `error`.
- `source`: `live-gemini` or `synthetic-demo`, assigned by application code, never guessed by the model.
- `triage`: the structured `ZeroHourTriageResult`.
- User confirmation/correction state for OCR observations.
- Data freshness/status and any sync error.

Do not let the model invent stable identity or decide whether its own result is real or synthetic. When an incident is updated by OCR, preserve its incident ID and creation timestamp.

---

## 4. Multilingual Engine

### 4.1 Supported languages

| Language | Locale | Code-mixing examples | Primary script |
|---|---|---|---|
| Tamil | `ta-IN` | Tanglish | Tamil |
| Hindi | `hi-IN` | Hinglish | Devanagari |
| Telugu | `te-IN` | Tenglish | Telugu |
| Malayalam | `ml-IN` | Manglish | Malayalam |
| English | `en-IN` | Indian English | Latin |

### 4.2 Behavior

- Automatic language detection should use the supplied speech/transcript evidence.
- A manual language override must always be available.
- UI strings, emergency guidance, bystander banners and driver directions should follow the selected language where translations exist.
- ER-facing clinical summaries remain standardized in English, with the original transcript retained separately.
- Language switching updates the visible banner and selected speech text immediately. Speech starts only when the browser permits it; otherwise, offer a clear Speak button.
- Browser speech voices vary by device. Detect voice availability, use the best matching locale if present, and give a graceful fallback if it is absent.
- Preserve proper native scripts. Do not force all-language text into Latin transliteration.

The language selector is part of navigation, not a decorative pill bar. Use a compact, accessible segmented control or menu with labels such as `Auto-Detect`, `தமிழ்`, `हिन्दी`, `తెలుగు`, `മലയാളം` and `EN`.

---

## 5. Original Six Core Features

The build walkthrough reported these features as implemented. Each must be retested after the redesign.

### Feature 1: One-Tap Panic Stream

**Purpose:** Capture the incident with minimal interaction.

Expected behavior:

1. The user can start an emergency immediately.
2. The browser requests camera and microphone access with understandable permission handling.
3. The default capture window is approximately six seconds.
4. Canvas extracts three JPEG keyframes, approximately one every two seconds, when a video stream is available.
5. Audio is captured where the browser supports it.
6. Geolocation is requested with status and graceful fallback. A Chennai demo fallback must be labeled as a fallback, not the user's actual location.
7. The app sends the captured input and current context to `/api/triage` when live Gemini processing is configured.
8. The app distinguishes genuine API output from synthetic fixtures.

All four demo scenarios must work without a Gemini key. They should not issue repeated unnecessary API requests when the app is configured to use local demo fixtures.

### Feature 2: Hands-Free First Aid and 110 BPM CPR Metronome

Expected behavior:

- Speak first-aid instructions using `window.speechSynthesis` and the best available language voice.
- Present short step-by-step actions.
- Provide speak, stop and repeat controls.
- Provide a Web Audio API metronome at 110 beats per minute, with a visual beat indicator and clear start/stop control.
- Do not infer that CPR is needed from chest pain or dizziness alone. Activation should follow the defined triage logic and vetted first-aid guidance.
- Handle user gestures required by browser autoplay policies.

### Feature 3: Multilingual Bystander Crowd-Control

Expected behavior:

- Display a large, high-contrast static or restrained-pulse warning.
- Support Tamil, Hindi, Telugu, Malayalam and English.
- Show the selected regional language plus English where appropriate.
- Include a safe, specific crowd-delegation task.
- Let the user speak the task aloud.
- Do not use rapid strobe effects, which can harm accessibility and may be unsafe for some viewers.

Baseline warning language must be based on cited, reviewed safety guidance rather than invented for visual impact.

### Feature 4: Transit Mode Medical OCR

Expected behavior:

- Capture or upload prescription images, discharge summaries and medicine packaging.
- Provide three one-click synthetic example records if they exist in the current implementation.
- Send the actual selected image and relevant incident context to the API for live OCR processing.
- Extract medication names, strength/frequency text when readable, chronic conditions and allergies where explicitly present.
- Make unreadable and partially legible fields visible as uncertain.
- Show potential drug-trauma concerns and explain why user/clinician confirmation is required.
- Patch the existing incident ticket instead of duplicating it.
- Do not persist raw media in `localStorage`.

Example demonstration concerns include blood-thinner medication history alongside reported head trauma. These are demo patterns, not automatic definitive diagnoses.

### Feature 5: Trauma-Capability-Based Hospital Navigation

Expected behavior:

- Match incident needs to the capabilities supplied in `src/data/chennai_trauma_hubs.json`.
- Check that a suggested hospital ID exists in the directory.
- Calculate straight-line distance using Haversine only when the user's actual coordinates are available.
- Call this value “approximate straight-line distance”, not driving distance.
- Provide an Open in Google Maps directions link using a destination address or coordinates and a properly encoded URL.
- Speak driver directions in the selected language.
- Show source-provided emergency gate/corridor text clearly, and identify unverified information.
- Do not invent routing, live traffic, ETA, gate details or hospital capabilities.
- Do not claim that a hospital accepted the patient.

An estimated driving time must only be shown if there is a real routing service. If a simple heuristic is retained for demonstration, label it as an illustrative estimate and never as live traffic or a guaranteed ETA.

### Feature 6: Hospital Gate Handoff and Command Center

Expected behavior:

- Display ESI-style RED/ORANGE/YELLOW prototype priority card.
- Generate a QR code with `qrcode.react`.
- Keep the QR payload minimal and avoid secrets, tokens and unnecessary personal data.
- Show the relevant clinical summary and medication warnings.
- Display structured clinical JSON on `/command`.
- Support copying JSON and printing a readable triage report.
- Make it clear that a generated handoff has not been sent to a real hospital EHR unless that integration exists.

The current schema's `fhir_r4_bundle_summary` is a summary object, not a standards-conformant FHIR R4 Bundle. The application must build the actual FHIR structure using a deterministic mapper and validate it before labelling it a FHIR R4 Bundle. See [HL7 FHIR R4](https://hl7.org/fhir/R4/).

---

## 6. New Citizen App Information Architecture

The existing one-screen design is to be replaced with five focused destinations under `/`.

### 6.1 Five navigation tabs

1. **01 Capture**: Lucide `Mic` icon.
2. **02 First Aid**: Lucide `HeartPulse` icon.
3. **03 Crowd Shield**: Lucide `ShieldAlert` icon.
4. **04 Med Scan**: Lucide `FileScan` icon.
5. **05 ER Handoff**: Lucide `QrCode` icon.

Every item must show a visible text label; icons alone are not sufficient.

### 6.2 Desktop layout

- Center the main citizen app in a comfortable container, approximately `max-w-3xl mx-auto` where the layout permits.
- Use a fixed/sticky vertical navigation rail with icon and label.
- Keep header and navigation compact.
- Use normal vertical scrolling for the selected view.
- Do not squeeze every feature onto a single screen.

### 6.3 Mobile layout

- Use full available width.
- Use a fixed bottom navigation bar with five labeled destinations.
- Respect safe-area insets and reserve enough bottom padding so controls and content are not covered.
- Keep important emergency actions reachable by thumb.
- Prevent horizontal overflow.

### 6.4 Tab-specific contents

#### 01 Capture

- Large Start Emergency action.
- Live camera and microphone states.
- Capture progress and geolocation state.
- Four multilingual demo scenarios.
- Optional Family Medical Vault drawer.

#### 02 First Aid

- Current guidance in selected language plus English as appropriate.
- Checkable action steps.
- Speech controls.
- 110 BPM metronome and mechanical-style beat bar.
- Audio unavailable fallback.

#### 03 Crowd Shield

- Large high-contrast warning.
- Five-language switcher.
- Crowd-delegation action and speak control.
- No rapid flashing background.

#### 04 Med Scan

- Camera capture and upload.
- Three sample prescription simulations where present.
- Processing state, extracted fields, uncertainties, correction/confirmation controls and drug-trauma warnings.

#### 05 ER Handoff

- Hospital capability match and routing rationale.
- Supplied gate/corridor details and verification status.
- Approximate straight-line distance where actual coordinates exist.
- Open in Google Maps action.
- Speak to Driver action.
- Triage priority card, QR code and expandable clinical payload.

### 6.5 Panic Auto-Pilot bar

Place a compact, persistent bar immediately above the mobile bottom navigation and in a consistent position near desktop navigation.

Suggested progression:

`01 Capture -> 02 First Aid -> 03 Crowd Shield -> 04 Med Scan -> 05 ER Handoff`

Behavior:

- A single tap opens the next applicable view.
- The bar reflects incident state and suggests the next useful action.
- Opening a tab alone does not mark a task complete.
- Users can go backwards or skip irrelevant sections without losing the incident.
- Capture completion should move to First Aid and attempt TTS. If autoplay is blocked, show a prominent Speak Now action.
- The persistent emergency indicator and Return to Emergency control remain accessible at all times.
- Do not add confirmation screens before the initial emergency action.

### 6.6 Shared state and lifecycle

Tab changes must not reset the active incident, language, OCR result, speech/metronome state or necessary captured metadata. The app must distinguish a current incident from a historical session record. Resetting or deleting information must be explicit and understandable.

Do not let an inactive tab accidentally trigger a second capture. Prevent duplicate submissions and use stable incident IDs.

### 6.7 Optional Family Medical Vault

The current planned vault is a small user-controlled convenience drawer for:

- Blood group.
- Age.
- Chronic conditions.
- Medications.

Requirements:

- Optional and opt-in only.
- Save and delete actions must be explicit.
- Explain that localStorage is browser storage and is not encrypted by this app.
- Never automatically transmit the saved data or attach it to a new incident without deliberate user action.
- Do not store audio, video frames or prescription images in the vault.
- Keep real family data separate from synthetic fixtures.
- If time is short, this feature is lower priority than navigation, core incident state, fallback behavior and the Vercel deployment.

---

## 7. Command Center: Multi-Tab Clinical EHR Workstation

Redesign `/command` as a focused clinical operations workstation, not six narrow columns. This is a research/demo interface, not a production hospital record system.

### 7.1 Incoming ER Patient Queue

Use a left sidebar on desktop and a collapsible drawer/stack on mobile.

Each session record should show:

- Incident ID.
- Triage priority.
- Incident category.
- Created/updated time.
- Source type: `live-gemini` or `synthetic-demo`.
- Processing status.

Sort by defined priority and then recency within equal priority. Keep the queue stable while an incident is updated through OCR. Selecting a queue item changes the active record.

Do not fabricate patient names, hospital counts, metrics or incident activity. Use real current session records or clearly labelled synthetic examples.

Full real medical data must not be persistently stored in localStorage. For the demonstration queue, prefer in-memory session state or an appropriate session store. Limit persistence of non-sensitive metadata and synthetic fixtures. Explain that same-browser synchronization is not cross-device infrastructure.

### 7.2 Golden Hour timer

Show a timer such as `T+ 00:00:00`, based on the incident's recorded start timestamp. Show the timestamp and define the timer's reference point. Label it as incident elapsed time, not a verified clinical deadline.

### 7.3 Patient sub-navigation

Each selected incident has four views.

#### A. Overview & Triage

- Original transcript.
- Detected language.
- Clinical English translation.
- Priority and category.
- Scene assessment table.
- Hazard flags.
- Creation time and event audit log.
- Distinguish reported facts, visual observations, model inference and unknowns.

#### B. Pharmacology & OCR

- Medication table.
- Strength/dosage/frequency text where available.
- Chronic conditions and allergies where supported by the record.
- Legibility/uncertainty indicators.
- Drug-trauma warnings.
- Distinguish user-corrected/confirmed values from model-extracted values.

#### C. Facility Routing & Civic Dispatch

- Recommended hospital and matched capability.
- Source-provided emergency gate and corridor.
- Coordinate/distance information where available.
- Maps link.
- Crowd-control warning content.
- Ambulance, utility and civic dispatch states.

If no actual dispatch integration exists, show “Not integrated”, “Not sent” or “Demo only”. A model-generated boolean must never be shown as confirmation that an external service was contacted.

#### D. FHIR R4 & Print

- Readable monospace JSON inspector.
- Copy JSON action with feedback.
- Print Clinical Triage Sheet action.
- Print styles in `@media print`.
- Include incident ID, timestamps, priority, clinical summary, medication alerts and clear synthetic/unverified labels when applicable.
- Validate the FHIR Bundle structure before representing it as FHIR R4.

### 7.4 Responsive behavior

- Prefer two-column clinical information layouts at normal desktop widths.
- Use a third column only when it improves an actual comparison and remains legible.
- Stack panels and make the queue collapsible on tablets/mobile.
- Do not reduce type size just to fit everything into one viewport.
- Maintain sensible scroll behavior and avoid nested scrollbars where unnecessary.

---

## 8. Strict Daylight Clinical EHR Visual System

These constraints are mandatory. The old dark emergency aesthetic is superseded.

### 8.1 Palette and borders

- Outer background: Clinical Paper Off-White `#F4F4F0`.
- Content surfaces: White `#FFFFFF`.
- Primary text: Deep Charcoal Ink `#111827`.
- Structural borders: `1px solid #D1D5DB`.
- Resuscitation Crimson: `#B91C1C` with white text.
- Emergent Amber: `#B45309`, tested with accessible text color.
- Clinical Navy: `#1E3A8A` for structural navigation/data emphasis, not as a gradient.
- Muted neutral secondary text with adequate contrast.
- Restrained green for a real successful state only.

Use CSS custom properties or equivalent design tokens. Test text contrast; do not assume the palette automatically passes accessibility checks.

### 8.2 Prohibited styling

- No dark backgrounds like `#09090b` as the primary page style.
- No neon green/teal/orange outline effects.
- No purple, blue or pink gradients.
- No gradient text.
- No glassmorphism, translucent frosted surfaces or glowing shadows.
- No grainy/animated mesh backgrounds or blurred blobs.
- No floating detached nav with heavy blur/shadow.
- No fully pill-shaped buttons or excessively rounded `rounded-xl` bento cards.
- No decorative emoji used as icons or bullets.
- No unnecessary decorative animations.

### 8.3 Typography and copy

- Prefer a clear editorial serif for optional large headings and a highly readable sans-serif for controls, tables and clinical data.
- Body copy should normally be at least 16px.
- Operational text, tables and regional-script text must remain readable at standard zoom.
- Use structured headings, clear labels, adequate line height and consistent spacing.
- Avoid hype copy such as “Supercharge”, “Unlock the power of” or “Seamlessly”.
- Avoid random capitalization and unnecessary em dashes in authored UI copy.
- Remove obsolete em-dash/emoji decorations from demo card labels, but do not perform blind global text replacement that damages user speech, data or code.

### 8.4 Controls and layouts

- Use rectangular controls with square or modest corners, generally `rounded-none` or `rounded-sm`.
- Language selector may use a compact segmented control, not a fully rounded pill row.
- Use simple and consistent navigation.
- Use bento grids only when needed to compare separate, meaningful data groups.
- Do not use decorative “Introducing” or “New” badges floating above headings.
- Do not use fake reviews, fake user counts, fake patient counts, fake success claims or generic builder tags.

### 8.5 Imagery and assets

- No generated clay/isometric illustrations or generic AI-slop photos.
- Prefer real, properly licensed imagery only if it adds real value. For this product, functional UI, sourced diagrams and clear data displays are usually preferable to hero stock photography.
- Use Lucide React icons with consistent weight and accessible labels.
- Add a simple original ZeroHour favicon. Do not add unrelated illustration sets.

### 8.6 Motion

- No parallax, typewriter text, custom cursors, cursor-following blobs, flying-in cards, heavy fade-up animation or infinite auto-scrolling marquees.
- Respect `prefers-reduced-motion`.
- Do not use rapid flashing emergency backgrounds. Use static high-contrast warning blocks with restrained optional pulses.

### 8.7 Required screenshot checks

Test approximately:

- 1440px desktop width.
- 1024px tablet width.
- 390px mobile width.

At each width, verify no horizontal overflow, clipped controls, hidden content behind fixed navigation, tiny clinical text or broken regional scripts.

---

## 9. Updated Gemini Structured Output Contract

Canonical schema file: `src/lib/triage-schema.ts`.

The file should export:

- `ZEROHOUR_MODEL_ID`.
- `ZeroHourTriageSchema` typed as the SDK `Schema` type.
- TypeScript unions/interfaces for `LanguageCode`, `TriagePriority`, `IncidentCategory`, `ZeroHourTriageResult` and nested objects.
- Application-owned source metadata type, distinct from model output.

The schema retains the original field names used by the initial implementation and adds these UI-supporting fields:

- `triage_rationale`.
- `scene_assessment` with reported findings, visual observations, hazards and unknowns.
- `first_aid_protocol.safety_caveats`.
- `medical_history_ocr.allergies`.
- `medical_history_ocr.medication_observations`, including legibility and confirmation requirement.
- `medical_history_ocr.extraction_uncertainties`.
- `auto_driver_routing.routing_rationale`.
- `assessment_limitations`.

Existing root fields retained:

- `incident_id`.
- `detected_language_code`.
- `detected_language_name`.
- `triage_priority`.
- `incident_category`.
- `extracted_caller_transcript`.
- `clinical_english_translation`.
- `visual_evidence_tags`.
- `first_aid_protocol`.
- `bystander_crowd_control`.
- `medical_history_ocr`.
- `auto_driver_routing`.
- `civic_dispatch_payload`.
- `fhir_r4_bundle_summary`.

### 9.1 Schema usage rules

- Use `responseMimeType: "application/json"` and `responseSchema: ZeroHourTriageSchema` in the existing `generateContent` call if that is the API pattern currently used by the repository.
- Do not blindly migrate to a different Gemini endpoint as part of the UI task.
- Validate/parsing-check model output in application code after generation.
- Structured output guarantees a response shape, not correct medicine identification, diagnosis, hospital facts or dispatch status.
- Ensure local demo fixtures are updated to match the schema, or type them through the same `ZeroHourTriageResult` interface.
- Assign `source: "live-gemini" | "synthetic-demo"` in application code based on the actual execution path. Never ask Gemini to determine its own provenance.
- Keep user confirmation state outside the model schema.
- Treat an empty allergy array as “no allergy was extracted/provided”, not proof that the patient has no allergies.
- Treat `critical_drug_trauma_alert` being empty as no specific alert identified from available input, not proof of no risk.
- `civic_dispatch_payload` fields are recommendations, not proof of contact with an external service.
- The `fhir_r4_bundle_summary` is a summary for a deterministic FHIR mapper, not a real Bundle by itself.

Official reference: [Gemini structured outputs](https://ai.google.dev/gemini-api/docs/structured-output).

---

## 10. Four Built-In Multilingual Demo Scenarios

These scenarios are **synthetic fixtures** for judges and tests. They must be visibly labelled “Simulated Demo” and must not be passed off as real patient cases.

### Scenario 1: Tamil/Tanglish cardiac collapse

Example input: “Hello! Appa ki திடீர்னு நெஞ்சு வலிக்குது, he's sweating heavily and dizzy near Tambaram Sanatorium bus stand! He takes sugar and blood thinner tablets!”

Expected demo emphasis:

- Cardiac emergency concern.
- Chest pain, sweating and dizziness as caller-reported symptoms.
- The caller reports chronic medication history but the exact medicine requires scan/review.
- Follow-up synthetic prescription can contain Clopilet 75 mg and Glycomet.
- Cath-lab capability matching is part of the demonstration scenario, but the final match must be validated against the existing directory and marked as a dataset-based suggestion.

### Scenario 2: Hindi/Hinglish road polytrauma

Example input: “Bhaiya ka bike skid ho gaya OMR junction ke paas, sir se khoon aa raha hai, behosh ho rahe hain!”

Expected demo emphasis:

- Road polytrauma concern.
- Head bleeding and drowsiness/unconsciousness as reported signs.
- Synthetic follow-up medicine strip can show Ecosprin 150 mg.
- Potential bleeding-risk alert, clearly labeled as a concern requiring clinician review.
- Neuro-trauma capability matching from the supplied directory if a suitable record is present.

### Scenario 3: Telugu/Tenglish electrical and flood hazard

Example input: “Velachery Main Road lo electric wire neellalo padipoyindi, oka aayana shock kotti padipoyaru, evarini neellalo diganivvakandi!”

Expected demo emphasis:

- Electrical hazard and possible electrical injury.
- A warning not to enter the water or approach a downed live wire.
- Recommend contacting emergency services and the relevant utility. Do not claim that the power was cut off or a dispatcher was contacted.
- Check for an electrical-injury/burns capability in the supplied directory.

### Scenario 4: Malayalam/Manglish acute stroke

Example input: “Achchan pettennu thalakarangi veenu, samsarikkan pattunnilla, right side kai anakkan pattunnilla!”

Expected demo emphasis:

- Suspected stroke symptoms requiring urgent professional evaluation.
- Speech difficulty and right-sided weakness as reported symptoms.
- Do not diagnose or assert that a thrombolysis window is confirmed from incomplete data.
- Match stroke-related capability only against the supplied hospital directory and show the basis for the suggestion.

### 10.1 Demo fixture rules

- Store scenarios in `src/lib/demo-scenarios.ts` or the existing fixture module.
- Mark the record source as `synthetic-demo` at the application level.
- Never invent fake clinical success outcomes or real dispatch confirmations.
- Ensure fixtures conform to `ZeroHourTriageResult`.
- No Gemini API key must be required to demonstrate the local fixture path.
- Do not falsely claim that a fixture was generated by Gemini.

---

## 11. Chennai Hospital Capability Dataset

**Canonical path:** `src/data/chennai_trauma_hubs.json`  
**Record count supplied by the user:** 8  
**Verification state:** Supplied project data. Emergency gates, coordinates, capability lists and contact details must not be described as independently verified without checking authoritative sources.

Do not fabricate more records, add a twelfth hospital to satisfy an older planning note, or silently alter these supplied records. If a record is later verified and corrected, document its source and change explicitly.

```json
[
  {
    "id": "rgggh-park-town",
    "name": "Rajiv Gandhi Govt General Hospital (RGGGH)",
    "zone": "Central / Park Town",
    "corridor": "EVR Periyar Salai (Poonamallee High Rd)",
    "type": "Government",
    "coordinates": { "lat": 13.0818, "lng": 80.2772 },
    "emergency_gate": "Tower Block 1 Zero-Delay Trauma Gate (Opp. Central Station)",
    "capabilities": ["polytrauma", "neuro_trauma", "cath_lab", "toxicology", "vascular_surgery"],
    "contact_dispatch": "044-25305000"
  },
  {
    "id": "kmc-kilpauk",
    "name": "Kilpauk Medical College Hospital (KMC)",
    "zone": "Central / Kilpauk",
    "corridor": "Poonamallee High Road",
    "type": "Government",
    "coordinates": { "lat": 13.0784, "lng": 80.2447 },
    "emergency_gate": "Main Casualty & Regional Burns Unit Gate, EVR Salai",
    "capabilities": ["burns_unit", "electrical_injury", "polytrauma", "toxicology"],
    "contact_dispatch": "044-28364951"
  },
  {
    "id": "apollo-greams",
    "name": "Apollo Hospitals, Greams Road",
    "zone": "Central / Thousand Lights",
    "corridor": "Greams Road / Anna Salai",
    "type": "Private",
    "coordinates": { "lat": 13.0632, "lng": 80.2516 },
    "emergency_gate": "Gate 2 Emergency & Chest Pain Clinic",
    "capabilities": ["cath_lab", "stroke_thrombolysis", "neuro_trauma", "polytrauma"],
    "contact_dispatch": "044-28293333"
  },
  {
    "id": "kauvery-alwarpet",
    "name": "Kauvery Hospital, Alwarpet",
    "zone": "Central / South",
    "corridor": "TTK Road / Luz Church Road Junction",
    "type": "Private",
    "coordinates": { "lat": 13.0336, "lng": 80.2542 },
    "emergency_gate": "Emergency Bay, TTK Road Entrance",
    "capabilities": ["cath_lab", "geriatric_emergency", "stroke_thrombolysis", "neuro_trauma"],
    "contact_dispatch": "044-40006000"
  },
  {
    "id": "miot-manapakkam",
    "name": "MIOT International, Manapakkam",
    "zone": "West / South-West",
    "corridor": "Mount-Poonamallee Road",
    "type": "Private",
    "coordinates": { "lat": 13.0213, "lng": 80.1844 },
    "emergency_gate": "Level-1 Trauma & Orthopaedic Emergency Gate",
    "capabilities": ["polytrauma", "orthopaedic_trauma", "vascular_surgery", "neuro_trauma", "cath_lab"],
    "contact_dispatch": "044-42002288"
  },
  {
    "id": "rela-chromepet",
    "name": "Dr. Rela Institute & Medical Centre, Chromepet",
    "zone": "South / Suburbs",
    "corridor": "GST Road (CLC Works Road)",
    "type": "Private",
    "coordinates": { "lat": 12.9565, "lng": 80.1419 },
    "emergency_gate": "Emergency Triage Bay, GST Service Road Entrance",
    "capabilities": ["cath_lab", "polytrauma", "neuro_trauma", "critical_care", "toxicology"],
    "contact_dispatch": "044-66667777"
  },
  {
    "id": "gleneagles-perumbakkam",
    "name": "Gleneagles HealthCity, Perumbakkam (OMR/Sholinganallur)",
    "zone": "South / OMR IT Corridor",
    "corridor": "Cheran Nagar / Sholinganallur-Medavakkam Link Road",
    "type": "Private",
    "coordinates": { "lat": 12.8988, "lng": 80.2064 },
    "emergency_gate": "24x7 Trauma & Neuro Emergency Bay",
    "capabilities": ["neuro_trauma", "polytrauma", "cath_lab", "stroke_thrombolysis"],
    "contact_dispatch": "044-44777000"
  },
  {
    "id": "srm-global-kattankulathur",
    "name": "SRM Medical College Hospital & Research Centre",
    "zone": "Far South / GST Corridor",
    "corridor": "GST Road, Potheri / Kattankulathur",
    "type": "Private / Teaching",
    "coordinates": { "lat": 12.8231, "lng": 80.0453 },
    "emergency_gate": "Highway Trauma & Casualty Block, GST Road",
    "capabilities": ["polytrauma", "neuro_trauma", "cath_lab", "toxicology", "burns_unit"],
    "contact_dispatch": "044-47432333"
  }
]
```

---

## 12. API Contract and Gemini Behavior

### 12.1 Endpoint

- `POST /api/triage` for triage, multimodal capture and medical-image processing according to the existing request contract.
- Reject unsupported methods with appropriate status codes.
- Validate request shape, content type and payload size before expensive model processing.
- Avoid returning raw SDK errors or stack traces to the browser.
- Do not include the API key in client components, browser URLs, logs or responses.

### 12.2 Environment variables

Local development uses `.env.local` in the project root:

```dotenv
GOOGLE_API_KEY=your_actual_secret_value
```

The real file must never be committed. `.env.example` may contain placeholders only. Do not prefix the secret with `NEXT_PUBLIC_`.

Vercel requires `GOOGLE_API_KEY` to be configured in the project's Environment Variables settings for each applicable environment, followed by redeployment.

### 12.3 Model request behavior

- Use the canonical `ZeroHourTriageSchema` export.
- Preserve current multimodal inputs.
- Include the current stable incident ID and the hospital directory context where appropriate.
- Instruct the model not to invent unreadable details, hospitals, capabilities, gate locations or external dispatch outcomes.
- Parse the response and validate it against the application type/validation layer.
- Handle missing key, model access failure, quota/rate limits, malformed output and timeout distinctly enough for debugging while hiding secrets from users.

### 12.4 Model output is not verification

A schema-conforming response may still be factually wrong. Hospital selection must be checked against the supplied directory. OCR results must show uncertainty. Clinical recommendations must not be presented as confirmed diagnosis or substitute for professional assessment.

---

## 13. Security Requirements Before Public Deployment

Complete a bounded, documented security review before public launch. Do not claim “fully secure” or “full audit passed” based only on a successful build.

### 13.1 Secrets and Git history

- Check `.env.local`, all environment-file variants, `.gitignore` and `.env.example`.
- Check browser bundles and client code for secret references.
- Ensure `GOOGLE_API_KEY` is server-only.
- Scan current files and Git history for leaked secrets using an appropriate tool.
- If a key has ever been exposed, revoke/rotate it. Removing the current copy alone is not sufficient.
- Never echo secret values into logs or terminal reports.

### 13.2 API protection

- Validate request method, content type, input schema and field sizes.
- Set a request body limit of less than 4.5 MB and return `413 Payload Too Large` for oversized requests.
- Validate image content/type rather than trusting only extensions.
- Bound audio/image count, transcript lengths and other fields.
- Implement a starting rate limit of 12 triage requests per minute per trusted client IP.
- Return `429 Too Many Requests` with appropriate retry information.
- Do not trust arbitrary caller-supplied IP headers.
- For distributed/serverless deployment, use a shared rate-limit store or clearly document the limitation of a local in-memory development fallback.
- Use safe errors and avoid logging full medical payloads.

### 13.3 Input handling

- Use schema validation such as Zod for untrusted JSON where appropriate.
- Render transcripts as text. Avoid `dangerouslySetInnerHTML` for user/model-provided clinical text.
- Do not blindly strip HTML-like characters from transcripts, because doing so can damage legitimate speech text. Sanitize rich HTML only if the product intentionally accepts it.
- Validate and bound uploads before processing them.

### 13.4 Security headers

Configure and verify appropriate headers through the existing `next.config.js`, including:

- `X-Frame-Options: DENY`.
- `X-Content-Type-Options: nosniff`.
- `Referrer-Policy: strict-origin-when-cross-origin`.
- A suitable Content Security Policy, tested against the app.
- A suitable Permissions Policy that does not accidentally disable camera, microphone and geolocation on the app's own origin.
- HSTS for the HTTPS production deployment after confirming deployment assumptions.

Reference: [Next.js header configuration](https://nextjs.org/docs/app/api-reference/config/next-config-js/headers).

### 13.5 Command Center access gate

A Clinical Duty Officer PIN gate may be implemented for `/command` if time and current architecture permit.

- Do not hard-code a PIN in source code or verify it only in browser JavaScript.
- Store a PIN/secret in server-side environment configuration.
- Rate-limit attempts.
- If it is intended to protect clinical records, use server-validated sessions and protect data APIs as well as the visible page.
- A one-click Judge Demo Bypass must grant access only to synthetic demo records. It must not bypass protection for real or private records.
- If there is no protected-record backend, document that a UI gate alone is not production-grade access control.
- Do not require login for the citizen emergency-start workflow.

### 13.6 Data minimization and local storage

- Do not persist raw audio, video keyframes or prescription images in localStorage.
- Avoid persistent storage of real clinical payloads in browser storage.
- Keep the demo queue in memory or an appropriate session store; persist only minimal, non-sensitive metadata or clearly synthetic fixtures where needed.
- Do not put medical data or secrets in URLs or console logs.
- Be clear about what the application stores and transmits.

### 13.7 Dependency and build configuration

- Review dependency vulnerabilities with the package manager's audit tools.
- Update only what is necessary and compatible within the time available.
- Remove unused dependencies only after checking imports and builds.
- Do not run destructive Git commands, overwrite user changes or force major dependency upgrades without reason.
- Confirm production builds with `NODE_ENV=production` behavior as provided by Next.js/Vercel.

Reference: [OWASP REST Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html) and [OWASP Input Validation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html).

---

## 14. Academic Credibility, Sources and Legal Pages

Before public launch, include:

1. **Favicon:** A simple, original ZeroHour mark that follows the daylight clinical visual system.
2. **References page:** Traceable references supporting first-aid advice, triage terms, FHIR implementation and relevant technical claims. Cite authoritative organisations and standards. Do not invent articles or imply endorsement.
3. **Privacy page:** Accurately describe camera, microphone, geolocation, prescription-image processing, Gemini processing, local storage, session history and retention. Describe actual behavior, not intended future behavior.
4. **Terms page:** Explain that this is a research prototype and not a replacement for emergency services, clinician assessment or hospital systems. Have legal text reviewed where necessary.
5. **Custom domain:** Connect and verify the domain through Vercel/DNS. This step requires the owner's domain and account access.

Other trust requirements:

- No fake reviews, usage numbers, success rates, hospital acceptance rates or operational metrics.
- No generic “Made with AI”/builder tags.
- Label synthetic cases clearly.
- Label model output as provisional and identify unknowns.
- Do not present unverified hospital dataset fields as verified facts.
- Add a medical safety disclaimer in a concise, accessible location without obscuring the emergency action.

---

## 15. PWA and Browser Requirements

- Maintain valid PWA metadata and manifest.
- Add a favicon and suitable app icons if available.
- Check that the app renders without browser APIs on the server. Access `window`, `navigator`, `AudioContext`, speech APIs and camera APIs only in client-side code/handlers.
- Camera, microphone and geolocation require user permission and a secure context for the deployed application. Test in current desktop and mobile browsers.
- Provide useful states when browser APIs do not exist or permissions are denied.
- Keep app navigation responsive and prevent fixed controls from obscuring the content.
- Do not promise offline Gemini processing. The local demo fixtures can work without an API key or a model response only if implemented client-side and appropriately bundled.

---

## 16. Two-Day Execution Plan

The available time is approximately two days. Protect the critical path and do not expand scope during implementation.

### Day 1: User experience and functional stability

**Priority 1: Navigation and layout**

- Inspect existing code.
- Implement the five Citizen navigation tabs.
- Implement the persistent active-incident indicator and Panic Auto-Pilot.
- Preserve incident state across tabs.
- Reorganize `/command` into the patient queue and four patient-record views.
- Apply the daylight clinical visual design.
- Fix scrolling, desktop/tablet/mobile layout and safe areas.

**Priority 2: Preserve core behavior**

- Verify all four demo scenarios work without a key.
- Verify the capture workflow, language switching, speech and metronome.
- Verify OCR updates the same incident.
- Verify hospital matching and QR behavior.
- Verify split-screen synchronization.

**Priority 3: Build check**

- Run `npm run build` or the project's existing production build script.
- Run TypeScript/lint/tests where configured.
- Fix regressions introduced by the UI work.

### Day 2: API, security and deployment

**Priority 1: Gemini connection**

- Confirm `.env.local` contains `GOOGLE_API_KEY` in the project root and is ignored by Git.
- Verify that the deployed server route reads the key server-side.
- Run a real request and inspect the exact error/status if it fails.
- Verify model access. Current Google documentation notes that new projects may have limited access to Gemini 2.5. If necessary, perform a deliberate, documented model change and test the full output contract.

**Priority 2: Security and trust requirements**

- Test input validation, upload size/type, rate limiting and safe errors.
- Verify headers and secret handling.
- Inspect Git status/history for leaked secrets; rotate if necessary.
- Add/verify favicon, references, privacy and terms pages.
- Verify synthetic/live source labels and dispatch disclaimers.

**Priority 3: Vercel deployment**

- Ensure the repository is committed and pushed to the correct Git remote.
- Import the repository into Vercel.
- Configure `GOOGLE_API_KEY` in Vercel Environment Variables for the necessary deployment environment.
- Deploy and inspect build logs.
- Test `/`, `/command`, `/api/triage`, demo fallbacks, responsive UI and a real Gemini request on the deployed URL.
- Configure the custom domain and verify DNS/HTTPS if owner access is available.

The custom domain, production key access, DNS propagation and any external service setup can depend on accounts outside the codebase. Report these as external blockers if not completed. Do not claim the application is live on a custom domain until it has been checked.

### Scope controls if time runs short

Must finish first:

1. Readable responsive Citizen UI and Command Center.
2. Navigation, panic state and all four demo fallbacks.
3. Existing core features remain functional.
4. Successful production build.
5. Secure server-side API key handling and an honest API status.
6. Vercel deployment and smoke tests.

Next:

7. Upload hardening and rate limiting.
8. References, privacy, terms and favicon.
9. Custom domain if access allows.

Lower priority within the two-day window:

10. Family Medical Vault.
11. More elaborate queue filtering, advanced print polish or optional routing refinements.

Do not skip a safety or security requirement and report it as completed. If an item cannot be completed, document the exact limitation.

---

## 17. Verification and Acceptance Checklist

Mark a criterion complete only after actually testing it.

### Core app

- [ ] `/` renders and the Start Emergency action is accessible immediately.
- [ ] `/command` renders.
- [ ] `/api/triage` responds with safe errors and expected structured output when configured.
- [ ] All six original core features remain present and functional.
- [ ] All five languages render and language switching updates banners/speech text.
- [ ] Four synthetic demo scenarios work without the Gemini key.
- [ ] Demo results are clearly labelled synthetic.

### Citizen navigation

- [ ] Five tabs have visible icon labels.
- [ ] Active incident state survives tab changes.
- [ ] Panic Auto-Pilot advances to relevant destinations without marking uncompleted tasks as complete.
- [ ] Audio autoplay failure shows an explicit Speak Now control.
- [ ] Scroll and fixed navigation work at desktop, tablet and mobile widths.
- [ ] Family Medical Vault is opt-in, deletable and transparent about storage if included.

### Medical and routing

- [ ] Real image upload is routed to the API when live processing is used.
- [ ] OCR uncertainty is visible and user correction is possible.
- [ ] Existing eight-record hospital data is used without fabricated additions.
- [ ] Straight-line distance is not shown as road distance.
- [ ] Hospital recommendations do not imply acceptance or dispatch.
- [ ] QR payload contains only intentional, minimal data.
- [ ] The FHIR R4 Bundle is actually validated, or the UI calls it a summary when it is not a valid Bundle.

### Command Center

- [ ] Patient queue uses stable incident IDs and does not duplicate OCR updates.
- [ ] Priority/recency sort works.
- [ ] Elapsed timer uses the correct recorded timestamp.
- [ ] Four patient sub-views work.
- [ ] Copy and print functions work.
- [ ] Synthetic and live-source labels are accurate.
- [ ] Same-browser sync works; no unsupported cross-device claim is made.

### Security

- [ ] API key is server-only and `.env.local` is ignored by Git.
- [ ] Current repository and Git history are checked for leaked secrets.
- [ ] Request validation, body size limits and file checks work.
- [ ] Rate limit behavior is tested and the production storage model is documented.
- [ ] Security headers are verified in responses.
- [ ] Officer gate, if implemented, is server-validated and demo bypass is synthetic-only.
- [ ] No full clinical data or secrets are printed to console logs.
- [ ] Dependency audit and production build are run.

### Trust and launch

- [ ] Favicon is present.
- [ ] References contain real, traceable sources.
- [ ] Privacy page matches actual application data flows.
- [ ] Terms page states the prototype's scope and limitations.
- [ ] Vercel deployment succeeds and deployed routes are smoke-tested.
- [ ] Custom domain and HTTPS are verified, or listed as remaining external setup.

---

## 18. Sources and Standards

Use these as starting points and verify the specific claims/pages relevant to the implementation. These sources do not certify ZeroHour or validate the supplied hospital records.

- Google Gemini structured outputs: https://ai.google.dev/gemini-api/docs/structured-output
- Google Gemini model availability: https://ai.google.dev/gemini-api/docs/models
- Google Gemini deprecations: https://ai.google.dev/gemini-api/docs/deprecations
- Next.js response headers: https://nextjs.org/docs/app/api-reference/config/next-config-js/headers
- Next.js environment variables: https://nextjs.org/docs/app/guides/environment-variables
- OWASP REST Security Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html
- OWASP Input Validation Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html
- OWASP Password Storage Cheat Sheet, if password authentication is introduced: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
- HL7 FHIR R4 specification: https://hl7.org/fhir/R4/
- W3C Web Content Accessibility Guidelines 2.2: https://www.w3.org/TR/WCAG22/
- Google Maps URLs: https://developers.google.com/maps/documentation/urls/get-started

---

## 19. Future Roadmap After the MVP

These are future ideas, not launch requirements for the current two-day build:

- QR sticker bystander mode with a deliberate consent/privacy model.
- WhatsApp voice/photo bot using the same triage pipeline.
- Authenticated cross-device incident sync.
- Real map routing and traffic-aware travel-time estimates.
- Controlled integration with real hospital systems or dispatch services.
- Larger, properly licensed evaluation datasets and documented benchmark cases.

Do not introduce these into the current MVP critical path unless the user explicitly changes the scope.

---

## 20. Implementation Instructions for Antigravity

Read this entire `SYSTEM_BLUEPRINT.md` and inspect the repository before editing. This updated document is the source of truth for current requirements.

Implement in this order:

1. Inspect existing features and current working-tree state. Do not overwrite user changes.
2. Implement the daylight clinical design tokens and responsive layouts.
3. Implement the five Citizen tabs, persistent incident state, and Panic Auto-Pilot.
4. Redesign `/command` into the patient queue and four patient-record views.
5. Update and integrate `src/lib/triage-schema.ts`; update demo fixtures and consumers to match its types. Keep only one canonical schema definition.
6. Verify the original six features and four demo scenarios.
7. Implement the security review and required server-side controls without exposing secrets or falsely claiming an exhaustive audit.
8. Add the references, privacy, terms and favicon requirements.
9. Run production build, type checking, lint/tests and responsive/browser checks.
10. Prepare and execute Vercel deployment steps if the user has provided the necessary account access. Never fabricate deployment success.

Do not implement all tasks as unreviewed global text replacements. Do not change the model or schema silently. Do not label synthetic data as live. Do not claim real dispatch, hospital acceptance, clinical verification or cross-device synchronization unless those capabilities actually exist.

At the end, report changed files, completed behavior, actual checks run, test results, known issues and remaining external setup. This is a research prototype; accuracy, uncertainty, privacy, legibility and truthful status reporting take priority over visual decoration or exaggerated claims.
