/**
 * 🧠 النواة الرئيسية للمساعد الذكي
 * AI Expert Core Engine
 * 
 * العقل المركزي الذي يربط جميع المكونات ويدير المنطق الذكي
 * 
 * @author AI Expert System
 * @version 2.1.0 - FIXED
 */

class AIExpertCore {
  constructor() {
    // المكونات الأساسية
    this.normalizer = null;
    this.vectorEngine = null; // ✅ تغيير الاسم من VectorEngineV7
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

    // ✅ قواعد البيانات المحملة - مع التأكيد على البنية الصحيحة
    this.vectorDatabases = {
      activity: null,
      decision104: null,
      industrial: null
    };

    // ✅ قواعد البيانات النصية (المشوشة)
    this.textDatabases = {
      activities: null,
      decision104: null,
      industrial: null
    };

    // الفهرس المحلي
    this.metaIndex = {
      governorates: new Set(),
      locations: new Set(),
      activities: new Set(),
      authorities: new Set(),
      keywords: new Map()
    };
  }

  /**
   * 🚀 التهيئة الكاملة للنظام - FIXED
   */
  async initialize() {
    if (this.initialized) {
      console.log('✅ النظام مهيأ بالفعل');
      return true;
    }

    console.log('🚀 بدء تهيئة المساعد الذكي...');
    const startTime = performance.now();

    try {
      // === 1. تهيئة المكونات الأساسية ===
      console.log('📦 تهيئة المكونات الأساسية...');
      this.normalizer = new ArabicNormalizer();
      this.dbManager = new IndexedDBManager();
      await this.dbManager.init();

      // === 2. تحميل قواعد البيانات ===
      console.log('🔍 تحميل قواعد البيانات...');
      await this._loadAllDatabases();

      // === 3. التحقق من وجود بيانات ===
      if (!this._validateDatabases()) {
        throw new Error('❌ فشل التحقق من قواعد البيانات!');
      }

      // === 4. بناء الفهرس ===
      console.log('🗂️ بناء الفهرس...');
      await this._buildMetaIndex();

      // === 5. تهيئة محرك المتجهات ===
      console.log('⚡ تهيئة محرك المتجهات...');
      this.vectorEngine = new VectorEngineV7(this.normalizer);
      await this.vectorEngine.initialize();
      
      // ✅ تحميل قواعد البيانات في المحرك
      await this.vectorEngine.loadDatabases(this.vectorDatabases);

      // === 6. تهيئة مصنف النوايا ===
      console.log('🎯 تهيئة مصنف النوايا...');
      this.intentClassifier = new IntentClassifier(this.normalizer, this.vectorEngine);
      this.intentClassifier.loadKnownEntities(this.metaIndex);

      // === 7. تهيئة نظام التعلم ===
      console.log('🧠 تهيئة نظام التعلم...');
      this.learningSystem = new LearningSystem(this.dbManager, this.normalizer);
      await this.learningSystem.initialize();

      // === 8. تهيئة محلل الاستعلامات ===
      console.log('🔍 تهيئة محلل الاستعلامات...');
      this.queryParser = new QueryParser(this.normalizer, this.intentClassifier);

      // === 9. تحميل الذاكرة السياقية ===
      const savedContext = await this.dbManager.loadContext();
      if (savedContext) {
        this.contextMemory = { ...this.contextMemory, ...savedContext };
      }

      this.initialized = true;
      const totalTime = ((performance.now() - startTime) / 1000).toFixed(2);
      
      console.log('');
      console.log('✅ ════════════════════════════════════════');
      console.log('✅ اكتمل التهيئة بنجاح!');
      console.log('✅ ════════════════════════════════════════');
      console.log(`⏱️ الزمن الكلي: ${totalTime} ثانية`);
      console.log('');
      console.log('📊 إحصائيات قواعد البيانات:');
      console.log('   📁 المتجهات (Vectors):');
      console.log(`      • الأنشطة: ${this.vectorDatabases.activity?.data?.length || 0} سجل`);
      console.log(`      • القرار 104: ${this.vectorDatabases.decision104?.data?.length || 0} سجل`);
      console.log(`      • المناطق الصناعية: ${this.vectorDatabases.industrial?.data?.length || 0} سجل`);
      console.log('');
      console.log('   📝 البيانات النصية (Text):');
      console.log(`      • الأنشطة: ${this.textDatabases.activities?.length || 0} سجل`);
      console.log(`      • القرار 104: ${typeof this.textDatabases.decision104 === 'object' ? '✓' : '✗'}`);
      console.log(`      • المناطق الصناعية: ${this.textDatabases.industrial?.length || 0} سجل`);
      console.log('');
      console.log(`   🗂️ الفهرس: ${Object.keys(this.metaIndex).length} عناصر`);
      console.log('');

      return true;

    } catch (error) {
      console.error('❌ فشل التهيئة:', error);
      console.error('تفاصيل الخطأ:', error.stack);
      this.initialized = false;
      return false;
    }
  }

