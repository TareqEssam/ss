/**
 * 🧠 النواة الرئيسية للمساعد الذكي
 * AI Expert Core Engine
 * 
 * العقل المركزي الذي يربط جميع المكونات ويدير المنطق الذكي
 * 
 * @author AI Expert System
 * @version 2.0.0
 */

class AIExpertCore {
  constructor() {
    // المكونات الأساسية
    this.normalizer = null;
    this.vectorEngine = null;
    this.intentClassifier = null;
    this.dbManager = null;
    this.learningSystem = null;
    this.queryParser = null;

    // الحالة
    this.initialized = false;
    this.isProcessing = false;
    
    // الذاكرة السياقية
    this.contextMemory = {
      lastQuery: null,
      lastEntity: null,
      lastIntent: null,
      lastResults: null,
      conversationHistory: [],
      maxHistoryLength: 10
    };

    // الإحصائيات
    this.stats = {
      totalQueries: 0,
      successfulQueries: 0,
      failedQueries: 0,
      averageResponseTime: 0,
      learnedCorrections: 0
    };

    // قواعد البيانات المحملة
    this.vectorDatabases = {
      activity: null,
      decision104: null,
      industrial: null
    };

    // الفهرس المحلي
    this.metaIndex = {
      governorates: new Set(),
      locations: new Set(),
      activities: new Set(),
      authorities: new Set(),
      keywords: new Map() // keyword -> [database, recordId]
    };
  }

  /**
   * 🚀 التهيئة الكاملة للنظام
   */
  async initialize() {
    if (this.initialized) {
      console.log('✅ النظام مهيأ بالفعل');
      return true;
    }

    console.log('🚀 بدء تهيئة المساعد الذكي...');
    const startTime = performance.now();

    try {
      // 1. تهيئة المكونات الأساسية
      console.log('📦 تهيئة المكونات الأساسية...');
      this.normalizer = new ArabicNormalizer();
      this.dbManager = new IndexedDBManager();
      await this.dbManager.init();

      // 2. التحقق من وجود بيانات محفوظة
      console.log('🔍 فحص البيانات المحفوظة...');
      const savedData = await this._checkSavedData();

      if (savedData.exists) {
        console.log('✅ تم العثور على بيانات محفوظة، التحميل...');
        await this._loadSavedData();
      } else {
        console.log('📥 لا توجد بيانات محفوظة، تحميل من الملفات الأصلية...');
        await this._loadFromSourceFiles();
        await this._buildMetaIndex();
        await this._saveAllData();
      }

      // 3. تهيئة محرك المتجهات
      console.log('⚡ تهيئة محرك المتجهات...');
      this.vectorEngine = new VectorEngine(this.normalizer);
      await this.vectorEngine.loadDatabases(this.vectorDatabases);

      // 4. تهيئة مصنف النوايا
      console.log('🎯 تهيئة مصنف النوايا...');
      this.intentClassifier = new IntentClassifier(this.normalizer, this.vectorEngine);
      this.intentClassifier.loadKnownEntities(this.metaIndex);

      // 5. تهيئة نظام التعلم
      console.log('🧠 تهيئة نظام التعلم...');
      this.learningSystem = new LearningSystem(this.dbManager, this.normalizer);
      await this.learningSystem.initialize();

      // 6. تهيئة محلل الاستعلامات
      console.log('📝 تهيئة محلل الاستعلامات...');
      this.queryParser = new QueryParser(this.normalizer, this.intentClassifier);

      // 7. تحميل الذاكرة السياقية
      const savedContext = await this.dbManager.loadContext();
      if (savedContext) {
        this.contextMemory = { ...this.contextMemory, ...savedContext };
      }

      this.initialized = true;
      const totalTime = ((performance.now() - startTime) / 1000).toFixed(2);
      
      console.log('✅ اكتمل التهيئة بنجاح!');
      console.log(`⏱️ الزمن الكلي: ${totalTime} ثانية`);
      console.log('📊 الإحصائيات:', await this._getSystemStats());

      return true;

    } catch (error) {
      console.error('❌ فشل التهيئة:', error);
      return false;
    }
  }

