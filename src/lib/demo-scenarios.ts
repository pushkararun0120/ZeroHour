import { getHospitalById } from "./hospitals";
import type {
  AutoDriverRouting,
  MedicalHistoryOcr,
  ZeroHourTriageResult,
} from "./triage-schema";

/** Label shown on every simulated scenario and its output. */
export const SIMULATED_LABEL = "Simulated Demo";

/** The app assigns the incident ID, so fixtures do not carry one. */
export type TriageFixture = Omit<ZeroHourTriageResult, "incident_id">;

export type DemoScenarioId =
  | "tamil-cardiac"
  | "hindi-polytrauma"
  | "telugu-electrical"
  | "malayalam-stroke";

export interface DemoScenario {
  id: DemoScenarioId;
  label: string;
  languageLabel: string;
  summary: string;
  /** The simulated caller's words. */
  inputText: string;
  /** A sample record that goes with this scenario in the Med Scan tab. */
  suggestedSampleId: string;
  triage: TriageFixture;
}

export interface SamplePrescription {
  id: string;
  label: string;
  description: string;
  ocr: MedicalHistoryOcr;
}

const SIMULATION_NOTE =
  "This is a simulated demo scenario written by the developers. No real caller, camera frames or audio were analysed, and Gemini did not produce it.";
const CLINICIAN_NOTE = "A clinician must assign the real triage level.";

/** Builds routing from the supplied directory so the fixture cannot drift from it. */
function routingFrom(
  hospitalId: string,
  capability: string,
  rationale: string,
  spokenDirection: string,
): AutoDriverRouting {
  const hospital = getHospitalById(hospitalId);
  if (!hospital) {
    throw new Error(`Demo scenario uses a hospital that is not in the directory: ${hospitalId}`);
  }
  if (!hospital.capabilities.includes(capability)) {
    throw new Error(`${hospitalId} does not list the capability ${capability}`);
  }
  return {
    recommended_hospital_id: hospital.id,
    recommended_hospital_name: hospital.name,
    required_capability_matched: capability,
    routing_rationale: rationale,
    emergency_gate_instructions: `${hospital.emergency_gate} (from the supplied directory, not independently verified)`,
    spoken_driver_direction_native: spokenDirection,
  };
}

// ---------------------------------------------------------------------------
// Scenario 1: Tamil / Tanglish cardiac emergency
// ---------------------------------------------------------------------------

const TAMIL_INPUT =
  "Hello! Appa ki திடீர்னு நெஞ்சு வலிக்குது, he's sweating heavily and dizzy near Tambaram Sanatorium bus stand! He takes sugar and blood thinner tablets!";

const cardiacRouting = routingFrom(
  "rela-chromepet",
  "cath_lab",
  "Chest pain with sweating suggests a possible cardiac need, so a hospital that lists cath_lab was matched from the supplied directory. Dr. Rela is the closest listed cath_lab hospital to the reported area, judged by the coordinates in the directory. The hospital has not been contacted and has not accepted the patient.",
  "Dr. Rela Institute & Medical Centre, குரோம்பேட்டைக்குச் செல்லுங்கள். அவசரப் பிரிவு வாசல்: Emergency Triage Bay, GST Service Road Entrance.",
);