  /**
   * ✅ تحميل جميع قواعد البيانات
   */
  async _loadAllDatabases() {
    console.log('📥 تحميل قواعد البيانات من الملفات...');

    try {
      // === 1. تحميل قواعد المتجهات ===
      console.log('   🔢 تحميل قواعد المتجهات...');
      
      // التحقق من وجود البيانات في window أولاً
      if (window.activityVectors && window.decision104Vectors && window.industrialVectors) {
        console.log('   ✅ البيانات موجودة في window');
        this.vectorDatabases.activity = window.activityVectors;
        this.vectorDatabases.decision104 = window.decision104Vectors;
        this.vectorDatabases.industrial = window.industrialVectors;
      } else {
        console.log('   📥 تحميل البيانات من الملفات...');
        const [activityVectors, decision104Vectors, industrialVectors] = await Promise.all([
          import('../data/activity_vectors.js'),
          import('../data/decision104_vectors.js'),
          import('../data/industrial_vectors.js')
        ]);

        this.vectorDatabases.activity = activityVectors.default;
        this.vectorDatabases.decision104 = decision104Vectors.default;
        this.vectorDatabases.industrial = industrialVectors.default;
      }

      console.log('   ✅ تم تحميل قواعد المتجهات:');
      console.log(`      - الأنشطة: ${this.vectorDatabases.activity?.data?.length || 0}`);
      console.log(`      - القرار 104: ${this.vectorDatabases.decision104?.data?.length || 0}`);
      console.log(`      - المناطق: ${this.vectorDatabases.industrial?.data?.length || 0}`);

      // === 2. تحميل قواعد البيانات النصية ===
      console.log('   📝 ربط قواعد البيانات النصية...');
      
      if (typeof window.textDatabases !== 'undefined') {
        this.textDatabases = window.textDatabases;
        console.log('   ✅ تم ربط قواعد البيانات النصية من window');
      } else if (typeof masterActivityDB !== 'undefined' && 
                 typeof decision104DB !== 'undefined' && 
                 typeof industrialDB !== 'undefined') {
        this.textDatabases = {
          activities: masterActivityDB,
          decision104: decision104DB,
          industrial: industrialDB
        };
        console.log('   ✅ تم ربط قواعد البيانات النصية من المتغيرات العامة');
      } else {
        console.warn('   ⚠️ لم يتم العثور على قواعد البيانات النصية');
      }

      console.log('   ✅ قواعد البيانات النصية:');
      console.log(`      - masterActivityDB: ${this.textDatabases.activities?.length || 0}`);
      console.log(`      - decision104DB: ${typeof this.textDatabases.decision104 === 'object' ? '✓' : '✗'}`);
      console.log(`      - industrialDB: ${this.textDatabases.industrial?.length || 0}`);

      return true;

    } catch (error) {
      console.error('❌ فشل تحميل قواعد البيانات:', error);
      throw error;
    }
  }

