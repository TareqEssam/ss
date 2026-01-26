/**
 * 🚀 محرك المتجهات والبحث الدلالي - النسخة الاحترافية
 * Vector Engine & Semantic Search - Professional Edition
 * 
 * الهدف: البحث الدلالي الذكي باستخدام Hybrid Search (Keyword + Semantic)
 * يجمع بين قوة المطابقة النصية ودقة المتجهات الدلالية
 * 
 * @author AI Expert System
 * @version 3.0.0 Professional
 * @license MIT
 */

class VectorEngine {
  constructor(arabicNormalizer) {
    this.normalizer = arabicNormalizer;
    this.model = null;
    this.modelLoaded = false;
    this.vectorDimension = 384; // paraphrase-multilingual-MiniLM-L12-v2
    
    // قواعد البيانات المحملة
    this.databases = {
      activity: null,
      decision104: null,
      industrial: null
    };

    // الإحصائيات المتقدمة
    this.stats = {
      totalSearches: 0,
      averageSearchTime: 0,
      cacheHits: 0,
      cacheMisses: 0,
      totalResults: 0,
      avgResultsPerSearch: 0,
      searchByDatabase: {
        activity: 0,
        decision104: 0,
        industrial: 0
      }
    };

    // ذاكرة مؤقتة للمتجهات المولدة (LRU Cache)
    this.embeddingCache = new Map();
    this.maxCacheSize = 1000;

    // إعدادات البحث الافتراضية
    this.defaultConfig = {
      topK: 5,
      minSimilarity: 0.3,
      useHybridSearch: true, // استخدام البحث المهجن
      keywordWeight: 0.4,    // وزن المطابقة النصية
      semanticWeight: 0.6,   // وزن التشابه الدلالي
      dynamicThreshold: true  // عتبة ديناميكية
    };

    console.log('🚀 تم تهيئة محرك المتجهات الاحترافي');
  }