const tamilCardiac: DemoScenario = {
  id: "tamil-cardiac",
  label: "Cardiac emergency",
  languageLabel: "Tamil / Tanglish",
  summary: "Chest pain, sweating and dizziness near Tambaram Sanatorium bus stand.",
  inputText: TAMIL_INPUT,
  suggestedSampleId: "sample-cardiac-antiplatelet",
  triage: {
    detected_language_code: "ta-IN",
    detected_language_name: "Tamil (Tanglish)",
    triage_priority: "ESI_2_EMERGENT",
    triage_rationale:
      "Chest pain with heavy sweating and dizziness can be a heart emergency, so a high priority is suggested. Breathing and responsiveness were not described. " +
      CLINICIAN_NOTE,
    incident_category: "CARDIAC_EMERGENCY",
    extracted_caller_transcript: TAMIL_INPUT,
    clinical_english_translation:
      "Caller reports that his father suddenly has chest pain, is sweating heavily and is dizzy, near Tambaram Sanatorium bus stand. Caller says he takes tablets for sugar and a blood thinner.",
    visual_evidence_tags: [],
    scene_assessment: {
      scene_summary:
        "Caller reports his father has sudden chest pain, heavy sweating and dizziness near Tambaram Sanatorium bus stand.",
      reported_findings: [
        "Sudden chest pain",
        "Heavy sweating",
        "Dizziness",
        "Takes tablets for sugar and a blood thinner (caller report)",
      ],
      visual_observations: [],
      hazard_flags: [],
      unknowns: [
        "Patient's age",
        "Whether he is awake and breathing normally",
        "How long the pain has lasted",
        "Names and doses of his medicines",
        "Current blood sugar",
        "Any known allergies",
      ],
    },
    first_aid_protocol: {
      spoken_instruction_en:
        "Help him sit down and stay still. Loosen tight clothing. Call 108 now. Do not give him food, drink or any medicine unless the operator tells you to. Stay with him and watch his breathing.",
      spoken_instruction_native:
        "அவரை உட்கார வைத்து அசையாமல் ஓய்வெடுக்கச் சொல்லுங்கள். இறுக்கமான ஆடைகளைத் தளர்த்துங்கள். உடனே 108க்கு அழைக்கவும். ஆபரேட்டர் சொல்லாத வரை உணவு, தண்ணீர் அல்லது மருந்து எதுவும் கொடுக்க வேண்டாம். அவருடன் இருந்து சுவாசத்தைக் கவனியுங்கள்.",
      multilingual_tts_map: {
        ta: "அவரை உட்கார வைத்து அசையாமல் ஓய்வெடுக்கச் சொல்லுங்கள். இறுக்கமான ஆடைகளைத் தளர்த்துங்கள். உடனே 108க்கு அழைக்கவும். ஆபரேட்டர் சொல்லாத வரை உணவு, தண்ணீர் அல்லது மருந்து எதுவும் கொடுக்க வேண்டாம். அவருடன் இருந்து சுவாசத்தைக் கவனியுங்கள்.",
        hi: "उन्हें बैठाएं और बिल्कुल हिलने-डुलने न दें। तंग कपड़े ढीले करें। अभी 108 पर कॉल करें। ऑपरेटर के कहे बिना उन्हें कुछ खाने-पीने को या कोई दवा न दें। उनके साथ रहें और सांस पर नज़र रखें।",
        te: "ఆయనను కూర్చోబెట్టి కదలకుండా విశ్రాంతి తీసుకోనివ్వండి. బిగుతైన దుస్తులను వదులు చేయండి. వెంటనే 108కి కాల్ చేయండి. ఆపరేటర్ చెప్పే వరకు ఆహారం, నీళ్లు లేదా మందులు ఇవ్వకండి. ఆయన దగ్గరే ఉండి శ్వాసను గమనించండి.",
        ml: "അദ്ദേഹത്തെ ഇരുത്തി അനങ്ങാതെ വിശ്രമിക്കാൻ അനുവദിക്കുക. മുറുകിയ വസ്ത്രങ്ങൾ അയയ്ക്കുക. ഉടൻ 108-ൽ വിളിക്കുക. ഓപ്പറേറ്റർ പറയുന്നതുവരെ ഭക്ഷണമോ വെള്ളമോ മരുന്നോ നൽകരുത്. കൂടെയിരുന്ന് ശ്വാസം ശ്രദ്ധിക്കുക.",
      },
      requires_cpr_metronome: false,
      step_by_step_actions: [
        "Call 108 now, or ask a bystander to call.",
        "Help him sit down in a comfortable position and keep him still.",
        "Loosen tight clothing around the neck and chest.",
        "Do not give food, drink or any medicine unless the operator tells you to.",
        "Stay with him and watch his breathing and responsiveness.",
        "If he becomes unresponsive and is not breathing normally, tell the operator and start chest compressions.",
      ],
      safety_caveats: [
        "Chest pain with sweating can be a heart emergency. Do not wait to see if it passes.",
        "The caller says he takes a blood thinner, so do not give aspirin or other tablets unless a medical professional tells you to.",
        "Sweating and dizziness can have other causes, such as low blood sugar. Do not guess. Tell the operator that he takes tablets for sugar.",
      ],
    },
    bystander_crowd_control: {
      danger_banner_en: "MEDICAL EMERGENCY. Give him space. Do not crowd. Someone call 108.",
      danger_banner_ta: "மருத்துவ அவசரநிலை. இடம் விடுங்கள். கூட்டம் கூட வேண்டாம். யாராவது 108க்கு அழைக்கவும்.",
      danger_banner_hi: "चिकित्सा आपातकाल। जगह दें। भीड़ न लगाएं। कोई 108 पर कॉल करे।",
      danger_banner_te: "వైద్య అత్యవసర పరిస్థితి. స్థలం ఇవ్వండి. గుమిగూడకండి. ఎవరైనా 108కి కాల్ చేయండి.",
      danger_banner_ml: "വൈദ്യ അടിയന്തരാവസ്ഥ. സ്ഥലം നൽകുക. തിങ്ങിക്കൂടരുത്. ആരെങ്കിലും 108-ൽ വിളിക്കുക.",
      crowd_delegation_task:
        "Ask one person to call 108 and another to clear space around him.",
    },
    medical_history_ocr: {
      chronic_conditions: ["Diabetes (reported by caller, not verified)"],
      detected_medications: [],
      allergies: [],
      medication_observations: [],
      critical_drug_trauma_alert: "",
      extraction_uncertainties: [
        "The caller mentioned sugar tablets and a blood thinner. Exact medicine names, strengths and doses are not known until a record is scanned.",
        "No allergy information was provided.",
      ],
    },
    auto_driver_routing: cardiacRouting,
    civic_dispatch_payload: {
      notify_108_ambulance: true,
      notify_power_utility_cutoff: false,
      notify_civic_command_hazard: false,
      dispatch_notes:
        "Suggest contacting 108. Reported location: near Tambaram Sanatorium bus stand. Nothing was sent from this app.",
    },
    fhir_r4_bundle_summary: {
      resourceType: "ClinicalSummary",
      chiefComplaint: "Sudden chest pain with sweating and dizziness (caller report)",
      suspectedDiagnosis: "Possible cardiac event, for clinician review",
      activeMedications: [
        "Blood thinner tablets (reported by caller, name not known)",
        "Tablets for diabetes (reported by caller, name not known)",
      ],
      vitalRiskFlags: ["Chest pain", "Sweating", "Dizziness"],
      receivingFacility: cardiacRouting.recommended_hospital_name,
    },
    assessment_limitations: [
      SIMULATION_NOTE,
      "Only the caller's words were used. There is no information about breathing, responsiveness or vital signs.",
    ],
  },
};

