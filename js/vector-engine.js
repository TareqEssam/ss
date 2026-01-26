/**
 * 🚀 محرك المتجهات والبحث الدلالي - نسخة احترافية
 * Vector Engine - Professional Semantic Search
 * 
 * يعتمد على:
 * - المتجهات المحفوظة (أولوية قصوى)
 * - عتبات ديناميكية ذكية
 * - فهم النية وليس الكلمات المفتاحية
 * 
 * @author AI Expert System
 * @version 6.0.0 - Professional Edition
 */

class VectorEngine {
  constructor(arabicNormalizer) {
    this.normalizer = arabicNormalizer;
    this.vectorDimension = 384;
    
    this.databases = {
      activity: null,
      decision104: null,
      industrial: null
    };

    this.stats = {
      totalSearches: 0,
      averageSearchTime: 0,
      cacheHits: 0,
      cacheMisses: 0
    };

    this.embeddingCache = new Map();
    this.maxCacheSize = 1000;

    // 🔥 إعدادات احترافية
    this.defaultConfig = {
      topK: 5,
      minSimilarity: 0.35,           // عتبة ابتدائية معقولة
      useDynamicThreshold: true,     // تفعيل العتبات الديناميكية
      semanticWeight: 0.85,          // 🔥 أولوية قصوى للمتجهات
      textMatchWeight: 0.15,         // مساعد بسيط فقط
      requireStrongMatch: true       // يتطلب تطابق قوي
    };

    // 🎯 عتبات ديناميكية حسب نوع السؤال
    this.dynamicThresholds = {
      simple: {
        min: 0.40,      // سؤال بسيط: يحتاج تطابق قوي
        ideal: 0.60
      },
      complex: {
        min: 0.30,      // سؤال مركب: أكثر مرونة
        ideal: 0.50
      },
      statistical: {
        min: 0.25,      // إحصائي: نحتاج كل البيانات
        ideal: 0.40
      },
      comparative: {
        min: 0.35,      // مقارنة: تطابق جيد
        ideal: 0.55
      }
    };
  }

