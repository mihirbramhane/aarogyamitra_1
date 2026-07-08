// lib/i18n.ts
//
// Best-effort UI translations for en/hi/te/ta/bn/mr. These are machine/LLM
// translations, NOT reviewed by a native speaker — please have someone fluent
// check the wording (especially government/medical terms) before relying on
// this for real users, since a wrong term could mislead someone.
//
// One shared language selection (the wizard's language step) drives both the
// spoken report AND this UI chrome — there is intentionally no second picker.

export type LangCode = "en" | "hi" | "te" | "ta" | "bn" | "mr";

export interface Strings {
  appName: string;
  loading: string;
  signInTitle: string;
  signUpTitle: string;
  email: string;
  password: string;
  signIn: string;
  signUp: string;
  toggleToSignUp: string;
  toggleToSignIn: string;
  stepState: string;
  stepStateHint: string;
  useMyLocation: string;
  stepIncome: string;
  incomeLabel: string;
  familySizeLabel: string;
  stepRationCard: string;
  stepAilment: string;
  ailmentPlaceholder: string;
  tapToSpeak: string;
  stepLanguage: string;
  stepReview: string;
  uploadBill: string;
  back: string;
  next: string;
  submit: string;
  tapToHear: string;
  agentsWorking: string;
  resultsReady: string;
  matchedSchemes: string;
  coverageSummary: string;
  nearbyHospitals: string;
  documentsNeeded: string;
  listen: string;
  stop: string;
  copy: string;
  download: string;
  print: string;
  shareWhatsApp: string;
  sendSms: string;
  sendWhatsApp: string;
  phoneNumberPlaceholder: string;
  history: string;
  signOut: string;
  rationWhite: string;
  rationYellow: string;
  rationOrange: string;
  rationNone: string;
}

