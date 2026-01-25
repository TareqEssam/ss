/**
 * 🚀 محرك المتجهات والبحث الدلالي
 * Vector Engine & Semantic Search
 * 
 * الهدف: البحث الدلالي المتقدم باستخدام المتجهات فقط (بدون كلمات مفتاحية)
 * 
 * @author AI Expert System
 * @version 2.0.0
 */

class VectorEngine {
  constructor(arabicNormalizer) {
    this.normalizer = arabicNormalizer;
    this.model = null;
    this.modelLoaded = false;
    this.vectorDimension = 384; // MiniLM dimension
    
    // قواعد البيانات المحملة
    this.databases = {
      activity: null,
      decision104: null,
      industrial: null
    };

    // الإحصائيات
    this.stats = {
      totalSearches: 0,
      averageSearchTime: 0,
      cacheHits: 0
    };

    // ذاكرة مؤقتة للمتجهات المولدة
    this.embeddingCache = new Map();
    this.maxCacheSize = 1000;
  }

  /**
   * 🎯 تحميل قواعد البيانات المتجهية
   * @param {object} vectorDatabases - القواعد الثلاث
   */
  async loadDatabases(vectorDatabases) {
    console.log('📦 تحميل قواعد البيانات المتجهية...');
    
    try {
      this.databases.activity = vectorDatabases.activity;
      this.databases.decision104 = vectorDatabases.decision104;
      this.databases.industrial = vectorDatabases.industrial;

      console.log('✅ تم تحميل القواعد:');
      console.log(`   - الأنشطة: ${this.databases.activity?.data?.length || 0} سجل`);
      console.log(`   - القرار 104: ${this.databases.decision104?.data?.length || 0} سجل`);
      console.log(`   - المناطق: ${this.databases.industrial?.data?.length || 0} سجل`);

      return true;
    } catch (error) {
      console.error('❌ خطأ في تحميل القواعد:', error);
      return false;
    }
  }

  /**
   * 🧮 توليد متجه من نص (محاكاة - للاستخدام المحلي)
   * في الإنتاج، يجب استخدام transformers.js أو API خارجي
   * 
   * @param {string} text - النص المراد تحويله
   * @returns {Array<number>} المتجه الناتج
   */
  async generateEmbedding(text) {
    // التحقق من الذاكرة المؤقتة
    const normalized = this.normalizer.normalizeForEmbedding(text);
    
    if (this.embeddingCache.has(normalized)) {
      this.stats.cacheHits++;
      return this.embeddingCache.get(normalized);
    }

    // توليد متجه بسيط (هذا للنموذج الأولي)
    // في الإنتاج: استخدم transformers.js أو xenova/transformers
    const vector = await this._generateSimpleEmbedding(normalized);

    // حفظ في الذاكرة المؤقتة
    if (this.embeddingCache.size < this.maxCacheSize) {
      this.embeddingCache.set(normalized, vector);
    } else {
      // حذف أقدم عنصر
      const firstKey = this.embeddingCache.keys().next().value;
      this.embeddingCache.delete(firstKey);
      this.embeddingCache.set(normalized, vector);
    }

    return vector;
  }

  /**
   * 🔢 توليد متجه بسيط (Simple TF-IDF-like embedding)
   * هذا نموذج مبسط - يجب استبداله بنموذج حقيقي
   */
  async _generateSimpleEmbedding(text) {
    const words = text.split(/\s+/);
    const vector = new Array(this.vectorDimension).fill(0);

    // توزيع بسيط بناءً على hash الكلمات
    words.forEach((word, idx) => {
      const hash = this._simpleHash(word);
      for (let i = 0; i < this.vectorDimension; i++) {
        vector[i] += Math.sin(hash + i) * (1 / (idx + 1));
      }
    });

    // Normalization
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return magnitude > 0 ? vector.map(v => v / magnitude) : vector;
  }

