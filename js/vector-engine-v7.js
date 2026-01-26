/**
 * 🚀 محرك المتجهات v7 - محسّن للأداء
 * Vector Engine v7 - Performance Optimized
 * 
 * @version 7.1.0 - HIGH PERFORMANCE
 */

class VectorEngineV7 {
  constructor(arabicNormalizer) {
    this.normalizer = arabicNormalizer;
    this.vectorDimension = 384;
    
    // النموذج الحقيقي
    this.transformersLoader = window.transformersLoader || new TransformersLoader();
    this.useRealModel = true;
    this.modelReady = false;
    
    this.databases = {
      activity: null,
      decision104: null,
      industrial: null
    };

    this.stats = {
      totalSearches: 0,
      realModelSearches: 0,
      fallbackSearches: 0,
      cacheHits: 0,
      averageSearchTime: 0
    };

    this.embeddingCache = new Map();
    this.maxCacheSize = 1000; // ✅ زيادة حجم الذاكرة

    // 🔥 عتبات ديناميكية محسّنة - أعلى للجودة
    this.thresholds = {
      simple: { min: 0.45, ideal: 0.65 },      // ✅ رفع من 0.35
      complex: { min: 0.38, ideal: 0.55 },     // ✅ رفع من 0.28
      statistical: { min: 0.30, ideal: 0.45 }, // ✅ رفع من 0.20
      comparative: { min: 0.40, ideal: 0.60 }  // ✅ رفع من 0.30
    };
  }

  /**
   * 🚀 تهيئة النموذج
   */
  async initialize() {
    console.log('🔄 تهيئة محرك المتجهات...');
    
    try {
      const result = await this.transformersLoader.load();
      
      if (result.success) {
        this.modelReady = true;
        this.useRealModel = true;
        console.log('✅ النموذج الحقيقي جاهز!');
      } else {
        console.warn('⚠️ فشل تحميل النموذج، استخدام Fallback');
        this.modelReady = false;
        this.useRealModel = false;
      }
    } catch (error) {
      console.error('❌ خطأ في تهيئة النموذج:', error);
      this.useRealModel = false;
    }
  }

  async loadDatabases(vectorDatabases) {
    console.log('📦 تحميل قواعد البيانات...');
    
    this.databases.activity = vectorDatabases.activity;
    this.databases.decision104 = vectorDatabases.decision104;
    this.databases.industrial = vectorDatabases.industrial;

    this._validateDatabases();

    console.log('✅ تم تحميل القواعد:');
    console.log(`   - الأنشطة: ${this.databases.activity?.data?.length || 0}`);
    console.log(`   - القرار 104: ${this.databases.decision104?.data?.length || 0}`);
    console.log(`   - المناطق: ${this.databases.industrial?.data?.length || 0}`);

    return true;
  }

  _validateDatabases() {
    for (const [dbName, db] of Object.entries(this.databases)) {
      if (!db || !db.data) continue;
      
      let validCount = 0;
      db.data.forEach(record => {
        if (record.embeddings?.multilingual_minilm?.embeddings) {
          validCount++;
        }
      });
      
      console.log(`   ✓ ${dbName}: ${validCount}/${db.data.length} سجل صالح`);
    }
  }

  /**
   * 🔢 توليد متجه - مع Cache ذكي
   */
  async generateEmbedding(text) {
    const normalized = this.normalizer.normalize(text);
    const cacheKey = `emb_${normalized}`;
    
    // ✅ التحقق من الذاكرة أولاً
    if (this.embeddingCache.has(cacheKey)) {
      this.stats.cacheHits++;
      return this.embeddingCache.get(cacheKey);
    }

    let embedding;

    // 🔥 محاولة استخدام النموذج الحقيقي
    if (this.useRealModel && this.modelReady) {
      try {
        embedding = await this.transformersLoader.generateEmbedding(normalized);
        this.stats.realModelSearches++;
      } catch (error) {
        console.warn('⚠️ فشل النموذج الحقيقي، استخدام Fallback');
        embedding = await this._generateFallbackEmbedding(normalized);
        this.stats.fallbackSearches++;
      }
    } else {
      embedding = await this._generateFallbackEmbedding(normalized);
      this.stats.fallbackSearches++;
    }

    // حفظ في الذاكرة
    this._cacheEmbedding(cacheKey, embedding);
    return embedding;
  }

