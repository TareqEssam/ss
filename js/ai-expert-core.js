/**
 * 🧠 النواة الرئيسية للمساعد الذكي - منطق قبول محسّن
 * AI Expert Core Engine - Better Result Acceptance
 * 
 * @version 2.3.0 - FIXED RESULT ACCEPTANCE
 */

class AIExpertCore {
  constructor() {
    this.normalizer = null;
    this.vectorEngine = null;
    this.intentClassifier = null;
    this.dbManager = null;
    this.learningSystem = null;
    this.queryParser = null;

    this.initialized = false;
    this.isProcessing = false;
    
    this.onStatusChange = null;
    
    this.contextMemory = {
      lastQuery: null,
      lastEntity: null,
      lastIntent: null,
      lastResults: null,
      conversationHistory: [],
      maxHistoryLength: 10
    };

    this.stats = {
      totalQueries: 0,
      successfulQueries: 0,
      failedQueries: 0,
      averageResponseTime: 0,
      learnedCorrections: 0
    };

    this.vectorDatabases = {
      activity: null,
      decision104: null,
      industrial: null
    };

    this.textDatabases = {
      activities: null,
      decision104: null,
      industrial: null
    };

    this.metaIndex = {
      governorates: new Set(),
      locations: new Set(),
      activities: new Set(),
      authorities: new Set(),
      keywords: new Map()
    };

    // 🔥 عتبات قبول النتائج - أكثر تساهلاً
    this.acceptanceThresholds = {
      excellent: 0.65,  // نتائج ممتازة - قبول فوري
      good: 0.50,       // نتائج جيدة - قبول
      fair: 0.35,       // نتائج مقبولة - قبول مع تحذير
      minimal: 0.25     // الحد الأدنى - قبول للإحصائيات فقط
    };
  }

  _updateStatus(status, details = {}) {
    if (this.onStatusChange && typeof this.onStatusChange === 'function') {
      this.onStatusChange({ status, ...details });
    }
    
    console.log(`📍 ${status}`, details);
  }

  async initialize() {
    if (this.initialized) {
      console.log('✅ النظام مهيأ بالفعل');
      return true;
    }

    console.log('🚀 بدء تهيئة المساعد الذكي...');
    const startTime = performance.now();

    try {
      this._updateStatus('تهيئة المكونات الأساسية...');
      console.log('📦 تهيئة المكونات الأساسية...');
      this.normalizer = new ArabicNormalizer();
      this.dbManager = new IndexedDBManager();
      await this.dbManager.init();

      this._updateStatus('تحميل قواعد البيانات...');
      console.log('🔍 تحميل قواعد البيانات...');
      await this._loadAllDatabases();

      if (!this._validateDatabases()) {
        throw new Error('❌ فشل التحقق من قواعد البيانات!');
      }

      this._updateStatus('بناء الفهرس...');
      console.log('🗂️ بناء الفهرس...');
      await this._buildMetaIndex();

      this._updateStatus('تهيئة محرك المتجهات...');
      console.log('⚡ تهيئة محرك المتجهات...');
      this.vectorEngine = new VectorEngineV7(this.normalizer);
      await this.vectorEngine.initialize();
      await this.vectorEngine.loadDatabases(this.vectorDatabases);

      this._updateStatus('تهيئة مصنف النوايا...');
      console.log('🎯 تهيئة مصنف النوايا...');
      this.intentClassifier = new IntentClassifier(this.normalizer, this.vectorEngine);
      this.intentClassifier.loadKnownEntities(this.metaIndex);

      this._updateStatus('تهيئة نظام التعلم...');
      console.log('🧠 تهيئة نظام التعلم...');
      this.learningSystem = new LearningSystem(this.dbManager, this.normalizer);
      await this.learningSystem.initialize();

      this._updateStatus('تهيئة محلل الاستعلامات...');
      console.log('🔍 تهيئة محلل الاستعلامات...');
      this.queryParser = new QueryParser(this.normalizer, this.intentClassifier);

      const savedContext = await this.dbManager.loadContext();
      if (savedContext) {
        this.contextMemory = { ...this.contextMemory, ...savedContext };
      }

      this.initialized = true;
      const totalTime = ((performance.now() - startTime) / 1000).toFixed(2);
      
      this._updateStatus('ready', { initTime: totalTime });
      
      console.log('');
      console.log('✅ ════════════════════════════════════════');
      console.log('✅ اكتمل التهيئة بنجاح!');
      console.log('✅ ════════════════════════════════════════');
      console.log(`⏱️ الزمن الكلي: ${totalTime} ثانية`);
      console.log('');

      return true;

    } catch (error) {
      console.error('❌ فشل التهيئة:', error);
      this._updateStatus('error', { error: error.message });
      this.initialized = false;
      return false;
    }
  }