  /**
   * 💬 معالجة استعلام المستخدم (النقطة المركزية)
   */
  async processQuery(userQuery, options = {}) {
    if (!this.initialized) {
      throw new Error('النظام غير مهيأ! استخدم initialize() أولاً');
    }

    if (this.isProcessing) {
      console.warn('⚠️ النظام يعالج استعلام آخر...');
      return {
        success: false,
        message: 'انتظر قليلاً، أنا أفكر في السؤال السابق...'
      };
    }

    this.isProcessing = true;
    const startTime = performance.now();
    this.stats.totalQueries++;

    try {
      console.log('💬 استعلام جديد:', userQuery);

      // 1. التطبيع والمعالجة اللغوية
      const normalized = options.isVoice 
        ? this.normalizer.normalizeForVoice(userQuery)
        : this.normalizer.normalize(userQuery);

      console.log('📝 النص بعد المعالجة:', normalized);

      // 2. حل الضمائر (إذا كان سؤال متتابع)
      const resolvedQuery = this.intentClassifier.resolvePronouns(
        normalized, 
        this.contextMemory
      );

      console.log('🔄 النص بعد حل الضمائر:', resolvedQuery);

      // 3. البحث في الذاكرة (المعرفة المتعلمة)
      const learnedAnswer = await this.learningSystem.searchLearned(resolvedQuery);
      if (learnedAnswer) {
        console.log('🧠 تم العثور على إجابة متعلمة');
        return this._formatLearnedResponse(learnedAnswer);
      }

      // 4. تصنيف النية
      const intentClassification = await this.intentClassifier.classifyIntent(resolvedQuery);
      console.log('🎯 تصنيف النية:', {
        primary: intentClassification.primaryIntent,
        confidence: intentClassification.confidence.toFixed(2),
        type: intentClassification.queryType,
        databases: intentClassification.suggestedDatabases
      });

      // 5. بناء الاستعلامات الفرعية
      const subQueries = this.intentClassifier.buildSubQueries(
        resolvedQuery,
        intentClassification
      );

      // 6. تنفيذ الاستراتيجية المناسبة
      let response;

      if (intentClassification.queryType === 'statistical') {
        response = await this._handleStatisticalQuery(resolvedQuery, intentClassification);
      } else if (intentClassification.queryType === 'comparative') {
        response = await this._handleComparativeQuery(resolvedQuery, intentClassification);
      } else if (intentClassification.requiresCrossReference) {
        response = await this._handleCrossReferenceQuery(subQueries, intentClassification);
      } else {
        response = await this._handleSimpleQuery(resolvedQuery, intentClassification);
      }

      // 7. تحديث الذاكرة السياقية
      await this._updateContextMemory(userQuery, response, intentClassification);

      // 8. حفظ في سجل المحادثة
      this._addToConversationHistory({
        query: userQuery,
        normalized: normalized,
        response: response,
        timestamp: new Date().toISOString()
      });

      // 9. تحديث الإحصائيات
      const responseTime = performance.now() - startTime;
      this.stats.successfulQueries++;
      this._updateAverageResponseTime(responseTime);

      console.log(`✅ تمت المعالجة في ${responseTime.toFixed(2)}ms`);

      this.isProcessing = false;
      return response;

    } catch (error) {
      console.error('❌ خطأ في المعالجة:', error);
      this.stats.failedQueries++;
      this.isProcessing = false;

      return {
        success: false,
        message: 'عذراً، حدث خطأ أثناء معالجة سؤالك. حاول إعادة صياغته.',
        error: error.message
      };
    }
  }

  /**
   * 📊 معالجة السؤال الإحصائي
   */
  async _handleStatisticalQuery(query, classification) {
    console.log('📊 معالجة سؤال إحصائي...');

    const results = await this.vectorEngine.parallelSearch(query, {
      topK: 100, // نحتاج عدد كبير للإحصائيات
      databases: classification.suggestedDatabases
    });

    // تحليل النتائج
    const analysis = this._analyzeStatisticalResults(results, query);

    return {
      success: true,
      type: 'statistical',
      message: this._formatStatisticalAnswer(analysis, query),
      data: analysis,
      sources: this._extractSources(results)
    };
  }