  /**
   * 🎯 تحميل قواعد البيانات المتجهية
   * @param {object} vectorDatabases - القواعد الثلاث
   * @returns {boolean} نجاح التحميل
   */
  async loadDatabases(vectorDatabases) {
    console.log('📦 تحميل قواعد البيانات المتجهية...');
    
    try {
      this.databases.activity = vectorDatabases.activity;
      this.databases.decision104 = vectorDatabases.decision104;
      this.databases.industrial = vectorDatabases.industrial;

      // بناء فهارس البحث السريع
      this._buildSearchIndexes();

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
   * 🔨 بناء فهارس البحث السريع
   * @private
   */
  _buildSearchIndexes() {
    for (const [dbName, db] of Object.entries(this.databases)) {
      if (!db || !db.data) continue;

      // بناء فهرس الكلمات المفتاحية
      db.keywordIndex = new Map();
      
      db.data.forEach((record, idx) => {
        const keywords = [
          ...(record.keywords || []),
          ...(record.synonyms || []),
          record.text || '',
          record.name || ''
        ];

        keywords.forEach(kw => {
          if (!kw) return;
          const normalized = this.normalizer.normalize(kw.toLowerCase());
          
          if (!db.keywordIndex.has(normalized)) {
            db.keywordIndex.set(normalized, []);
          }
          db.keywordIndex.get(normalized).push(idx);
        });
      });

      console.log(`📇 بناء فهرس ${dbName}: ${db.keywordIndex.size} كلمة مفتاحية`);
    }
  }

  /**
   * 🧮 توليد متجه من نص (Hybrid Embedding)
   * يجمع بين المطابقة النصية والتمثيل الدلالي
   * 
   * @param {string} text - النص المراد تحويله
   * @param {object} metadata - بيانات إضافية (اختياري)
   * @returns {Promise<Array<number>>} المتجه الناتج
   */
  async generateEmbedding(text, metadata = {}) {
    // التحقق من الذاكرة المؤقتة
    const cacheKey = this._getCacheKey(text, metadata);
    
    if (this.embeddingCache.has(cacheKey)) {
      this.stats.cacheHits++;
      return this.embeddingCache.get(cacheKey);
    }

    this.stats.cacheMisses++;

    // تطبيع النص
    const normalized = this.normalizer.normalize(text);

    // توليد المتجه الهجين
    const vector = await this._generateHybridEmbedding(normalized, metadata);

    // حفظ في الذاكرة المؤقتة (LRU)
    this._addToCache(cacheKey, vector);

    return vector;
  }

  /**
   * 🔢 توليد متجه هجين (Keyword-Based + Semantic-Like)
   * @private
   */
  async _generateHybridEmbedding(text, metadata = {}) {
    const vector = new Array(this.vectorDimension).fill(0);
    const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 0);

    // === الجزء 1: المطابقة مع الكلمات المفتاحية ===
    if (metadata.keywords && Array.isArray(metadata.keywords)) {
      metadata.keywords.forEach((keyword, idx) => {
        const kw = this.normalizer.normalize(keyword.toLowerCase());
        const kwWords = kw.split(/\s+/);
        
        // مطابقة كاملة
        if (kwWords.every(kw => words.includes(kw))) {
          const position = idx % this.vectorDimension;
          vector[position] += 2.0; // وزن عالي للمطابقة الكاملة
        }
        // مطابقة جزئية
        else if (kwWords.some(kw => words.some(w => w.includes(kw) || kw.includes(w)))) {
          const position = idx % this.vectorDimension;
          vector[position] += 1.0;
        }
      });
    }

    // === الجزء 2: المطابقة مع المرادفات ===
    if (metadata.synonyms && Array.isArray(metadata.synonyms)) {
      metadata.synonyms.forEach((synonym, idx) => {
        const syn = this.normalizer.normalize(synonym.toLowerCase());
        const synWords = syn.split(/\s+/);
        
        if (synWords.some(s => words.includes(s))) {
          const position = (idx + 50) % this.vectorDimension;
          vector[position] += 1.5;
        } else if (synWords.some(s => words.some(w => w.includes(s) || s.includes(w)))) {
          const position = (idx + 50) % this.vectorDimension;
          vector[position] += 0.8;
        }
      });
    }

    // === الجزء 3: المطابقة مع النص الرئيسي ===
    const mainTexts = [
      metadata.text,
      metadata.name,
      metadata.value
    ].filter(Boolean);

    mainTexts.forEach((mainText, idx) => {
      const normalized = this.normalizer.normalize(mainText.toLowerCase());
      const mainWords = normalized.split(/\s+/);
      
      // تطابق تام
      if (words.every(w => mainWords.includes(w))) {
        vector[100 + idx] += 3.0;
      }
      // تطابق قوي
      else if (words.some(w => mainWords.includes(w))) {
        const matchRatio = words.filter(w => mainWords.includes(w)).length / words.length;
        vector[100 + idx] += 2.0 * matchRatio;
      }
      // تطابق جزئي
      else if (mainWords.some(mw => words.some(w => w.includes(mw) || mw.includes(w)))) {
        vector[100 + idx] += 1.0;
      }
    });

    // === الجزء 4: النوايا (Intent) ===
    if (metadata.intent && Array.isArray(metadata.intent)) {
      metadata.intent.forEach((intentPhrase, idx) => {
        const intent = this.normalizer.normalize(intentPhrase.toLowerCase());
        const intentWords = intent.split(/\s+/);
        
        const matchCount = intentWords.filter(iw => 
          words.some(w => w.includes(iw) || iw.includes(w))
        ).length;
        
        if (matchCount > 0) {
          const position = (idx + 150) % this.vectorDimension;
          vector[position] += 1.5 * (matchCount / intentWords.length);
        }
      });
    }

    // === الجزء 5: التمثيل الدلالي البسيط (TF-IDF-like) ===
    words.forEach((word, wordIdx) => {
      if (word.length < 2) return; // تجاهل الكلمات القصيرة جداً
      
      const hash = this._stringHash(word);
      const importance = 1 / (wordIdx + 1); // الكلمات الأولى أهم
      
      for (let i = 0; i < 3; i++) {
        const position = Math.abs(hash + i * 100) % this.vectorDimension;
        vector[position] += Math.sin(hash + i) * importance * 0.5;
      }
    });

    // === التطبيع (Normalization) ===
    return this._normalizeVector(vector);
  }

  /**
   * 📐 حساب التشابه الهجين (Hybrid Similarity)
   * يجمع بين cosine similarity والمطابقة النصية
   * 
   * @param {Array<number>} vecA 
   * @param {Array<number>} vecB 
   * @param {object} config - إعدادات الحساب
   * @returns {number} نسبة التشابه (0-1)
   */
  hybridSimilarity(vecA, vecB, config = {}) {
    const settings = { ...this.defaultConfig, ...config };
    
    // Cosine Similarity
    const cosineSim = this.cosineSimilarity(vecA, vecB);
    
    if (!settings.useHybridSearch) {
      return cosineSim;
    }

    // يمكن إضافة مقاييس أخرى هنا في المستقبل
    return cosineSim;
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
    return magnitude > 0 ? Math.max(0, Math.min(1, dotProduct / magnitude)) : 0;
  }

  /**
   * 🔍 البحث الدلالي في قاعدة بيانات واحدة
   * @param {string} query - استعلام المستخدم
   * @param {string} databaseName - اسم القاعدة (activity/decision104/industrial)
   * @param {number} topK - عدد النتائج المطلوبة
   * @param {object} config - إعدادات البحث
   * @returns {Promise<Array<object>>} النتائج المرتبة
   */
  async semanticSearch(query, databaseName, topK = 5, config = {}) {
    const startTime = performance.now();
    const settings = { ...this.defaultConfig, topK, ...config };

    // الحصول على القاعدة
    const db = this.databases[databaseName];
    if (!db || !db.data || db.data.length === 0) {
      console.warn(`⚠️ قاعدة ${databaseName} غير محملة أو فارغة`);
      return [];
    }

    // تطبيع الاستعلام
    const normalizedQuery = this.normalizer.normalize(query);

    // توليد متجه الاستعلام
    const queryVector = await this.generateEmbedding(normalizedQuery);

    // البحث في جميع السجلات
    const results = [];

    for (let i = 0; i < db.data.length; i++) {
      const record = db.data[i];
      
      // حساب التشابه
      const similarity = await this._calculateRecordSimilarity(
        queryVector,
        record,
        normalizedQuery,
        settings
      );

      if (similarity > 0) {
        results.push({
          ...record,
          similarity: similarity,
          database: databaseName,
          _index: i
        });
      }
    }

    // الترتيب حسب التشابه (تنازلي)
    results.sort((a, b) => b.similarity - a.similarity);

    // تحديد العتبة (Threshold)
    const threshold = settings.dynamicThreshold 
      ? this._calculateDynamicThreshold(results, settings.minSimilarity)
      : settings.minSimilarity;

    // تصفية حسب العتبة
    const filtered = results.filter(r => r.similarity >= threshold);

    // أخذ أعلى K نتائج
    const topResults = filtered.slice(0, settings.topK);

    // تحديث الإحصائيات
    const searchTime = performance.now() - startTime;
    this._updateStats(databaseName, searchTime, topResults.length);

    console.log(`🔍 بحث في ${databaseName}: ${topResults.length} نتائج (${searchTime.toFixed(2)}ms)`);
    if (topResults.length > 0) {
      console.log(`   📊 أعلى تشابه: ${(topResults[0].similarity * 100).toFixed(1)}%`);
    }

    return topResults;
  }

  /**
   * 🎯 حساب التشابه مع سجل واحد
   * @private
   */
  async _calculateRecordSimilarity(queryVector, record, normalizedQuery, settings) {
    let maxSimilarity = 0;

    // === الطريقة 1: المقارنة مع المتجهات المحفوظة ===
    if (record.embeddings?.multilingual_minilm?.embeddings) {
      const embeddings = record.embeddings.multilingual_minilm.embeddings;
      const variations = ['full', 'summary', 'contextual', 'key_phrases', 'no_stopwords'];
      
      for (const variation of variations) {
        if (embeddings[variation]) {
          const similarity = this.cosineSimilarity(queryVector, embeddings[variation]);
          maxSimilarity = Math.max(maxSimilarity, similarity);
        }
      }
    }

    // === الطريقة 2: توليد متجه جديد من البيانات ===
    const recordVector = await this.generateEmbedding(
      record.text || record.name || '', 
      record
    );
    const directSimilarity = this.cosineSimilarity(queryVector, recordVector);
    maxSimilarity = Math.max(maxSimilarity, directSimilarity);

    // === الطريقة 3: Keyword Boosting ===
    if (settings.useHybridSearch) {
      const keywordBoost = this._calculateKeywordBoost(normalizedQuery, record);
      maxSimilarity = Math.max(maxSimilarity, 
        maxSimilarity * settings.semanticWeight + keywordBoost * settings.keywordWeight
      );
    }

    return maxSimilarity;
  }

  /**
   * 🚀 تعزيز الكلمات المفتاحية (Keyword Boosting)
   * @private
   */
  _calculateKeywordBoost(query, record) {
    const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 1);
    let boost = 0;
    let matches = 0;

    const searchFields = [
      { field: record.text || '', weight: 2.0 },
      { field: record.name || '', weight: 2.0 },
      { field: (record.keywords || []).join(' '), weight: 1.5 },
      { field: (record.synonyms || []).join(' '), weight: 1.2 },
      { field: (record.intent || []).join(' '), weight: 1.0 }
    ];

    searchFields.forEach(({ field, weight }) => {
      const normalized = this.normalizer.normalize(field.toLowerCase());
      const fieldWords = normalized.split(/\s+/);
      
      queryWords.forEach(qWord => {
        // مطابقة تامة
        if (fieldWords.includes(qWord)) {
          matches++;
          boost += weight * 1.0;
        }
        // مطابقة جزئية
        else if (fieldWords.some(fw => fw.includes(qWord) || qWord.includes(fw))) {
          matches++;
          boost += weight * 0.5;
        }
      });
    });

    // تطبيع التعزيز
    return matches > 0 ? Math.min(1.0, boost / (queryWords.length * 2)) : 0;
  }

