import { createContext, useContext, useState, useMemo } from 'react';

const LanguageContext = createContext(null);

const translations = {
  en: {
    dashboard: 'Dashboard',
    cropAdvisor: 'Crop Advisor',
    weatherIntel: 'Weather Intel',
    govSchemes: 'Govt. Schemes',
    community: 'Community',
    diseaseCheck: 'Disease Check',
    adminConsole: 'Admin Console',
    logout: 'Log Out',
    activeCrops: 'Active Crops',
    rainChance: 'Rain Chance',
    cropHealth: 'Crop Health',
    potentialProfit: 'Potential Profit',
    farmPerformance: 'Farm Performance',
    actionPlan: 'Today’s Action Plan',
    recentActivity: 'Recent Activity',
    askQuestion: 'Ask a Question',
    searchDiscussions: 'Search discussions...',
    popularTopics: 'Popular Topics',
    savedCrops: 'Saved Crops',
    eligibilityFilters: 'Eligibility Filters',
    applyScheme: 'View eligibility and apply',
    uploadLeaf: 'Upload a leaf photo',
    previousScans: 'Previous Scans History',
    analyzeHealth: 'Analyze Crop Health',
    recommendCrops: 'Find Suitable Crops',
    soilType: 'Soil Type',
    season: 'Season',
    region: 'Region',
    waterAvailability: 'Water Availability',
    landArea: 'Land Area (acres)',
    registeredFarmers: 'Registered Farmers',
    activeSchemes: 'Active Schemes',
    reportedPosts: 'Reported Posts',
    adviceViews: 'Monthly Advice Views',
    managementQueue: 'Management Queue',
    language: 'Language',
    needAgronomyHelp: 'Need agronomy help?',
    talkToExpert: 'Talk to a local expert through Community.',
    farmSnapshot: 'Here is your farm snapshot for today.',
    goodMorning: 'Good morning',
  },
  hi: {
    dashboard: 'डैशबोर्ड',
    cropAdvisor: 'फसल सलाहकार',
    weatherIntel: 'मौसम की जानकारी',
    govSchemes: 'सरकारी योजनाएं',
    community: 'समुदाय',
    diseaseCheck: 'रोग की जांच',
    adminConsole: 'व्यवस्थापक कंसोल',
    logout: 'लॉग आउट',
    activeCrops: 'सक्रिय फसलें',
    rainChance: 'बारिश की संभावना',
    cropHealth: 'फसल का स्वास्थ्य',
    potentialProfit: 'संभावित लाभ',
    farmPerformance: 'खेत का प्रदर्शन',
    actionPlan: 'आज की कार्य योजना',
    recentActivity: 'हाल की गतिविधि',
    askQuestion: 'सवाल पूछें',
    searchDiscussions: 'चर्चा खोजें...',
    popularTopics: 'लोकप्रिय विषय',
    savedCrops: 'सहेजी गई फसलें',
    eligibilityFilters: 'पात्रता फ़िल्टर',
    applyScheme: 'पात्रता देखें और आवेदन करें',
    uploadLeaf: 'पत्ते की फोटो अपलोड करें',
    previousScans: 'पिछले स्कैन का इतिहास',
    analyzeHealth: 'फसल स्वास्थ्य का विश्लेषण करें',
    recommendCrops: 'उपयुक्त फसलें खोजें',
    soilType: 'मिट्टी का प्रकार',
    season: 'मौसम',
    region: 'क्षेत्र',
    waterAvailability: 'पानी की उपलब्धता',
    landArea: 'भूमि क्षेत्र (एकड़)',
    registeredFarmers: 'पंजीकृत किसान',
    activeSchemes: 'सक्रिय योजनाएं',
    reportedPosts: 'रिपोर्ट की गई पोस्ट',
    adviceViews: 'मासिक सलाह दृश्य',
    managementQueue: 'प्रबंधन कतार',
    language: 'भाषा',
    needAgronomyHelp: 'कृषि सहायता चाहिए?',
    talkToExpert: 'समुदाय के माध्यम से स्थानीय विशेषज्ञ से बात करें।',
    farmSnapshot: 'आज के लिए आपके खेत की स्थिति।',
    goodMorning: 'सुप्रभात',
  },
  mr: {
    dashboard: 'डॅशबोर्ड',
    cropAdvisor: 'पीक सल्लागार',
    weatherIntel: 'हवामान माहिती',
    govSchemes: 'शासकीय योजना',
    community: 'समुदाय',
    diseaseCheck: 'रोग तपासणी',
    adminConsole: 'अॅडमिन कन्सोल',
    logout: 'लॉग आउट',
    activeCrops: 'सक्रिय पिके',
    rainChance: 'पावसाची शक्यता',
    cropHealth: 'पिकांचे आरोग्य',
    potentialProfit: 'संभाव्य नफा',
    farmPerformance: 'शेती कामगिरी',
    actionPlan: 'आजची कार्य योजना',
    recentActivity: 'अलीकडील क्रियाकलाप',
    askQuestion: 'प्रश्न विचारा',
    searchDiscussions: 'चर्चा शोधा...',
    popularTopics: 'लोकप्रिय विषय',
    savedCrops: 'जतन केलेली पिके',
    eligibilityFilters: 'पात्रता निकष',
    applyScheme: 'पात्रता पहा आणि अर्ज करा',
    uploadLeaf: 'पानाचा फोटो अपलोड करा',
    previousScans: 'मागील स्कॅन्सचा इतिहास',
    analyzeHealth: 'पीक आरोग्याचे विश्लेषण करा',
    recommendCrops: 'योग्य पिके शोधा',
    soilType: 'मातीचा प्रकार',
    season: 'हंगाम',
    region: 'विभाग',
    waterAvailability: 'पाण्याची उपलब्धता',
    landArea: 'जमीन क्षेत्र (एकर)',
    registeredFarmers: 'नोंदणीकृत शेतकरी',
    activeSchemes: 'सक्रिय योजना',
    reportedPosts: 'तक्रार केलेल्या पोस्ट',
    adviceViews: 'मासिक सल्लागार दृश्ये',
    managementQueue: 'व्यवस्थापन रांग',
    language: 'भाषा',
    needAgronomyHelp: 'कृषी मार्गदर्शनाची गरज आहे?',
    talkToExpert: 'समुदाय द्वारे स्थानिक तज्ञाशी संपर्क साधा.',
    farmSnapshot: 'आजच्या तुमच्या शेताचा आढावा.',
    goodMorning: 'शुभ सकाळ',
  }
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => localStorage.getItem('krishi_lang') || 'en');

  const value = useMemo(() => {
    const t = (key) => translations[language][key] || key;
    const changeLanguage = (lang) => {
      localStorage.setItem('krishi_lang', lang);
      setLanguage(lang);
    };
    return { language, t, changeLanguage };
  }, [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