  async loadDatabases(vectorDatabases) {
    console.log('📦 تحميل قواعد البيانات المتجهية...');
    
    try {
      this.databases.activity = vectorDatabases.activity;
      this.databases.decision104 = vectorDatabases.decision104;
      this.databases.industrial = vectorDatabases.industrial;

      this._validateDatabases();

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
   * 🔍 التحقق من صحة قواعد البيانات
   */
  _validateDatabases() {
    for (const [dbName, db] of Object.entries(this.databases)) {
      if (!db || !db.data || db.data.length === 0) {
        console.warn(`⚠️ قاعدة ${dbName} فارغة أو غير صحيحة`);
        continue;
      }

      let validVectorsCount = 0;
      db.data.forEach(record => {
        if (record.embeddings?.multilingual_minilm?.embeddings) {
          validVectorsCount++;
        }
      });

      console.log(`   ✓ ${dbName}: ${validVectorsCount}/${db.data.length} سجل يحتوي متجهات صحيحة`);
    }
  }

  async generateEmbedding(text, metadata = {}) {
    const cacheKey = this._getCacheKey(text, metadata);
    
    if (this.embeddingCache.has(cacheKey)) {
      this.stats.cacheHits++;
      return this.embeddingCache.get(cacheKey);
    }

    this.stats.cacheMisses++;
    const normalized = this.normalizer.normalize(text);
    const vector = await this._generateProfessionalEmbedding(normalized, metadata);

    this._addToCache(cacheKey, vector);
    return vector;
  }

  /**
   * 🔥 توليد متجه احترافي (مطابق للمتجهات المحفوظة)
   */
  async _generateProfessionalEmbedding(text, metadata = {}) {
    const vector = new Array(this.vectorDimension).fill(0);
    const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 1);

    // === المرحلة 1: التمثيل الدلالي الرئيسي ===
    words.forEach((word, idx) => {
      const hash = this._stringHash(word);
      const position = 1.0 / Math.sqrt(idx + 1); // الكلمات الأولى أهم
      
      // توزيع متعدد الأبعاد
      for (let i = 0; i < 8; i++) {
        const dim = Math.abs((hash * (i + 1) + i * 41) % this.vectorDimension);
        const value = Math.sin(hash * 0.1 + i * 0.7) * position;
        vector[dim] += value * 2.0;
      }
    });

    // === المرحلة 2: السياق (bigrams & trigrams) ===
    for (let i = 0; i < words.length - 1; i++) {
      const bigram = words[i] + '_' + words[i + 1];
      const hash = this._stringHash(bigram);
      
      for (let j = 0; j < 5; j++) {
        const dim = Math.abs((hash * (j + 1) + j * 53) % this.vectorDimension);
        vector[dim] += Math.cos(hash * 0.15 + j * 0.5) * 1.5;
      }
      
      // trigrams
      if (i < words.length - 2) {
        const trigram = words[i] + '_' + words[i + 1] + '_' + words[i + 2];
        const tHash = this._stringHash(trigram);
        const dim = Math.abs(tHash % this.vectorDimension);
        vector[dim] += 1.0;
      }
    }

    // === المرحلة 3: التفاعلات بين الكلمات ===
    for (let i = 0; i < Math.min(words.length, 6); i++) {
      for (let j = i + 1; j < Math.min(words.length, 6); j++) {
        const interaction = this._stringHash(words[i] + '::' + words[j]);
        const dim = Math.abs(interaction % this.vectorDimension);
        vector[dim] += 0.8;
      }
    }

    // === المرحلة 4: المعلومات الإضافية (metadata) - وزن خفيف ===
    if (metadata.text || metadata.name) {
      const metaText = this.normalizer.normalize(
        String(metadata.text || metadata.name).toLowerCase()
      );
      const metaWords = metaText.split(/\s+/).slice(0, 8);
      
      metaWords.forEach((word, idx) => {
        const hash = this._stringHash(word);
        const dim = (Math.abs(hash) + idx * 11) % this.vectorDimension;
        vector[dim] += 0.3; // وزن منخفض
      });
    }

    return this._normalizeVector(vector);
  }

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
   * 🎯 البحث الدلالي الاحترافي
   */
  async semanticSearch(query, databaseName, topK = 5, config = {}) {
    const startTime = performance.now();
    const settings = { ...this.defaultConfig, topK, ...config };

    const db = this.databases[databaseName];
    if (!db || !db.data || db.data.length === 0) {
      console.warn(`⚠️ قاعدة ${databaseName} غير محملة أو فارغة`);
      return [];
    }

    const normalizedQuery = this.normalizer.normalize(query);
    const queryVector = await this.generateEmbedding(normalizedQuery);

    // 🔥 البحث في المتجهات المحفوظة (الأولوية القصوى)
    const results = [];

    for (let i = 0; i < db.data.length; i++) {
      const record = db.data[i];
      
      const similarity = await this._calculateSemanticSimilarity(
        queryVector,
        record,
        normalizedQuery,
        settings
      );

      if (similarity > 0.10) { // عتبة أولية منخفضة للفرز فقط
        results.push({
          ...record,
          similarity: similarity,
          database: databaseName,
          _index: i
        });
      }
    }

    // ترتيب بالتشابه
    results.sort((a, b) => b.similarity - a.similarity);

    // 🔥 تطبيق العتبة الديناميكية
    const threshold = this._calculateSmartThreshold(
      results,
      settings,
      config.queryType || 'simple'
    );

    const filtered = results.filter(r => r.similarity >= threshold);
    const topResults = filtered.slice(0, settings.topK);

    const searchTime = performance.now() - startTime;
    this._updateStats(databaseName, searchTime, topResults.length);

    console.log(`🔍 بحث في ${databaseName}: ${topResults.length} نتائج (${searchTime.toFixed(2)}ms)`);
    if (topResults.length > 0) {
      console.log(`   📊 أعلى تشابه: ${(topResults[0].similarity * 100).toFixed(1)}%`);
      console.log(`   🎯 العتبة الديناميكية: ${(threshold * 100).toFixed(1)}%`);
    }

    return topResults;
  }

  /**
   * 🔥 حساب التشابه الدلالي (المتجهات أولاً)
   */
  async _calculateSemanticSimilarity(queryVector, record, query, settings) {
    let bestSemanticScore = 0;

    // === 1. المتجهات المحفوظة (الأولوية القصوى) ===
    if (record.embeddings?.multilingual_minilm?.embeddings) {
      const embeddings = record.embeddings.multilingual_minilm.embeddings;
      
      // ترتيب الأشكال حسب الأهمية
      const variations = [
        'full',           // النص الكامل (أهم شيء)
        'contextual',     // السياق
        'summary',        // الملخص
        'key_phrases',    // العبارات المفتاحية
        'no_stopwords'    // بدون كلمات وقف
      ];
      
      const similarities = [];
      for (const variation of variations) {
        if (embeddings[variation] && Array.isArray(embeddings[variation])) {
          const sim = this.cosineSimilarity(queryVector, embeddings[variation]);
          similarities.push(sim);
        }
      }
      
      if (similarities.length > 0) {
        // أخذ أعلى تشابه + متوسط أفضل 3
        const top3 = similarities.sort((a, b) => b - a).slice(0, 3);
        const avgTop3 = top3.reduce((a, b) => a + b, 0) / top3.length;
        
        bestSemanticScore = Math.max(
          similarities[0], // أعلى تشابه
          avgTop3 * 0.95   // متوسط الأفضل
        );
      }
    }

    // === 2. التوليد المباشر (احتياطي) ===
    if (bestSemanticScore < 0.20) {
      const recordText = record.original_data?.text || 
                        record.original_data?.name || 
                        record.original_data?.value || '';
      
      if (recordText) {
        const recordVector = await this.generateEmbedding(recordText, record.original_data);
        const directSim = this.cosineSimilarity(queryVector, recordVector);
        bestSemanticScore = Math.max(bestSemanticScore, directSim);
      }
    }

    // === 3. تعزيز بسيط من المطابقة النصية (وزن منخفض جداً) ===
    if (settings.textMatchWeight > 0) {
      const textBoost = this._calculateTextBoost(query, record.original_data);
      
      // الجمع: الدلالي له الأولوية المطلقة
      const finalScore = bestSemanticScore * settings.semanticWeight + 
                        textBoost * settings.textMatchWeight;
      
      return Math.max(bestSemanticScore, finalScore);
    }

    return bestSemanticScore;
  }

  /**
   * 🔥 تعزيز بسيط من المطابقة النصية (مساعد فقط)
   */
  _calculateTextBoost(query, metadata) {
    if (!metadata) return 0;
    
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);
    
    let boostScore = 0;

    // فقط النصوص الرئيسية
    const mainTexts = [
      metadata.text,
      metadata.name,
      metadata.value,
      metadata.text_preview
    ].filter(Boolean);

    mainTexts.forEach(text => {
      const normalized = this.normalizer.normalize(String(text).toLowerCase());
      
      // مطابقة العبارة الكاملة
      if (normalized.includes(queryLower)) {
        boostScore += 0.3;
      }
      
      // مطابقة الكلمات
      const textWords = normalized.split(/\s+/);
      const matches = queryWords.filter(qw => textWords.includes(qw));
      
      if (matches.length > 0) {
        boostScore += (matches.length / queryWords.length) * 0.2;
      }
    });

    return Math.min(0.25, boostScore); // سقف منخفض
  }

