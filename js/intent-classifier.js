/**
 * 🎯 مصنف النوايا الذكي - فهم دلالي عميق
 * Intent Classifier - Deep Semantic Understanding
 * 
 * @author AI Expert System
 * @version 5.0.0 - Smart Database Selection
 */

class IntentClassifier {
  constructor(arabicNormalizer, vectorEngine) {
    this.normalizer = arabicNormalizer;
    this.vectorEngine = vectorEngine;

    // 🔥 تحسين أنماط النوايا
    this.intentPatterns = {
      legal: {
        semantic: ['ترخيص', 'رخصة', 'تصريح', 'سجل', 'اشتراطات', 'متطلبات', 'مستندات', 'أوراق', 'وثيقة', 'إجازة'],
        weight: 1.2
      },
      geographic: {
        semantic: ['منطقة', 'موقع', 'مكان', 'محافظة', 'مدينة', 'قرية', 'حي', 'خريطة', 'عنوان', 'موقع'],
        weight: 1.0
      },
      technical: {
        semantic: ['اشتراطات', 'فنية', 'معاينة', 'فحص', 'مواصفات', 'معايير', 'سلامة', 'حماية', 'مساحة', 'مقاس'],
        weight: 1.0
      },
      incentive: {
        semantic: ['حوافز', 'قرار 104', 'قرار', 'دعم', 'إعفاء', 'تخفيض', 'مزايا', 'قطاع', 'تسهيلات'],
        weight: 1.1
      },
      statistical: {
        semantic: ['كم', 'عدد', 'كام', 'إحصائية', 'جميع', 'كل', 'قائمة', 'أسماء', 'توزيع', 'مجموع'],
        weight: 0.8
      },
      comparative: {
        semantic: ['فرق', 'مقارنة', 'أفضل', 'أحسن', 'الأنسب', 'بين', 'مقابل', 'ولا', 'أيهما'],
        weight: 0.9
      },
      activity: {
        semantic: ['نشاط', 'مشروع', 'شركة', 'مؤسسة', 'منشأة', 'محل', 'مصنع', 'فندق', 'مطعم'],
        weight: 1.5  // ⬆️ زيادة الوزن للأنشطة
      }
    };

    // 🔥 تحسين المفاهيم الدلالية للقواعد
    this.databaseSemantics = {
      industrial: {
        concepts: [
          'منطقة صناعية', 'مناطق صناعية', 'منطقة', 'مناطق',
          'موقع صناعي', 'مدينة صناعية', 'حيز صناعي',
          'محافظة', 'تبعية', 'جهاز', 'هيئة عمرانية', 'مساحة',
          'إحداثيات', 'خريطة', 'موجود', 'تابع', 'صناعي', 'صناعية'
        ],
        weight: 1.0
      },
      activity: {
        concepts: [
          'نشاط', 'أنشطة', 'مشروع', 'مشاريع', 'ترخيص', 'رخصة',
          'تصريح', 'اشتراطات', 'متطلبات', 'إجراءات', 'فني', 'قانوني',
          'مستندات', 'أوراق', 'جهة مختصة', 'سجل', 'فتح', 'تأسيس',
          'إنشاء', 'تشغيل', 'تراخيص', 'عمل', 'مهنة', 'صنعة'
        ],
        weight: 1.3  // ⬆️ زيادة الوزن لأنشطة
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

    // 🔥 زيادة قائمة الأنشطة الشائعة
    this.commonActivities = [
      'فندق', 'مصنع', 'مطعم', 'مقهى', 'كافيه', 'محل', 'شركة', 'مكتب',
      'مخبز', 'صيدلية', 'عيادة', 'مستشفى', 'مدرسة', 'حضانة', 'روضة',
      'ورشة', 'معمل', 'قرية سياحية', 'منتجع', 'ريزورت', 'كومباوند',
      'سوبر ماركت', 'هايبر ماركت', 'مول', 'محطة وقود', 'غسيل سيارات',
      'مستودع', 'مخزن', 'صالون', 'محل تجاري', 'صالون تجميل', 'صالة ألعاب',
      'مكتب هندسي', 'مكتب محاماة', 'مكتب استشاري', 'مكتب تسويق', 'معرض'
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
      semanticScores: {},
      queryComplexity: 0
    };

    // 1. استخلاص الكيانات
    classification.entities = this._extractQueryEntities(normalized);

    // 2. حساب نقاط النوايا
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
        .filter(([_, score]) => score > 0.2) // ⬇️ خفض العتبة
        .map(([intent, _]) => intent);
    }

    // 🔥 5. حساب تعقيد السؤال
    classification.queryComplexity = this._calculateQueryComplexity(normalized, classification.entities);

    // 🔥 تسجيل التطابقات الدلالية
    console.log('🎯 فهم النية:', {
      query: query.substring(0, 50) + '...',
      primary: classification.primaryIntent,
      confidence: (classification.confidence * 100).toFixed(1) + '%',
      semanticScores: {
        industrial: (classification.semanticScores.industrial * 100).toFixed(1) + '%',
        activity: (classification.semanticScores.activity * 100).toFixed(1) + '%',
        decision104: (classification.semanticScores.decision104 * 100).toFixed(1) + '%'
      }
    });

    // 6. تحديد نوع السؤال
    classification.queryType = this._detectQueryType(normalized, classification.entities);

    // 7. تحديد الربط المتقاطع
    classification.requiresCrossReference = this._needsCrossReference(
      classification.primaryIntent,
      classification.entities,
      classification.queryType
    );

    // 🔥 8. اختيار القواعد بناءً على الفهم الدلالي
    classification.suggestedDatabases = this._suggestDatabasesIntelligent(
      classification,
      normalized
    );

    // 🔥 9. إذا لم يتم اختيار قواعد، نختار بناءً على النية
    if (classification.suggestedDatabases.length === 0) {
      classification.suggestedDatabases = this._fallbackDatabaseSelection(classification.primaryIntent);
    }

    return classification;
  }

  /**
   * 🔥 حساب تعقيد السؤال
   */
  _calculateQueryComplexity(normalizedQuery, entities) {
    let complexity = 0;
    
    // عدد الكلمات
    const wordCount = normalizedQuery.split(/\s+/).length;
    if (wordCount > 8) complexity += 0.3;
    
    // عدد الكيانات
    const entityCount = Object.values(entities).filter(e => e && e.length > 0).length;
    complexity += entityCount * 0.2;
    
    // وجود أسئلة مركبة
    if (/(و|أو|ثم|لكن|لذا|بالإضافة|كذلك)/.test(normalizedQuery)) {
      complexity += 0.3;
    }
    
    // وجود أسئلة فرعية
    const questionCount = (normalizedQuery.match(/\؟/g) || []).length;
    if (questionCount > 1) complexity += 0.2;
    
    return Math.min(complexity, 1.0);
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
          matchScore += 10.0 * dbData.weight; // ⬆️ زيادة الوزن
          conceptMatches++;
        }
        // تطابق كلمات المفهوم
        else {
          const matches = conceptWords.filter(cw => 
            queryWords.some(qw => {
              // تطابق تام أو جزئي
              return qw === cw || 
                     qw.includes(cw) || 
                     cw.includes(qw) ||
                     this._areWordsRelated(qw, cw);
            })
          );
          
          if (matches.length > 0) {
            const ratio = matches.length / conceptWords.length;
            matchScore += ratio * 5.0 * dbData.weight; // ⬆️ زيادة الوزن
            conceptMatches++;
          }
        }
      });

      // تطبيع النتيجة
      if (dbData.concepts.length > 0) {
        scores[dbName] = Math.min(1.0, matchScore / (dbData.concepts.length * 2));
      }
    }

    return scores;
  }

  /**
   * 🔥 التحقق من علاقة الكلمات
   */
  _areWordsRelated(word1, word2) {
    if (word1.length < 3 || word2.length < 3) return false;
    
    // كلمات ذات جذر مشترك
    const commonRoots = [
      ['صنع', 'صناعة', 'صناعي'],
      ['تجار', 'تجاري', 'تجارة'],
      ['خدم', 'خدمي', 'خدمات'],
      ['تعليم', 'تعلم', 'تعليمي'],
      ['صحة', 'صحي', 'مستشفى'],
      ['سكن', 'سكني', 'مساكن'],
      ['فندق', 'فندقي', 'فنادق'],
      ['مطعم', 'مطعمي', 'مطاعم']
    ];
    
    for (const rootGroup of commonRoots) {
      if (rootGroup.includes(word1) && rootGroup.includes(word2)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * 🔥 اختيار قواعد ذكي
   */
  _suggestDatabasesIntelligent(classification, normalizedQuery) {
    const databases = new Set();
    const semanticScores = classification.semanticScores;

    // 🔥 قاعدة 1: إذا كان التطابق الدلالي عالي (> 40%)
    const highScoreDbs = Object.entries(semanticScores)
      .filter(([db, score]) => score > 0.4)
      .sort((a, b) => b[1] - a[1])
      .map(([db]) => db);
    
    if (highScoreDbs.length > 0) {
      highScoreDbs.forEach(db => databases.add(db));
      console.log(`🔍 اختيار قواعد بالتطابق العالي: ${highScoreDbs.join(', ')}`);
      return Array.from(databases);
    }

    // 🔥 قاعدة 2: تحليل النية الأساسية
    if (classification.primaryIntent) {
      switch (classification.primaryIntent) {
        case 'activity':
          databases.add('activity');
          if (classification.entities.activities.length > 0) {
            databases.add('decision104'); // الأنشطة قد يكون لها حوافز
          }
          break;
          
        case 'geographic':
          databases.add('industrial');
          break;
          
        case 'incentive':
          databases.add('decision104');
          databases.add('activity'); // الحوافز مرتبطة بالأنشطة
          break;
          
        case 'legal':
        case 'technical':
          databases.add('activity');
          break;
          
        case 'statistical':
          // الإحصائية تبحث في جميع القواعد
          databases.add('industrial');
          databases.add('activity');
          databases.add('decision104');
          break;
          
        default:
          databases.add('activity');
          break;
      }
    }

    // 🔥 قاعدة 3: تحليل الكيانات
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

    // 🔥 قاعدة 4: كلمات محددة توجه لقاعدة محددة
    const specificPatterns = {
      industrial: [
        /منطق[ةه]?\s*صناعي[ةه]?/i,
        /مدين[ةه]?\s*صناعي[ةه]?/i,
        /موقع\s*صناعي/i,
        /حيز\s*صناعي/i,
        /محافظ[ةه]?/i,
        /تبعية/i,
        /هيئة عمرانية/i,
        /مساحة/i,
        /إحداثيات/i,
        /خريطة/i
      ],
      activity: [
        /نشاط/i,
        /ترخيص/i,
        /رخصة/i,
        /تصريح/i,
        /اشتراطات/i,
        /متطلبات/i,
        /إجراءات/i,
        /مستندات/i,
        /أوراق/i,
        /سجل/i,
        /فتح/i,
        /تأسيس/i,
        /إنشاء/i,
        /تشغيل/i
      ],
      decision104: [
        /قرار\s*104/i,
        /حوافز/i,
        /إعفاء/i,
        /تخفيض/i,
        /مزايا/i,
        /قطاع\s*أ/i,
        /قطاع\s*ب/i,
        /تسهيلات/i
      ]
    };

    for (const [db, patterns] of Object.entries(specificPatterns)) {
      if (patterns.some(pattern => pattern.test(normalizedQuery))) {
        databases.add(db);
      }
    }

    // 🔥 إذا لم نجد أي قاعدة، نستخدم التطابق الدلالي الأعلى
    if (databases.size === 0) {
      const sortedByScore = Object.entries(semanticScores)
        .sort((a, b) => b[1] - a[1])
        .filter(([_, score]) => score > 0.1);
      
      if (sortedByScore.length > 0) {
        databases.add(sortedByScore[0][0]);
        if (sortedByScore.length > 1 && sortedByScore[1][1] > 0.2) {
          databases.add(sortedByScore[1][0]);
        }
      }
    }

    // 🔥 تأكيد: إذا كان السؤال عن فندق أو مطعم، فهذا نشاط بالتأكيد
    if (/فندق|مطعم|مقهى|كافيه|مصنع|ورشة|معمل/i.test(normalizedQuery)) {
      databases.add('activity');
    }

    // 🔥 تأكيد: إذا كان السؤال عن منطقة صناعية، فهذا industrial بالتأكيد
    if (/منطق[ةه]?\s*صناعي[ةه]?/i.test(normalizedQuery)) {
      databases.clear();
      databases.add('industrial');
    }

    return Array.from(databases);
  }

  /**
   * 🔥 اختيار احتياطي للقواعد
   */
  _fallbackDatabaseSelection(primaryIntent) {
    switch (primaryIntent) {
      case 'activity':
      case 'legal':
      case 'technical':
        return ['activity'];
      case 'geographic':
        return ['industrial'];
      case 'incentive':
        return ['decision104'];
      case 'statistical':
        return ['industrial', 'activity', 'decision104'];
      default:
        return ['activity', 'industrial']; // ⬅️ قواعد افتراضية
    }
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
          score += intentData.weight * matchCount * 1.5; // ⬆️ زيادة الوزن
        }
      }

      if (matches > 0) {
        scores[intentName] = Math.min(1.0, score / Math.max(1, words.length * 0.5));
      } else {
        scores[intentName] = 0;
      }
    }

    return scores;
  }

  _detectQueryType(normalizedQuery, entities) {
    if (/\b(كم|عدد|كام|كل|جميع|قائمة|توزيع|احصائية|مجموع|كامل)\b/.test(normalizedQuery)) {
      return this.queryTypes.STATISTICAL;
    }

    if (/\b(فرق|مقارنة|أفضل|بين|ولا|أم|أيهما|مقابل|مقارنة)\b/.test(normalizedQuery)) {
      return this.queryTypes.COMPARATIVE;
    }

    const entityCount = Object.values(entities).filter(e => e && e.length > 0).length;
    if (entityCount >= 3) {
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
      /(?:نشاط|مشروع|تأسيس|إنشاء|فتح|بدء|تشغيل|عمل)\s+([^\s,،.؟]+(?:\s+[^\s,،.؟]+){0,3})/gi,
      /(?:ترخيص|رخصة|تصريح)\s+(?:لـ|ل)?\s*([^\s,،.؟]+(?:\s+[^\s,،.؟]+){0,3})/gi,
      /([^\s,،.؟]+)\s+(?:فندق|مصنع|مطعم|مقهى|مخبز|صالون|معرض)/gi
    ];

    activityPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(queryLower)) !== null) {
        const extracted = match[1].trim();
        if (extracted.length > 2 && extracted.length < 40) {
          entities.activities.push(extracted);
        }
      }
    });

    // استخلاص المواقع
    const locationPatterns = [
      /منطقة\s+([^\s,،.؟]+(?:\s+[^\s,،.؟]+){0,3})/gi,
      /مدينة\s+([^\s,،.؟]+(?:\s+[^\s,،.؟]+){0,2})/gi,
      /(\d+)\s*(رمضان|أكتوبر|مايو|السادات)/gi,
      /(العبور|بدر|الشروق|السادات|العاشر|الروبيكي|شق الثعبان|حلوان)/gi
    ];

    locationPatterns.forEach(pattern => {
      const matches = normalizedQuery.match(pattern);
      if (matches) {
        entities.locations.push(...matches.map(m => m.trim()));
      }
    });

    // استخلاص الجهات
    const authorityPatterns = [
      /(وزارة|هيئة|مصلحة|جهاز|إدارة)\s+([^\s,،.؟]+(?:\s+[^\s,،.؟]+){0,3})/gi,
      /(المحافظة|المجتمعات العمرانية|التنمية الصناعية|السياحة|الصحة|التعليم)/gi
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
        queryType === this.queryTypes.COMPARATIVE ||
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
        classification.entities.sectors.length > 0 ||
        /حوافز|قرار|104/.test(normalized)) {
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