  async _loadAllDatabases() {
    console.log('📥 تحميل قواعد البيانات من الملفات...');

    try {
      // التحقق من المتغيرات العالمية (التي تم توليدها بواسطة السكريبت الجديد)
      if (window.activityVectorsData && window.decisionVectorsData && window.industrialVectorsData) {
        console.log('   ✅ تم العثور على البيانات في window (الإصدار 3.1)');
        this.vectorDatabases.activity = window.activityVectorsData;
        this.vectorDatabases.decision104 = window.decisionVectorsData;
        this.vectorDatabases.industrial = window.industrialVectorsData;
      } 
      // دعم خلفي إذا كانت بأسماء قديمة
      else if (window.activityVectors && window.decision104Vectors && window.industrialVectors) {
        this.vectorDatabases.activity = window.activityVectors;
        this.vectorDatabases.decision104 = window.decision104Vectors;
        this.vectorDatabases.industrial = window.industrialVectors;
      }

      // ربط قواعد البيانات النصية
      if (typeof masterActivityDB !== 'undefined') {
        this.textDatabases.activities = masterActivityDB;
        this.textDatabases.decision104 = decision104DB;
        this.textDatabases.industrial = industrialDB;
      }

      return true;
    } catch (error) {
      console.error('❌ فشل تحميل قواعد البيانات:', error);
      throw error;
    }
  }

  _validateDatabases() {
    console.log('🔍 التحقق من قواعد البيانات (إصدار 3.1)...');

    let isValid = true;
  ['activity', 'decision104', 'industrial'].forEach(dbName => {
    const db = this.vectorDatabases[dbName];
    // التحقق من وجود المفتاح vectors (الإصدار 3.1)
    const records = db?.vectors || db?.data; 

    if (!db || !records || !Array.isArray(records)) {
      console.error(`❌ قاعدة ${dbName} غير صالحة!`);
      isValid = false;
    }
  });
  return isValid;
}

      // التحقق من صحة السجلات (البحث في الهيكل الجديد والقديم)
      let validRecords = 0;
      vectorList.forEach(record => {
        // التحقق من الهيكل الجديد الذي يضع المتجه في مفتاح 'vector' مباشرة
        if (record.vector || record.embeddings?.multilingual_minilm?.embeddings) {
          validRecords++;
        }
      });

      const percentage = ((validRecords / vectorList.length) * 100).toFixed(1);
      console.log(`   ✓ ${dbName}: ${validRecords}/${vectorList.length} سجل صالح (${percentage}%)`);