  /**
   * 🔍 تحليل النتائج الإحصائية
   */
  _analyzeStatisticalResults(results, query) {
    const analysis = {
      total: 0,
      byGovernorate: {},
      byAuthority: {},
      byType: {},
      topResults: []
    };

    // تحليل المناطق الصناعية
    if (results.industrial && results.industrial.length > 0) {
      results.industrial.forEach(record => {
        const data = record.original_data;
        
        // حسب المحافظة
        if (data.governorate) {
          analysis.byGovernorate[data.governorate] = 
            (analysis.byGovernorate[data.governorate] || 0) + 1;
        }

        // حسب التبعية
        if (data.dependency) {
          analysis.byAuthority[data.dependency] = 
            (analysis.byAuthority[data.dependency] || 0) + 1;
        }

        analysis.total++;
      });

      analysis.topResults = results.industrial
        .slice(0, 10)
        .map(r => r.original_data);
    }

    // تحليل الأنشطة
    if (results.activity && results.activity.length > 0) {
      results.activity.forEach(record => {
        const data = record.original_data;
        analysis.total++;
      });
    }

    // تحليل القرار 104
    if (results.decision104 && results.decision104.length > 0) {
      results.decision104.forEach(record => {
        const preview = record.original_data.text_preview || '';
        
        // استخراج القطاع
        if (preview.includes('sectorA') || preview.includes('القطاع أ')) {
          analysis.byType['قطاع أ'] = (analysis.byType['قطاع أ'] || 0) + 1;
        } else if (preview.includes('sectorB') || preview.includes('القطاع ب')) {
          analysis.byType['قطاع ب'] = (analysis.byType['قطاع ب'] || 0) + 1;
        }

        analysis.total++;
      });
    }

    return analysis;
  }

  /**
   * 🆚 معالجة السؤال المقارن
   */
  async _handleComparativeQuery(query, classification) {
    console.log('🆚 معالجة سؤال مقارنة...');

    // استخراج العناصر المراد مقارنتها
    const entities = classification.entities;
    
    const comparisons = [];

    // إذا كان يقارن بين مواقع
    if (entities.locations.length >= 2) {
      for (const location of entities.locations) {
        const result = await this.vectorEngine.semanticSearch(
          location,
          'industrial',
          1
        );
        if (result.length > 0) {
          comparisons.push({
            entity: location,
            data: result[0].original_data,
            type: 'location'
          });
        }
      }
    }

    // إذا كان يقارن بين أنشطة
    if (entities.activities.length >= 2) {
      for (const activity of entities.activities) {
        const result = await this.vectorEngine.semanticSearch(
          activity,
          'activity',
          1
        );
        if (result.length > 0) {
          comparisons.push({
            entity: activity,
            data: result[0].original_data,
            type: 'activity'
          });
        }
      }
    }

    return {
      success: true,
      type: 'comparative',
      message: this._formatComparativeAnswer(comparisons),
      data: { comparisons },
      sources: comparisons.map(c => ({ type: c.type, entity: c.entity }))
    };
  }

  /**
   * 🔗 معالجة السؤال المتقاطع (يحتاج ربط بين قواعد)
   */
  async _handleCrossReferenceQuery(subQueries, classification) {
    console.log('🔗 معالجة سؤال متقاطع...');

    const crossResults = {
      activity: null,
      location: null,
      decision104: null,
      match: false
    };

    // البحث عن النشاط
    if (subQueries.activity) {
      const activityResults = await this.vectorEngine.semanticSearch(
        subQueries.activity,
        'activity',
        3
      );
      if (activityResults.length > 0) {
        crossResults.activity = activityResults[0];
      }
    }

    // البحث عن الموقع
    if (subQueries.location) {
      const locationResults = await this.vectorEngine.semanticSearch(
        subQueries.location,
        'industrial',
        3
      );
      if (locationResults.length > 0) {
        crossResults.location = locationResults[0];
      }
    }

    // البحث في القرار 104 (إذا كان النشاط موجود)
    if (crossResults.activity) {
      const activityText = crossResults.activity.original_data.text_preview || '';
      const decision104Results = await this.vectorEngine.semanticSearch(
        activityText,
        'decision104',
        5
      );
      if (decision104Results.length > 0) {
        crossResults.decision104 = decision104Results;
      }
    }

    // التحقق من التطابق
    crossResults.match = !!(crossResults.activity && crossResults.location);

    return {
      success: true,
      type: 'cross_reference',
      message: this._formatCrossReferenceAnswer(crossResults),
      data: crossResults,
      sources: this._extractCrossReferenceSources(crossResults)
    };
  }