  /**
   * ✅ التحقق من صحة قواعد البيانات
   */
  _validateDatabases() {
    console.log('🔍 التحقق من قواعد البيانات...');

    let isValid = true;

    // التحقق من قواعد المتجهات
    ['activity', 'decision104', 'industrial'].forEach(dbName => {
      const db = this.vectorDatabases[dbName];
      
      if (!db) {
        console.error(`❌ قاعدة ${dbName} غير موجودة!`);
        isValid = false;
        return;
      }

      if (!db.data || !Array.isArray(db.data)) {
        console.error(`❌ قاعدة ${dbName} لا تحتوي على data!`);
        isValid = false;
        return;
      }

      if (db.data.length === 0) {
        console.warn(`⚠️ قاعدة ${dbName} فارغة!`);
      }

      // التحقق من وجود المتجهات
      let validRecords = 0;
      db.data.forEach(record => {
        if (record.embeddings?.multilingual_minilm?.embeddings) {
          validRecords++;
        }
      });

      const percentage = ((validRecords / db.data.length) * 100).toFixed(1);
      console.log(`   ✓ ${dbName}: ${validRecords}/${db.data.length} سجل صالح (${percentage}%)`);

      if (validRecords === 0) {
        console.error(`❌ قاعدة ${dbName} لا تحتوي على متجهات صالحة!`);
        isValid = false;
      }
    });

    if (isValid) {
      console.log('✅ جميع قواعد البيانات صالحة');
    }

    return isValid;
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
   * ✅ معالجة سؤال بسيط
   */
  async _handleSimpleQuery(query, classification) {
    console.log('✅ معالجة سؤال بسيط...');

    const results = await this.vectorEngine.parallelSearch(query, {
      topK: 5,
      databases: classification.suggestedDatabases,
      queryType: classification.queryType
    });

    const totalResults = results.totalResults || 0;

    if (totalResults === 0) {
      return {
        success: false,
        type: 'no_results',
        message: `لم أجد معلومات دقيقة كافية للإجابة على "${query}". لقد بحثت في: ${classification.suggestedDatabases.join(', ')}.`,
        query,
        searchedIn: classification.suggestedDatabases
      };
    }

    // دمج النتائج من جميع القواعد
    const allResults = [];
    classification.suggestedDatabases.forEach(db => {
      if (results[db] && results[db].length > 0) {
        allResults.push(...results[db]);
      }
    });

    // ترتيب حسب التشابه
    allResults.sort((a, b) => b.similarity - a.similarity);

    return {
      success: true,
      type: 'simple',
      results: allResults.slice(0, 5),
      totalFound: totalResults,
      query,
      searchedIn: classification.suggestedDatabases,
      topSimilarity: allResults[0]?.similarity || 0
    };
  }

  /**
   * 📊 معالجة سؤال إحصائي
   */
  async _handleStatisticalQuery(query, classification) {
    console.log('📊 معالجة سؤال إحصائي...');

    const results = await this.vectorEngine.parallelSearch(query, {
      topK: 200,
      databases: classification.suggestedDatabases,
      queryType: 'statistical',
      minSimilarity: 0.20
    });

    // تحليل النتائج
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

  /**
   * 🔄 معالجة سؤال مقارن
   */
  async _handleComparativeQuery(query, classification) {
    console.log('🔄 معالجة سؤال مقارن...');

    const results = await this.vectorEngine.parallelSearch(query, {
      topK: 10,
      databases: classification.suggestedDatabases,
      queryType: 'comparative'
    });

    return {
      success: true,
      type: 'comparative',
      results,
      query
    };
  }

  /**
   * 🔗 معالجة سؤال متقاطع
   */
  async _handleCrossReferenceQuery(subQueries, classification) {
    console.log('🔗 معالجة سؤال متقاطع...');

    const results = {};
    
    for (const sq of subQueries) {
      const res = await this.vectorEngine.semanticSearch(
        sq.query,
        sq.database,
        5,
        { queryType: classification.queryType }
      );
      results[sq.database] = res;
    }

    return {
      success: true,
      type: 'cross_reference',
      results,
      query: classification.originalQuery || subQueries[0]?.query
    };
  }

  /**
   * 📊 تحليل النتائج الإحصائية
   */
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

    console.log('✅ تم بناء الفهرس:', {
      governorates: this.metaIndex.governorates.length,
      locations: this.metaIndex.locations.length,
      activities: this.metaIndex.activities.length,
      authorities: this.metaIndex.authorities.length
    });
  }

  /**
   * تحديث الذاكرة السياقية
   */
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

  /**
   * إضافة للسجل
   */
  _addToConversationHistory(entry) {
    this.contextMemory.conversationHistory.push(entry);
    
    if (this.contextMemory.conversationHistory.length > this.contextMemory.maxHistoryLength) {
      this.contextMemory.conversationHistory.shift();
    }
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
   * تحديث متوسط زمن الاستجابة
   */
  _updateAverageResponseTime(newTime) {
    const n = this.stats.totalQueries;
    this.stats.averageResponseTime = 
      ((this.stats.averageResponseTime * (n - 1)) + newTime) / n;
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
      },
      vectorEngine: this.vectorEngine?.getStatistics() || {}
    };
  }
}

// تصدير الكلاس
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AIExpertCore;
}
