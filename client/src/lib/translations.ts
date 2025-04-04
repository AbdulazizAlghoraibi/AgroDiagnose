/**
 * Simple translation dictionary for Arabic and English languages
 */

export type Language = "ar" | "en";

interface TranslationDictionary {
  [key: string]: {
    ar: string;
    en: string;
  };
}

// Translation keys grouped by component/feature
export const translations: TranslationDictionary = {
  // Common
  "app.title": {
    ar: "الكشف عن أمراض النباتات",
    en: "Plant Disease Detection"
  },
  "app.footer": {
    ar: "نظام الكشف عن أمراض النباتات للمزارعين التجاريين في المملكة العربية السعودية",
    en: "Plant Disease Detection System for Commercial Farmers in Saudi Arabia"
  },
  
  // Home page
  "home.title": {
    ar: "تحليل صورة النبات",
    en: "Analyze Plant Image"
  },
  "home.subtitle": {
    ar: "التقط صورة لأوراق النبات أو الحقل المصاب للكشف عن المرض وشدته",
    en: "Take a photo of the affected plant leaves or field to detect disease and severity"
  },
  "home.upload.title": {
    ar: "تحميل صورة",
    en: "Upload Image"
  },
  "home.upload.subtitle": {
    ar: "يمكنك تحميل الصور بتنسيق JPG أو PNG",
    en: "You can upload images in JPG or PNG format"
  },
  "home.upload.button": {
    ar: "تحديد صورة",
    en: "Select Image"
  },
  "home.analyze.button": {
    ar: "تحليل الصورة",
    en: "Analyze Image"
  },
  "home.remove.button": {
    ar: "إزالة",
    en: "Remove"
  },
  
  // Diagnosis Result
  "diagnosis.title": {
    ar: "نتيجة التحليل",
    en: "Analysis Result"
  },
  "diagnosis.description": {
    ar: "الوصف:",
    en: "Description:"
  },
  "diagnosis.severity": {
    ar: "درجة الخطورة:",
    en: "Severity Level:"
  },
  "diagnosis.severity.low": {
    ar: "منخفضة",
    en: "Low"
  },
  "diagnosis.severity.medium": {
    ar: "متوسطة",
    en: "Medium"
  },
  "diagnosis.severity.high": {
    ar: "عالية",
    en: "High"
  },
  "diagnosis.loading": {
    ar: "جاري تحليل الصورة...",
    en: "Analyzing image..."
  },
  "diagnosis.recommendations": {
    ar: "الحصول على توصيات العلاج",
    en: "Get Treatment Recommendations"
  },
  "diagnosis.expert": {
    ar: "التحدث مع خبير زراعي",
    en: "Talk to an Agricultural Expert"
  },
  
  // History page
  "history.title": {
    ar: "سجل التشخيصات",
    en: "Diagnosis History"
  },
  "history.empty": {
    ar: "لا توجد تشخيصات سابقة",
    en: "No previous diagnoses"
  },
  "history.start": {
    ar: "ابدأ التشخيص الأول",
    en: "Start Your First Diagnosis"
  },
  "history.date": {
    ar: "تاريخ التشخيص:",
    en: "Diagnosis Date:"
  },
  
  // Navigation
  "nav.home": {
    ar: "الرئيسية",
    en: "Home"
  },
  "nav.history": {
    ar: "السجل",
    en: "History"
  },
  "nav.language": {
    ar: "AR | EN",
    en: "EN | AR"
  },
  "nav.local": {
    ar: "تحليل محلي",
    en: "Local Analysis"
  },

  // Not Found page
  "notfound.title": {
    ar: "صفحة غير موجودة",
    en: "Page Not Found"
  },
  "notfound.description": {
    ar: "الصفحة التي تبحث عنها غير موجودة",
    en: "The page you are looking for does not exist"
  },
  "notfound.back": {
    ar: "العودة إلى الصفحة الرئيسية",
    en: "Back to Home"
  },
  
  // AI Analysis Component
  "tfModelTitle": {
    ar: "تحليل الصورة باستخدام الذكاء الاصطناعي",
    en: "AI-Powered Plant Analysis"
  },
  "tfModelDescription": {
    ar: "تحليل متقدم للصورة باستخدام نموذج الذكاء الاصطناعي",
    en: "Advanced image analysis using AI model"
  },
  "loadingModel": {
    ar: "جاري تحميل نموذج الذكاء الاصطناعي...",
    en: "Loading AI model..."
  },
  "modelLoadError": {
    ar: "خطأ في تحميل النموذج",
    en: "Model loading error"
  },
  "checkModelFiles": {
    ar: "يرجى التأكد من وجود ملفات النموذج في الدليل الصحيح",
    en: "Please ensure model files are in the correct directory"
  },
  "dropImageHere": {
    ar: "اسحب وأفلت الصورة هنا",
    en: "Drop your image here"
  },
  "orClickToUpload": {
    ar: "أو انقر للتحميل",
    en: "or click to upload"
  },
  "formatsAccepted": {
    ar: "الصيغ المقبولة",
    en: "formats accepted"
  },
  "analyzing": {
    ar: "جاري التحليل...",
    en: "Analyzing..."
  },
  "analyzeImage": {
    ar: "تحليل الصورة",
    en: "Analyze Image"
  },
  "diagnosisResult": {
    ar: "نتيجة التشخيص",
    en: "Diagnosis Result"
  },
  "detected": {
    ar: "تم اكتشاف",
    en: "Detected"
  },
  "confidence": {
    ar: "درجة الثقة",
    en: "Confidence"
  },
  "severity": {
    ar: "الخطورة",
    en: "Severity"
  },
  "low": {
    ar: "منخفضة",
    en: "Low"
  },
  "medium": {
    ar: "متوسطة",
    en: "Medium"
  },
  "high": {
    ar: "عالية",
    en: "High"
  },
  "tfPrivacyNote": {
    ar: "يتم معالجة الصور بأمان باستخدام خوارزميات الذكاء الاصطناعي المتقدمة.",
    en: "Your images are securely processed using advanced AI algorithms."
  }
};

/**
 * Get a translation string based on the current language
 * @param key The translation key
 * @param language The current language
 * @returns The translated string
 */
export function t(key: string, language: Language): string {
  const translation = translations[key];
  
  if (!translation) {
    console.warn(`Translation missing for key: ${key}`);
    return key;
  }
  
  return translation[language];
}

/**
 * Format a date based on the current language
 * @param date The date to format
 * @param language The current language
 * @returns The formatted date string
 */
export function formatDate(date: Date | string | number | null | undefined, language: Language): string {
  try {
    // Check if date is valid
    if (!date) {
      return language === 'ar' ? 'تاريخ غير متاح' : 'Date unavailable';
    }
    
    // Convert to Date object if it's a string or number
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return language === 'ar' ? 'تاريخ غير صالح' : 'Invalid date';
    }
    
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    const locale = language === 'ar' ? 'ar-SA' : 'en-US';
    return new Intl.DateTimeFormat(locale, options).format(dateObj);
  } catch (error) {
    console.error('Error formatting date:', error);
    return language === 'ar' ? 'تاريخ غير متاح' : 'Date unavailable';
  }
}