  /**
   * ✅ معالجة السؤال البسيط
   */
  async _handleSimpleQuery(query, classification) {
    console.log('✅ معالجة سؤال بسيط...');

    const results = await this.vectorEngine.parallelSearch(query, {
      topK: 5,
      databases: classification.suggestedDatabases
    });

    // اختيار أفضل نتيجة
    const allResults = [
      ...(results.activity || []),
      ...(results.decision104 || []),
      ...(results.industrial || [])
    ];

    allResults.sort((a, b) => b.similarity - a.similarity);

    const bestResult = allResults[0];

    if (!bestResult || bestResult.similarity < 0.3) {
      return {
        success: false,
        message: 'عذراً، لم أجد معلومات كافية للإجابة على سؤالك. هل يمكنك إعادة صياغته؟',
        suggestion: this._generateSuggestions(query)
      };
    }

    return {
      success: true,
      type: 'simple',
      message: this._formatSimpleAnswer(bestResult, classification),
      data: bestResult,
      confidence: bestResult.similarity,
      sources: [{ 
        database: bestResult.database, 
        id: bestResult.id,
        similarity: bestResult.similarity 
      }]
    };
  }

  /**
   * 📝 تنسيق الإجابة البسيطة
   */
  _formatSimpleAnswer(result, classification) {
    const data = result.original_data;
    let answer = '';

    // حسب نوع القاعدة
    if (result.database === 'activity') {
      answer = this._formatActivityAnswer(data, classification);
    } else if (result.database === 'industrial') {
      answer = this._formatIndustrialAnswer(data, classification);
    } else if (result.database === 'decision104') {
      answer = this._formatDecision104Answer(data, classification);
    }

    return answer;
  }

  /**
   * 🏭 تنسيق إجابة النشاط
   */
  _formatActivityAnswer(data, classification) {
    const preview = data.text_preview || '';
    
    let answer = `بالتأكيد! `;

    // استخراج معلومات النشاط
    const activityMatch = preview.match(/نشاط\s+([^\n]+)/);
    if (activityMatch) {
      answer += `النشاط هو: **${activityMatch[1].trim()}**\n\n`;
    }

    // إذا كان السؤال قانوني
    if (classification.primaryIntent === 'legal') {
      answer += `📋 **التراخيص المطلوبة:**\n`;
      const licenses = preview.match(/رخصة|ترخيص|تصريح|سجل/gi);
      if (licenses) {
        answer += `- يتطلب هذا النشاط استخراج تراخيص من الجهات المختصة.\n\n`;
      }

      // الجهة المختصة
      const authority = preview.match(/هيئة|وزارة|مصلحة/gi);
      if (authority) {
        answer += `🏛️ **الجهة المختصة:** ${authority[0]}\n\n`;
      }
    }

    // إذا كان السؤال فني
    if (classification.primaryIntent === 'technical') {
      answer += `🔧 **الاشتراطات الفنية:**\n`;
      answer += `- يخضع هذا النشاط لاشتراطات فنية محددة للسلامة والجودة.\n`;
      answer += `- يجب مراجعة دليل الخدمات للتفاصيل الكاملة.\n\n`;
    }

    answer += `\n💡 هل تريد المزيد من التفاصيل عن جانب معين؟`;

    return answer;
  }

  /**
   * 🏗️ تنسيق إجابة المنطقة الصناعية
   */
  _formatIndustrialAnswer(data, classification) {
    let answer = `بالتأكيد! `;

    if (data.name) {
      answer += `المنطقة هي: **${data.name}**\n\n`;
    }

    answer += `📍 **المعلومات الجغرافية:**\n`;
    
    if (data.governorate) {
      answer += `- المحافظة: ${data.governorate}\n`;
    }

    if (data.dependency) {
      answer += `- التبعية الإدارية: ${data.dependency}\n`;
    }

    if (data.area) {
      answer += `- المساحة: ${data.area} فدان\n`;
    }

    if (data.decision) {
      answer += `\n📜 **السند القانوني:**\n`;
      answer += `- ${data.decision}\n`;
    }

    // إضافة رابط الخريطة إذا توفرت الإحداثيات
    if (data.x && data.y) {
      const mapLink = `https://www.google.com/maps?q=${data.y},${data.x}`;
      answer += `\n🗺️ **[عرض على الخريطة](${mapLink})**\n`;
    }

    answer += `\n💡 هل تريد معرفة المزيد عن الأنشطة المسموحة في هذه المنطقة؟`;

    return answer;
  }

