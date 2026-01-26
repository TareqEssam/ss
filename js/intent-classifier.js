/**
 * 🎯 مصنف النوايا الذكي - فهم دلالي عميق
 * Intent Classifier - Deep Semantic Understanding
 * 
 * @author AI Expert System
 * @version 4.0.0 - Semantic Intent Understanding
 */

class IntentClassifier {
  constructor(arabicNormalizer, vectorEngine) {
    this.normalizer = arabicNormalizer;
    this.vectorEngine = vectorEngine;

    // 🔥 أنماط النوايا الدلالية (بدون كلمات مفتاحية صريحة)
    this.intentPatterns = {
      legal: {
        semantic: ['قانون', 'ترخيص', 'رخصة', 'تصريح', 'سجل', 'اشتراطات', 'متطلبات', 'جهة', 'وزارة', 'هيئة', 'مستندات', 'أوراق'],
        weight: 1.0
      },
      geographic: {
        semantic: ['منطقة', 'موقع', 'مكان', 'محافظة', 'مدينة', 'قرية', 'حي', 'خريطة', 'موجود', 'تابع', 'عنوان', 'صناعية', 'صناعي'],
        weight: 1.0
      },
      technical: {
        semantic: ['اشتراطات', 'فنية', 'معاينة', 'فحص', 'مواصفات', 'معايير', 'سلامة', 'حماية', 'مدني'],
        weight: 1.0
      },
      incentive: {
        semantic: ['حوافز', 'قرار', '104', 'دعم', 'إعفاء', 'تخفيض', 'مزايا', 'قطاع', 'تسهيلات'],
        weight: 1.0
      },
      statistical: {
        semantic: ['كم', 'عدد', 'كام', 'إحصائية', 'جميع', 'كل', 'قائمة', 'أسماء', 'توزيع'],
        weight: 1.0
      },
      comparative: {
        semantic: ['فرق', 'مقارنة', 'أفضل', 'أحسن', 'الأنسب', 'بين', 'مقابل', 'ولا', 'أيهما'],
        weight: 1.0
      },
      activity: {
        semantic: ['نشاط', 'مشروع', 'شركة', 'مؤسسة', 'منشأة', 'محل', 'مصنع', 'فندق', 'مطعم'],
        weight: 1.2
      }
    };

    // 🔥 مفاهيم دلالية للقواعد (ما يميز كل قاعدة)
    this.databaseSemantics = {
      industrial: {
        concepts: [
          'منطقة صناعية', 'مناطق صناعية', 'منطقة', 'مناطق',
          'موقع', 'مواقع', 'أرض', 'أراضي', 'مدينة صناعية',
          'محافظة', 'تبعية', 'جهاز', 'هيئة عمرانية', 'مساحة',
          'إحداثيات', 'خريطة', 'موجود', 'تابع', 'صناعي', 'صناعية'
        ],
        weight: 1.0
      },
      activity: {
        concepts: [
          'نشاط', 'أنشطة', 'مشروع', 'مشاريع', 'ترخيص', 'رخصة',
          'تصريح', 'اشتراطات', 'متطلبات', 'إجراءات', 'فني', 'قانوني',
          'مستندات', 'أوراق', 'جهة مختصة', 'سجل', 'فتح', 'تأسيس'
        ],
        weight: 1.0
      },
      decision104: {
        concepts: [
          'حوافز', 'قرار 104', 'قرار', 'دعم', 'إعفاء', 'تخفيض',
          'مزايا', 'قطاع أ', 'قطاع ب', 'تسهيلات', 'ضريبة',
          'رسوم', 'أرض', 'مرافق', 'توصيل', 'استثمار'
        ],
        weight: 1.0
      }
    };

    this.queryTypes = {
      SIMPLE: 'simple',
      COMPLEX: 'complex',
      SEQUENTIAL: 'sequential',
      COMPARATIVE: 'comparative',
      STATISTICAL: 'statistical',
      CROSS_REFERENCE: 'cross_ref'
    };

    this.knownEntities = {
      governorates: [],
      locations: [],
      activities: [],
      authorities: []
    };

    this.commonActivities = [
      'فندق', 'مصنع', 'مطعم', 'مقهى', 'كافيه', 'محل', 'شركة', 'مكتب',
      'مخبز', 'صيدلية', 'عيادة', 'مستشفى', 'مدرسة', 'حضانة', 'روضة',
      'ورشة', 'معمل', 'قرية سياحية', 'منتجع', 'ريزورت', 'كومباوند',
      'سوبر ماركت', 'هايبر ماركت', 'مول', 'محطة وقود', 'غسيل سيارات'
    ];
  }