// ---------------------------------------------------------------------------
// Scenario 2: Hindi / Hinglish road polytrauma
// ---------------------------------------------------------------------------

const HINDI_INPUT =
  "Bhaiya ka bike skid ho gaya OMR junction ke paas, sir se khoon aa raha hai, behosh ho rahe hain!";

const polytraumaRouting = routingFrom(
  "gleneagles-perumbakkam",
  "neuro_trauma",
  "A head injury with loss of consciousness needs a hospital that lists neuro_trauma. The directory lists several. Gleneagles is on the OMR side of the city, close to the reported area. The hospital has not been contacted and has not accepted the patient.",
  "Gleneagles HealthCity, Perumbakkam जाएं। इमरजेंसी गेट: 24x7 Trauma & Neuro Emergency Bay।",
);

const hindiPolytrauma: DemoScenario = {
  id: "hindi-polytrauma",
  label: "Road polytrauma",
  languageLabel: "Hindi / Hinglish",
  summary: "Motorbike skid near an OMR junction, head bleeding, losing consciousness.",
  inputText: HINDI_INPUT,
  suggestedSampleId: "sample-head-injury-strip",
  triage: {
    detected_language_code: "hi-IN",
    detected_language_name: "Hindi (Hinglish)",
    triage_priority: "ESI_1_RESUSCITATION",
    triage_rationale:
      "Head bleeding with loss of consciousness after a bike crash can mean a serious head injury, so the highest provisional priority is suggested. Breathing was not described. " +
      CLINICIAN_NOTE,
    incident_category: "ROAD_POLYTRAUMA",
    extracted_caller_transcript: HINDI_INPUT,
    clinical_english_translation:
      "Caller reports that his brother's motorbike skidded near the OMR junction. Blood is coming from the head and he is losing consciousness.",
    visual_evidence_tags: [],
    scene_assessment: {
      scene_summary:
        "Caller reports a motorbike skid near an OMR junction. The rider is bleeding from the head and losing consciousness.",
      reported_findings: [
        "Motorbike skid",
        "Bleeding from the head",
        "Losing consciousness",
      ],
      visual_observations: [],
      hazard_flags: ["Possible traffic at the crash site (junction location reported)"],
      unknowns: [
        "Whether a helmet was worn",
        "How much blood has been lost",
        "Whether he is breathing normally",
        "Other injuries",
        "Medicines he takes, including blood thinners",
        "Which OMR junction",
      ],
    },
    first_aid_protocol: {
      spoken_instruction_en:
        "Keep his head and neck still. Do not move him unless there is danger. Press a clean cloth gently on the bleeding. Call 108 now. Do not give food or drink. If he stops breathing normally, tell the operator and start chest compressions.",
      spoken_instruction_native:
        "उनका सिर और गर्दन स्थिर रखें। खतरा न हो तो उन्हें हिलाएं नहीं। खून बहने की जगह पर साफ कपड़ा हल्के से दबाकर रखें। अभी 108 पर कॉल करें। खाना या पानी न दें। अगर वे सामान्य रूप से सांस नहीं ले रहे हों, तो ऑपरेटर को बताएं और सीने पर दबाव देना शुरू करें।",
      multilingual_tts_map: {
        ta: "அவரது தலையையும் கழுத்தையும் அசையாமல் வைத்திருங்கள். ஆபத்து இல்லாவிட்டால் அவரை நகர்த்த வேண்டாம். ரத்தம் வரும் இடத்தில் சுத்தமான துணியை மெதுவாக அழுத்தி வைக்கவும். உடனே 108க்கு அழைக்கவும். உணவு அல்லது தண்ணீர் கொடுக்க வேண்டாம். சாதாரணமாக சுவாசிக்கவில்லை என்றால், ஆபரேட்டரிடம் சொல்லி மார்பு அழுத்தங்களைத் தொடங்குங்கள்.",
        hi: "उनका सिर और गर्दन स्थिर रखें। खतरा न हो तो उन्हें हिलाएं नहीं। खून बहने की जगह पर साफ कपड़ा हल्के से दबाकर रखें। अभी 108 पर कॉल करें। खाना या पानी न दें। अगर वे सामान्य रूप से सांस नहीं ले रहे हों, तो ऑपरेटर को बताएं और सीने पर दबाव देना शुरू करें।",
        te: "ఆయన తల, మెడ కదలకుండా ఉంచండి. ప్రమాదం లేకపోతే ఆయనను కదిలించకండి. రక్తం కారుతున్న చోట శుభ్రమైన గుడ్డను మెల్లగా నొక్కి ఉంచండి. వెంటనే 108కి కాల్ చేయండి. ఆహారం లేదా నీళ్లు ఇవ్వకండి. ఆయన సాధారణంగా శ్వాస తీసుకోకపోతే, ఆపరేటర్‌కు చెప్పి ఛాతీపై నొక్కడం మొదలుపెట్టండి.",
        ml: "അദ്ദേഹത്തിന്റെ തലയും കഴുത്തും അനങ്ങാതെ പിടിക്കുക. അപകടമില്ലെങ്കിൽ അദ്ദേഹത്തെ നീക്കരുത്. രക്തം വരുന്ന ഭാഗത്ത് വൃത്തിയുള്ള തുണി പതുക്കെ അമർത്തി വെക്കുക. ഉടൻ 108-ൽ വിളിക്കുക. ഭക്ഷണമോ വെള്ളമോ നൽകരുത്. സാധാരണ പോലെ ശ്വസിക്കുന്നില്ലെങ്കിൽ ഓപ്പറേറ്ററോട് പറഞ്ഞ് നെഞ്ചിൽ അമർത്തുന്നത് തുടങ്ങുക.",
      },
      requires_cpr_metronome: false,
      step_by_step_actions: [
        "Call 108 now, or ask a bystander to call.",
        "Keep his head and neck as still as possible. Do not move him unless there is danger such as traffic or fire.",
        "Press a clean cloth gently on the bleeding. Do not press hard if the skull feels dented.",
        "Do not remove a helmet unless the operator tells you to.",
        "Do not give food or drink.",
        "Watch his breathing. If he is not breathing normally, tell the operator and start chest compressions.",
      ],
      safety_caveats: [
        "A head injury with loss of consciousness can be serious even if the bleeding looks small.",
        "Moving a person with a possible neck injury can cause more harm.",
        "Keep traffic away from the scene.",
      ],
    },
    bystander_crowd_control: {
      danger_banner_en: "ROAD ACCIDENT. Keep the injured person still. Do not crowd. Someone call 108.",
      danger_banner_ta: "சாலை விபத்து. காயமடைந்தவரை அசைக்க வேண்டாம். கூட்டம் கூட வேண்டாம். யாராவது 108க்கு அழைக்கவும்.",
      danger_banner_hi: "सड़क दुर्घटना। घायल को हिलाएं नहीं। भीड़ न लगाएं। कोई 108 पर कॉल करे।",
      danger_banner_te: "రోడ్డు ప్రమాదం. గాయపడిన వ్యక్తిని కదిలించకండి. గుమిగూడకండి. ఎవరైనా 108కి కాల్ చేయండి.",
      danger_banner_ml: "റോഡ് അപകടം. പരിക്കേറ്റ ആളെ അനക്കരുത്. തിങ്ങിക്കൂടരുത്. ആരെങ്കിലും 108-ൽ വിളിക്കുക.",
      crowd_delegation_task:
        "Ask one person to call 108 and another to keep traffic away from the crash site.",
    },
    medical_history_ocr: {
      chronic_conditions: [],
      detected_medications: [],
      allergies: [],
      medication_observations: [],
      critical_drug_trauma_alert: "",
      extraction_uncertainties: [
        "No medical history was provided. Whether he takes blood thinners is not known.",
        "No allergy information was provided.",
      ],
    },
    auto_driver_routing: polytraumaRouting,
    civic_dispatch_payload: {
      notify_108_ambulance: true,
      notify_power_utility_cutoff: false,
      notify_civic_command_hazard: false,
      dispatch_notes:
        "Suggest contacting 108. Reported location: near an OMR junction (exact junction not given). Nothing was sent from this app.",
    },
    fhir_r4_bundle_summary: {
      resourceType: "ClinicalSummary",
      chiefComplaint:
        "Head bleeding and loss of consciousness after a motorbike skid (caller report)",
      suspectedDiagnosis: "Possible serious head injury, for clinician review",
      activeMedications: [],
      vitalRiskFlags: ["Head bleeding", "Reduced consciousness"],
      receivingFacility: polytraumaRouting.recommended_hospital_name,
    },
    assessment_limitations: [
      SIMULATION_NOTE,
      "Only the caller's words were used. Injuries other than head bleeding are unknown.",
    ],
  },
};

