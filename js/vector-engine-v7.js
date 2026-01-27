/**
 * 🚀 محرك المتجهات v7 - عتبة ديناميكية ذكية
 * Vector Engine v7 - Smart Dynamic Threshold
 * 
 * @version 7.2.0 - SMART THRESHOLD
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
    this.maxCacheSize = 1000;

    // 🔥 عتبات ديناميكية ذكية جداً - أكثر مرونة
    this.thresholds = {
      simple: { 
        excellent: 0.70,  // تطابق ممتاز
        good: 0.55,       // تطابق جيد
        fair: 0.40,       // تطابق مقبول
        min: 0.30         // الحد الأدنى المطلق
      },
      complex: { 
        excellent: 0.65,
        good: 0.50,
        fair: 0.35,
        min: 0.25
      },
      statistical: { 
        excellent: 0.55,
        good: 0.40,
        fair: 0.28,
        min: 0.20
      },
      comparative: { 
        excellent: 0.65,
        good: 0.50,
        fair: 0.38,
        min: 0.28
      },
      technical: { // ✅ إضافة للأسئلة التقنية
        excellent: 0.65,
        good: 0.50,
        fair: 0.35,
        min: 0.25
      }
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
    console.log('🔍 التحقق من قواعد البيانات v3.1...');
    let isValid = true;

    ['activity', 'decision104', 'industrial'].forEach(dbName => {
        const db = this.vectorDatabases[dbName];
        // في v3.1، البيانات قد تكون في db.vectors أو db.data
        const records = db.vectors || db.data || [];
        
        let validRecords = records.filter(r => r.vector || r.embeddings).length;
        const percentage = ((validRecords / records.length) * 100).toFixed(1);
        
        console.log(`  ✓ ${dbName}: ${validRecords}/${records.length} سجل صالح (${percentage}%)`);
        if (validRecords === 0) isValid = false;
    });
    return isValid;
}

  /**
   * 🔢 توليد متجه - مع Cache ذكي
   */
  async generateEmbedding(text) {
    const normalized = this.normalizer.normalize(text);
    const cacheKey = `emb_${normalized}`;
    
    if (this.embeddingCache.has(cacheKey)) {
      this.stats.cacheHits++;
      return this.embeddingCache.get(cacheKey);
    }

    let embedding;

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

    this._cacheEmbedding(cacheKey, embedding);
    return embedding;
  }

  /**
   * 🔧 Fallback - توليد متجه محسّن
   */
  async _generateFallbackEmbedding(text) {
    const vector = new Array(this.vectorDimension).fill(0);
    const words = text.split(/\s+/).filter(w => w.length > 1);

    words.forEach((word, idx) => {
      const hash = this._hash(word);
      const importance = 1.0 / Math.sqrt(idx + 1);
      
      for (let i = 0; i < 8; i++) {
        const dim = Math.abs((hash * (i + 1) + i * 41) % this.vectorDimension);
        vector[dim] += Math.sin(hash * 0.1 + i * 0.7) * importance * 2.0;
      }
    });

    for (let i = 0; i < words.length - 1; i++) {
      const bigram = words[i] + '_' + words[i + 1];
      const hash = this._hash(bigram);
      
      for (let j = 0; j < 5; j++) {
        const dim = Math.abs((hash * (j + 1) + j * 53) % this.vectorDimension);
        vector[dim] += Math.cos(hash * 0.15 + j * 0.5) * 1.5;
      }
    }

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
    const queryVector = await this.generateEmbedding(normalizedQuery);

    // البحث في جميع السجلات
    const results = [];

    for (const record of db.data) {
      const similarity = this._calculateSimilarityFromPrecomputed(
        queryVector,
        record,
        normalizedQuery
      );

      if (similarity > 0.15) { // عتبة أولية منخفضة جداً
        results.push({
          ...record,
          similarity,
          database: databaseName
        });
      }
    }

    // ترتيب حسب التشابه
    results.sort((a, b) => b.similarity - a.similarity);

    // 🔥 عتبة ديناميكية ذكية جداً
    const thresholdInfo = this._calculateSmartThreshold(
      results,
      config.queryType || 'simple',
      query
    );

    const filtered = results.filter(r => r.similarity >= thresholdInfo.threshold);
    const topResults = filtered.slice(0, topK);

    const searchTime = performance.now() - startTime;
    this._updateStats(searchTime);

    console.log(`🔍 ${databaseName}: ${topResults.length} نتائج (${searchTime.toFixed(0)}ms)`);
    if (topResults.length > 0) {
      console.log(`   📊 أعلى تشابه: ${(topResults[0].similarity * 100).toFixed(1)}%`);
      console.log(`   🎯 العتبة: ${(thresholdInfo.threshold * 100).toFixed(1)}% (${thresholdInfo.level})`);
    } else if (results.length > 0) {
      console.log(`   ⚠️ كل النتائج تحت العتبة (أعلى تشابه: ${(results[0].similarity * 100).toFixed(1)}%)`);
    }

    return topResults;
  }

  /**
   * 🎯 حساب التشابه من المتجهات المحفوظة فقط
   */
  _calculateSimilarityFromPrecomputed(queryVector, record, normalizedQuery) {
    let bestScore = 0;

    if (record.embeddings?.multilingual_minilm?.embeddings) {
      const embeddings = record.embeddings.multilingual_minilm.embeddings;
      
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
        scores.sort((a, b) => b - a);
        const topScore = scores[0];
        const top2Avg = scores.slice(0, 2).reduce((a, b) => a + b, 0) / Math.min(2, scores.length);
        bestScore = Math.max(topScore, top2Avg * 0.95);
      }
    }

    // تعزيز نصي
    const textBoost = this._calculateTextBoost(normalizedQuery, record);
    
    return Math.min(1.0, bestScore * 0.85 + textBoost * 0.15);
  }

  _extractRecordText(record) {
    const data = record.original_data;
    return data.text_preview || 
           data.text || 
           data.name || 
           data.value || 
           JSON.stringify(data).substring(0, 200);
  }

  /**
   * 🔥 تعزيز نصي محسّن
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
      
      if (recordText.includes(wordLower)) {
        matches++;
        boost += 0.20;
        
        const regex = new RegExp(`\\b${wordLower}\\b`, 'i');
        if (regex.test(recordText)) {
          exactMatches++;
          boost += 0.10;
        }
      }
    });
    
    if (matches > 0) {
      const matchRatio = matches / queryWords.length;
      boost += matchRatio * 0.15;
      
      if (exactMatches > 0) {
        boost += (exactMatches / queryWords.length) * 0.10;
      }
    }
    
    return Math.min(0.40, boost);
  }

  /**
   * 🎯 عتبة ديناميكية ذكية جداً - SUPER SMART
   */
  _calculateSmartThreshold(results, queryType, query = '') {
    if (results.length === 0) {
      return { 
        threshold: this.thresholds[queryType]?.min || 0.30,
        level: 'min'
      };
    }

    const config = this.thresholds[queryType] || this.thresholds.simple;
    const maxSim = results[0].similarity;
    
    // حساب إحصائيات النتائج
    const top10 = results.slice(0, Math.min(10, results.length));
    const avgTop10 = top10.reduce((sum, r) => sum + r.similarity, 0) / top10.length;
    const gap = top10.length > 1 ? top10[0].similarity - top10[1].similarity : 0;

    // 🔥 استراتيجية ذكية متعددة المستويات

    // === المستوى 1: تطابق ممتاز (70%+) ===
    if (maxSim >= config.excellent) {
      return {
        threshold: Math.max(config.good, maxSim * 0.75),
        level: 'excellent',
        confidence: 'very_high'
      };
    }

    // === المستوى 2: تطابق جيد جداً (60-70%) ===
    if (maxSim >= 0.60) {
      // إذا كان الفرق كبير، نكون أكثر صرامة
      const factor = gap > 0.15 ? 0.70 : 0.65;
      return {
        threshold: Math.max(config.fair, maxSim * factor),
        level: 'very_good',
        confidence: 'high'
      };
    }

    // === المستوى 3: تطابق جيد (50-60%) ===
    if (maxSim >= 0.50) {
      // إذا كان المتوسط قريب من الأعلى، نقبل أكثر
      const avgRatio = avgTop10 / maxSim;
      const factor = avgRatio > 0.85 ? 0.60 : 0.65;
      
      return {
        threshold: Math.max(config.fair * 0.95, maxSim * factor),
        level: 'good',
        confidence: 'medium_high'
      };
    }

    // === المستوى 4: تطابق مقبول (40-50%) ===
    if (maxSim >= 0.40) {
      // تحليل التوزيع
      const isWideSpread = (maxSim - top10[top10.length - 1].similarity) > 0.20;
      
      if (isWideSpread) {
        // تطابق متنوع - نكون أكثر انتقائية
        return {
          threshold: Math.max(config.fair * 0.90, maxSim * 0.62),
          level: 'fair',
          confidence: 'medium'
        };
      } else {
        // تطابق متجانس - نقبل أكثر
        return {
          threshold: Math.max(config.min * 1.2, avgTop10 * 0.70),
          level: 'fair_clustered',
          confidence: 'medium'
        };
      }
    }

    // === المستوى 5: تطابق ضعيف (30-40%) ===
    if (maxSim >= 0.30) {
      // للأسئلة الإحصائية نكون أكثر تساهلاً
      if (queryType === 'statistical') {
        return {
          threshold: Math.max(config.min, maxSim * 0.55),
          level: 'weak_statistical',
          confidence: 'low'
        };
      }
      
      // إذا كان هناك تطابق نصي قوي
      const hasTextMatch = this._checkStrongTextMatch(query, results[0]);
      if (hasTextMatch) {
        return {
          threshold: Math.max(config.min, maxSim * 0.60),
          level: 'weak_text_boost',
          confidence: 'low_medium'
        };
      }
      
      return {
        threshold: Math.max(config.min * 1.1, maxSim * 0.58),
        level: 'weak',
        confidence: 'low'
      };
    }

    // === المستوى 6: تطابق ضعيف جداً (<30%) ===
    if (queryType === 'statistical' && results.length >= 5) {
      // للإحصائيات: إذا كان هناك عدد كافٍ من النتائج
      return {
        threshold: Math.max(config.min * 0.85, maxSim * 0.50),
        level: 'very_weak_statistical',
        confidence: 'very_low'
      };
    }

    // === الحد الأدنى المطلق ===
    return {
      threshold: Math.max(config.min * 0.90, maxSim * 0.55),
      level: 'minimal',
      confidence: 'very_low'
    };
  }

  /**
   * ✅ فحص تطابق نصي قوي
   */
  _checkStrongTextMatch(query, result) {
    if (!result) return false;
    
    const recordText = this._extractRecordText(result).toLowerCase();
    const queryWords = query.split(/\s+/).filter(w => w.length > 3);
    
    if (queryWords.length === 0) return false;
    
    let matches = 0;
    queryWords.forEach(word => {
      if (recordText.includes(word.toLowerCase())) {
        matches++;
      }
    });
    
    // إذا كان 60%+ من الكلمات موجودة
    return (matches / queryWords.length) >= 0.60;
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
   * ⚡ بحث متوازي
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

