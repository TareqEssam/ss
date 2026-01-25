/**
 * 🔤 محرك المعالجة اللغوية العربية الموحد
 * Unified Arabic Normalizer Engine
 * 
 * الهدف: معالجة النصوص العربية لضمان دقة 100% بغض النظر عن طريقة الكتابة
 * 
 * @author AI Expert System
 * @version 2.0.0
 */

class ArabicNormalizer {
  constructor() {
    // خريطة توحيد الأحرف
    this.normalizationMap = {
      // توحيد الألف
      'أ': 'ا', 'إ': 'ا', 'آ': 'ا', 'ٱ': 'ا',
      
      // توحيد الياء
      'ى': 'ي', 'ئ': 'ي',
      
      // توحيد التاء المربوطة
      'ة': 'ه',
      
      // الهمزات
      'ؤ': 'و', 'ء': ''
    };

    // التشكيل والحركات
    this.diacritics = /[\u064B-\u065F\u0670]/g;
    
    // الكشيدة (التطويل)
    this.tatweel = /ـ/g;
    
    // الأرقام العربية إلى هندية
    this.arabicNumbers = {
      '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
      '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
    };

    // كلمات التوقف العربية (للمعالجة الاختيارية)
    this.stopWords = new Set([
      'في', 'من', 'إلى', 'على', 'عن', 'هو', 'هي', 'هم', 'هن',
      'أنا', 'نحن', 'أنت', 'أنتم', 'أنتن', 'هذا', 'هذه', 'ذلك',
      'تلك', 'الذي', 'التي', 'اللذان', 'اللتان', 'اللذين', 'اللتين',
      'ما', 'ماذا', 'متى', 'أين', 'كيف', 'لماذا', 'هل',
      'أو', 'و', 'ف', 'ثم', 'لكن', 'بل', 'لا', 'نعم',
      'كل', 'بعض', 'جميع', 'كان', 'يكون', 'ليس', 'لن', 'لم'
    ]);

    // خريطة المرادفات الشائعة في الاستفسارات
    this.commonSynonyms = {
      'عايز': 'أريد',
      'عاوز': 'أريد',
      'محتاج': 'أريد',
      'ممكن': 'يمكن',
      'فين': 'أين',
      'ايه': 'ما',
      'إيه': 'ما',
      'ازاي': 'كيف',
      'إزاي': 'كيف',
      'ليه': 'لماذا',
      'امتى': 'متى',
      'كام': 'كم'
    };
  }

  /**
   * 🎯 الدالة الرئيسية: تطبيع النص الكامل
   * @param {string} text - النص المراد معالجته
   * @param {object} options - خيارات المعالجة
   * @returns {string} النص المعالج والموحد
   */
  normalize(text, options = {}) {
    if (!text || typeof text !== 'string') return '';

    const defaults = {
      removeDiacritics: true,
      normalizeAlef: true,
      normalizeYaa: true,
      normalizeTaa: true,
      removeTatweel: true,
      normalizeNumbers: true,
      removeStopWords: false,
      applySynonyms: true,
      toLowerCase: true,
      trimSpaces: true
    };

    const config = { ...defaults, ...options };

    let normalized = text;

    // 1. إزالة التشكيل
    if (config.removeDiacritics) {
      normalized = this.removeDiacritics(normalized);
    }

    // 2. توحيد الأحرف حسب الخريطة
    normalized = this.applyNormalizationMap(normalized);

    // 3. إزالة الكشيدة
    if (config.removeTatweel) {
      normalized = this.removeTatweel(normalized);
    }

    // 4. توحيد الأرقام
    if (config.normalizeNumbers) {
      normalized = this.normalizeNumbers(normalized);
    }

    // 5. تطبيق المرادفات العامية
    if (config.applySynonyms) {
      normalized = this.applySynonyms(normalized);
    }

    // 6. إزالة كلمات التوقف (اختياري)
    if (config.removeStopWords) {
      normalized = this.removeStopWords(normalized);
    }

    // 7. توحيد الحالة
    if (config.toLowerCase) {
      normalized = normalized.toLowerCase();
    }

    // 8. تنظيف المسافات
    if (config.trimSpaces) {
      normalized = this.normalizeSpaces(normalized);
    }

    return normalized;
  }