  /**
   * 🎯 التصنيف الرئيسي - فهم دلالي عميق
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
      suggestedDatabases: [],
      semanticScores: {} // 🔥 درجات الفهم الدلالي
    };

    // 1. استخلاص الكيانات
    classification.entities = this._extractQueryEntities(normalized);

    // 2. حساب نقاط النوايا (الطريقة القديمة)
    const intentScores = this._calculateIntentScores(normalized);

    // 🔥 3. حساب التطابق الدلالي مع كل قاعدة بيانات
    classification.semanticScores = await this._calculateDatabaseSemanticScores(normalized);

    // 4. تحديد النية الرئيسية
    const sortedIntents = Object.entries(intentScores)
      .sort((a, b) => b[1] - a[1])
      .filter(([_, score]) => score > 0);

    if (sortedIntents.length > 0) {
      classification.primaryIntent = sortedIntents[0][0];
      classification.confidence = sortedIntents[0][1];
      
      classification.secondaryIntents = sortedIntents
        .slice(1)
        .filter(([_, score]) => score > 0.3)
        .map(([intent, _]) => intent);
    }

    // 5. تحديد نوع السؤال
    classification.queryType = this._detectQueryType(normalized, classification.entities);

    // 6. تحديد الربط المتقاطع
    classification.requiresCrossReference = this._needsCrossReference(
      classification.primaryIntent,
      classification.entities,
      classification.queryType
    );

    // 🔥 7. اختيار القواعد بناءً على الفهم الدلالي (الأهم!)
    classification.suggestedDatabases = this._suggestDatabasesSemanticBased(
      classification,
      normalized
    );

    return classification;
  }

  /**
   * 🔥 حساب التطابق الدلالي مع كل قاعدة بيانات
   */
  async _calculateDatabaseSemanticScores(normalizedQuery) {
    const scores = {
      industrial: 0,
      activity: 0,
      decision104: 0
    };

    const queryWords = normalizedQuery.split(/\s+/).filter(w => w.length > 1);

    for (const [dbName, dbData] of Object.entries(this.databaseSemantics)) {
      let matchScore = 0;
      let conceptMatches = 0;

      // حساب التطابق مع المفاهيم
      dbData.concepts.forEach(concept => {
        const conceptWords = this.normalizer.normalize(concept).split(/\s+/);
        
        // تطابق كامل للعبارة
        if (normalizedQuery.includes(concept)) {
          matchScore += 5.0;
          conceptMatches++;
        }
        // تطابق كلمات المفهوم
        else {
          const matches = conceptWords.filter(cw => 
            queryWords.some(qw => qw === cw || qw.includes(cw) || cw.includes(qw))
          );
          
          if (matches.length > 0) {
            const ratio = matches.length / conceptWords.length;
            matchScore += ratio * 2.0;
            conceptMatches++;
          }
        }
      });

      // تطبيع النتيجة
      if (conceptMatches > 0) {
        scores[dbName] = Math.min(1.0, matchScore / dbData.concepts.length);
      }
    }

    return scores;
  }

  /**
   * 🔥 اختيار القواعد بناءً على الفهم الدلالي
   */
  _suggestDatabasesSemanticBased(classification, normalizedQuery) {
    const databases = new Set();

    // 🔥 الأولوية للتطابق الدلالي
    const semanticScores = classification.semanticScores;
    const sortedBySemantics = Object.entries(semanticScores)
      .sort((a, b) => b[1] - a[1])
      .filter(([_, score]) => score > 0.15); // عتبة منخفضة للسماح بالمرونة

    // حالة خاصة: الأسئلة الإحصائية
    if (classification.queryType === this.queryTypes.STATISTICAL) {
      // 🔥 إذا كان التطابق الدلالي واضح
      if (sortedBySemantics.length > 0 && sortedBySemantics[0][1] > 0.4) {
        // إضافة القاعدة الأعلى تطابقاً
        databases.add(sortedBySemantics[0][0]);
        
        // إضافة قواعد أخرى إذا كان تطابقها قوي أيضاً
        sortedBySemantics.slice(1).forEach(([db, score]) => {
          if (score > sortedBySemantics[0][1] * 0.5) {
            databases.add(db);
          }
        });
      } else {
        // السلوك الافتراضي للإحصائيات: جميع القواعد
        return ['industrial', 'activity', 'decision104'];
      }
      
      return Array.from(databases);
    }

    // الحالات العادية: استخدام التطابق الدلالي + الكيانات
    if (sortedBySemantics.length > 0) {
      // إضافة القاعدة الأعلى تطابقاً
      databases.add(sortedBySemantics[0][0]);
      
      // إضافة قواعد أخرى قريبة من الأعلى
      sortedBySemantics.slice(1, 2).forEach(([db, score]) => {
        if (score > 0.3) {
          databases.add(db);
        }
      });
    }

    // تعزيز بناءً على الكيانات المستخلصة
    if (classification.entities.activities.length > 0) {
      databases.add('activity');
      databases.add('decision104');
    }

    if (classification.entities.locations.length > 0 || 
        classification.entities.governorates.length > 0) {
      databases.add('industrial');
    }

    if (classification.entities.sectors.length > 0 || 
        /حوافز|قرار|104/.test(normalizedQuery)) {
      databases.add('decision104');
    }

    // تعزيز بناءً على النية
    if (classification.primaryIntent === 'legal' || 
        classification.primaryIntent === 'activity') {
      databases.add('activity');
    }

    if (classification.primaryIntent === 'geographic') {
      databases.add('industrial');
    }

    if (classification.primaryIntent === 'incentive') {
      databases.add('decision104');
    }

    // 🔥 حالة خاصة: "منطقة صناعية" يجب أن تذهب لـ industrial
    if (/منطق[ةه]?\s*صناعي[ةه]?|مناطق\s*صناعي[ةه]?|صناعي[ةه]?\s*منطق[ةه]?/i.test(normalizedQuery)) {
      databases.clear();
      databases.add('industrial');
    }

    // افتراضي إذا لم نجد شيء
    if (databases.size === 0) {
      if (sortedBySemantics.length > 0) {
        databases.add(sortedBySemantics[0][0]);
      } else {
        databases.add('activity');
      }
    }

    return Array.from(databases);
  }