export const STRINGS: Record<LangCode, Strings> = {
  en: {
    appName: "AarogyaMitra",
    loading: "Loading your health guide…",
    signInTitle: "Sign in to continue",
    signUpTitle: "Create your account",
    email: "Email",
    password: "Password",
    signIn: "Sign In",
    signUp: "Sign Up",
    toggleToSignUp: "Don't have an account? Sign Up",
    toggleToSignIn: "Already have an account? Sign In",
    stepState: "Where do you live?",
    stepStateHint: "Choose your state",
    useMyLocation: "📍 Use my location",
    stepIncome: "Family income & size",
    incomeLabel: "Family annual income (₹)",
    familySizeLabel: "Family size",
    stepRationCard: "Do you have a ration card?",
    stepAilment: "What is the health issue?",
    ailmentPlaceholder: "e.g. Cardiac surgery, Kidney dialysis",
    tapToSpeak: "Tap to speak",
    stepLanguage: "Choose your language",
    stepReview: "Review & submit",
    uploadBill: "Hospital bill / estimate (PDF, optional)",
    back: "Back",
    next: "Next",
    submit: "🚀 Find My Schemes",
    tapToHear: "🔊 Tap to hear this",
    agentsWorking: "AI Agents Working…",
    resultsReady: "Your Results Are Ready!",
    matchedSchemes: "Matched Schemes",
    coverageSummary: "Coverage Summary",
    nearbyHospitals: "Nearby Hospitals",
    documentsNeeded: "Documents Needed",
    listen: "Listen",
    stop: "Stop",
    copy: "Copy",
    download: "Download",
    print: "Print",
    shareWhatsApp: "Share via WhatsApp",
    sendSms: "Send SMS",
    sendWhatsApp: "Send WhatsApp",
    phoneNumberPlaceholder: "+91 98765 43210",
    history: "History",
    signOut: "Sign out",
    rationWhite: "White / BPL",
    rationYellow: "Yellow / AAY",
    rationOrange: "Orange / APL",
    rationNone: "No card",
  },
  hi: {
    appName: "आरोग्यमित्र",
    loading: "आपकी स्वास्थ्य गाइड लोड हो रही है…",
    signInTitle: "जारी रखने के लिए साइन इन करें",
    signUpTitle: "अपना खाता बनाएं",
    email: "ईमेल",
    password: "पासवर्ड",
    signIn: "साइन इन करें",
    signUp: "साइन अप करें",
    toggleToSignUp: "खाता नहीं है? साइन अप करें",
    toggleToSignIn: "पहले से खाता है? साइन इन करें",
    stepState: "आप कहाँ रहते हैं?",
    stepStateHint: "अपना राज्य चुनें",
    useMyLocation: "📍 मेरा स्थान उपयोग करें",
    stepIncome: "पारिवारिक आय और सदस्य",
    incomeLabel: "परिवार की वार्षिक आय (₹)",
    familySizeLabel: "परिवार के सदस्य",
    stepRationCard: "क्या आपके पास राशन कार्ड है?",
    stepAilment: "स्वास्थ्य समस्या क्या है?",
    ailmentPlaceholder: "जैसे हृदय शल्य चिकित्सा, किडनी डायलिसिस",
    tapToSpeak: "बोलने के लिए टैप करें",
    stepLanguage: "अपनी भाषा चुनें",
    stepReview: "समीक्षा करें और भेजें",
    uploadBill: "अस्पताल का बिल / अनुमान (PDF, वैकल्पिक)",
    back: "पीछे",
    next: "आगे",
    submit: "🚀 मेरी योजनाएं खोजें",
    tapToHear: "🔊 सुनने के लिए टैप करें",
    agentsWorking: "AI एजेंट काम कर रहे हैं…",
    resultsReady: "आपके परिणाम तैयार हैं!",
    matchedSchemes: "योग्य योजनाएं",
    coverageSummary: "कवरेज सारांश",
    nearbyHospitals: "नज़दीकी अस्पताल",
    documentsNeeded: "आवश्यक दस्तावेज़",
    listen: "सुनें",
    stop: "रोकें",
    copy: "कॉपी करें",
    download: "डाउनलोड करें",
    print: "प्रिंट करें",
    shareWhatsApp: "व्हाट्सएप पर शेयर करें",
    sendSms: "SMS भेजें",
    sendWhatsApp: "व्हाट्सएप भेजें",
    phoneNumberPlaceholder: "+91 98765 43210",
    history: "इतिहास",
    signOut: "साइन आउट करें",
    rationWhite: "सफेद / BPL",
    rationYellow: "पीला / AAY",
    rationOrange: "नारंगी / APL",
    rationNone: "कार्ड नहीं है",
  },
  te: {
    appName: "ఆరోగ్యమిత్ర",
    loading: "మీ ఆరోగ్య గైడ్ లోడ్ అవుతోంది…",
    signInTitle: "కొనసాగించడానికి సైన్ ఇన్ చేయండి",
    signUpTitle: "మీ ఖాతాను సృష్టించండి",
    email: "ఇమెయిల్",
    password: "పాస్‌వర్డ్",
    signIn: "సైన్ ఇన్",
    signUp: "సైన్ అప్",
    toggleToSignUp: "ఖాతా లేదా? సైన్ అప్ చేయండి",
    toggleToSignIn: "ఇప్పటికే ఖాతా ఉందా? సైన్ ఇన్ చేయండి",
    stepState: "మీరు ఎక్కడ నివసిస్తున్నారు?",
    stepStateHint: "మీ రాష్ట్రాన్ని ఎంచుకోండి",
    useMyLocation: "📍 నా స్థానాన్ని ఉపయోగించండి",
    stepIncome: "కుటుంబ ఆదాయం & సభ్యులు",
    incomeLabel: "కుటుంబ వార్షిక ఆదాయం (₹)",
    familySizeLabel: "కుటుంబ సభ్యుల సంఖ్య",
    stepRationCard: "మీ వద్ద రేషన్ కార్డు ఉందా?",
    stepAilment: "ఆరోగ్య సమస్య ఏమిటి?",
    ailmentPlaceholder: "ఉదా. గుండె శస్త్రచికిత్స, కిడ్నీ డయాలసిస్",
    tapToSpeak: "మాట్లాడటానికి నొక్కండి",
    stepLanguage: "మీ భాషను ఎంచుకోండి",
    stepReview: "సమీక్షించి సమర్పించండి",
    uploadBill: "ఆసుపత్రి బిల్లు / అంచనా (PDF, ఐచ్ఛికం)",
    back: "వెనుకకు",
    next: "తదుపరి",
    submit: "🚀 నా పథకాలను కనుగొనండి",
    tapToHear: "🔊 వినడానికి నొక్కండి",
    agentsWorking: "AI ఏజెంట్లు పనిచేస్తున్నారు…",
    resultsReady: "మీ ఫలితాలు సిద్ధంగా ఉన్నాయి!",
    matchedSchemes: "అర్హత గల పథకాలు",
    coverageSummary: "కవరేజ్ సారాంశం",
    nearbyHospitals: "సమీప ఆసుపత్రులు",
    documentsNeeded: "అవసరమైన పత్రాలు",
    listen: "వినండి",
    stop: "ఆపు",
    copy: "కాపీ చేయండి",
    download: "డౌన్‌లోడ్ చేయండి",
    print: "ప్రింట్ చేయండి",
    shareWhatsApp: "వాట్సాప్‌లో పంచుకోండి",
    sendSms: "SMS పంపండి",
    sendWhatsApp: "వాట్సాప్ పంపండి",
    phoneNumberPlaceholder: "+91 98765 43210",
    history: "చరిత్ర",
    signOut: "సైన్ అవుట్",
    rationWhite: "తెలుపు / BPL",
    rationYellow: "పసుపు / AAY",
    rationOrange: "నారింజ / APL",
    rationNone: "కార్డు లేదు",
  },
  ta: {
    appName: "ஆரோக்யமித்ரா",
    loading: "உங்கள் சுகாதார வழிகாட்டி ஏற்றப்படுகிறது…",
    signInTitle: "தொடர உள்நுழையவும்",
    signUpTitle: "உங்கள் கணக்கை உருவாக்கவும்",
    email: "மின்னஞ்சல்",
    password: "கடவுச்சொல்",
    signIn: "உள்நுழைக",
    signUp: "பதிவு செய்க",
    toggleToSignUp: "கணக்கு இல்லையா? பதிவு செய்யவும்",
    toggleToSignIn: "ஏற்கனவே கணக்கு உள்ளதா? உள்நுழையவும்",
    stepState: "நீங்கள் எங்கு வசிக்கிறீர்கள்?",
    stepStateHint: "உங்கள் மாநிலத்தை தேர்ந்தெடுக்கவும்",
    useMyLocation: "📍 எனது இருப்பிடத்தைப் பயன்படுத்தவும்",
    stepIncome: "குடும்ப வருமானம் & உறுப்பினர்கள்",
    incomeLabel: "குடும்ப ஆண்டு வருமானம் (₹)",
    familySizeLabel: "குடும்ப உறுப்பினர்கள்",
    stepRationCard: "உங்களிடம் ரேஷன் கார்டு உள்ளதா?",
    stepAilment: "உடல்நலப் பிரச்சனை என்ன?",
    ailmentPlaceholder: "எ.கா. இதய அறுவை சிகிச்சை, சிறுநீரக டயாலிசிஸ்",
    tapToSpeak: "பேச தட்டவும்",
    stepLanguage: "உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்",
    stepReview: "மதிப்பாய்வு செய்து சமர்ப்பிக்கவும்",
    uploadBill: "மருத்துவமனை பில் / மதிப்பீடு (PDF, விருப்பமானது)",
    back: "பின்",
    next: "அடுத்து",
    submit: "🚀 எனது திட்டங்களைக் கண்டறியவும்",
    tapToHear: "🔊 கேட்க தட்டவும்",
    agentsWorking: "AI முகவர்கள் பணிபுரிகின்றனர்…",
    resultsReady: "உங்கள் முடிவுகள் தயார்!",
    matchedSchemes: "பொருந்தும் திட்டங்கள்",
    coverageSummary: "கவரேஜ் சுருக்கம்",
    nearbyHospitals: "அருகிலுள்ள மருத்துவமனைகள்",
    documentsNeeded: "தேவையான ஆவணங்கள்",
    listen: "கேளுங்கள்",
    stop: "நிறுத்து",
    copy: "நகலெடு",
    download: "பதிவிறக்கு",
    print: "அச்சிடு",
    shareWhatsApp: "வாட்ஸ்அப் மூலம் பகிரவும்",
    sendSms: "SMS அனுப்பு",
    sendWhatsApp: "வாட்ஸ்அப் அனுப்பு",
    phoneNumberPlaceholder: "+91 98765 43210",
    history: "வரலாறு",
    signOut: "வெளியேறு",
    rationWhite: "வெள்ளை / BPL",
    rationYellow: "மஞ்சள் / AAY",
    rationOrange: "ஆரஞ்சு / APL",
    rationNone: "கார்டு இல்லை",
  },
  bn: {
    appName: "আরোগ্যমিত্র",
    loading: "আপনার স্বাস্থ্য গাইড লোড হচ্ছে…",
    signInTitle: "চালিয়ে যেতে সাইন ইন করুন",
    signUpTitle: "আপনার অ্যাকাউন্ট তৈরি করুন",
    email: "ইমেইল",
    password: "পাসওয়ার্ড",
    signIn: "সাইন ইন",
    signUp: "সাইন আপ",
    toggleToSignUp: "অ্যাকাউন্ট নেই? সাইন আপ করুন",
    toggleToSignIn: "ইতিমধ্যে অ্যাকাউন্ট আছে? সাইন ইন করুন",
    stepState: "আপনি কোথায় থাকেন?",
    stepStateHint: "আপনার রাজ্য নির্বাচন করুন",
    useMyLocation: "📍 আমার অবস্থান ব্যবহার করুন",
    stepIncome: "পারিবারিক আয় ও সদস্য সংখ্যা",
    incomeLabel: "পারিবারিক বার্ষিক আয় (₹)",
    familySizeLabel: "পরিবারের সদস্য সংখ্যা",
    stepRationCard: "আপনার কি রেশন কার্ড আছে?",
    stepAilment: "স্বাস্থ্য সমস্যা কী?",
    ailmentPlaceholder: "যেমন হৃদরোগ অস্ত্রোপচার, কিডনি ডায়ালাইসিস",
    tapToSpeak: "কথা বলতে ট্যাপ করুন",
    stepLanguage: "আপনার ভাষা নির্বাচন করুন",
    stepReview: "পর্যালোচনা করে জমা দিন",
    uploadBill: "হাসপাতালের বিল / আনুমানিক খরচ (PDF, ঐচ্ছিক)",
    back: "পেছনে",
    next: "পরবর্তী",
    submit: "🚀 আমার প্রকল্প খুঁজুন",
    tapToHear: "🔊 শুনতে ট্যাপ করুন",
    agentsWorking: "AI এজেন্টরা কাজ করছে…",
    resultsReady: "আপনার ফলাফল প্রস্তুত!",
    matchedSchemes: "যোগ্য প্রকল্পসমূহ",
    coverageSummary: "কভারেজ সারাংশ",
    nearbyHospitals: "নিকটবর্তী হাসপাতাল",
    documentsNeeded: "প্রয়োজনীয় নথিপত্র",
    listen: "শুনুন",
    stop: "থামুন",
    copy: "কপি করুন",
    download: "ডাউনলোড করুন",
    print: "প্রিন্ট করুন",
    shareWhatsApp: "হোয়াটসঅ্যাপে শেয়ার করুন",
    sendSms: "SMS পাঠান",
    sendWhatsApp: "হোয়াটসঅ্যাপ পাঠান",
    phoneNumberPlaceholder: "+91 98765 43210",
    history: "ইতিহাস",
    signOut: "সাইন আউট",
    rationWhite: "সাদা / BPL",
    rationYellow: "হলুদ / AAY",
    rationOrange: "কমলা / APL",
    rationNone: "কার্ড নেই",
  },
  mr: {
    appName: "आरोग्यमित्र",
    loading: "तुमचे आरोग्य मार्गदर्शक लोड होत आहे…",
    signInTitle: "सुरू ठेवण्यासाठी साइन इन करा",
    signUpTitle: "तुमचे खाते तयार करा",
    email: "ईमेल",
    password: "पासवर्ड",
    signIn: "साइन इन करा",
    signUp: "साइन अप करा",
    toggleToSignUp: "खाते नाही? साइन अप करा",
    toggleToSignIn: "आधीच खाते आहे? साइन इन करा",
    stepState: "तुम्ही कुठे राहता?",
    stepStateHint: "तुमचे राज्य निवडा",
    useMyLocation: "📍 माझे स्थान वापरा",
    stepIncome: "कौटुंबिक उत्पन्न आणि सदस्य",
    incomeLabel: "कुटुंबाचे वार्षिक उत्पन्न (₹)",
    familySizeLabel: "कुटुंब सदस्य संख्या",
    stepRationCard: "तुमच्याकडे रेशन कार्ड आहे का?",
    stepAilment: "आरोग्य समस्या काय आहे?",
    ailmentPlaceholder: "उदा. हृदय शस्त्रक्रिया, किडनी डायलिसिस",
    tapToSpeak: "बोलण्यासाठी टॅप करा",
    stepLanguage: "तुमची भाषा निवडा",
    stepReview: "पुनरावलोकन करा आणि सबमिट करा",
    uploadBill: "रुग्णालय बिल / अंदाज (PDF, ऐच्छिक)",
    back: "मागे",
    next: "पुढे",
    submit: "🚀 माझ्या योजना शोधा",
    tapToHear: "🔊 ऐकण्यासाठी टॅप करा",
    agentsWorking: "AI एजंट काम करत आहेत…",
    resultsReady: "तुमचे निकाल तयार आहेत!",
    matchedSchemes: "पात्र योजना",
    coverageSummary: "कव्हरेज सारांश",
    nearbyHospitals: "जवळची रुग्णालये",
    documentsNeeded: "आवश्यक कागदपत्रे",
    listen: "ऐका",
    stop: "थांबवा",
    copy: "कॉपी करा",
    download: "डाउनलोड करा",
    print: "प्रिंट करा",
    shareWhatsApp: "व्हॉट्सअॅपवर शेअर करा",
    sendSms: "SMS पाठवा",
    sendWhatsApp: "व्हॉट्सअॅप पाठवा",
    phoneNumberPlaceholder: "+91 98765 43210",
    history: "इतिहास",
    signOut: "साइन आउट करा",
    rationWhite: "पांढरे / BPL",
    rationYellow: "पिवळे / AAY",
    rationOrange: "केशरी / APL",
    rationNone: "कार्ड नाही",
  },
};

export function t(lang: string): Strings {
  return STRINGS[lang as LangCode] ?? STRINGS.en;
}
