/**
 * 🚀 محرك المتجهات والبحث الدلالي - فهم عميق
 * Vector Engine - Pure Semantic Understanding
 * 
 * @author AI Expert System
 * @version 4.0.0 - Semantic-First Approach
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

    // 🔥 تغيير جذري: الأولوية للدلالي على الكلمات المفتاحية
    this.defaultConfig = {
      topK: 5,
      minSimilarity: 0.20,        // عتبة منخفضة
      useHybridSearch: true,
      semanticWeight: 0.7,         // 🔥 الدلالي أولاً
      keywordWeight: 0.3,          // 🔥 الكلمات مساعدة فقط
      dynamicThreshold: true
    };
  }

  async loadDatabases(vectorDatabases) {
    console.log('📦 تحميل قواعد البيانات المتجهية...');
    
    try {
      this.databases.activity = vectorDatabases.activity;
      this.databases.decision104 = vectorDatabases.decision104;
      this.databases.industrial = vectorDatabases.industrial;

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

  _buildSearchIndexes() {
    for (const [dbName, db] of Object.entries(this.databases)) {
      if (!db || !db.data) continue;

      db.keywordIndex = new Map();
      
      db.data.forEach((record, idx) => {
        const searchableText = [
          record.original_data?.text || '',
          record.original_data?.name || '',
          record.original_data?.value || '',
          ...(record.original_data?.keywords || []),
          ...(record.original_data?.synonyms || []),
          ...(record.original_data?.intent || [])
        ];

        searchableText.forEach(text => {
          if (!text) return;
          const normalized = this.normalizer.normalize(String(text).toLowerCase());
          const words = normalized.split(/\s+/);
          
          words.forEach(word => {
            if (word.length < 2) return;
            if (!db.keywordIndex.has(word)) {
              db.keywordIndex.set(word, []);
            }
            if (!db.keywordIndex.get(word).includes(idx)) {
              db.keywordIndex.get(word).push(idx);
            }
          });
        });
      });

      console.log(`📇 بناء فهرس ${dbName}: ${db.keywordIndex.size} كلمة`);
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
    const vector = await this._generateSemanticEmbedding(normalized, metadata);

    this._addToCache(cacheKey, vector);
    return vector;
  }

  /**
   * 🔥 توليد متجه دلالي بحت (تقليل الاعتماد على الكلمات المفتاحية)
   */
  async _generateSemanticEmbedding(text, metadata = {}) {
    const vector = new Array(this.vectorDimension).fill(0);
    const queryWords = text.toLowerCase().split(/\s+/).filter(w => w.length > 1);

    // === 1. التمثيل الدلالي الرئيسي (الأولوية العليا) ===
    queryWords.forEach((word, wordIdx) => {
      const hash = this._stringHash(word);
      const importance = 1 / Math.sqrt(wordIdx + 1); // الكلمات الأولى أهم
      
      // توزيع متعدد الأبعاد
      for (let i = 0; i < 5; i++) {
        const position = Math.abs(hash + i * 97) % this.vectorDimension;
        vector[position] += Math.sin(hash + i) * importance * 1.5;
      }
      
      // نمط تفاعلي بين الكلمات
      if (wordIdx > 0) {
        const prevWord = queryWords[wordIdx - 1];
        const combinedHash = this._stringHash(prevWord + word);
        const pos = Math.abs(combinedHash) % this.vectorDimension;
        vector[pos] += 1.2;
      }
    });

    // === 2. السياق الدلالي من الـ metadata (وزن متوسط) ===
    const contextTexts = [
      metadata.text,
      metadata.name,
      metadata.value
    ].filter(Boolean);

    contextTexts.forEach((contextText, idx) => {
      const normalized = this.normalizer.normalize(String(contextText).toLowerCase());
      const contextWords = normalized.split(/\s+/).slice(0, 10); // أول 10 كلمات فقط
      
      contextWords.forEach(cWord => {
        const hash = this._stringHash(cWord);
        const position = (Math.abs(hash) + idx * 50) % this.vectorDimension;
        vector[position] += 0.8; // وزن أقل من الاستعلام نفسه
      });
    });

    // === 3. الكلمات المفتاحية والمرادفات (مساعدة فقط) ===
    if (metadata.keywords && Array.isArray(metadata.keywords)) {
      metadata.keywords.slice(0, 5).forEach((keyword, idx) => {
        const kw = this.normalizer.normalize(String(keyword).toLowerCase());
        const kwWords = kw.split(/\s+/);
        
        kwWords.forEach(kwWord => {
          const hash = this._stringHash(kwWord);
          const position = (Math.abs(hash) + idx * 30) % this.vectorDimension;
          vector[position] += 0.5; // وزن منخفض
        });
      });
    }

    if (metadata.synonyms && Array.isArray(metadata.synonyms)) {
      metadata.synonyms.slice(0, 5).forEach((synonym, idx) => {
        const syn = this.normalizer.normalize(String(synonym).toLowerCase());
        const synWords = syn.split(/\s+/);
        
        synWords.forEach(synWord => {
          const hash = this._stringHash(synWord);
          const position = (Math.abs(hash) + idx * 40) % this.vectorDimension;
          vector[position] += 0.4; // وزن منخفض
        });
      });
    }

    // === 4. النوايا (إضافة خفيفة) ===
    if (metadata.intent && Array.isArray(metadata.intent)) {
      metadata.intent.slice(0, 3).forEach((intentPhrase, idx) => {
        const intent = this.normalizer.normalize(String(intentPhrase).toLowerCase());
        const intentWords = intent.split(/\s+/);
        
        intentWords.forEach(iWord => {
          const hash = this._stringHash(iWord);
          const position = (Math.abs(hash) + idx * 60) % this.vectorDimension;
          vector[position] += 0.3; // وزن منخفض جداً
        });
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

    const results = [];

    for (let i = 0; i < db.data.length; i++) {
      const record = db.data[i];
      
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

    results.sort((a, b) => b.similarity - a.similarity);

    const threshold = settings.dynamicThreshold 
      ? this._calculateDynamicThreshold(results, settings.minSimilarity)
      : settings.minSimilarity;

    const filtered = results.filter(r => r.similarity >= threshold);
    const topResults = filtered.slice(0, settings.topK);

    const searchTime = performance.now() - startTime;
    this._updateStats(databaseName, searchTime, topResults.length);

    console.log(`🔍 بحث في ${databaseName}: ${topResults.length} نتائج (${searchTime.toFixed(2)}ms)`);
    if (topResults.length > 0) {
      console.log(`   📊 أعلى تشابه: ${(topResults[0].similarity * 100).toFixed(1)}%`);
    }

    return topResults;
  }

  /**
   * 🔥 حساب التشابه: الأولوية للدلالي
   */
  async _calculateRecordSimilarity(queryVector, record, normalizedQuery, settings) {
    let semanticScore = 0;

    // === 1. المتجهات المحفوظة (الأولوية القصوى) ===
    if (record.embeddings?.multilingual_minilm?.embeddings) {
      const embeddings = record.embeddings.multilingual_minilm.embeddings;
      const variations = ['full', 'contextual', 'summary', 'key_phrases', 'no_stopwords'];
      
      const similarities = [];
      for (const variation of variations) {
        if (embeddings[variation] && Array.isArray(embeddings[variation])) {
          const sim = this.cosineSimilarity(queryVector, embeddings[variation]);
          similarities.push(sim);
        }
      }
      
      if (similarities.length > 0) {
        // أخذ أعلى تشابه + متوسط التشابهات
        semanticScore = Math.max(
          Math.max(...similarities),
          similarities.reduce((a, b) => a + b, 0) / similarities.length
        );
      }
    }

    // === 2. التوليد المباشر للمتجه ===
    const recordVector = await this.generateEmbedding(
      record.original_data?.text || record.original_data?.name || '', 
      record.original_data
    );
    const directSimilarity = this.cosineSimilarity(queryVector, recordVector);
    semanticScore = Math.max(semanticScore, directSimilarity);

    // === 3. Keyword Boost (مساعد فقط، وزن منخفض) ===
    let keywordBoost = 0;
    if (settings.useHybridSearch) {
      keywordBoost = this._calculateKeywordBoost(normalizedQuery, record.original_data);
    }

    // 🔥 الجمع: الدلالي أولاً، الكلمات مساعدة
    const finalScore = Math.max(
      semanticScore, // الدلالي وحده
      semanticScore * settings.semanticWeight + keywordBoost * settings.keywordWeight // هجين
    );

    return finalScore;
  }

  /**
   * 🔥 Keyword Boost: مساعد فقط، ليس أساسي
   */
  _calculateKeywordBoost(query, metadata) {
    if (!metadata) return 0;
    
    const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 1);
    if (queryWords.length === 0) return 0;

    let totalScore = 0;
    let matchCount = 0;

    const searchFields = [
      { field: metadata.text || metadata.name || '', weight: 2.0 },
      { field: (metadata.keywords || []).join(' '), weight: 1.5 },
      { field: (metadata.synonyms || []).join(' '), weight: 1.2 },
      { field: (metadata.intent || []).join(' '), weight: 1.0 }
    ];

    searchFields.forEach(({ field, weight }) => {
      if (!field) return;
      
      const normalized = this.normalizer.normalize(String(field).toLowerCase());
      const fieldWords = normalized.split(/\s+/);
      
      queryWords.forEach(qWord => {
        if (fieldWords.includes(qWord)) {
          totalScore += weight * 1.0;
          matchCount++;
        } else if (fieldWords.some(fw => fw.includes(qWord) || qWord.includes(fw))) {
          totalScore += weight * 0.4;
          matchCount++;
        }
      });
    });

    if (matchCount === 0) return 0;

    const normalizedScore = totalScore / (queryWords.length * 2.0);
    return Math.min(1.0, normalizedScore);
  }

  _calculateDynamicThreshold(results, minThreshold = 0.20) {
    if (results.length === 0) return minThreshold;

    const maxSim = results[0]?.similarity || 0;

    // استعلام ضعيف جداً
    if (maxSim < 0.30) return Math.max(0.12, minThreshold * 0.6);

    // استعلام دقيق
    if (maxSim > 0.80) return Math.max(0.50, maxSim * 0.7);

    // وسط
    const topSims = results.slice(0, Math.min(10, results.length)).map(r => r.similarity);
    const median = this._calculateMedian(topSims);

    return Math.max(minThreshold, median * 0.55);
  }

  _calculateMedian(arr) {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 
      ? (sorted[mid - 1] + sorted[mid]) / 2 
      : sorted[mid];
  }

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

  async crossReferenceSearch(entities, config = {}) {
    const results = {
      activity: null,
      location: null,
      decision104: null,
      crossMatch: false
    };

    const settings = { ...this.defaultConfig, topK: 3, ...config };

    if (entities.activityQuery) {
      const activityResults = await this.semanticSearch(
        entities.activityQuery, 
        'activity', 
        settings.topK,
        settings
      );
      results.activity = activityResults[0] || null;
    }

    if (entities.locationQuery) {
      const locationResults = await this.semanticSearch(
        entities.locationQuery, 
        'industrial', 
        settings.topK,
        settings
      );
      results.location = locationResults[0] || null;
    }

    if (entities.activityQuery) {
      const decisionResults = await this.semanticSearch(
        entities.activityQuery, 
        'decision104', 
        settings.topK,
        settings
      );
      results.decision104 = decisionResults[0] || null;
    }

    results.crossMatch = !!(results.activity && results.location);

    return results;
  }

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