  _calculateIntentScores(normalizedQuery) {
    const scores = {};
    const words = normalizedQuery.split(/\s+/).filter(w => w.length > 1);

    for (const [intentName, intentData] of Object.entries(this.intentPatterns)) {
      let score = 0;
      let matches = 0;

      for (const semanticWord of intentData.semantic) {
        const matchCount = words.filter(word => 
          word.includes(semanticWord) || semanticWord.includes(word)
        ).length;
        
        if (matchCount > 0) {
          matches += matchCount;
          score += intentData.weight * matchCount;
        }
      }

      if (matches > 0) {
        scores[intentName] = Math.min(1.0, score / Math.sqrt(words.length));
      } else {
        scores[intentName] = 0;
      }
    }

    return scores;
  }

  _detectQueryType(normalizedQuery, entities) {
    if (/\b(كم|عدد|كام|كل|جميع|قائمة|توزيع|احصائية)\b/.test(normalizedQuery)) {
      return this.queryTypes.STATISTICAL;
    }

    if (/\b(فرق|مقارنة|أفضل|بين|ولا|أم|أيهما|مقابل)\b/.test(normalizedQuery)) {
      return this.queryTypes.COMPARATIVE;
    }

    const entityCount = Object.values(entities).filter(e => e && e.length > 0).length;
    if (entityCount >= 2) {
      return this.queryTypes.COMPLEX;
    }

    if (/\b(ها|هم|هي|هو|هذا|هذه|ذلك|تلك|فيها|منها)\b/.test(normalizedQuery)) {
      return this.queryTypes.SEQUENTIAL;
    }

    return this.queryTypes.SIMPLE;
  }