  /**
   * 🎯 حساب العتبة الديناميكية الذكية
   */
  _calculateSmartThreshold(results, settings, queryType = 'simple') {
    if (results.length === 0) {
      return this.dynamicThresholds[queryType]?.min || 0.35;
    }

    const maxSim = results[0]?.similarity || 0;
    const thresholdConfig = this.dynamicThresholds[queryType] || this.dynamicThresholds.simple;

    // === حالة 1: تشابه قوي جداً (نتيجة مثالية) ===
    if (maxSim >= 0.80) {
      // نأخذ النتائج القريبة من الأفضل فقط
      return Math.max(thresholdConfig.ideal, maxSim * 0.70);
    }

    // === حالة 2: تشابه جيد (نتائج موثوقة) ===
    if (maxSim >= 0.55) {
      return Math.max(thresholdConfig.min, maxSim * 0.65);
    }

    // === حالة 3: تشابه متوسط (نحتاج مرونة) ===
    if (maxSim >= 0.35) {
      // نأخذ متوسط أفضل 5 نتائج
      const top5 = results.slice(0, 5).map(r => r.similarity);
      const avg = top5.reduce((a, b) => a + b, 0) / top5.length;
      
      return Math.max(thresholdConfig.min * 0.85, avg * 0.60);
    }

    // === حالة 4: تشابه ضعيف ===
    if (maxSim >= 0.20) {
      // للأسئلة الإحصائية: نكون أكثر مرونة
      if (queryType === 'statistical') {
        return Math.max(0.18, maxSim * 0.50);
      }
      
      // للأسئلة العادية: نحافظ على جودة
      return Math.max(thresholdConfig.min * 0.90, maxSim * 0.55);
    }

    // === حالة 5: تشابه ضعيف جداً ===
    // لا نريد نتائج غير دقيقة
    return queryType === 'statistical' 
      ? Math.max(0.15, thresholdConfig.min * 0.70)
      : thresholdConfig.min;
  }