// ---------------------------------------------------------------------------
// Scenario 3: Telugu / Tenglish electrical and flood hazard
// ---------------------------------------------------------------------------

const TELUGU_INPUT =
  "Velachery Main Road lo electric wire neellalo padipoyindi, oka aayana shock kotti padipoyaru, evarini neellalo diganivvakandi!";

const electricalRouting = routingFrom(
  "kmc-kilpauk",
  "electrical_injury",
  "Kilpauk Medical College Hospital is the only hospital in the supplied directory that lists electrical_injury. It may be far from the scene. The app shows straight-line distance only when a real device location is available. The hospital has not been contacted and has not accepted the patient.",
  "Kilpauk Medical College Hospital కి వెళ్లండి. అత్యవసర ద్వారం: Main Casualty & Regional Burns Unit Gate, EVR Salai.",
);

const teluguElectrical: DemoScenario = {
  id: "telugu-electrical",
  label: "Electrical and flood hazard",
  languageLabel: "Telugu / Tenglish",
  summary: "Live wire in water on Velachery Main Road, one man shocked and fallen.",
  inputText: TELUGU_INPUT,
  suggestedSampleId: "sample-handwritten-partial",
  triage: {
    detected_language_code: "te-IN",
    detected_language_name: "Telugu (Tenglish)",
    triage_priority: "ESI_2_EMERGENT",
    triage_rationale:
      "A person who was shocked and fell near a live wire in water may have an electrical injury, and rescuers are also at risk. A high priority is suggested until responsiveness and breathing are known. " +
      CLINICIAN_NOTE,
    incident_category: "ELECTRICAL_CIVIC_HAZARD",
    extracted_caller_transcript: TELUGU_INPUT,
    clinical_english_translation:
      "Caller reports that an electric wire has fallen into the water on Velachery Main Road. A man received a shock and fell. The caller is telling people not to enter the water.",
    visual_evidence_tags: [],
    scene_assessment: {
      scene_summary:
        "Caller reports an electric wire in water on Velachery Main Road. One man was shocked and fell.",
      reported_findings: [
        "Electric wire fell into water",
        "One man was shocked and fell",
        "Caller is warning people not to enter the water",
      ],
      visual_observations: [],
      hazard_flags: [
        "Possible live electric wire in water",
        "Standing water around the victim",
        "Risk of further shock to rescuers and bystanders",
      ],
      unknowns: [
        "Whether the power to the wire is off",
        "Whether the man is awake and breathing",
        "How many people are at risk",
        "How deep and wide the water is",
      ],
    },
    first_aid_protocol: {
      spoken_instruction_en:
        "Do not enter the water. Do not touch the person or the wire. Keep everyone back. Call 108 and the electricity department now. Help only after the power is confirmed off.",
      spoken_instruction_native:
        "నీటిలోకి దిగకండి. బాధితుడిని లేదా తీగను తాకకండి. అందరినీ దూరంగా ఉంచండి. వెంటనే 108కి, విద్యుత్ శాఖకు కాల్ చేయండి. విద్యుత్ ఆపివేశారని నిర్ధారణ అయ్యాకే సహాయం చేయండి.",
      multilingual_tts_map: {
        ta: "தண்ணீரில் இறங்க வேண்டாம். பாதிக்கப்பட்டவரையோ மின் கம்பியையோ தொடாதீர்கள். அனைவரையும் விலகி நிற்கச் சொல்லுங்கள். உடனே 108க்கும் மின்வாரியத்திற்கும் அழைக்கவும். மின்சாரம் நிறுத்தப்பட்டது உறுதியான பிறகு மட்டுமே உதவுங்கள்.",
        hi: "पानी में न उतरें। पीड़ित या तार को न छुएं। सबको दूर रखें। अभी 108 और बिजली विभाग को कॉल करें। बिजली बंद होने की पुष्टि के बाद ही मदद करें।",
        te: "నీటిలోకి దిగకండి. బాధితుడిని లేదా తీగను తాకకండి. అందరినీ దూరంగా ఉంచండి. వెంటనే 108కి, విద్యుత్ శాఖకు కాల్ చేయండి. విద్యుత్ ఆపివేశారని నిర్ధారణ అయ్యాకే సహాయం చేయండి.",
        ml: "വെള്ളത്തിൽ ഇറങ്ങരുത്. ബാധിതനെയോ കമ്പിയോ തൊടരുത്. എല്ലാവരെയും അകറ്റി നിർത്തുക. ഉടൻ 108-ലും വൈദ്യുതി വകുപ്പിലും വിളിക്കുക. വൈദ്യുതി ഓഫാക്കിയെന്ന് ഉറപ്പായ ശേഷം മാത്രം സഹായിക്കുക.",
      },
      requires_cpr_metronome: false,
      step_by_step_actions: [
        "Stay out of the water and keep everyone else out.",
        "Do not touch the person or the wire.",
        "Call 108 and the electricity department. Say there is a live wire in water.",
        "Keep people at a safe distance from the water.",
        "Go to the person only after the electricity department confirms the power is off.",
        "Once it is safe, check if he is breathing. If not, start chest compressions.",
      ],
      safety_caveats: [
        "Water can carry current. A wire in the water may energise a wide area.",
        "Do not use metal or wet objects to move the wire.",
        "Rescuers can be shocked too if they step into the water before the power is off.",
      ],
    },
    bystander_crowd_control: {
      danger_banner_en:
        "DANGER: LIVE ELECTRIC WIRE. Stay out of the water. Do not touch the person. Keep everyone back.",
      danger_banner_ta:
        "ஆபத்து: மின் கம்பி. தண்ணீரில் இறங்க வேண்டாம். பாதிக்கப்பட்டவரைத் தொடாதீர்கள். அனைவரும் விலகி நிற்கவும்.",
      danger_banner_hi: "खतरा: बिजली का तार। पानी में न जाएं। पीड़ित को न छुएं। सब दूर रहें।",
      danger_banner_te: "ప్రమాదం: విద్యుత్ తీగ. నీటిలోకి దిగకండి. బాధితుడిని తాకకండి. అందరూ దూరంగా ఉండండి.",
      danger_banner_ml:
        "അപകടം: വൈദ്യുതി കമ്പി. വെള്ളത്തിൽ ഇറങ്ങരുത്. ബാധിതനെ തൊടരുത്. എല്ലാവരും അകന്നു നിൽക്കുക.",
      crowd_delegation_task:
        "Ask one person to call 108 and the electricity department, and ask others to keep everyone away from the water.",
    },
    medical_history_ocr: {
      chronic_conditions: [],
      detected_medications: [],
      allergies: [],
      medication_observations: [],
      critical_drug_trauma_alert: "",
      extraction_uncertainties: [
        "No medical history was provided.",
        "No allergy information was provided.",
      ],
    },
    auto_driver_routing: electricalRouting,
    civic_dispatch_payload: {
      notify_108_ambulance: true,
      notify_power_utility_cutoff: true,
      notify_civic_command_hazard: true,
      dispatch_notes:
        "Suggest contacting 108 and the electricity department. Reported location: Velachery Main Road. Nothing was sent from this app, and nobody has confirmed that the power is off.",
    },
    fhir_r4_bundle_summary: {
      resourceType: "ClinicalSummary",
      chiefComplaint: "Electric shock near a live wire in water (caller report)",
      suspectedDiagnosis: "Possible electrical injury, for clinician review",
      activeMedications: [],
      vitalRiskFlags: ["Live wire in water", "Collapsed after shock"],
      receivingFacility: electricalRouting.recommended_hospital_name,
    },
    assessment_limitations: [
      SIMULATION_NOTE,
      "Whether the power is off is not known. Rescue should wait until the electricity department confirms it.",
    ],
  },
};

