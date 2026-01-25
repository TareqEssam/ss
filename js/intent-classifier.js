/**
 * 🎯 مصنف النوايا الذكي
 * Intent Classifier & Query Understanding
 * 
 * الهدف: فهم نية المستخدم من السؤال (بدون كلمات مفتاحية صريحة)
 * 
 * @author AI Expert System
 * @version 2.0.0
 */

class IntentClassifier {
  constructor(arabicNormalizer, vectorEngine) {
    this.normalizer = arabicNormalizer;
    this.vectorEngine = vectorEngine;

    // أنماط النوايا (Intent Patterns) - للتعرف الأولي
    this.intentPatterns = {
      // نية قانونية (القوانين والتراخيص)
      legal: {
        semantic: ['قانون', 'ترخيص', 'رخصة', 'تصريح', 'سجل', 'اشتراطات', 'متطلبات', 'جهة', 'وزارة', 'هيئة'],
        weight: 1.0
      },

      // نية جغرافية (المواقع والمناطق)
      geographic: {
        semantic: ['منطقة', 'موقع', 'مكان', 'محافظة', 'مدينة', 'قرية', 'حي', 'خريطة', 'موجود', 'تابع'],
        weight: 1.0
      },

      // نية تقنية (الاشتراطات الفنية)
      technical: {
        semantic: ['اشتراطات', 'فنية', 'معاينة', 'فحص', 'مواصفات', 'معايير', 'سلامة', 'حماية', 'مدني'],
        weight: 1.0
      },

      // نية الحوافز
      incentive: {
        semantic: ['حوافز', 'قرار', '104', 'دعم', 'إعفاء', 'تخفيض', 'مزايا', 'قطاع'],
        weight: 1.0
      },

      // نية إحصائية
      statistical: {
        semantic: ['كم', 'عدد', 'عدد', 'كام', 'إحصائية', 'جميع', 'كل', 'قائمة', 'أسماء'],
        weight: 1.0
      },

      // نية مقارنة
      comparative: {
        semantic: ['فرق', 'مقارنة', 'أفضل', 'أحسن', 'الأنسب', 'بين', 'مقابل', 'ولا'],
        weight: 1.0
      }
    };

    // أنماط الأسئلة (Query Types)
    this.queryTypes = {
      SIMPLE: 'simple',              // سؤال بسيط
      COMPLEX: 'complex',            // سؤال مركب
      SEQUENTIAL: 'sequential',      // سؤال متتابع
      COMPARATIVE: 'comparative',    // سؤال مقارنة
      STATISTICAL: 'statistical',    // سؤال إحصائي
      CROSS_REFERENCE: 'cross_ref'   // سؤال يحتاج ربط بين قواعد
    };

    // الكيانات المعروفة (للاستخلاص)
    this.knownEntities = {
      governorates: [],
      locations: [],
      activities: [],
      authorities: []
    };
  }

  /**
   * 🎯 التصنيف الرئيسي للنية
   * @param {string} query - سؤال المستخدم
   * @returns {object} النية المكتشفة مع درجة الثقة
   */
  async classifyIntent(query) {
    const normalized = this.normalizer.normalize(query);
    
    const classification = {
      primaryIntent: null,
      secondaryIntents: [],
      confidence: 0,
      queryType: this.queryTypes.SIMPLE,
      entities: {},
      requiresCrossReference: false,
      suggestedDatabases: []
    };

    // 1. التعرف على النية بناءً على الأنماط الدلالية
    const intentScores = this._calculateIntentScores(normalized);
    
    // ترتيب النوايا حسب الدرجة
    const sortedIntents = Object.entries(intentScores)
      .sort((a, b) => b[1] - a[1]);

    if (sortedIntents.length > 0) {
      classification.primaryIntent = sortedIntents[0][0];
      classification.confidence = sortedIntents[0][1];
      
      // النوايا الثانوية (درجة > 0.3)
      classification.secondaryIntents = sortedIntents
        .slice(1)
        .filter(([_, score]) => score > 0.3)
        .map(([intent, _]) => intent);
    }

    // 2. تحديد نوع السؤال
    classification.queryType = this._detectQueryType(normalized);

    // 3. استخلاص الكيانات
    classification.entities = this._extractQueryEntities(normalized);

    // 4. تحديد ما إذا كان يحتاج ربط بين قواعد
    classification.requiresCrossReference = this._needsCrossReference(
      classification.primaryIntent,
      classification.entities,
      classification.queryType
    );

    // 5. اقتراح القواعد المناسبة
    classification.suggestedDatabases = this._suggestDatabases(classification);

    return classification;
  }