  /**
   * إزالة التشكيل (الحركات)
   */
  removeDiacritics(text) {
    return text.replace(this.diacritics, '');
  }

  /**
   * تطبيق خريطة التوحيد على النص
   */
  applyNormalizationMap(text) {
    let result = text;
    for (const [original, normalized] of Object.entries(this.normalizationMap)) {
      result = result.replace(new RegExp(original, 'g'), normalized);
    }
    return result;
  }

  /**
   * إزالة الكشيدة (التطويل)
   */
  removeTatweel(text) {
    return text.replace(this.tatweel, '');
  }

  /**
   * توحيد الأرقام العربية إلى أرقام هندية
   */
  normalizeNumbers(text) {
    let result = text;
    for (const [arabic, hindi] of Object.entries(this.arabicNumbers)) {
      result = result.replace(new RegExp(arabic, 'g'), hindi);
    }
    return result;
  }

  /**
   * تطبيق المرادفات العامية
   */
  applySynonyms(text) {
    let result = text;
    for (const [colloquial, formal] of Object.entries(this.commonSynonyms)) {
      const regex = new RegExp(`\\b${colloquial}\\b`, 'gi');
      result = result.replace(regex, formal);
    }
    return result;
  }

  /**
   * إزالة كلمات التوقف
   */
  removeStopWords(text) {
    const words = text.split(/\s+/);
    const filtered = words.filter(word => !this.stopWords.has(word));
    return filtered.join(' ');
  }

  /**
   * تنظيف وتوحيد المسافات
   */
  normalizeSpaces(text) {
    return text
      .replace(/\s+/g, ' ')           // مسافات متعددة → مسافة واحدة
      .replace(/\u200B/g, '')         // إزالة المسافة الصفرية
      .replace(/\u00A0/g, ' ')        // مسافة غير قابلة للكسر → مسافة عادية
      .trim();                        // إزالة المسافات من البداية والنهاية
  }

  /**
   * 🔍 استخلاص الكلمات المفتاحية (بدون كلمات التوقف)
   * @param {string} text - النص
   * @returns {Array<string>} مصفوفة الكلمات المفتاحية
   */
  extractKeywords(text) {
    const normalized = this.normalize(text, { removeStopWords: false });
    const words = normalized.split(/\s+/);
    
    // إزالة كلمات التوقف والكلمات القصيرة جداً
    const keywords = words.filter(word => {
      return word.length > 2 && !this.stopWords.has(word);
    });

    // إزالة التكرار
    return [...new Set(keywords)];
  }

  /**
   * 🎭 تطبيع خاص للمقارنة الدلالية (Semantic Comparison)
   * يستخدم عند توليد المتجهات
   */
  normalizeForEmbedding(text) {
    return this.normalize(text, {
      removeDiacritics: true,
      normalizeAlef: true,
      normalizeYaa: true,
      normalizeTaa: true,
      removeTatweel: true,
      normalizeNumbers: true,
      removeStopWords: false,  // نبقي على كلمات التوقف للسياق
      applySynonyms: true,
      toLowerCase: true,
      trimSpaces: true
    });
  }

  /**
   * 📊 تطبيع خاص للفهرسة (Indexing)
   * يستخدم عند بناء الفهرس المحلي
   */
  normalizeForIndexing(text) {
    return this.normalize(text, {
      removeDiacritics: true,
      normalizeAlef: true,
      normalizeYaa: true,
      normalizeTaa: true,
      removeTatweel: true,
      normalizeNumbers: true,
      removeStopWords: true,   // نحذف كلمات التوقف لتقليل حجم الفهرس
      applySynonyms: true,
      toLowerCase: true,
      trimSpaces: true
    });
  }