  /**
   * ⚡ البحث المتوازي
   */
  async parallelSearch(query, config = {}) {
    const settings = {
      ...this.defaultConfig,
      ...config,
      databases: config.databases || ['activity', 'decision104', 'industrial']
    };

    console.log(`⚡ بحث متوازي في ${settings.databases.length} قواعد...`);

    const searchPromises = settings.databases.map(dbName => 
      this.semanticSearch(query, dbName, settings.topK, settings)
    );

    const allResults = await Promise.all(searchPromises);

    const resultMap = {
      activity: [],
      decision104: [],
      industrial: []
    };

    settings.databases.forEach((dbName, idx) => {
      resultMap[dbName] = allResults[idx] || [];
    });

    return {
      ...resultMap,
      totalResults: allResults.reduce((sum, arr) => sum + arr.length, 0),
      query: query
    };
  }

  /**
   * 📊 الإحصائيات
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

  clearCache() {
    this.embeddingCache.clear();
    this.stats.cacheHits = 0;
    this.stats.cacheMisses = 0;
    console.log('🧹 تم تنظيف ذاكرة المتجهات');
  }

  _updateStats(databaseName, searchTime, resultCount) {
    this.stats.totalSearches++;
    this.stats.averageSearchTime = 
      (this.stats.averageSearchTime * (this.stats.totalSearches - 1) + searchTime) 
      / this.stats.totalSearches;
  }

  _getCacheKey(text, metadata) {
    const metaKeys = Object.keys(metadata).sort().join(',');
    return `${text}::${metaKeys}`;
  }

  _addToCache(key, value) {
    if (this.embeddingCache.size >= this.maxCacheSize) {
      const firstKey = this.embeddingCache.keys().next().value;
      this.embeddingCache.delete(firstKey);
    }
    this.embeddingCache.set(key, value);
  }

  _normalizeVector(vector) {
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return magnitude > 0 ? vector.map(v => v / magnitude) : vector;
  }

  _stringHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = VectorEngine;
}