  /**
   * 🔧 Fallback - توليد متجه محسّن
   */
  async _generateFallbackEmbedding(text) {
    const vector = new Array(this.vectorDimension).fill(0);
    const words = text.split(/\s+/).filter(w => w.length > 1);

    // === طبقة 1: كلمات رئيسية ===
    words.forEach((word, idx) => {
      const hash = this._hash(word);
      const importance = 1.0 / Math.sqrt(idx + 1);
      
      for (let i = 0; i < 8; i++) {
        const dim = Math.abs((hash * (i + 1) + i * 41) % this.vectorDimension);
        vector[dim] += Math.sin(hash * 0.1 + i * 0.7) * importance * 2.0;
      }
    });

    // === طبقة 2: Bigrams ===
    for (let i = 0; i < words.length - 1; i++) {
      const bigram = words[i] + '_' + words[i + 1];
      const hash = this._hash(bigram);
      
      for (let j = 0; j < 5; j++) {
        const dim = Math.abs((hash * (j + 1) + j * 53) % this.vectorDimension);
        vector[dim] += Math.cos(hash * 0.15 + j * 0.5) * 1.5;
      }
    }

    // === طبقة 3: تفاعلات الكلمات ===
    for (let i = 0; i < Math.min(5, words.length); i++) {
      for (let j = i + 1; j < Math.min(5, words.length); j++) {
        const interaction = this._hash(words[i] + '::' + words[j]);
        const dim = Math.abs(interaction % this.vectorDimension);
        vector[dim] += 0.8;
      }
    }

    return this._normalizeVector(vector);
  }

  /**
   * 🔍 البحث الدلالي المحسّن - HIGH PERFORMANCE
   */
  async semanticSearch(query, databaseName, topK = 5, config = {}) {
    const startTime = performance.now();

    const db = this.databases[databaseName];
    if (!db || !db.data || db.data.length === 0) {
      console.warn(`⚠️ قاعدة ${databaseName} فارغة`);
      return [];
    }

    const normalizedQuery = this.normalizer.normalize(query);
    
    // ✅ توليد متجه الاستعلام مرة واحدة فقط
    const queryVector = await this.generateEmbedding(normalizedQuery);

    // 🔥 البحث في جميع السجلات - بدون توليد متجهات جديدة!
    const results = [];

    for (const record of db.data) {
      // ✅ استخدام المتجهات المحفوظة فقط
      const similarity = this._calculateSimilarityFromPrecomputed(
        queryVector,
        record,
        normalizedQuery
      );

      if (similarity > 0.20) { // عتبة أولية منخفضة
        results.push({
          ...record,
          similarity,
          database: databaseName
        });
      }
    }

    // ترتيب حسب التشابه
    results.sort((a, b) => b.similarity - a.similarity);

    // 🔥 عتبة ديناميكية ذكية
    const threshold = this._calculateSmartThreshold(
      results,
      config.queryType || 'simple'
    );

    const filtered = results.filter(r => r.similarity >= threshold);
    const topResults = filtered.slice(0, topK);

    const searchTime = performance.now() - startTime;
    this._updateStats(searchTime);

    console.log(`🔍 ${databaseName}: ${topResults.length} نتائج (${searchTime.toFixed(0)}ms)`);
    if (topResults.length > 0) {
      console.log(`   📊 أعلى تشابه: ${(topResults[0].similarity * 100).toFixed(1)}%`);
      console.log(`   🎯 العتبة: ${(threshold * 100).toFixed(1)}%`);
    }

    return topResults;
  }

  /**
   * 🎯 حساب التشابه من المتجهات المحفوظة فقط - NO GENERATION!
   */
  _calculateSimilarityFromPrecomputed(queryVector, record, normalizedQuery) {
    let bestScore = 0;

    // ✅ استخدام المتجهات المحفوظة فقط
    if (record.embeddings?.multilingual_minilm?.embeddings) {
      const embeddings = record.embeddings.multilingual_minilm.embeddings;
      
      // تجربة جميع الأنواع المتاحة
      const variations = ['full', 'contextual', 'summary', 'key_phrases', 'no_stopwords'];
      const scores = [];
      
      for (const variant of variations) {
        if (embeddings[variant] && Array.isArray(embeddings[variant])) {
          const sim = this.cosineSimilarity(queryVector, embeddings[variant]);
          if (sim > 0) {
            scores.push(sim);
          }
        }
      }
      
      if (scores.length > 0) {
        // ✅ استراتيجية ذكية: أعلى تشابه + متوسط أفضل 2
        scores.sort((a, b) => b - a);
        const topScore = scores[0];
        const top2Avg = scores.slice(0, 2).reduce((a, b) => a + b, 0) / Math.min(2, scores.length);
        bestScore = Math.max(topScore, top2Avg * 0.95);
      }
    }

    // ✅ تعزيز نصي بسيط (بدون توليد متجهات)
    const textBoost = this._calculateTextBoost(normalizedQuery, record);
    
    // ✅ دمج ذكي
    return Math.min(1.0, bestScore * 0.85 + textBoost * 0.15);
  }

  /**
   * استخراج نص السجل
   */
  _extractRecordText(record) {
    const data = record.original_data;
    return data.text_preview || 
           data.text || 
           data.name || 
           data.value || 
           JSON.stringify(data).substring(0, 200);
  }