  /**
   * 🎁 تنسيق إجابة القرار 104
   */
  _formatDecision104Answer(data, classification) {
    const preview = data.text_preview || '';
    
    let answer = `بالتأكيد! `;

    // استخراج القطاع
    const sector = preview.includes('sectorA') ? 'القطاع (أ)' : 'القطاع (ب)';
    answer += `هذا النشاط مدرج في **${sector}** من القرار 104.\n\n`;

    answer += `🎁 **الحوافز المتاحة:**\n`;
    
    if (sector === 'القطاع (أ)') {
      answer += `- إعفاء من ضريبة الدمغة\n`;
      answer += `- إعفاء من رسوم التوثيق\n`;
      answer += `- خصم 50% من تكلفة توصيل المرافق\n`;
      answer += `- خصم 50% من سعر الأرض\n`;
    } else {
      answer += `- إعفاء من ضريبة الدمغة\n`;
      answer += `- إعفاء من رسوم التوثيق\n`;
      answer += `- خصم 30% من تكلفة توصيل المرافق\n`;
      answer += `- خصم 30% من سعر الأرض\n`;
    }

    // استخراج وصف النشاط
    const parts = preview.split('|');
    if (parts.length > 2) {
      answer += `\n📋 **وصف النشاط:**\n`;
      answer += `${parts[2].trim()}\n`;
    }

    answer += `\n💡 هل تريد معرفة شروط الحصول على هذه الحوافز؟`;

    return answer;
  }

  /**
   * 📊 تنسيق الإجابة الإحصائية
   */
  _formatStatisticalAnswer(analysis, query) {
    let answer = `بناءً على البيانات المتاحة:\n\n`;

    answer += `📊 **الإحصائيات العامة:**\n`;
    answer += `- إجمالي النتائج: **${analysis.total}**\n\n`;

    // حسب المحافظة
    if (Object.keys(analysis.byGovernorate).length > 0) {
      answer += `🗺️ **التوزيع حسب المحافظة:**\n`;
      const sorted = Object.entries(analysis.byGovernorate)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
      
      sorted.forEach(([gov, count]) => {
        answer += `- ${gov}: ${count} منطقة\n`;
      });
      answer += `\n`;
    }

    // حسب التبعية
    if (Object.keys(analysis.byAuthority).length > 0) {
      answer += `🏛️ **التوزيع حسب جهة الولاية:**\n`;
      Object.entries(analysis.byAuthority).forEach(([auth, count]) => {
        answer += `- ${auth}: ${count} منطقة\n`;
      });
      answer += `\n`;
    }

    // حسب النوع (للقرار 104)
    if (Object.keys(analysis.byType).length > 0) {
      answer += `📋 **التوزيع حسب القطاع:**\n`;
      Object.entries(analysis.byType).forEach(([type, count]) => {
        answer += `- ${type}: ${count} نشاط\n`;
      });
      answer += `\n`;
    }

    answer += `💡 هل تريد تفاصيل أكثر عن منطقة أو محافظة معينة؟`;

    return answer;
  }

  /**
   * 🆚 تنسيق إجابة المقارنة
   */
  _formatComparativeAnswer(comparisons) {
    if (comparisons.length < 2) {
      return 'عذراً، لم أستطع العثور على معلومات كافية للمقارنة.';
    }

    let answer = `بالتأكيد! إليك المقارنة:\n\n`;

    comparisons.forEach((comp, index) => {
      answer += `**${index + 1}. ${comp.entity}:**\n`;
      
      if (comp.type === 'location') {
        const data = comp.data;
        answer += `- المحافظة: ${data.governorate || 'غير متوفر'}\n`;
        answer += `- التبعية: ${data.dependency || 'غير متوفر'}\n`;
        answer += `- المساحة: ${data.area ? data.area + ' فدان' : 'غير متوفر'}\n`;
      }
      
      answer += `\n`;
    });

    // استخراج الفروقات
    if (comparisons[0].type === 'location') {
      const diff = this._compareLocations(comparisons[0].data, comparisons[1].data);
      answer += `📌 **الفروقات الرئيسية:**\n${diff}\n`;
    }

    return answer;
  }

