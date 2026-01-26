/**
 * 🚀 محرك المتجهات والبحث الدلالي - النسخة المُصلحة
 * Vector Engine & Semantic Search - Fixed Version
 * 
 * @author AI Expert System
 * @version 3.0.0 - Fixed
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

    this.defaultConfig = {
      topK: 5,
      minSimilarity: 0.25,      // ⬇️ عتبة أقل للسماح بنتائج أكثر
      useHybridSearch: true,
      keywordWeight: 0.6,        // ⬆️ وزن أكبر للكلمات المفتاحية
      semanticWeight: 0.4,
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
    const vector = await this._generateHybridEmbedding(normalized, metadata);

    this._addToCache(cacheKey, vector);
    return vector;
  }

  async _generateHybridEmbedding(text, metadata = {}) {
    const vector = new Array(this.vectorDimension).fill(0);
    const queryWords = text.toLowerCase().split(/\s+/).filter(w => w.length > 1);

    // === 1. مطابقة النص الرئيسي (أعلى أولوية) ===
    const mainTexts = [
      metadata.text,
      metadata.name,
      metadata.value
    ].filter(Boolean);

    mainTexts.forEach((mainText, idx) => {
      const normalized = this.normalizer.normalize(String(mainText).toLowerCase());
      const mainWords = normalized.split(/\s+/);
      
      // تطابق كامل
      const exactMatches = queryWords.filter(qw => mainWords.includes(qw));
      if (exactMatches.length > 0) {
        const matchRatio = exactMatches.length / queryWords.length;
        vector[100 + idx] += 5.0 * matchRatio; // 🔥 وزن عالي جداً
      }
      
      // تطابق جزئي
      queryWords.forEach((qWord, qIdx) => {
        mainWords.forEach(mWord => {
          if (mWord.includes(qWord) || qWord.includes(mWord)) {
            vector[150 + (qIdx % 100)] += 2.0;
          }
        });
      });
    });

    // === 2. مطابقة الكلمات المفتاحية ===
    if (metadata.keywords && Array.isArray(metadata.keywords)) {
      metadata.keywords.forEach((keyword, idx) => {
        const kw = this.normalizer.normalize(String(keyword).toLowerCase());
        const kwWords = kw.split(/\s+/);
        
        const matches = queryWords.filter(qw => 
          kwWords.some(kw => kw === qw || kw.includes(qw) || qw.includes(kw))
        );
        
        if (matches.length > 0) {
          const position = idx % this.vectorDimension;
          vector[position] += 3.0 * (matches.length / queryWords.length);
        }
      });
    }

    // === 3. مطابقة المرادفات ===
    if (metadata.synonyms && Array.isArray(metadata.synonyms)) {
      metadata.synonyms.forEach((synonym, idx) => {
        const syn = this.normalizer.normalize(String(synonym).toLowerCase());
        const synWords = syn.split(/\s+/);
        
        const matches = queryWords.filter(qw => 
          synWords.some(sw => sw === qw || sw.includes(qw) || qw.includes(sw))
        );
        
        if (matches.length > 0) {
          const position = (idx + 50) % this.vectorDimension;
          vector[position] += 2.5 * (matches.length / queryWords.length);
        }
      });
    }

    // === 4. مطابقة النوايا ===
    if (metadata.intent && Array.isArray(metadata.intent)) {
      metadata.intent.forEach((intentPhrase, idx) => {
        const intent = this.normalizer.normalize(String(intentPhrase).toLowerCase());
        const intentWords = intent.split(/\s+/);
        
        const matches = queryWords.filter(qw => 
          intentWords.some(iw => iw.includes(qw) || qw.includes(iw))
        );
        
        if (matches.length > 0) {
          const position = (idx + 200) % this.vectorDimension;
          vector[position] += 2.0 * (matches.length / queryWords.length);
        }
      });
    }

    // === 5. تمثيل دلالي بسيط ===
    queryWords.forEach((word, wordIdx) => {
      const hash = this._stringHash(word);
      const importance = 1 / Math.sqrt(wordIdx + 1);
      
      for (let i = 0; i < 3; i++) {
        const position = Math.abs(hash + i * 97) % this.vectorDimension;
        vector[position] += Math.sin(hash + i) * importance * 0.3;
      }
    });

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
      console.warn(`⚠️ قاعدة ${databaseName} غير محملة`);
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

  async _calculateRecordSimilarity(queryVector, record, normalizedQuery, settings) {
    let maxSimilarity = 0;

    // === الطريقة 1: مطابقة مباشرة (الأقوى) ===
    const recordVector = await this.generateEmbedding(
      record.original_data?.text || record.original_data?.name || '', 
      record.original_data
    );
    const directSimilarity = this.cosineSimilarity(queryVector, recordVector);
    maxSimilarity = Math.max(maxSimilarity, directSimilarity);

    // === الطريقة 2: المتجهات المحفوظة ===
    if (record.embeddings?.multilingual_minilm?.embeddings) {
      const embeddings = record.embeddings.multilingual_minilm.embeddings;
      const variations = ['full', 'summary', 'contextual', 'key_phrases', 'no_stopwords'];
      
      for (const variation of variations) {
        if (embeddings[variation] && Array.isArray(embeddings[variation])) {
          const similarity = this.cosineSimilarity(queryVector, embeddings[variation]);
          maxSimilarity = Math.max(maxSimilarity, similarity);
        }
      }
    }

    // === الطريقة 3: Keyword Boosting ===
    if (settings.useHybridSearch) {
      const keywordBoost = this._calculateKeywordBoost(normalizedQuery, record.original_data);
      
      // الجمع الهجين
      const hybridScore = Math.max(
        maxSimilarity,
        directSimilarity * settings.semanticWeight + keywordBoost * settings.keywordWeight,
        keywordBoost * 0.9 // في حالة المطابقة القوية
      );
      
      maxSimilarity = hybridScore;
    }

    return maxSimilarity;
  }

  _calculateKeywordBoost(query, metadata) {
    if (!metadata) return 0;
    
    const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 1);
    if (queryWords.length === 0) return 0;

    let totalScore = 0;
    let matchCount = 0;

    const searchFields = [
      { 
        field: metadata.text || metadata.name || '', 
        weight: 4.0,  // 🔥 أعلى وزن
        name: 'text'
      },
      { 
        field: (metadata.keywords || []).join(' '), 
        weight: 3.0,
        name: 'keywords'
      },
      { 
        field: (metadata.synonyms || []).join(' '), 
        weight: 2.5,
        name: 'synonyms'
      },
      { 
        field: (metadata.intent || []).join(' '), 
        weight: 2.0,
        name: 'intent'
      }
    ];

    searchFields.forEach(({ field, weight, name }) => {
      if (!field) return;
      
      const normalized = this.normalizer.normalize(String(field).toLowerCase());
      const fieldWords = normalized.split(/\s+/);
      
      queryWords.forEach(qWord => {
        // مطابقة تامة
        if (fieldWords.includes(qWord)) {
          totalScore += weight * 1.0;
          matchCount++;
        }
        // مطابقة قوية (تحتوي بعضها)
        else if (fieldWords.some(fw => 
          (fw.includes(qWord) && fw.length - qWord.length <= 2) ||
          (qWord.includes(fw) && qWord.length - fw.length <= 2)
        )) {
          totalScore += weight * 0.7;
          matchCount++;
        }
        // مطابقة ضعيفة
        else if (fieldWords.some(fw => fw.includes(qWord) || qWord.includes(fw))) {
          totalScore += weight * 0.4;
          matchCount++;
        }
      });
    });

    if (matchCount === 0) return 0;

    // تطبيع النتيجة
    const normalizedScore = totalScore / (queryWords.length * 4.0);
    return Math.min(1.0, normalizedScore);
  }

  _calculateDynamicThreshold(results, minThreshold = 0.25) {
    if (results.length === 0) return minThreshold;

    const maxSim = results[0]?.similarity || 0;

    // استعلام ضعيف جداً
    if (maxSim < 0.35) return Math.max(0.15, minThreshold * 0.6);

    // استعلام دقيق
    if (maxSim > 0.85) return Math.max(0.55, maxSim * 0.75);

    // وسط
    const topSims = results.slice(0, Math.min(10, results.length)).map(r => r.similarity);
    const median = this._calculateMedian(topSims);

    return Math.max(minThreshold, median * 0.6);
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

    return {
      activity: allResults[settings.databases.indexOf('activity')] || [],
      decision104: allResults[settings.databases.indexOf('decision104')] || [],
      industrial: allResults[settings.databases.indexOf('industrial')] || [],
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
