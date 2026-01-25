/**
 * 📝 محلل الاستعلامات المعقدة
 * Complex Query Parser
 * 
 * الهدف: تحليل وتقسيم الأسئلة المركبة والمتتابعة
 * 
 * @author AI Expert System
 * @version 2.0.0
 */

class QueryParser {
  constructor(normalizer, intentClassifier) {
    this.normalizer = normalizer;
    this.intentClassifier = intentClassifier;

    // روابط الجمل
    this.conjunctions = {
      AND: ['و', 'وأيضا', 'وكذلك', 'كما', 'بالإضافة'],
      OR: ['أو', 'أم'],
      THEN: ['ثم', 'بعد ذلك', 'وبعدها'],
      BUT: ['لكن', 'ولكن', 'إلا أن'],
      QUESTION: ['هل', 'ما', 'ماذا', 'أين', 'متى', 'كيف', 'لماذا', 'من']
    };

    // أدوات المقارنة
    this.comparisonMarkers = [
      'فرق', 'مقارنة', 'بين', 'مقابل', 'أفضل', 'أحسن',
      'الأنسب', 'الأكثر', 'الأقل', 'أكبر', 'أصغر'
    ];
  }

  /**
   * 🎯 تحليل الاستعلام الرئيسي
   */
  parseQuery(query) {
    const normalized = this.normalizer.normalize(query);

    const parseResult = {
      originalQuery: query,
      normalizedQuery: normalized,
      queryType: null,
      subQueries: [],
      entities: {},
      hasComparison: false,
      hasSequence: false,
      complexity: 0
    };

    // 1. اكتشاف نوع السؤال
    parseResult.queryType = this._detectQueryStructure(normalized);

    // 2. استخراج الكيانات
    parseResult.entities = this.normalizer.extractEntities(normalized);

    // 3. تقسيم الأسئلة المركبة
    if (parseResult.queryType === 'complex') {
      parseResult.subQueries = this._splitComplexQuery(normalized);
    } else if (parseResult.queryType === 'sequential') {
      parseResult.subQueries = this._splitSequentialQuery(normalized);
    } else {
      parseResult.subQueries = [{ text: normalized, type: 'simple' }];
    }

    // 4. اكتشاف المقارنة
    parseResult.hasComparison = this._hasComparison(normalized);

    // 5. اكتشاف التتابع
    parseResult.hasSequence = this._hasSequence(normalized);

    // 6. حساب التعقيد
    parseResult.complexity = this._calculateComplexity(parseResult);

    return parseResult;
  }

  /**
   * 🔍 اكتشاف بنية السؤال
   */
  _detectQueryStructure(query) {
    // سؤال متتابع (يحتوي على ضمائر)
    if (/\b(ها|هو|هي|هم|هذا|هذه|ذلك|تلك)\b/.test(query)) {
      return 'sequential';
    }

    // سؤال مقارنة
    const hasComparison = this.comparisonMarkers.some(marker => 
      query.includes(marker)
    );
    if (hasComparison) {
      return 'comparative';
    }

    // سؤال إحصائي
    if (/\b(كم|عدد|كام|كل|جميع|قائمة|أسماء)\b/.test(query)) {
      return 'statistical';
    }

    // سؤال مركب (يحتوي على أكثر من رابط)
    const conjunctionCount = this._countConjunctions(query);
    if (conjunctionCount >= 2) {
      return 'complex';
    }

    // سؤال بسيط
    return 'simple';
  }

  /**
   * 🔢 عد الروابط في السؤال
   */
  _countConjunctions(query) {
    let count = 0;
    
    for (const conjList of Object.values(this.conjunctions)) {
      for (const conj of conjList) {
        const regex = new RegExp(`\\b${conj}\\b`, 'g');
        const matches = query.match(regex);
        if (matches) {
          count += matches.length;
        }
      }
    }

    return count;
  }

  /**
   * ✂️ تقسيم السؤال المركب
   */
  _splitComplexQuery(query) {
    const subQueries = [];

    // تقسيم عند علامات الاستفهام
    let parts = query.split(/[؟?]/);
    parts = parts.filter(p => p.trim().length > 0);

    if (parts.length > 1) {
      // سؤال متعدد
      parts.forEach((part, index) => {
        subQueries.push({
          text: part.trim(),
          type: 'sub_question',
          index: index
        });
      });
    } else {
      // تقسيم عند الروابط الرئيسية
      const splitPattern = /\s+(و|ثم|لكن)\s+/;
      parts = query.split(splitPattern);

      for (let i = 0; i < parts.length; i += 2) {
        if (parts[i] && parts[i].trim().length > 0) {
          subQueries.push({
            text: parts[i].trim(),
            type: 'clause',
            conjunction: parts[i + 1] || null
          });
        }
      }
    }

    return subQueries.length > 0 ? subQueries : [{ text: query, type: 'simple' }];
  }