  /**
   * 🔍 مقارنة موقعين
   */
  _compareLocations(loc1, loc2) {
    let diff = '';

    if (loc1.dependency !== loc2.dependency) {
      diff += `- التبعية مختلفة: ${loc1.dependency} مقابل ${loc2.dependency}\n`;
    }

    if (loc1.governorate !== loc2.governorate) {
      diff += `- المحافظة مختلفة: ${loc1.governorate} مقابل ${loc2.governorate}\n`;
    }

    if (loc1.area && loc2.area) {
      const areaDiff = Math.abs(loc1.area - loc2.area);
      diff += `- فرق المساحة: ${areaDiff.toFixed(2)} فدان\n`;
    }

    return diff || '- لا توجد فروقات جوهرية';
  }

  /**
   * 🔗 تنسيق إجابة الربط المتقاطع
   */
  _formatCrossReferenceAnswer(crossResults) {
    let answer = `بناءً على البحث المتقاطع:\n\n`;

    // معلومات النشاط
    if (crossResults.activity) {
      const actData = crossResults.activity.original_data;
      answer += `🏭 **النشاط:**\n`;
      answer += `${actData.text_preview?.substring(0, 200) || 'غير متوفر'}...\n\n`;
    }

    // معلومات الموقع
    if (crossResults.location) {
      const locData = crossResults.location.original_data;
      answer += `📍 **الموقع:**\n`;
      answer += `- المنطقة: ${locData.name || 'غير متوفر'}\n`;
      answer += `- المحافظة: ${locData.governorate || 'غير متوفر'}\n`;
      answer += `- التبعية: ${locData.dependency || 'غير متوفر'}\n\n`;
    }

    // معلومات الحوافز
    if (crossResults.decision104 && crossResults.decision104.length > 0) {
      answer += `🎁 **الحوافز (القرار 104):**\n`;
      answer += `- تم العثور على ${crossResults.decision104.length} حافز مرتبط\n`;
      
      const topIncentive = crossResults.decision104[0];
      const preview = topIncentive.original_data.text_preview || '';
      const sector = preview.includes('sectorA') ? 'القطاع (أ)' : 'القطاع (ب)';
      answer += `- القطاع المناسب: ${sector}\n\n`;
    }

    // التوافق
    if (crossResults.match) {
      answer += `✅ **التحليل:** النشاط متوافق مع المنطقة المحددة.\n`;
    } else {
      answer += `⚠️ **ملاحظة:** قد يكون هناك نقص في المعلومات لتأكيد التوافق الكامل.\n`;
    }

    answer += `\n💡 هل تريد تفاصيل أكثر عن جانب معين؟`;

    return answer;
  }

  /**
   * 📚 توليد اقتراحات عند فشل البحث
   */
  _generateSuggestions(query) {
    const suggestions = [
      'حاول استخدام كلمات أكثر وضوحاً',
      'اذكر اسم المحافظة أو المنطقة إن كنت تسأل عن موقع',
      'حدد نوع النشاط بوضوح (صناعي، تجاري، سياحي)',
      'يمكنك السؤال عن القرار 104 والحوافز بشكل مباشر'
    ];

    return suggestions.join('\n- ');
  }

  /**
   * 💭 تحديث الذاكرة السياقية
   */
  async _updateContextMemory(query, response, classification) {
    this.contextMemory.lastQuery = query;
    this.contextMemory.lastIntent = classification.primaryIntent;
    this.contextMemory.lastResults = response.data;

    // استخراج آخر كيان مذكور
    if (classification.entities) {
      if (classification.entities.locations.length > 0) {
        this.contextMemory.lastEntity = classification.entities.locations[0];
      } else if (classification.entities.activities.length > 0) {
        this.contextMemory.lastEntity = classification.entities.activities[0];
      }
    }

    // حفظ في قاعدة البيانات
    await this.dbManager.saveContext(this.contextMemory);
  }

  /**
   * 📝 إضافة إلى سجل المحادثة
   */
  _addToConversationHistory(entry) {
    this.contextMemory.conversationHistory.push(entry);

    // الاحتفاظ بآخر N رسالة فقط
    if (this.contextMemory.conversationHistory.length > this.contextMemory.maxHistoryLength) {
      this.contextMemory.conversationHistory.shift();
    }
  }