// ---------------------------------------------------------------------------
// Scenario 4: Malayalam / Manglish acute stroke
// ---------------------------------------------------------------------------

const MALAYALAM_INPUT =
  "Achchan pettennu thalakarangi veenu, samsarikkan pattunnilla, right side kai anakkan pattunnilla!";

const strokeRouting = routingFrom(
  "kauvery-alwarpet",
  "stroke_thrombolysis",
  "Sudden speech difficulty and one-sided weakness need a hospital that lists stroke_thrombolysis. Three hospitals in the directory list it. Kauvery was used for this demo because no location was given, so the nearest could not be worked out. With a real device location, the app ranks the matches by straight-line distance. The hospital has not been contacted and has not accepted the patient.",
  "Kauvery Hospital, Alwarpet-ലേക്ക് പോകുക. അടിയന്തര പ്രവേശനം: Emergency Bay, TTK Road Entrance.",
);

const malayalamStroke: DemoScenario = {
  id: "malayalam-stroke",
  label: "Acute stroke",
  languageLabel: "Malayalam / Manglish",
  summary: "Sudden dizziness and fall, cannot speak, cannot move the right hand.",
  inputText: MALAYALAM_INPUT,
  suggestedSampleId: "sample-handwritten-partial",
  triage: {
    detected_language_code: "ml-IN",
    detected_language_name: "Malayalam (Manglish)",
    triage_priority: "ESI_2_EMERGENT",
    triage_rationale:
      "Sudden trouble speaking and weakness on one side are warning signs of a stroke. Treatment is time-sensitive, so a high priority is suggested. The time the symptoms started is not known. " +
      CLINICIAN_NOTE,
    incident_category: "STROKE_NEURO",
    extracted_caller_transcript: MALAYALAM_INPUT,
    clinical_english_translation:
      "Caller reports that his father suddenly felt dizzy and fell. He cannot speak and cannot move his right hand.",
    visual_evidence_tags: [],
    scene_assessment: {
      scene_summary:
        "Caller reports his father suddenly felt dizzy and fell, and now cannot speak or move his right hand.",
      reported_findings: [
        "Sudden dizziness and a fall",
        "Cannot speak",
        "Cannot move the right hand",
      ],
      visual_observations: [],
      hazard_flags: [],
      unknowns: [
        "Time the symptoms started",
        "Whether he hit his head when he fell",
        "Whether he is awake and breathing normally",
        "Medicines he takes, including blood thinners",
        "Blood sugar",
        "Location (not given in the message)",
      ],
    },
    first_aid_protocol: {
      spoken_instruction_en:
        "Help him lie down or sit with his head supported. Do not give food, drink or medicine. Note the time the symptoms started. Call 108 now and say it may be a stroke.",
      spoken_instruction_native:
        "അദ്ദേഹത്തെ കിടത്തുക, അല്ലെങ്കിൽ തല താങ്ങി ഇരുത്തുക. ഭക്ഷണമോ വെള്ളമോ മരുന്നോ നൽകരുത്. ലക്ഷണങ്ങൾ തുടങ്ങിയ സമയം കുറിച്ചുവെക്കുക. ഉടൻ 108-ൽ വിളിച്ച് സ്ട്രോക്ക് ആകാം എന്ന് പറയുക.",
      multilingual_tts_map: {
        ta: "அவரைப் படுக்க வைக்கவும் அல்லது தலையைத் தாங்கியபடி உட்கார வைக்கவும். உணவு, தண்ணீர் அல்லது மருந்து கொடுக்க வேண்டாம். அறிகுறிகள் தொடங்கிய நேரத்தைக் குறித்துக்கொள்ளுங்கள். உடனே 108க்கு அழைத்து பக்கவாதமாக இருக்கலாம் என்று சொல்லுங்கள்.",
        hi: "उन्हें लिटाएं या सिर को सहारा देकर बैठाएं। खाना, पानी या दवा न दें। लक्षण शुरू होने का समय नोट करें। अभी 108 पर कॉल करें और बताएं कि यह स्ट्रोक हो सकता है।",
        te: "ఆయనను పడుకోబెట్టండి లేదా తలకు ఆధారం ఇచ్చి కూర్చోబెట్టండి. ఆహారం, నీళ్లు లేదా మందులు ఇవ్వకండి. లక్షణాలు మొదలైన సమయాన్ని గుర్తుంచుకోండి. వెంటనే 108కి కాల్ చేసి స్ట్రోక్ అయి ఉండవచ్చని చెప్పండి.",
        ml: "അദ്ദേഹത്തെ കിടത്തുക, അല്ലെങ്കിൽ തല താങ്ങി ഇരുത്തുക. ഭക്ഷണമോ വെള്ളമോ മരുന്നോ നൽകരുത്. ലക്ഷണങ്ങൾ തുടങ്ങിയ സമയം കുറിച്ചുവെക്കുക. ഉടൻ 108-ൽ വിളിച്ച് സ്ട്രോക്ക് ആകാം എന്ന് പറയുക.",
      },
      requires_cpr_metronome: false,
      step_by_step_actions: [
        "Call 108 now and say it may be a stroke.",
        "Help him lie down, or sit with his head supported.",
        "Note the exact time his symptoms started, or the last time he was seen well.",
        "Do not give food, drink or medicine, including aspirin.",
        "If he vomits or becomes drowsy, turn him onto his side.",
        "Stay with him and watch his breathing.",
      ],
      safety_caveats: [
        "Stroke treatment is time-sensitive. Do not wait to see if the symptoms pass.",
        "Do not give anything by mouth because he may have trouble swallowing.",
        "Aspirin is not safe in every stroke, so do not give it.",
      ],
    },
    bystander_crowd_control: {
      danger_banner_en: "STROKE SUSPECTED. Do not give food or drink. Note the time. Someone call 108.",
      danger_banner_ta: "பக்கவாதம் சந்தேகம். உணவு, தண்ணீர் கொடுக்க வேண்டாம். நேரத்தைக் குறித்துக்கொள்ளுங்கள். யாராவது 108க்கு அழைக்கவும்.",
      danger_banner_hi: "स्ट्रोक का संदेह। खाना-पानी न दें। समय नोट करें। कोई 108 पर कॉल करे।",
      danger_banner_te: "స్ట్రోక్ అనుమానం. ఆహారం, నీళ్లు ఇవ్వకండి. సమయం గుర్తుంచుకోండి. ఎవరైనా 108కి కాల్ చేయండి.",
      danger_banner_ml: "സ്ട്രോക്ക് സംശയം. ഭക്ഷണമോ വെള്ളമോ നൽകരുത്. സമയം കുറിച്ചുവെക്കുക. ആരെങ്കിലും 108-ൽ വിളിക്കുക.",
      crowd_delegation_task:
        "Ask one person to call 108 and another to write down the time the symptoms started.",
    },
    medical_history_ocr: {
      chronic_conditions: [],
      detected_medications: [],
      allergies: [],
      medication_observations: [],
      critical_drug_trauma_alert: "",
      extraction_uncertainties: [
        "No medical history was provided. Whether he takes blood thinners is not known, and this matters for stroke treatment decisions.",
        "No allergy information was provided.",
      ],
    },
    auto_driver_routing: strokeRouting,
    civic_dispatch_payload: {
      notify_108_ambulance: true,
      notify_power_utility_cutoff: false,
      notify_civic_command_hazard: false,
      dispatch_notes:
        "Suggest contacting 108. No location was given in the message. Nothing was sent from this app.",
    },
    fhir_r4_bundle_summary: {
      resourceType: "ClinicalSummary",
      chiefComplaint:
        "Sudden dizziness, fall, difficulty speaking and right hand weakness (caller report)",
      suspectedDiagnosis: "Possible stroke, for clinician review",
      activeMedications: [],
      vitalRiskFlags: ["Speech difficulty", "Right-sided weakness", "Symptom onset time unknown"],
      receivingFacility: strokeRouting.recommended_hospital_name,
    },
    assessment_limitations: [
      SIMULATION_NOTE,
      "The time the symptoms started is not known, so it cannot be said whether time-sensitive treatment is still possible.",
    ],
  },
};