  /**
   * 🔥 تعزيز نصي بسيط - بدون توليد متجهات
   */
  _calculateTextBoost(query, record) {
    const recordText = this._extractRecordText(record).toLowerCase();
    const queryWords = query.split(/\s+/).filter(w => w.length > 2);
    
    if (queryWords.length === 0) return 0;
    
    let boost = 0;
    let matches = 0;
    let exactMatches = 0;
    
    queryWords.forEach(word => {
      const wordLower = word.toLowerCase();
      
      // تطابق تام
      if (recordText.includes(wordLower)) {
        matches++;
        boost += 0.20; // ✅ تعزيز أعلى
        
        // تطابق ككلمة كاملة (أفضل)
        const regex = new RegExp(`\\b${wordLower}\\b`, 'i');
        if (regex.test(recordText)) {
          exactMatches++;
          boost += 0.10; // تعزيز إضافي
        }
      }
    });
    
    // تعزيز إضافي لنسبة التطابق
    if (matches > 0) {
      const matchRatio = matches / queryWords.length;
      boost += matchRatio * 0.15;
      
      // مكافأة للتطابقات التامة
      if (exactMatches > 0) {
        boost += (exactMatches / queryWords.length) * 0.10;
      }
    }
    
    return Math.min(0.40, boost); // ✅ حد أقصى 40%
  }

  /**
   * 🎯 عتبة ديناميكية ذكية - محسّنة
   */
  _calculateSmartThreshold(results, queryType) {
    if (results.length === 0) {
      return this.thresholds[queryType]?.min || 0.40;
    }

    const maxSim = results[0].similarity;
    const config = this.thresholds[queryType] || this.thresholds.simple;

    // === حالة 1: تطابق ممتاز (75%+) ===
    if (maxSim >= 0.75) {
      return Math.max(config.ideal, maxSim * 0.70); // ✅ رفع من 0.65
    }

    // === حالة 2: تطابق جيد جداً (60-75%) ===
    if (maxSim >= 0.60) {
      return Math.max(config.ideal * 0.95, maxSim * 0.65);
    }

    // === حالة 3: تطابق جيد (50-60%) ===
    if (maxSim >= 0.50) {
      return Math.max(config.min, maxSim * 0.62); // ✅ رفع من 0.60
    }

    // === حالة 4: تطابق متوسط (40-50%) ===
    if (maxSim >= 0.40) {
      const top5 = results.slice(0, 5).map(r => r.similarity);
      const avg = top5.reduce((a, b) => a + b, 0) / top5.length;
      return Math.max(config.min * 0.90, avg * 0.58); // ✅ رفع من 0.55
    }

    // === حالة 5: تطابق ضعيف (<40%) ===
    if (queryType === 'statistical') {
      return Math.max(0.25, maxSim * 0.55); // ✅ رفع من 0.18
    }

    return Math.max(config.min * 0.92, maxSim * 0.60); // ✅ رفع العتبة
  }

  cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) {
      return 0;
    }

    let dot = 0, magA = 0, magB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dot += vecA[i] * vecB[i];
      magA += vecA[i] * vecA[i];
      magB += vecB[i] * vecB[i];
    }

    const mag = Math.sqrt(magA) * Math.sqrt(magB);
    return mag > 0 ? Math.max(0, Math.min(1, dot / mag)) : 0;
  }

  /**
   * ⚡ بحث متوازي - محسّن
   */
  async parallelSearch(query, config = {}) {
    const settings = {
      topK: 5,
      databases: ['activity', 'decision104', 'industrial'],
      ...config
    };

    console.log(`⚡ بحث متوازي في ${settings.databases.length} قواعد...`);

    const promises = settings.databases.map(db => 
      this.semanticSearch(query, db, settings.topK, settings)
    );

    const allResults = await Promise.all(promises);

    const resultMap = {};
    settings.databases.forEach((db, idx) => {
      resultMap[db] = allResults[idx] || [];
    });

    const totalResults = allResults.reduce((sum, arr) => sum + arr.length, 0);

    return {
      ...resultMap,
      totalResults,
      query
    };
  }

  _hash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  _normalizeVector(vector) {
    const mag = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return mag > 0 ? vector.map(v => v / mag) : vector;
  }

  _cacheEmbedding(key, value) {
    if (this.embeddingCache.size >= this.maxCacheSize) {
      const firstKey = this.embeddingCache.keys().next().value;
      this.embeddingCache.delete(firstKey);
    }
    this.embeddingCache.set(key, value);
  }

  _updateStats(searchTime) {
    this.stats.totalSearches++;
    this.stats.averageSearchTime = 
      (this.stats.averageSearchTime * (this.stats.totalSearches - 1) + searchTime) 
      / this.stats.totalSearches;
  }

  getStatistics() {
    return {
      ...this.stats,
      modelStatus: this.useRealModel ? 'نموذج حقيقي' : 'Fallback',
      cacheSize: this.embeddingCache.size,
      cacheHitRate: this.stats.cacheHits > 0 
        ? `${((this.stats.cacheHits / (this.stats.cacheHits + this.stats.realModelSearches + this.stats.fallbackSearches)) * 100).toFixed(1)}%`
        : '0%',
      databases: {
        activity: this.databases.activity?.data?.length || 0,
        decision104: this.databases.decision104?.data?.length || 0,
        industrial: this.databases.industrial?.data?.length || 0
      }
    };
  }

  clearCache() {
    this.embeddingCache.clear();
    console.log('🧹 تم مسح ذاكرة المتجهات');
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = VectorEngineV7;
}