      if (validRecords === 0) {
        console.error(`❌ قاعدة ${dbName} لا تحتوي على متجهات صالحة!`);
        isValid = false;
      }
    });

    return isValid;
  }

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
      this._updateStatus('processing', { step: 'تحليل السؤال...' });

      const normalized = options.isVoice 
        ? this.normalizer.normalizeForVoice(userQuery)
        : this.normalizer.normalize(userQuery);

      console.log('📝 النص بعد المعالجة:', normalized);

      this._updateStatus('processing', { step: 'فهم السياق...' });
      const resolvedQuery = this.intentClassifier.resolvePronouns(
        normalized, 
        this.contextMemory
      );

      console.log('🔄 النص بعد حل الضمائر:', resolvedQuery);

      this._updateStatus('processing', { step: 'البحث في الذاكرة...' });
      const learnedAnswer = await this.learningSystem.searchLearned(resolvedQuery);
      if (learnedAnswer) {
        console.log('🧠 تم العثور على إجابة متعلمة');
        this._updateStatus('complete');
        return this._formatLearnedResponse(learnedAnswer);
      }

      this._updateStatus('processing', { step: 'تصنيف نوع السؤال...' });
      const intentClassification = await this.intentClassifier.classifyIntent(resolvedQuery);
      console.log('🎯 تصنيف النية:', {
        primary: intentClassification.primaryIntent,
        confidence: intentClassification.confidence.toFixed(2),
        type: intentClassification.queryType,
        databases: intentClassification.suggestedDatabases
      });

      const subQueries = this.intentClassifier.buildSubQueries(
        resolvedQuery,
        intentClassification
      );

      this._updateStatus('processing', { step: 'البحث في قواعد البيانات...' });
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

      this._updateStatus('processing', { step: 'حفظ النتائج...' });
      await this._updateContextMemory(userQuery, response, intentClassification);

      this._addToConversationHistory({
        query: userQuery,
        normalized: normalized,
        response: response,
        timestamp: new Date().toISOString()
      });

      const responseTime = performance.now() - startTime;
      this.stats.successfulQueries++;
      this._updateAverageResponseTime(responseTime);

      console.log(`✅ تمت المعالجة في ${responseTime.toFixed(2)}ms`);
      this._updateStatus('complete', { responseTime });

      this.isProcessing = false;
      return response;

    } catch (error) {
      console.error('❌ خطأ في المعالجة:', error);
      this.stats.failedQueries++;
      this.isProcessing = false;
      this._updateStatus('error', { error: error.message });

      return {
        success: false,
        message: 'عذراً، حدث خطأ أثناء معالجة سؤالك. حاول إعادة صياغته.',
        error: error.message
      };
    }
  }

  /**
   * ✅ معالجة سؤال بسيط - محسّن مع منطق قبول أفضل
   */
  async _handleSimpleQuery(query, classification) {
    console.log('✅ معالجة سؤال بسيط...');

    const results = await this.vectorEngine.parallelSearch(query, {
      topK: 10, // ✅ زيادة عدد النتائج
      databases: classification.suggestedDatabases,
      queryType: classification.queryType
    });

    const totalResults = results.totalResults || 0;

    // دمج النتائج من جميع القواعد
    const allResults = [];
    classification.suggestedDatabases.forEach(db => {
      if (results[db] && results[db].length > 0) {
        allResults.push(...results[db]);
      }
    });

    // ترتيب حسب التشابه
    allResults.sort((a, b) => b.similarity - a.similarity);

    console.log(`📊 إجمالي النتائج: ${allResults.length}`);
    
    if (allResults.length > 0) {
      console.log(`   🎯 أعلى تشابه: ${(allResults[0].similarity * 100).toFixed(1)}%`);
      console.log(`   📈 نطاق التشابه: ${(allResults[allResults.length-1].similarity * 100).toFixed(1)}% - ${(allResults[0].similarity * 100).toFixed(1)}%`);
    }

    // 🔥 منطق قبول محسّن
    if (allResults.length === 0) {
      return {
        success: false,
        type: 'no_results',
        message: `لم أجد أي نتائج للبحث عن "${query}". حاول إعادة صياغة السؤال بكلمات مختلفة.`,
        query,
        searchedIn: classification.suggestedDatabases
      };
    }

    const topSimilarity = allResults[0].similarity;

    // ✅ قبول النتائج بناءً على جودة التشابه
    let acceptedResults = [];
    let qualityLevel = '';

    if (topSimilarity >= this.acceptanceThresholds.excellent) {
      // نتائج ممتازة - نأخذ أفضل 5
      acceptedResults = allResults.filter(r => r.similarity >= this.acceptanceThresholds.good).slice(0, 5);
      qualityLevel = 'excellent';
      console.log('✅ نتائج ممتازة');
    } else if (topSimilarity >= this.acceptanceThresholds.good) {
      // نتائج جيدة - نأخذ أفضل 5
      acceptedResults = allResults.filter(r => r.similarity >= this.acceptanceThresholds.fair).slice(0, 5);
      qualityLevel = 'good';
      console.log('✅ نتائج جيدة');
    } else if (topSimilarity >= this.acceptanceThresholds.fair) {
      // نتائج مقبولة - نأخذ أفضل 5
      acceptedResults = allResults.filter(r => r.similarity >= this.acceptanceThresholds.minimal).slice(0, 5);
      qualityLevel = 'fair';
      console.log('✅ نتائج مقبولة');
    } else if (topSimilarity >= this.acceptanceThresholds.minimal) {
      // نتائج ضعيفة - نأخذ أفضل 3 فقط
      acceptedResults = allResults.slice(0, 3);
      qualityLevel = 'weak';
      console.log('⚠️ نتائج ضعيفة');
    }

    console.log(`📌 تم قبول ${acceptedResults.length} نتيجة`);

    // ✅ إذا لم يكن هناك نتائج مقبولة
    if (acceptedResults.length === 0) {
      return {
        success: false,
        type: 'low_quality',
        message: `وجدت ${allResults.length} نتيجة، لكن جودة التشابه منخفضة (${(topSimilarity * 100).toFixed(1)}%). حاول إعادة صياغة السؤال.`,
        query,
        searchedIn: classification.suggestedDatabases,
        topSimilarity
      };
    }

    // ✅ إرجاع النتائج المقبولة
    return {
      success: true,
      type: 'simple',
      results: acceptedResults,
      totalFound: allResults.length,
      acceptedCount: acceptedResults.length,
      query,
      searchedIn: classification.suggestedDatabases,
      topSimilarity,
      qualityLevel,
      // ✅ رسالة توضيحية للنتائج الضعيفة
      note: qualityLevel === 'weak' 
        ? 'تم العثور على نتائج ذات تشابه منخفض. قد لا تكون دقيقة تماماً.'
        : null
    };
  }

  async _handleStatisticalQuery(query, classification) {
    console.log('📊 معالجة سؤال إحصائي...');

    const results = await this.vectorEngine.parallelSearch(query, {
      topK: 200,
      databases: classification.suggestedDatabases,
      queryType: 'statistical',
      minSimilarity: 0.20
    });

    const analysis = this._analyzeStatisticalResults(results, query, classification);

    if (analysis.total === 0) {
      return {
        success: false,
        type: 'statistical',
        message: `لم أجد بيانات كافية للإحصاء حول "${query}".`,
        query
      };
    }

    return {
      success: true,
      type: 'statistical',
      analysis,
      totalFound: analysis.total,
      query
    };
  }

  _handleComparativeQuery(query, classification) {
    console.log('🔄 معالجة سؤال مقارن...');
    return this._handleSimpleQuery(query, classification);
  }

  _handleCrossReferenceQuery(subQueries, classification) {
    console.log('🔗 معالجة سؤال متقاطع...');
    return this._handleSimpleQuery(subQueries[0]?.query || '', classification);
  }

  _analyzeStatisticalResults(results, query, classification) {
    const allResults = [];
    
    classification.suggestedDatabases.forEach(db => {
      if (results[db] && results[db].length > 0) {
        allResults.push(...results[db]);
      }
    });

    return {
      total: allResults.length,
      byDatabase: {
        activity: results.activity?.length || 0,
        decision104: results.decision104?.length || 0,
        industrial: results.industrial?.length || 0
      },
      results: allResults
    };
  }

  async _buildMetaIndex() {
    console.log('🗂️ بناء الفهرس...');

    const governorates = new Set();
    const locations = new Set();
    const activities = new Set();
    const authorities = new Set();

    if (this.vectorDatabases.industrial?.data) {
      this.vectorDatabases.industrial.data.forEach(record => {
        const data = record.original_data;
        if (data.governorate) governorates.add(data.governorate);
        if (data.name) locations.add(data.name);
        if (data.dependency) authorities.add(data.dependency);
      });
    }

    if (this.vectorDatabases.activity?.data) {
      this.vectorDatabases.activity.data.forEach(record => {
        const preview = record.original_data?.text_preview || '';
        if (preview) {
          const words = this.normalizer.normalize(preview)
            .split(/\s+/)
            .filter(w => w.length > 3);
          words.slice(0, 5).forEach(word => activities.add(word));
        }
      });
    }

    this.metaIndex = {
      governorates: Array.from(governorates),
      locations: Array.from(locations),
      activities: Array.from(activities).slice(0, 500),
      authorities: Array.from(authorities)
    };
  }

  async _updateContextMemory(query, response, classification) {
    this.contextMemory.lastQuery = query;
    this.contextMemory.lastIntent = classification.primaryIntent;
    this.contextMemory.lastResults = response;

    if (response.success && response.results && response.results.length > 0) {
      const topResult = response.results[0];
      this.contextMemory.lastEntity = {
        type: topResult.database || topResult.type,
        id: topResult.id,
        data: topResult.original_data
      };
    }

    await this.dbManager.saveContext(this.contextMemory);
  }

  _addToConversationHistory(entry) {
    this.contextMemory.conversationHistory.push(entry);
    
    if (this.contextMemory.conversationHistory.length > this.contextMemory.maxHistoryLength) {
      this.contextMemory.conversationHistory.shift();
    }
  }

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

  _updateAverageResponseTime(newTime) {
    const n = this.stats.totalQueries;
    this.stats.averageResponseTime = 
      ((this.stats.averageResponseTime * (n - 1)) + newTime) / n;
  }

  getStatistics() {
    return {
      ...this.stats,
      acceptanceThresholds: this.acceptanceThresholds,
      contextMemory: {
        conversationLength: this.contextMemory.conversationHistory.length,
        lastEntity: this.contextMemory.lastEntity,
        lastIntent: this.contextMemory.lastIntent
      },
      databases: {
        activity: this.vectorDatabases.activity?.data?.length || 0,
        decision104: this.vectorDatabases.decision104?.data?.length || 0,
        industrial: this.vectorDatabases.industrial?.data?.length || 0
      },
      vectorEngine: this.vectorEngine?.getStatistics() || {}
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AIExpertCore;
}


