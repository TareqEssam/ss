/**
 * 🧠 النواة الرئيسية للمساعد الذكي - النسخة المصححة
 * AI Expert Core Engine - FIXED VERSION
 * 
 * العقل المركزي الذي يربط جميع المكونات ويدير المنطق الذكي
 * 
 * @author AI Expert System
 * @version 2.2.0 - FIXED DATABASE LOADING
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

    // ✅ قواعد البيانات المحملة
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
   * ✅ تحميل جميع قواعد البيانات - FIXED VERSION
   */
  async _loadAllDatabases() {
    console.log('📥 تحميل قواعد البيانات من الملفات...');

    try {
      // === انتظار تحميل السكريبتات ===
      await this._waitForVectorDatabases();
      
      // === 1. تحميل قواعد المتجهات ===
      console.log('   🔢 ربط قواعد المتجهات...');
      
      // ✅ الطريقة 1: من المتغيرات العامة الجديدة
      if (window.activityVectors && window.decision104Vectors && window.industrialVectors) {
        console.log('   ✅ استخدام البيانات من window (الطريقة الجديدة)');
        this.vectorDatabases.activity = window.activityVectors;
        this.vectorDatabases.decision104 = window.decision104Vectors;
        this.vectorDatabases.industrial = window.industrialVectors;
      }
      // ✅ الطريقة 2: من المتغيرات الأصلية
      else if (window.activityVectorsData && window.decisionVectorsData && window.industrialVectorsData) {
        console.log('   ✅ استخدام البيانات من المتغيرات الأصلية');
        
        this.vectorDatabases.activity = {
          data: window.activityVectorsData.vectors || [],
          name: window.activityVectorsData.name || 'Activity Vectors',
          version: window.activityVectorsData.version || '3.1.0',
          dimension: window.activityVectorsData.dimension || 384
        };
        
        this.vectorDatabases.decision104 = {
          data: window.decisionVectorsData.vectors || [],
          name: window.decisionVectorsData.name || 'Decision104 Vectors',
          version: window.decisionVectorsData.version || '3.1.0',
          dimension: window.decisionVectorsData.dimension || 384
        };
        
        this.vectorDatabases.industrial = {
          data: window.industrialVectorsData.vectors || [],
          name: window.industrialVectorsData.name || 'Industrial Vectors',
          version: window.industrialVectorsData.version || '3.1.0',
          dimension: window.industrialVectorsData.dimension || 384
        };
      }
      // ❌ فشل التحميل
      else {
        console.error('   ❌ لم يتم العثور على قواعد المتجهات!');
        console.error('   المتغيرات المتاحة:');
        console.error('      - activityVectors:', typeof window.activityVectors);
        console.error('      - activityVectorsData:', typeof window.activityVectorsData);
        console.error('      - decision104Vectors:', typeof window.decision104Vectors);
        console.error('      - decisionVectorsData:', typeof window.decisionVectorsData);
        console.error('      - industrialVectors:', typeof window.industrialVectors);
        console.error('      - industrialVectorsData:', typeof window.industrialVectorsData);
        throw new Error('قواعد المتجهات غير محملة في window');
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
   * ⏳ انتظار تحميل قواعد المتجهات - NEW
   */
  async _waitForVectorDatabases() {
    const maxWait = 10000; // 10 ثوانٍ
    const checkInterval = 100;
    let elapsed = 0;
    
    console.log('   ⏳ انتظار تحميل السكريپتات...');
    
    while (elapsed < maxWait) {
      // التحقق من الطريقة الجديدة
      if (window.activityVectors && 
          window.decision104Vectors && 
          window.industrialVectors) {
        console.log('   ✅ تم تحميل جميع السكريبتات (window.*)');
        return true;
      }
      
      // التحقق من الطريقة القديمة
      if (window.activityVectorsData && 
          window.decisionVectorsData && 
          window.industrialVectorsData) {
        console.log('   ✅ تم تحميل جميع السكريبتات (*Data)');
        return true;
      }
      
      await new Promise(resolve => setTimeout(resolve, checkInterval));
      elapsed += checkInterval;
      
      // طباعة التقدم كل ثانية
      if (elapsed % 1000 === 0) {
        console.log(`   ⏳ انتظار... ${elapsed/1000}s`);
      }
    }
    
    console.warn('   ⚠️ انتهت المهلة - بعض البيانات قد تكون غير محملة');
    return false;
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
        if (record.vector || record.embeddings?.multilingual_minilm?.embeddings) {
          validRecords++;
        }
      });

      console.log(`   ✓ ${dbName}: ${validRecords}/${db.data.length} سجل صالح`);
    });

    return isValid;
  }

  /**
   * 🔍 معالجة الاستعلام
   */
  async processQuery(query) {
    if (!this.initialized) {
      throw new Error('النظام غير مهيأ! استخدم initialize() أولاً');
    }

    if (this.isProcessing) {
      console.warn('⚠️ يتم معالجة استعلام آخر حالياً');
      return {
        success: false,
        message: 'الرجاء الانتظار حتى انتهاء الاستعلام السابق'
      };
    }

    this.isProcessing = true;
    const startTime = performance.now();

    try {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`🔍 استعلام جديد: "${query}"`);
      console.log(${'='.repeat(60)});

      // 1. التحقق من الذاكرة المتعلمة
      const learnedResponse = await this.learningSystem.getLearnedResponse(query);
      if (learnedResponse) {
        console.log('🧠 تم العثور على إجابة من الذاكرة المتعلمة');
        this._updateStats(true, performance.now() - startTime);
        return this._formatLearnedResponse(learnedResponse);
      }

      // 2. تصنيف الاستعلام
      const classification = await this.intentClassifier.classify(query);
      console.log('🎯 تصنيف الاستعلام:', classification);

      // 3. معالجة حسب النوع
      let response;
      
      switch (classification.queryType) {
        case 'simple':
        case 'contextual':
          response = await this._handleSimpleQuery(query, classification);
          break;
        
        case 'statistical':
          response = await this._handleStatisticalQuery(query, classification);
          break;
        
        case 'comparative':
          response = await this._handleComparativeQuery(query, classification);
          break;
        
        case 'cross_reference':
          response = await this._handleCrossReferenceQuery(
            classification.subQueries,
            classification
          );
          break;
        
        default:
          response = await this._handleSimpleQuery(query, classification);
      }

      // 4. تحديث الذاكرة والإحصائيات
      await this._updateContextMemory(query, response, classification);
      this._addToConversationHistory({
        query,
        response,
        timestamp: new Date().toISOString()
      });

      const responseTime = performance.now() - startTime;
      this._updateStats(response.success, responseTime);

      console.log(`✅ اكتملت المعالجة (${responseTime.toFixed(0)}ms)`);
      console.log(${'='.repeat(60)}\n);

      return response;

    } catch (error) {
      console.error('❌ خطأ في المعالجة:', error);
      this._updateStats(false, performance.now() - startTime);
      
      return {
        success: false,
        message: 'حدث خطأ أثناء معالجة الاستعلام',
        error: error.message
      };
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * 📝 معالجة سؤال بسيط
   */
  async _handleSimpleQuery(query, classification) {
    console.log('📝 معالجة سؤال بسيط...');

    const results = await this.vectorEngine.parallelSearch(query, {
      topK: 5,
      databases: classification.suggestedDatabases,
      queryType: classification.queryType
    });

    let totalResults = 0;
    classification.suggestedDatabases.forEach(db => {
      totalResults += results[db]?.length || 0;
    });

    if (totalResults === 0) {
      return {
        success: false,
        type: 'simple',
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
   * تحديث الإحصائيات
   */
  _updateStats(success, responseTime) {
    this.stats.totalQueries++;
    
    if (success) {
      this.stats.successfulQueries++;
    } else {
      this.stats.failedQueries++;
    }
    
    this._updateAverageResponseTime(responseTime);
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