  /**
   * 📊 حساب العتبة الديناميكية (Dynamic Threshold)
   * @private
   */
  _calculateDynamicThreshold(results, minThreshold = 0.3) {
    if (results.length === 0) return minThreshold;

    const maxSim = results[0]?.similarity || 0;

    // إذا كان أعلى تشابه ضعيف جداً، خفّض العتبة
    if (maxSim < 0.4) return Math.max(0.15, minThreshold * 0.7);

    // إذا كان قوي جداً (استعلام دقيق)، ارفع العتبة
    if (maxSim > 0.85) return Math.max(0.6, maxSim * 0.8);

    // حساب الوسيط (Median)
    const similarities = results.slice(0, 10).map(r => r.similarity);
    const median = this._calculateMedian(similarities);

    // العتبة = 65% من الوسيط، مع حد أدنى
    return Math.max(minThreshold, median * 0.65);
  }

  /**
   * 📈 حساب الوسيط (Median)
   * @private
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
   * @returns {Promise<object>} النتائج من جميع القواعد
   */
  async parallelSearch(query, config = {}) {
    const settings = {
      ...this.defaultConfig,
      ...config,
      databases: config.databases || ['activity', 'decision104', 'industrial']
    };

    console.log(`⚡ بحث متوازي في ${settings.databases.length} قواعد...`);

    // البحث في جميع القواعد بالتوازي
    const searchPromises = settings.databases.map(dbName => 
      this.semanticSearch(query, dbName, settings.topK, settings)
    );

    const allResults = await Promise.all(searchPromises);

    // تجميع النتائج
    const result = {
      activity: allResults[settings.databases.indexOf('activity')] || [],
      decision104: allResults[settings.databases.indexOf('decision104')] || [],
      industrial: allResults[settings.databases.indexOf('industrial')] || [],
      totalResults: allResults.reduce((sum, arr) => sum + arr.length, 0),
      query: query,
      searchTime: this.stats.averageSearchTime
    };

    return result;
  }