  /**
   * 🔄 تقسيم السؤال المتتابع
   */
  _splitSequentialQuery(query) {
    // الأسئلة المتتابعة عادة لا تحتاج تقسيم
    // لأنها تعتمد على السياق من السؤال السابق
    return [{
      text: query,
      type: 'sequential',
      requiresContext: true
    }];
  }

  /**
   * 🆚 التحقق من وجود مقارنة
   */
  _hasComparison(query) {
    return this.comparisonMarkers.some(marker => query.includes(marker));
  }

  /**
   * ➡️ التحقق من وجود تتابع
   */
  _hasSequence(query) {
    return /\b(ثم|بعد ذلك|وبعدها)\b/.test(query);
  }

  /**
   * 🧮 حساب درجة التعقيد
   */
  _calculateComplexity(parseResult) {
    let complexity = 0;

    // عدد الأسئلة الفرعية
    complexity += parseResult.subQueries.length * 2;

    // عدد الكيانات
    const entityCount = Object.values(parseResult.entities)
      .reduce((sum, arr) => sum + arr.length, 0);
    complexity += entityCount;

    // المقارنة
    if (parseResult.hasComparison) {
      complexity += 3;
    }

    // التتابع
    if (parseResult.hasSequence) {
      complexity += 2;
    }

    // الطول
    complexity += Math.floor(parseResult.normalizedQuery.length / 50);

    return Math.min(complexity, 10); // الحد الأقصى 10
  }

  /**
   * 🔍 استخراج العناصر المراد مقارنتها
   */
  extractComparisonElements(query) {
    const elements = [];

    // البحث عن نمط "بين X و Y"
    const betweenPattern = /بين\s+([^\s]+(?:\s+[^\s]+){0,3})\s+و\s+([^\s]+(?:\s+[^\s]+){0,3})/;
    const match = query.match(betweenPattern);

    if (match) {
      elements.push({
        element: match[1].trim(),
        position: 'first'
      });
      elements.push({
        element: match[2].trim(),
        position: 'second'
      });
    } else {
      // محاولة استخراج العناصر من الكيانات
      const entities = this.normalizer.extractEntities(query);
      
      if (entities.locations.length >= 2) {
        entities.locations.forEach((loc, idx) => {
          elements.push({
            element: loc,
            type: 'location',
            position: idx === 0 ? 'first' : 'second'
          });
        });
      } else if (entities.activities.length >= 2) {
        entities.activities.forEach((act, idx) => {
          elements.push({
            element: act,
            type: 'activity',
            position: idx === 0 ? 'first' : 'second'
          });
        });
      }
    }

    return elements;
  }

  /**
   * 📊 استخراج معايير الإحصاء
   */
  extractStatisticalCriteria(query) {
    const criteria = {
      target: null,        // ما المطلوب إحصاؤه
      filters: {},         // الفلاتر
      groupBy: null,       // التجميع حسب
      limit: null          // الحد الأقصى
    };

    // ما المطلوب إحصاؤه
    if (query.includes('عدد المناطق') || query.includes('كم منطقة')) {
      criteria.target = 'industrial_zones';
    } else if (query.includes('عدد الأنشطة') || query.includes('كم نشاط')) {
      criteria.target = 'activities';
    } else if (query.includes('جهات الولاية') || query.includes('الجهات التابعة')) {
      criteria.target = 'authorities';
    }

    // الفلاتر
    const entities = this.normalizer.extractEntities(query);
    
    if (entities.governorates.length > 0) {
      criteria.filters.governorate = entities.governorates[0];
    }

    if (entities.authorities.length > 0) {
      criteria.filters.authority = entities.authorities[0];
    }

    // التجميع
    if (query.includes('حسب المحافظة') || query.includes('في كل محافظة')) {
      criteria.groupBy = 'governorate';
    } else if (query.includes('حسب الجهة') || query.includes('حسب التبعية')) {
      criteria.groupBy = 'authority';
    }

    // الحد الأقصى
    const limitMatch = query.match(/أعلى\s+(\d+)|أكثر\s+(\d+)|أول\s+(\d+)/);
    if (limitMatch) {
      criteria.limit = parseInt(limitMatch[1] || limitMatch[2] || limitMatch[3]);
    }

    return criteria;
  }