export const DEMO_SCENARIOS: readonly DemoScenario[] = [
  tamilCardiac,
  hindiPolytrauma,
  teluguElectrical,
  malayalamStroke,
];

// ---------------------------------------------------------------------------
// Sample records for the Med Scan tab (simulated, not real patient data)
// ---------------------------------------------------------------------------

export const SAMPLE_PRESCRIPTIONS: readonly SamplePrescription[] = [
  {
    id: "sample-cardiac-antiplatelet",
    label: "Prescription: Clopilet and Glycomet",
    description: "Simulated printed prescription. Goes with the cardiac scenario.",
    ocr: {
      chronic_conditions: ["Diabetes (written as K/C/O DM on the sheet)"],
      detected_medications: ["Clopilet 75 mg", "Glycomet"],
      allergies: [],
      medication_observations: [
        {
          medication_name: "Clopilet",
          strength_text: "75 mg",
          dose_frequency_text: "OD",
          source_text: "Tab Clopilet 75 mg OD",
          legibility_status: "CLEAR",
          requires_user_confirmation: false,
        },
        {
          medication_name: "Glycomet",
          strength_text: "",
          dose_frequency_text: "",
          source_text: "Tab Glycomet (strength and dose smudged)",
          legibility_status: "PARTIALLY_LEGIBLE",
          requires_user_confirmation: true,
        },
      ],
      critical_drug_trauma_alert:
        "Clopilet is a brand of clopidogrel, an antiplatelet medicine that raises bleeding risk. Tell the receiving team about it before any procedure. This is a concern for clinician review, not a confirmed finding.",
      extraction_uncertainties: [
        "Glycomet strength and dose could not be read.",
        "The brand reading should be confirmed against the tablet packaging or a pharmacist.",
        "The sheet does not show when the last dose was taken.",
        "No allergy line was found on the sheet.",
      ],
    },
  },
  {
    id: "sample-head-injury-strip",
    label: "Tablet strip: Ecosprin 150",
    description: "Simulated tablet strip. Goes with the road polytrauma scenario.",
    ocr: {
      chronic_conditions: [],
      detected_medications: ["Ecosprin 150 mg"],
      allergies: [],
      medication_observations: [
        {
          medication_name: "Ecosprin",
          strength_text: "150 mg",
          dose_frequency_text: "",
          source_text: "ECOSPRIN 150 (printed on tablet strip)",
          legibility_status: "CLEAR",
          requires_user_confirmation: false,
        },
      ],
      critical_drug_trauma_alert:
        "Ecosprin is a brand of aspirin, which can increase bleeding. With a reported head injury, tell the receiving doctors about it right away. This is a concern for clinician review, not a confirmed finding.",
      extraction_uncertainties: [
        "A strip shows the medicine but not who takes it, how often, or when the last dose was taken.",
        "No other medicines or conditions were visible.",
      ],
    },
  },
  {
    id: "sample-handwritten-partial",
    label: "Handwritten sheet: partly legible",
    description:
      "Simulated handwritten prescription with unclear lines. Shows how uncertain readings are handled.",
    ocr: {
      chronic_conditions: ["Hypertension (written as K/C/O HTN, partly legible)"],
      detected_medications: ["Atorvastatin 20 mg", "Amlodipine"],
      allergies: ["Penicillin (allergy line is partly legible)"],
      medication_observations: [
        {
          medication_name: "Atorvastatin",
          strength_text: "20 mg",
          dose_frequency_text: "HS",
          source_text: "Tab Atorvastatin 20 mg HS",
          legibility_status: "CLEAR",
          requires_user_confirmation: false,
        },
        {
          medication_name: "Amlodipine",
          strength_text: "5 mg",
          dose_frequency_text: "OD",
          source_text: "Tab Amlodipine 5(?) mg OD",
          legibility_status: "PARTIALLY_LEGIBLE",
          requires_user_confirmation: true,
        },
        {
          medication_name: "Unreadable",
          strength_text: "",
          dose_frequency_text: "",
          source_text: "Third line could not be read",
          legibility_status: "UNREADABLE",
          requires_user_confirmation: true,
        },
      ],
      critical_drug_trauma_alert: "",
      extraction_uncertainties: [
        "The third medicine line could not be read.",
        "The Amlodipine strength is uncertain.",
        "The allergy line is partly legible and should be confirmed with the family.",
        "No blood thinner was found on this sheet, but that does not rule out other medicines.",
      ],
    },
  },
];

export function getDemoScenario(id: string): DemoScenario | undefined {
  return DEMO_SCENARIOS.find((scenario) => scenario.id === id);
}

export function getSamplePrescription(id: string): SamplePrescription | undefined {
  return SAMPLE_PRESCRIPTIONS.find((sample) => sample.id === id);
}

/** A full triage result for a scenario, with the app-assigned incident ID. Returns a fresh copy. */
export function buildDemoTriage(
  scenario: DemoScenario,
  incidentId: string,
): ZeroHourTriageResult {
  return { incident_id: incidentId, ...structuredClone(scenario.triage) };
}