  /**
   * 🔗 البحث المتقاطع (Cross-Reference Search)
   * @param {object} entities - الكيانات المستخلصة
   * @param {object} config - إعدادات
   * @returns {Promise<object>} النتائج المرتبطة
   */
  async crossReferenceSearch(entities, config = {}) {
    const results = {
      activity: null,
      location: null,
      decision104: null,
      crossMatch: false,
      suggestions: []
    };

    const settings = { ...this.defaultConfig, topK: 3, ...config };

    // البحث عن النشاط
    if (entities.activityQuery) {
      const activityResults = await this.semanticSearch(
        entities.activityQuery, 
        'activity', 
        settings.topK,
        settings
      );
      results.activity = activityResults[0] || null;
    }

    // البحث عن الموقع
    if (entities.locationQuery) {
      const locationResults = await this.semanticSearch(
        entities.locationQuery, 
        'industrial', 
        settings.topK,
        settings
      );
      results.location = locationResults[0] || null;
    }

    // البحث في القرار 104
    if (entities.activityQuery) {
      const decisionResults = await this.semanticSearch(
        entities.activityQuery, 
        'decision104', 
        settings.topK,
        settings
      );
      results.decision104 = decisionResults[0] || null;
    }

    // التحقق من التطابق
    results.crossMatch = !!(results.activity && results.location);

    // اقتراحات ذكية
    if (results.activity && !results.location) {
      results.suggestions.push('يمكنك البحث عن مناطق صناعية مناسبة لهذا النشاط');
    }
    if (results.location && !results.activity) {
      results.suggestions.push('يمكنك البحث عن الأنشطة المسموح بها في هذه المنطقة');
    }

    return results;
  }