  /**
   * 🧠 تعلم من تصحيح المستخدم
   */
  async learnCorrection(query, correctAnswer, metadata = {}) {
    await this.learningSystem.learn(query, correctAnswer, metadata);
    this.stats.learnedCorrections++;
    console.log('🧠 تم حفظ التصحيح في الذاكرة');
  }

  /**
   * 🔄 مسح الذاكرة السياقية
   */
  async clearContext() {
    this.contextMemory = {
      lastQuery: null,
      lastEntity: null,
      lastIntent: null,
      lastResults: null,
      conversationHistory: [],
      maxHistoryLength: 10
    };
    await this.dbManager.clearContext();
    console.log('🔄 تم مسح الذاكرة السياقية');
  }

  /**
   * 📤 تصدير العقل الكامل
   */
  async exportBrain() {
    console.log('📤 بدء تصدير العقل...');
    const brain = await this.dbManager.exportBrain();
    
    // إضافة الإحصائيات الحالية
    brain.stats = this.stats;
    brain.contextMemory = this.contextMemory;

    // تحويل إلى JSON
    const jsonString = JSON.stringify(brain, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // تحميل الملف
    const a = document.createElement('a');
    a.href = url;
    a.download = `GAFI_AI_Brain_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('✅ تم تصدير العقل بنجاح');
  }

  /**
   * 📥 استيراد العقل
   */
  async importBrain(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const brainData = JSON.parse(e.target.result);
          await this.dbManager.importBrain(brainData);
          
          // تحديث الإحصائيات
          if (brainData.stats) {
            this.stats = brainData.stats;
          }
          
          // تحديث الذاكرة
          if (brainData.contextMemory) {
            this.contextMemory = brainData.contextMemory;
          }

          console.log('✅ تم استيراد العقل بنجاح');
          resolve(true);
        } catch (error) {
          console.error('❌ فشل استيراد العقل:', error);
          reject(error);
        }
      };

      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  /**
   * 🔍 فحص البيانات المحفوظة
   */
  async _checkSavedData() {
    const stats = await this.dbManager.getStatistics();
    
    const exists = 
      stats.vectorDatabases.activity > 0 ||
      stats.vectorDatabases.decision104 > 0 ||
      stats.vectorDatabases.industrial > 0;

    return { exists, stats };
  }

  /**
   * 📥 تحميل البيانات المحفوظة
   */
  async _loadSavedData() {
    console.log('📥 تحميل البيانات من IndexedDB...');

    this.vectorDatabases.activity = await this.dbManager.loadVectorDatabase('activity');
    this.vectorDatabases.decision104 = await this.dbManager.loadVectorDatabase('decision104');
    this.vectorDatabases.industrial = await this.dbManager.loadVectorDatabase('industrial');

    const metaIndex = await this.dbManager.loadMetaIndex();
    if (metaIndex) {
      this.metaIndex = metaIndex;
    }

    console.log('✅ تم تحميل البيانات المحفوظة');
  }

  /**
   * 📂 تحميل من الملفات الأصلية
   */
  async _loadFromSourceFiles() {
    console.log('📂 تحميل من الملفات الأصلية...');

    try {
      // تحميل المتجهات
      const activityVectors = await import('../data/activity_vectors.js');
      const decision104Vectors = await import('../data/decision104_vectors.js');
      const industrialVectors = await import('../data/industrial_vectors.js');

      this.vectorDatabases.activity = activityVectors.default;
      this.vectorDatabases.decision104 = decision104Vectors.default;
      this.vectorDatabases.industrial = industrialVectors.default;

      console.log('✅ تم تحميل الملفات الأصلية');
    } catch (error) {
      console.error('❌ فشل تحميل الملفات:', error);
      throw error;
    }
  }

  /**
   * 🗂️ بناء الفهرس
   */
  async _buildMetaIndex() {
    console.log('🗂️ بناء الفهرس...');

    const governorates = new Set();
    const locations = new Set();
    const activities = new Set();
    const authorities = new Set();

    // استخراج من المناطق الصناعية
    if (this.vectorDatabases.industrial?.data) {
      this.vectorDatabases.industrial.data.forEach(record => {
        const data = record.original_data;
        if (data.governorate) governorates.add(data.governorate);
        if (data.name) locations.add(data.name);
        if (data.dependency) authorities.add(data.dependency);
      });
    }

    // استخراج من الأنشطة
    if (this.vectorDatabases.activity?.data) {
      this.vectorDatabases.activity.data.forEach(record => {
        const preview = record.original_data.text_preview || '';
        // استخراج كلمات مفتاحية
        const words = this.normalizer.extractKeywords(preview);
        words.forEach(word => activities.add(word));
      });
    }

    this.metaIndex = {
      governorates: Array.from(governorates),
      locations: Array.from(locations),
      activities: Array.from(activities).slice(0, 500), // الحد من الحجم
      authorities: Array.from(authorities)
    };

    console.log('✅ تم بناء الفهرس:', {
      governorates: this.metaIndex.governorates.length,
      locations: this.metaIndex.locations.length,
      activities: this.metaIndex.activities.length,
      authorities: this.metaIndex.authorities.length
    });
  }

  /**
   * 💾 حفظ جميع البيانات
   */
  async _saveAllData() {
    console.log('💾 حفظ البيانات في IndexedDB...');

    await this.dbManager.saveVectorDatabase('activity', this.vectorDatabases.activity);
    await this.dbManager.saveVectorDatabase('decision104', this.vectorDatabases.decision104);
    await this.dbManager.saveVectorDatabase('industrial', this.vectorDatabases.industrial);
    await this.dbManager.saveMetaIndex(this.metaIndex);

    console.log('✅ تم حفظ جميع البيانات');
  }

  /**
   * 📊 الحصول على إحصائيات النظام
   */
  async _getSystemStats() {
    const dbStats = await this.dbManager.getStatistics();
    
    return {
      databases: dbStats.vectorDatabases,
      metaIndex: this.metaIndex.governorates.length + this.metaIndex.locations.length,
      learned: dbStats.learnedCount,
      queries: this.stats.totalQueries,
      success: this.stats.successfulQueries,
      failed: this.stats.failedQueries
    };
  }

  /**
   * استخراج المصادر من النتائج
   */
  _extractSources(results) {
    const sources = [];
    
    ['activity', 'decision104', 'industrial'].forEach(db => {
      if (results[db] && results[db].length > 0) {
        sources.push({
          database: db,
          count: results[db].length,
          topSimilarity: results[db][0].similarity
        });
      }
    });

    return sources;
  }

  /**
   * استخراج مصادر الربط المتقاطع
   */
  _extractCrossReferenceSources(crossResults) {
    const sources = [];

    if (crossResults.activity) {
      sources.push({ type: 'activity', id: crossResults.activity.id });
    }
    if (crossResults.location) {
      sources.push({ type: 'location', id: crossResults.location.id });
    }
    if (crossResults.decision104) {
      sources.push({ 
        type: 'decision104', 
        count: crossResults.decision104.length 
      });
    }

    return sources;
  }

  /**
   * تحديث متوسط زمن الاستجابة
   */
  _updateAverageResponseTime(newTime) {
    const n = this.stats.totalQueries;
    this.stats.averageResponseTime = 
      ((this.stats.averageResponseTime * (n - 1)) + newTime) / n;
  }

  /**
   * تنسيق الإجابة المتعلمة
   */
  _formatLearnedResponse(learnedData) {
    return {
      success: true,
      type: 'learned',
      message: learnedData.answer,
      source: 'learned_knowledge',
      learnedAt: learnedData.learnedAt,
      usageCount: learnedData.usageCount
    };
  }

  /**
   * 📊 الحصول على الإحصائيات العامة
   */
  getStatistics() {
    return {
      ...this.stats,
      contextMemory: {
        conversationLength: this.contextMemory.conversationHistory.length,
        lastEntity: this.contextMemory.lastEntity,
        lastIntent: this.contextMemory.lastIntent
      },
      databases: {
        activity: this.vectorDatabases.activity?.data?.length || 0,
        decision104: this.vectorDatabases.decision104?.data?.length || 0,
        industrial: this.vectorDatabases.industrial?.data?.length || 0
      }
    };
  }
}

// تصدير الكلاس
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AIExpertCore;
}