  /**
   * 🎤 تطبيع خاص للصوت (Voice Input)
   * معالجة أقوى للأخطاء الشائعة في التعرف الصوتي
   */
  normalizeForVoice(text) {
    let normalized = this.normalize(text);

    // معالجات خاصة بالأخطاء الصوتية
    const voiceCorrections = {
      'الاسماعيلية': 'الإسماعيلية',
      'العاشر': '10',
      'السادس اكتوبر': '6 أكتوبر',
      'الشيخ زايد': 'الشيخ زايد',
      'بدر': 'بدر',
      'العبور': 'العبور',
      'الصف': 'الصف',
      'برج العرب': 'برج العرب'
    };

    for (const [error, correction] of Object.entries(voiceCorrections)) {
      const regex = new RegExp(error, 'gi');
      normalized = normalized.replace(regex, correction);
    }

    return normalized;
  }

  /**
   * 🧮 حساب التشابه النصي البسيط (للفهرسة السريعة)
   * @param {string} text1 
   * @param {string} text2 
   * @returns {number} نسبة التشابه (0-1)
   */
  textSimilarity(text1, text2) {
    const normalized1 = this.normalizeForIndexing(text1);
    const normalized2 = this.normalizeForIndexing(text2);

    const words1 = new Set(normalized1.split(/\s+/));
    const words2 = new Set(normalized2.split(/\s+/));

    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return union.size > 0 ? intersection.size / union.size : 0;
  }

  /**
   * 🔗 استخلاص الكيانات المحتملة (Entities)
   * @param {string} text 
   * @returns {object} كائن يحتوي على الكيانات المستخلصة
   */
  extractEntities(text) {
    const normalized = this.normalize(text);
    
    const entities = {
      numbers: [],
      locations: [],
      activities: [],
      governorates: []
    };

    // استخلاص الأرقام
    const numberPattern = /\d+/g;
    entities.numbers = normalized.match(numberPattern) || [];

    // الكلمات الدالة على المحافظات
    const governorateKeywords = [
      'القاهرة', 'الجيزة', 'الإسكندرية', 'الإسماعيلية', 
      'السويس', 'بورسعيد', 'قناة السويس', 'شمال سينا', 
      'جنوب سينا', 'القليوبية', 'الشرقية', 'الدقهلية',
      'البحيرة', 'المنوفية', 'الغربية', 'كفر الشيخ', 
      'دمياط', 'الفيوم', 'بني سويف', 'المنيا', 
      'أسيوط', 'سوهاج', 'قنا', 'الأقصر', 'أسوان',
      'البحر الأحمر', 'الوادي الجديد', 'مطروح'
    ];

    governorateKeywords.forEach(gov => {
      if (normalized.includes(gov)) {
        entities.governorates.push(gov);
      }
    });

    // الكلمات الدالة على المناطق
    const locationKeywords = [
      'منطقة', 'مدينة', 'قرية', 'حي', 'شارع', 'كيلو', 
      'طريق', 'ميدان', 'محور', 'كوبري'
    ];

    locationKeywords.forEach(loc => {
      if (normalized.includes(loc)) {
        entities.locations.push(loc);
      }
    });

    // الكلمات الدالة على الأنشطة
    const activityKeywords = [
      'مصنع', 'شركة', 'مشروع', 'نشاط', 'استثمار', 
      'ترخيص', 'رخصة', 'تسجيل', 'إقامة', 'تشغيل',
      'صناعي', 'تجاري', 'سياحي', 'زراعي', 'خدمي'
    ];

    activityKeywords.forEach(act => {
      if (normalized.includes(act)) {
        entities.activities.push(act);
      }
    });

    return entities;
  }
}

// تصدير الكلاس للاستخدام
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ArabicNormalizer;
}