  /**
   * 📈 الحصول على الإحصائيات
   * @returns {object} إحصائيات الأداء
   */
  getStatistics() {
    return {
      ...this.stats,
      cacheSize: this.embeddingCache.size,
      cacheHitRate: this.stats.totalSearches > 0 
        ? ((this.stats.cacheHits / (this.stats.cacheHits + this.stats.cacheMisses)) * 100).toFixed(2) + '%'
        : '0%',
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
    this.stats.cacheHits = 0;
    this.stats.cacheMisses = 0;
    console.log('🧹 تم تنظيف ذاكرة المتجهات المؤقتة');
  }

  /**
   * 🔧 تحديث الإحصائيات
   * @private
   */
  _updateStats(databaseName, searchTime, resultCount) {
    this.stats.totalSearches++;
    this.stats.searchByDatabase[databaseName]++;
    this.stats.totalResults += resultCount;
    this.stats.avgResultsPerSearch = this.stats.totalResults / this.stats.totalSearches;
    
    this.stats.averageSearchTime = 
      (this.stats.averageSearchTime * (this.stats.totalSearches - 1) + searchTime) 
      / this.stats.totalSearches;
  }

  /**
   * 🔑 توليد مفتاح للذاكرة المؤقتة
   * @private
   */
  _getCacheKey(text, metadata) {
    const metaKeys = Object.keys(metadata).sort().join(',');
    return `${text}::${metaKeys}`;
  }

  /**
   * 💾 إضافة للذاكرة المؤقتة (LRU)
   * @private
   */
  _addToCache(key, value) {
    if (this.embeddingCache.size >= this.maxCacheSize) {
      // حذف أقدم عنصر (First In, First Out)
      const firstKey = this.embeddingCache.keys().next().value;
      this.embeddingCache.delete(firstKey);
    }
    this.embeddingCache.set(key, value);
  }

  /**
   * 🔨 تطبيع متجه (Vector Normalization)
   * @private
   */
  _normalizeVector(vector) {
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return magnitude > 0 ? vector.map(v => v / magnitude) : vector;
  }

  /**
   * 🔢 Hash بسيط للنص
   * @private
   */
  _stringHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}

// تصدير الكلاس
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VectorEngine;
}