  /**
   * 🧮 حساب درجة كل نية
   */
  _calculateIntentScores(normalizedQuery) {
    const scores = {};
    const words = normalizedQuery.split(/\s+/);

    for (const [intentName, intentData] of Object.entries(this.intentPatterns)) {
      let score = 0;
      let matches = 0;

      // البحث عن الكلمات الدلالية
      for (const semanticWord of intentData.semantic) {
        if (words.some(word => word.includes(semanticWord) || semanticWord.includes(word))) {
          matches++;
          score += intentData.weight;
        }
      }

      // تطبيع الدرجة
      if (matches > 0) {
        scores[intentName] = Math.min(1.0, score / Math.sqrt(words.length));
      } else {
        scores[intentName] = 0;
      }
    }

    return scores;
  }

  /**
   * 🔍 تحديد نوع السؤال
   */
  _detectQueryType(normalizedQuery) {
    // إحصائي
    if (/\b(كم|عدد|كام|كل|جميع|قائمة)\b/.test(normalizedQuery)) {
      return this.queryTypes.STATISTICAL;
    }

    // مقارنة
    if (/\b(فرق|مقارنة|أفضل|بين|ولا|أم)\b/.test(normalizedQuery)) {
      return this.queryTypes.COMPARATIVE;
    }

    // مركب (يحتوي على أكثر من كيان)
    const entities = this._extractQueryEntities(normalizedQuery);
    const entityCount = Object.values(entities).filter(e => e.length > 0).length;
    
    if (entityCount >= 2) {
      return this.queryTypes.COMPLEX;
    }

    // متتابع (يحتوي على ضمائر)
    if (/\b(ها|هم|هي|هو|هذا|هذه|ذلك|تلك)\b/.test(normalizedQuery)) {
      return this.queryTypes.SEQUENTIAL;
    }

    // بسيط
    return this.queryTypes.SIMPLE;
  }

  /**
   * 🏷️ استخلاص الكيانات من السؤال
   */
  _extractQueryEntities(normalizedQuery) {
    const entities = {
      numbers: [],
      locations: [],
      activities: [],
      governorates: [],
      authorities: [],
      sectors: []
    };

    // استخدام محلل اللغة العربية
    const basicEntities = this.normalizer.extractEntities(normalizedQuery);
    
    entities.numbers = basicEntities.numbers;
    entities.governorates = basicEntities.governorates;

    // استخلاص أسماء المناطق المحتملة
    const locationPatterns = [
      /منطقة\s+([^\s,،.]+(?:\s+[^\s,،.]+){0,3})/g,
      /مدينة\s+([^\s,،.]+(?:\s+[^\s,،.]+){0,2})/g,
      /(\d+)\s*(رمضان|أكتوبر|مايو)/g,
      /(العبور|بدر|الشروق|السادات|العاشر|الروبيكي|شق الثعبان)/g
    ];

    locationPatterns.forEach(pattern => {
      const matches = normalizedQuery.match(pattern);
      if (matches) {
        entities.locations.push(...matches);
      }
    });

    // استخلاص الأنشطة المحتملة
    const activityPatterns = [
      /مصنع\s+([^\s,،.]+(?:\s+[^\s,،.]+){0,3})/g,
      /نشاط\s+([^\s,،.]+(?:\s+[^\s,،.]+){0,2})/g,
      /(صناعي|تجاري|سياحي|زراعي|خدمي)/g
    ];

    activityPatterns.forEach(pattern => {
      const matches = normalizedQuery.match(pattern);
      if (matches) {
        entities.activities.push(...matches);
      }
    });

    // استخلاص الجهات
    const authorityPatterns = [
      /(وزارة|هيئة|مصلحة|جهاز)\s+([^\s,،.]+(?:\s+[^\s,،.]+){0,3})/g,
      /(المحافظة|المجتمعات العمرانية|التنمية الصناعية)/g
    ];

    authorityPatterns.forEach(pattern => {
      const matches = normalizedQuery.match(pattern);
      if (matches) {
        entities.authorities.push(...matches);
      }
    });

    // استخلاص القطاعات (القرار 104)
    if (/قطاع\s*(أ|ا|a)/i.test(normalizedQuery)) {
      entities.sectors.push('sectorA');
    }
    if (/قطاع\s*(ب|b)/i.test(normalizedQuery)) {
      entities.sectors.push('sectorB');
    }

    // إزالة التكرار
    for (const key in entities) {
      entities[key] = [...new Set(entities[key])];
    }

    return entities;
  }