  /**
   * 🎯 استخراج الفلاتر من السؤال
   */
  extractFilters(query) {
    const filters = {};
    const entities = this.normalizer.extractEntities(query);

    // المحافظة
    if (entities.governorates.length > 0) {
      filters.governorate = entities.governorates[0];
    }

    // الجهة
    if (entities.authorities.length > 0) {
      filters.authority = entities.authorities[0];
    }

    // النوع (للقرار 104)
    if (/قطاع\s*(أ|ا|a)/i.test(query)) {
      filters.sector = 'sectorA';
    } else if (/قطاع\s*(ب|b)/i.test(query)) {
      filters.sector = 'sectorB';
    }

    // المساحة
    const areaMatch = query.match(/مساحة\s+(\d+)/);
    if (areaMatch) {
      filters.minArea = parseInt(areaMatch[1]);
    }

    return filters;
  }

  /**
   * 🔗 ربط الضمائر بالسياق
   */
  resolvePronounsWithContext(query, contextMemory) {
    if (!contextMemory || !contextMemory.lastEntity) {
      return query;
    }

    let resolved = query;

    // قائمة الضمائر
    const pronounMap = {
      'ها': contextMemory.lastEntity,
      'هو': contextMemory.lastEntity,
      'هي': contextMemory.lastEntity,
      'هم': contextMemory.lastEntity,
      'هذا': contextMemory.lastEntity,
      'هذه': contextMemory.lastEntity,
      'ذلك': contextMemory.lastEntity,
      'تلك': contextMemory.lastEntity,
      'فيه': `في ${contextMemory.lastEntity}`,
      'منها': `من ${contextMemory.lastEntity}`,
      'لها': `ل${contextMemory.lastEntity}`
    };

    // استبدال الضمائر
    for (const [pronoun, replacement] of Object.entries(pronounMap)) {
      const regex = new RegExp(`\\b${pronoun}\\b`, 'g');
      resolved = resolved.replace(regex, replacement);
    }

    return resolved;
  }

  /**
   * 🧩 دمج الأسئلة الفرعية
   */
  mergeSubQueries(subQueries, conjunction = 'و') {
    return subQueries
      .map(sq => sq.text)
      .join(` ${conjunction} `);
  }

  /**
   * 📋 تحليل سؤال تفصيلي
   */
  analyzeDetailedQuery(query) {
    const analysis = {
      isDetailed: false,
      aspects: [],
      depth: 0
    };

    // كلمات دالة على التفاصيل
    const detailMarkers = [
      'تفاصيل', 'تفصيلي', 'بالتفصيل', 'شرح', 'وضح',
      'اذكر', 'اشرح', 'بين', 'عدد', 'أذكر'
    ];

    analysis.isDetailed = detailMarkers.some(marker => query.includes(marker));

    // الجوانب المطلوبة
    if (query.includes('اشتراطات') || query.includes('شروط')) {
      analysis.aspects.push('requirements');
    }
    if (query.includes('ترخيص') || query.includes('تراخيص')) {
      analysis.aspects.push('licenses');
    }
    if (query.includes('جهة') || query.includes('مختص')) {
      analysis.aspects.push('authority');
    }
    if (query.includes('قانون') || query.includes('قرار')) {
      analysis.aspects.push('legal');
    }
    if (query.includes('مكان') || query.includes('موقع')) {
      analysis.aspects.push('location');
    }
    if (query.includes('حوافز') || query.includes('دعم')) {
      analysis.aspects.push('incentives');
    }

    // عمق التفاصيل
    analysis.depth = analysis.aspects.length;

    return analysis;
  }

  /**
   * 📝 توليد ملخص للاستعلام
   */
  generateQuerySummary(parseResult) {
    const summary = {
      mainTopic: null,
      keywords: [],
      intent: null,
      complexity: parseResult.complexity
    };

    // الموضوع الرئيسي
    if (parseResult.entities.activities.length > 0) {
      summary.mainTopic = `نشاط: ${parseResult.entities.activities[0]}`;
    } else if (parseResult.entities.locations.length > 0) {
      summary.mainTopic = `موقع: ${parseResult.entities.locations[0]}`;
    } else if (parseResult.entities.governorates.length > 0) {
      summary.mainTopic = `محافظة: ${parseResult.entities.governorates[0]}`;
    }

    // الكلمات المفتاحية
    summary.keywords = this.normalizer.extractKeywords(parseResult.normalizedQuery);

    // النية (تحليل بسيط)
    if (parseResult.queryType === 'statistical') {
      summary.intent = 'إحصائي';
    } else if (parseResult.queryType === 'comparative') {
      summary.intent = 'مقارنة';
    } else if (parseResult.normalizedQuery.includes('ترخيص')) {
      summary.intent = 'قانوني';
    } else if (parseResult.normalizedQuery.includes('حوافز')) {
      summary.intent = 'حوافز';
    } else {
      summary.intent = 'استعلام عام';
    }

    return summary;
  }
}

// تصدير الكلاس
if (typeof module !== 'undefined' && module.exports) {
  module.exports = QueryParser;
}