  /**
   * Hash بسيط للكلمة
   */
  _simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  /**
   * 📐 حساب التشابه بين متجهين (Cosine Similarity)
   * @param {Array<number>} vecA 
   * @param {Array<number>} vecB 
   * @returns {number} نسبة التشابه (0-1)
   */
  cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) {
      return 0;
    }

    let dotProduct = 0;
    let magA = 0;
    let magB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      magA += vecA[i] * vecA[i];
      magB += vecB[i] * vecB[i];
    }

    const magnitude = Math.sqrt(magA) * Math.sqrt(magB);
    return magnitude > 0 ? dotProduct / magnitude : 0;
  }

  /**
   * 🔍 البحث الدلالي في قاعدة بيانات واحدة
   * @param {string} query - استعلام المستخدم
   * @param {string} databaseName - اسم القاعدة (activity/decision104/industrial)
   * @param {number} topK - عدد النتائج المطلوبة
   * @param {number} minSimilarity - الحد الأدنى للتشابه (ديناميكي)
   * @returns {Array<object>} النتائج المرتبة
   */
  async semanticSearch(query, databaseName, topK = 5, minSimilarity = null) {
    const startTime = performance.now();

    // الحصول على القاعدة
    const db = this.databases[databaseName];
    if (!db || !db.data || db.data.length === 0) {
      console.warn(`⚠️ قاعدة ${databaseName} غير محملة أو فارغة`);
      return [];
    }

    // توليد متجه الاستعلام
    const queryVector = await this.generateEmbedding(query);

    // البحث في جميع السجلات
    const results = [];

    for (const record of db.data) {
      // الحصول على أفضل متجه من الأشكال المختلفة
      const bestSimilarity = this._getBestSimilarity(
        queryVector, 
        record.embeddings?.multilingual_minilm?.embeddings
      );

      if (bestSimilarity > 0) {
        results.push({
          ...record,
          similarity: bestSimilarity,
          database: databaseName
        });
      }
    }

    // الترتيب حسب التشابه (تنازلي)
    results.sort((a, b) => b.similarity - a.similarity);

    // تحديد العتبة الديناميكية
    const threshold = minSimilarity || this._calculateDynamicThreshold(results);

    // تصفية حسب العتبة
    const filtered = results.filter(r => r.similarity >= threshold);

    // أخذ أعلى K نتائج
    const topResults = filtered.slice(0, topK);

    // تحديث الإحصائيات
    const searchTime = performance.now() - startTime;
    this.stats.totalSearches++;
    this.stats.averageSearchTime = 
      (this.stats.averageSearchTime * (this.stats.totalSearches - 1) + searchTime) 
      / this.stats.totalSearches;

    console.log(`🔍 بحث في ${databaseName}: ${topResults.length} نتائج (${searchTime.toFixed(2)}ms)`);

    return topResults;
  }

  /**
   * 🎯 الحصول على أفضل تشابه من بين الأشكال المختلفة
   */
  _getBestSimilarity(queryVector, embeddings) {
    if (!embeddings) return 0;

    const variations = ['full', 'summary', 'contextual', 'key_phrases', 'no_stopwords'];
    let maxSimilarity = 0;

    for (const variation of variations) {
      if (embeddings[variation]) {
        const similarity = this.cosineSimilarity(queryVector, embeddings[variation]);
        maxSimilarity = Math.max(maxSimilarity, similarity);
      }
    }

    return maxSimilarity;
  }

  /**
   * 📊 حساب العتبة الديناميكية (Dynamic Threshold)
   * تتكيف مع توزيع النتائج
   */
  _calculateDynamicThreshold(results) {
    if (results.length === 0) return 0.3;

    // الحصول على أعلى تشابه
    const maxSim = results[0]?.similarity || 0;

    // إذا كان أعلى تشابه ضعيف جداً
    if (maxSim < 0.4) return 0.2;

    // إذا كان قوي جداً (استعلام دقيق)
    if (maxSim > 0.85) return 0.7;

    // حساب الوسيط
    const similarities = results.map(r => r.similarity);
    const median = this._calculateMedian(similarities);

    // العتبة = 70% من الوسيط
    return Math.max(0.3, median * 0.7);
  }

  /**
   * حساب الوسيط (Median)
   */
  _calculateMedian(arr) {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 
      ? (sorted[mid - 1] + sorted[mid]) / 2 
      : sorted[mid];
  }

  /**
   * ⚡ البحث المتوازي في جميع القواعد
   * @param {string} query - الاستعلام
   * @param {object} config - إعدادات البحث
   * @returns {object} النتائج من جميع القواعد
   */
  async parallelSearch(query, config = {}) {
    const defaults = {
      topK: 5,
      minSimilarity: null,
      databases: ['activity', 'decision104', 'industrial']
    };

    const settings = { ...defaults, ...config };

    console.log(`⚡ بحث متوازي في ${settings.databases.length} قواعد...`);

    // البحث في جميع القواعد بالتوازي
    const searchPromises = settings.databases.map(dbName => 
      this.semanticSearch(query, dbName, settings.topK, settings.minSimilarity)
    );

    const allResults = await Promise.all(searchPromises);

    // تجميع النتائج
    return {
      activity: allResults[settings.databases.indexOf('activity')] || [],
      decision104: allResults[settings.databases.indexOf('decision104')] || [],
      industrial: allResults[settings.databases.indexOf('industrial')] || [],
      totalResults: allResults.reduce((sum, arr) => sum + arr.length, 0),
      query: query
    };
  }

  /**
   * 🔗 البحث المتقاطع (Cross-Reference Search)
   * للأسئلة المركبة التي تحتاج ربط بين القواعد
   * 
   * @param {object} entities - الكيانات المستخلصة
   * @returns {object} النتائج المرتبطة
   */
  async crossReferenceSearch(entities) {
    const results = {
      activity: null,
      location: null,
      decision104: null,
      crossMatch: false
    };

    // البحث عن النشاط
    if (entities.activityQuery) {
      const activityResults = await this.semanticSearch(
        entities.activityQuery, 
        'activity', 
        3
      );
      results.activity = activityResults[0] || null;
    }

    // البحث عن الموقع
    if (entities.locationQuery) {
      const locationResults = await this.semanticSearch(
        entities.locationQuery, 
        'industrial', 
        3
      );
      results.location = locationResults[0] || null;
    }

    // البحث في القرار 104
    if (entities.activityQuery) {
      const decisionResults = await this.semanticSearch(
        entities.activityQuery, 
        'decision104', 
        3
      );
      results.decision104 = decisionResults[0] || null;
    }

    // التحقق من التطابق
    results.crossMatch = !!(results.activity && results.location);

    return results;
  }

  /**
   * 📈 الحصول على الإحصائيات
   */
  getStatistics() {
    return {
      ...this.stats,
      cacheSize: this.embeddingCache.size,
      databases: {
        activity: this.databases.activity?.data?.length || 0,
        decision104: this.databases.decision104?.data?.length || 0,
        industrial: this.databases.industrial?.data?.length || 0
      }
    };
  }

  /**
   * 🧹 تنظيف الذاكرة المؤقتة
   */
  clearCache() {
    this.embeddingCache.clear();
    console.log('🧹 تم تنظيف ذاكرة المتجهات المؤقتة');
  }
}

// تصدير الكلاس
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VectorEngine;
}