  /**
   * 🔗 تحديد ما إذا كان السؤال يحتاج ربط بين قواعد
   */
  _needsCrossReference(primaryIntent, entities, queryType) {
    // إذا كان مركب أو متقاطع
    if (queryType === this.queryTypes.COMPLEX || queryType === this.queryTypes.CROSS_REFERENCE) {
      return true;
    }

    // إذا احتوى على نشاط + موقع
    if (entities.activities.length > 0 && entities.locations.length > 0) {
      return true;
    }

    // إذا احتوى على نشاط + حوافز
    if (entities.activities.length > 0 && primaryIntent === 'incentive') {
      return true;
    }

    // إذا احتوى على موقع + جهة
    if (entities.locations.length > 0 && entities.authorities.length > 0) {
      return true;
    }

    return false;
  }

  /**
   * 💡 اقتراح القواعد المناسبة للبحث
   */
  _suggestDatabases(classification) {
    const databases = [];

    // بناءً على النية الرئيسية
    if (classification.primaryIntent === 'legal' || 
        classification.entities.activities.length > 0) {
      databases.push('activity');
    }

    if (classification.primaryIntent === 'geographic' || 
        classification.entities.locations.length > 0 ||
        classification.entities.governorates.length > 0) {
      databases.push('industrial');
    }

    if (classification.primaryIntent === 'incentive' || 
        classification.entities.sectors.length > 0) {
      databases.push('decision104');
    }

    // إذا كان إحصائي، ابحث في كل القواعد
    if (classification.queryType === this.queryTypes.STATISTICAL) {
      return ['activity', 'decision104', 'industrial'];
    }

    // إذا كان مقارنة، ابحث في القواعد ذات الصلة
    if (classification.queryType === this.queryTypes.COMPARATIVE) {
      if (databases.length === 0) {
        return ['activity', 'decision104', 'industrial'];
      }
    }

    // على الأقل قاعدة واحدة
    if (databases.length === 0) {
      databases.push('activity');
    }

    return [...new Set(databases)];
  }

  /**
   * 📝 بناء استعلامات فرعية للأسئلة المركبة
   */
  buildSubQueries(query, classification) {
    const subQueries = {
      activity: null,
      location: null,
      decision104: null,
      authority: null
    };

    const normalized = this.normalizer.normalize(query);

    // استعلام النشاط
    if (classification.entities.activities.length > 0) {
      subQueries.activity = classification.entities.activities.join(' ');
    } else if (classification.suggestedDatabases.includes('activity')) {
      subQueries.activity = normalized;
    }

    // استعلام الموقع
    if (classification.entities.locations.length > 0) {
      subQueries.location = classification.entities.locations.join(' ');
    } else if (classification.entities.governorates.length > 0) {
      subQueries.location = classification.entities.governorates.join(' ');
    }

    // استعلام القرار 104
    if (classification.primaryIntent === 'incentive' || 
        classification.entities.sectors.length > 0) {
      subQueries.decision104 = normalized;
    }

    // استعلام الجهة
    if (classification.entities.authorities.length > 0) {
      subQueries.authority = classification.entities.authorities.join(' ');
    }

    return subQueries;
  }

  /**
   * 🎭 تحميل الكيانات المعروفة من الفهرس
   */
  loadKnownEntities(metaIndex) {
    if (!metaIndex) return;

    this.knownEntities = {
      governorates: metaIndex.governorates || [],
      locations: metaIndex.locations || [],
      activities: metaIndex.activities || [],
      authorities: metaIndex.authorities || []
    };

    console.log('✅ تم تحميل الكيانات المعروفة:', {
      governorates: this.knownEntities.governorates.length,
      locations: this.knownEntities.locations.length,
      activities: this.knownEntities.activities.length,
      authorities: this.knownEntities.authorities.length
    });
  }

  /**
   * 🔄 حل الضمائر (Pronoun Resolution) للأسئلة المتتابعة
   */
  resolvePronouns(query, contextMemory) {
    if (!contextMemory || !contextMemory.lastEntity) {
      return query;
    }

    let resolved = query;

    // خريطة الضمائر
    const pronouns = {
      'ها': contextMemory.lastEntity,
      'هو': contextMemory.lastEntity,
      'هي': contextMemory.lastEntity,
      'هم': contextMemory.lastEntity,
      'هذا': contextMemory.lastEntity,
      'هذه': contextMemory.lastEntity,
      'ذلك': contextMemory.lastEntity,
      'تلك': contextMemory.lastEntity
    };

    // استبدال الضمائر
    for (const [pronoun, entity] of Object.entries(pronouns)) {
      const regex = new RegExp(`\\b${pronoun}\\b`, 'g');
      resolved = resolved.replace(regex, entity);
    }

    return resolved;
  }
}

// تصدير الكلاس
if (typeof module !== 'undefined' && module.exports) {
  module.exports = IntentClassifier;
}