  _extractQueryEntities(normalizedQuery) {
    const entities = {
      numbers: [],
      locations: [],
      activities: [],
      governorates: [],
      authorities: [],
      sectors: []
    };

    const basicEntities = this.normalizer.extractEntities(normalizedQuery);
    entities.numbers = basicEntities.numbers || [];
    entities.governorates = basicEntities.governorates || [];

    const queryLower = normalizedQuery.toLowerCase();
    
    // استخلاص الأنشطة
    this.commonActivities.forEach(activity => {
      if (queryLower.includes(activity)) {
        entities.activities.push(activity);
      }
    });

    const activityPatterns = [
      /(?:نشاط|مشروع|تأسيس|إنشاء|فتح|بدء|تشغيل)\s+([^\s,،.؟]+(?:\s+[^\s,،.؟]+){0,2})/g,
      /([^\s,،.؟]+)\s+(?:في|بـ|من)\s+(?:مصر|القاهرة|الإسكندرية)/g,
    ];

    activityPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(queryLower)) !== null) {
        const extracted = match[1].trim();
        if (extracted.length > 2 && extracted.length < 30) {
          entities.activities.push(extracted);
        }
      }
    });

    // استخلاص المواقع
    const locationPatterns = [
      /منطقة\s+([^\s,،.؟]+(?:\s+[^\s,،.؟]+){0,3})/g,
      /مدينة\s+([^\s,،.؟]+(?:\s+[^\s,،.؟]+){0,2})/g,
      /(\d+)\s*(رمضان|أكتوبر|مايو|السادات)/g,
      /(العبور|بدر|الشروق|السادات|العاشر|الروبيكي|شق الثعبان|حلوان)/g
    ];

    locationPatterns.forEach(pattern => {
      const matches = normalizedQuery.match(pattern);
      if (matches) {
        entities.locations.push(...matches.map(m => m.trim()));
      }
    });

    // استخلاص الجهات
    const authorityPatterns = [
      /(وزارة|هيئة|مصلحة|جهاز|إدارة)\s+([^\s,،.؟]+(?:\s+[^\s,،.؟]+){0,3})/g,
      /(المحافظة|المجتمعات العمرانية|التنمية الصناعية|السياحة|الصحة|التعليم)/g
    ];

    authorityPatterns.forEach(pattern => {
      const matches = normalizedQuery.match(pattern);
      if (matches) {
        entities.authorities.push(...matches.map(m => m.trim()));
      }
    });

    // استخلاص القطاعات
    if (/قطاع\s*(أ|ا|a)/i.test(normalizedQuery)) {
      entities.sectors.push('sectorA');
    }
    if (/قطاع\s*(ب|b)/i.test(normalizedQuery)) {
      entities.sectors.push('sectorB');
    }

    for (const key in entities) {
      if (Array.isArray(entities[key])) {
        entities[key] = [...new Set(entities[key])];
      }
    }

    return entities;
  }

  _needsCrossReference(primaryIntent, entities, queryType) {
    if (queryType === this.queryTypes.COMPLEX || 
        queryType === this.queryTypes.CROSS_REFERENCE) {
      return true;
    }

    if (entities.activities.length > 0 && entities.locations.length > 0) {
      return true;
    }

    if (entities.activities.length > 0 && primaryIntent === 'incentive') {
      return true;
    }

    if (entities.locations.length > 0 && entities.authorities.length > 0) {
      return true;
    }

    return false;
  }

  buildSubQueries(query, classification) {
    const subQueries = {
      activity: null,
      location: null,
      decision104: null,
      authority: null
    };

    const normalized = this.normalizer.normalize(query);

    if (classification.entities.activities.length > 0) {
      subQueries.activity = classification.entities.activities.join(' ');
    } else if (classification.suggestedDatabases.includes('activity')) {
      subQueries.activity = normalized;
    }

    if (classification.entities.locations.length > 0) {
      subQueries.location = classification.entities.locations.join(' ');
    } else if (classification.entities.governorates.length > 0) {
      subQueries.location = classification.entities.governorates.join(' ');
    }

    if (classification.primaryIntent === 'incentive' || 
        classification.entities.sectors.length > 0) {
      subQueries.decision104 = normalized;
    }

    if (classification.entities.authorities.length > 0) {
      subQueries.authority = classification.entities.authorities.join(' ');
    }

    return subQueries;
  }

  loadKnownEntities(metaIndex) {
    if (!metaIndex) return;

    this.knownEntities = {
      governorates: Array.isArray(metaIndex.governorates) ? metaIndex.governorates : [],
      locations: Array.isArray(metaIndex.locations) ? metaIndex.locations : [],
      activities: Array.isArray(metaIndex.activities) ? metaIndex.activities : [],
      authorities: Array.isArray(metaIndex.authorities) ? metaIndex.authorities : []
    };

    console.log('✅ تم تحميل الكيانات المعروفة:', {
      governorates: this.knownEntities.governorates.length,
      locations: this.knownEntities.locations.length,
      activities: this.knownEntities.activities.length,
      authorities: this.knownEntities.authorities.length
    });
  }

  resolvePronouns(query, contextMemory) {
    if (!contextMemory || !contextMemory.lastEntity) {
      return query;
    }

    let resolved = query;

    const pronouns = {
      'ها': contextMemory.lastEntity,
      'هو': contextMemory.lastEntity,
      'هي': contextMemory.lastEntity,
      'هم': contextMemory.lastEntity,
      'هذا': contextMemory.lastEntity,
      'هذه': contextMemory.lastEntity,
      'ذلك': contextMemory.lastEntity,
      'تلك': contextMemory.lastEntity,
      'فيها': `في ${contextMemory.lastEntity}`,
      'منها': `من ${contextMemory.lastEntity}`
    };

    for (const [pronoun, entity] of Object.entries(pronouns)) {
      const regex = new RegExp(`\\b${pronoun}\\b`, 'g');
      resolved = resolved.replace(regex, entity);
    }

    return resolved;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = IntentClassifier;
}
