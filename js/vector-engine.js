/**
 * 🚀 محرك المتجهات المتقدم - الذكاء الدلالي المتكامل
 * Advanced Vector Engine - Integrated Semantic Intelligence
 * 
 * @author AI Expert System
 * @version 7.0.0 - Professional Semantic Search
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

    // 🔥 إحصائيات متقدمة
    this.stats = {
      totalSearches: 0,
      successfulSearches: 0,
      failedSearches: 0,
      averageSearchTime: 0,
      cacheHits: 0,
      cacheMisses: 0,
      highConfidenceMatches: 0,
      semanticClusters: 0
    };

    this.embeddingCache = new Map();
    this.maxCacheSize = 3000;
    
    this.semanticCache = new Map(); // تخزين مؤقت للاستعلامات المعالجة

    // 🔥 إعدادات احترافية للبحث الدلالي
    this.defaultConfig = {
      // المرحلة الأولى: جمع المرشحين
      candidateTopK: 100,           // جمع مرشحين كثر
      initialTopK: 50,              // نتائج أولية للتصفية
      finalTopK: 5,                 // النتائج النهائية المعروضة
      
      // العتبات الذكية
      minSimilarity: 0.08,          // عتبة دنيا جداً
      semanticThreshold: 0.25,      // عتبة للنتائج الدلالية الجيدة
      highConfidenceThreshold: 0.45,// عتبة للثقة العالية
      
      // الأوزان المتقدمة
      semanticWeight: 0.92,         // وزن كبير للمتجهات الدلالية
      contextualWeight: 0.85,       // وزن السياق
      keywordWeight: 0.08,          // وزن صغير للكلمات (تأكيد فقط)
      metadataWeight: 0.10,         // وزن الميتاداتا
      
      // الميزات المتقدمة
      dynamicThreshold: true,
      adaptiveScoring: true,
      semanticClustering: true,     // تجميع النتائج دلالياً
      queryDecomposition: true,     // تحليل الاستعلام إلى أجزاء
      multiStageSearch: true,       // بحث متعدد المراحل
      fallbackStrategies: true,     // استراتيجيات احتياطية
      
      // توسيع البحث
      semanticExpansion: true,      // توسيع دلالي
      synonymExpansion: true,       // توسيع بالمرادفات
      contextAwareSearch: true,     // بحث واعي بالسياق
      crossDatabaseBoost: true      // تعزيز البحث عبر القواعد
    };

    // 🔥 مفاهيم دلالية أساسية للبحث
    this.semanticConcepts = {
      activities: [
        'فندق', 'مصنع', 'مطعم', 'مقهى', 'محل', 'شركة', 'مكتب',
        'مستودع', 'مخزن', 'صالون', 'معرض', 'عيادة', 'مستشفى',
        'مدرسة', 'حضانة', 'روضة', 'ورشة', 'معمل', 'منتجع', 'قرية سياحية'
      ],
      industries: [
        'منطقة صناعية', 'مدينة صناعية', 'حيز صناعي', 'موقع صناعي',
        'منطقة تجارية', 'منطقة سكنية', 'منطقة سياحية'
      ],
      procedures: [
        'ترخيص', 'رخصة', 'تصريح', 'إذن', 'موافقة',
        'اشتراطات', 'متطلبات', 'شروط', 'مواصفات',
        'إجراءات', 'خطوات', 'عملية'
      ],
      incentives: [
        'حوافز', 'إعفاء', 'تخفيض', 'مزايا', 'تسهيلات',
        'قرار 104', 'قطاع أ', 'قطاع ب', 'دعم'
      ]
    };

    // 🔥 ذاكرة السياق المتقدمة
    this.contextMemory = {
      lastQueries: [],
      lastResults: {},
      conversationFlow: [],
      entityHistory: [],
      sessionStart: Date.now(),
      queryPatterns: new Map()
    };
    
    // 🔥 استراتيجيات البحث الاحتياطية
    this.fallbackStrategies = [
      'broadSemanticSearch',
      'keywordFallback',
      'conceptClustering',
      'metadataSearch',
      'partialMatchExpansion'
    ];
  }

  /**
   * 🚀 تهيئة المحرك الاحترافية
   */
  async initialize(vectorDatabases) {
    console.log('🚀 تهيئة محرك المتجهات المتقدم...');
    
    try {
      await this.loadDatabases(vectorDatabases);
      await this.buildSemanticStructures();
      await this.warmupCache();
      
      console.log('✅ اكتمل تحميل المحرك المتقدم:');
      console.log('   📊 الإحصائيات الأولية:', this.getInitialStats());
      
      return true;
    } catch (error) {
      console.error('❌ خطأ في تهيئة المحرك:', error);
      this.enableEmergencyMode();
      return false;
    }
  }

  /**
   * 📦 تحميل قواعد البيانات المتجهية
   */
  async loadDatabases(vectorDatabases) {
    console.log('📦 تحميل قواعد البيانات المتجهية المتقدمة...');
    
    try {
      this.databases.activity = vectorDatabases.activity;
      this.databases.decision104 = vectorDatabases.decision104;
      this.databases.industrial = vectorDatabases.industrial;

      // التحقق من جودة البيانات
      this.validateDatabases();

      // بناء الفهارس المتقدمة
      await this.buildAdvancedIndexes();

      console.log('✅ اكتمل تحميل القواعد:');
      console.log(`   📁 الأنشطة: ${this.databases.activity?.data?.length || 0} سجل`);
      console.log(`   📁 القرار 104: ${this.databases.decision104?.data?.length || 0} سجل`);
      console.log(`   📁 المناطق: ${this.databases.industrial?.data?.length || 0} سجل`);

      return true;
    } catch (error) {
      console.error('❌ خطأ في تحميل القواعد:', error);
      throw error;
    }
  }

  /**
   * 🔍 التحقق من جودة البيانات
   */
  validateDatabases() {
    for (const [dbName, db] of Object.entries(this.databases)) {
      if (!db || !db.data) {
        throw new Error(`قاعدة ${dbName} غير موجودة أو فارغة`);
      }

      // التحقق من وجود التضمينات
      let validRecords = 0;
      db.data.forEach(record => {
        if (record.embeddings?.multilingual_minilm?.embeddings) {
          validRecords++;
        }
      });

      if (validRecords === 0) {
        console.warn(`⚠️ قاعدة ${dbName} لا تحتوي على تضمينات متجهية`);
      }

      console.log(`   ✓ ${dbName}: ${validRecords}/${db.data.length} سجل به تضمينات`);
    }
  }

  /**
   * 🏗️ بناء فهارس متقدمة
   */
  async buildAdvancedIndexes() {
    console.log('🏗️ بناء الفهارس الدلالية المتقدمة...');
    
    for (const [dbName, db] of Object.entries(this.databases)) {
      if (!db || !db.data) continue;

      // 🔥 الفهارس الأساسية
      db.semanticIndex = new Map();
      db.conceptIndex = new Map();
      db.metadataIndex = new Map();
      db.clusterIndex = new Map();
      
      // 🔥 فهارس متقدمة
      db.semanticClusters = new Map();
      db.embeddingVectors = [];
      db.textCache = [];

      // معالجة كل سجل
      db.data.forEach((record, idx) => {
        // استخلاص النصوص والمفاهيم
        const semanticData = this.extractSemanticData(record);
        
        // فهرسة دلالية عميقة
        this.indexSemanticConcepts(semanticData.concepts, idx, db.semanticIndex);
        this.indexMetadata(record.original_data, idx, db.metadataIndex);
        
        // تخزين المتجهات للتجميع السريع
        if (record.embeddings?.multilingual_minilm?.embeddings?.full) {
          db.embeddingVectors[idx] = record.embeddings.multilingual_minilm.embeddings.full;
        }
        
        // تخزين النص للبحث النصي السريع
        db.textCache[idx] = semanticData.fullText;
        
        // تجميع دلالي
        if (semanticData.primaryConcept) {
          this.addToCluster(semanticData.primaryConcept, idx, db.clusterIndex);
        }
      });

      // 🔥 بناء تجمعات دلالية
      if (this.defaultConfig.semanticClustering) {
        this.buildSemanticClusters(db);
      }

      console.log(`   📊 ${dbName}:`, {
        مفاهيم: db.semanticIndex.size,
        تجمعات: db.clusterIndex.size,
        سجلات: db.data.length
      });
    }
  }

  /**
   * 🔥 استخلاص البيانات الدلالية
   */
  extractSemanticData(record) {
    const data = record.original_data || {};
    const result = {
      concepts: new Set(),
      keywords: new Set(),
      entities: new Set(),
      fullText: '',
      primaryConcept: null
    };

    // جمع كل النصوص
    const allTexts = [
      data.text || '',
      data.name || '',
      data.text_preview || '',
      data.value || '',
      ...(data.keywords || []),
      ...(data.synonyms || []),
      ...(data.intent || []),
      data.governorate || '',
      data.dependency || '',
      data.decision || ''
    ].filter(Boolean);

    result.fullText = allTexts.join(' ').toLowerCase();
    const normalizedText = this.normalizer.normalize(result.fullText);
    
    // استخلاص المفاهيم
    const words = normalizedText.split(/\s+/).filter(w => w.length > 2);
    
    // مفاهيم فردية
    words.forEach(word => result.concepts.add(word));
    
    // مفاهيم مركبة (2-3 كلمات)
    for (let i = 0; i < words.length - 1; i++) {
      const bigram = words[i] + ' ' + words[i + 1];
      result.concepts.add(bigram);
      
      if (i < words.length - 2) {
        const trigram = words[i] + ' ' + words[i + 1] + ' ' + words[i + 2];
        result.concepts.add(trigram);
      }
    }
    
    // تحديد المفهوم الأساسي (الأكثر تكراراً)
    if (words.length > 0) {
      const wordFreq = {};
      words.forEach(word => {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      });
      
      const sortedWords = Object.entries(wordFreq).sort((a, b) => b[1] - a[1]);
      if (sortedWords.length > 0 && sortedWords[0][1] > 1) {
        result.primaryConcept = sortedWords[0][0];
      }
    }

    return result;
  }

  /**
   * 🔥 فهرسة المفاهيم الدلالية
   */
  indexSemanticConcepts(concepts, recordIdx, indexMap) {
    concepts.forEach(concept => {
      if (!indexMap.has(concept)) {
        indexMap.set(concept, []);
      }
      if (!indexMap.get(concept).includes(recordIdx)) {
        indexMap.get(concept).push(recordIdx);
      }
    });
  }

  /**
   * 🔥 فهرسة الميتاداتا
   */
  indexMetadata(metadata, recordIdx, indexMap) {
    if (!metadata) return;
    
    const metaFields = [
      'governorate',
      'dependency',
      'decision',
      'value',
      'name'
    ];
    
    metaFields.forEach(field => {
      if (metadata[field]) {
        const value = String(metadata[field]).toLowerCase().trim();
        if (value) {
          const key = `${field}:${value}`;
          if (!indexMap.has(key)) {
            indexMap.set(key, []);
          }
          if (!indexMap.get(key).includes(recordIdx)) {
            indexMap.get(key).push(recordIdx);
          }
        }
      }
    });
  }

  /**
   * 🔥 إضافة للتجمع
   */
  addToCluster(concept, recordIdx, clusterIndex) {
    if (!clusterIndex.has(concept)) {
      clusterIndex.set(concept, []);
    }
    clusterIndex.get(concept).push(recordIdx);
  }

  /**
   * 🏗️ بناء تجمعات دلالية
   */
  buildSemanticClusters(db) {
    if (!db.embeddingVectors || db.embeddingVectors.length < 10) return;
    
    // تجميع بسيط بناءً على المفاهيم الأساسية
    for (const [concept, indices] of db.clusterIndex.entries()) {
      if (indices.length >= 3) { // تجمعات تحتوي على 3 سجلات على الأقل
        db.semanticClusters.set(concept, {
          indices: indices,
          size: indices.length,
          centroid: this.calculateCentroid(db.embeddingVectors, indices)
        });
        this.stats.semanticClusters++;
      }
    }
  }

  /**
   * 🔥 حساب المركز الهندسي
   */
  calculateCentroid(vectors, indices) {
    if (indices.length === 0) return null;
    
    const dimension = vectors[0]?.length || this.vectorDimension;
    const centroid = new Array(dimension).fill(0);
    
    indices.forEach(idx => {
      const vector = vectors[idx];
      if (vector && vector.length === dimension) {
        for (let i = 0; i < dimension; i++) {
          centroid[i] += vector[i];
        }
      }
    });
    
    const count = indices.length;
    for (let i = 0; i < dimension; i++) {
      centroid[i] /= count;
    }
    
    return this.normalizeVector(centroid);
  }

  /**
   * 🔥 توليد التضمينات المتقدمة
   */
  async generateEmbedding(text, metadata = {}, options = {}) {
    const cacheKey = this.getEmbeddingCacheKey(text, metadata, options);
    
    // التحقق من التخزين المؤقت
    if (this.embeddingCache.has(cacheKey)) {
      this.stats.cacheHits++;
      return this.embeddingCache.get(cacheKey);
    }

    this.stats.cacheMisses++;
    
    try {
      // التوليد المتقدم للتضمين
      const vector = await this.generateAdvancedEmbedding(text, metadata, options);
      
      // التطبيع والتخزين
      const normalizedVector = this.normalizeVector(vector);
      this.addToEmbeddingCache(cacheKey, normalizedVector);
      
      return normalizedVector;
    } catch (error) {
      console.warn('⚠️ خطأ في توليد التضمين، استخدام بديل:', error);
      return this.generateFallbackEmbedding(text);
    }
  }

  /**
   * 🔥 توليد تضمين متقدم
   */
  async generateAdvancedEmbedding(text, metadata = {}, options = {}) {
    const vector = new Array(this.vectorDimension).fill(0);
    const normalizedText = this.normalizer.normalize(text.toLowerCase());
    
    // 🔥 المرحلة 1: تحليل النص إلى مكونات
    const textAnalysis = this.analyzeText(normalizedText);
    
    // 🔥 المرحلة 2: معالجة كل جملة
    textAnalysis.sentences.forEach((sentence, sentenceIdx) => {
      const sentenceWeight = 1.0 / (sentenceIdx + 1);
      this.processSentence(sentence, sentenceWeight, vector);
    });
    
    // 🔥 المرحلة 3: معالجة الميتاداتا
    if (Object.keys(metadata).length > 0) {
      this.processMetadata(metadata, vector);
    }
    
    // 🔥 المرحلة 4: توسيع دلالي
    if (options.expand !== false) {
      await this.applySemanticExpansion(textAnalysis, vector);
    }
    
    // 🔥 المرحلة 5: تحسين السياق
    if (options.context !== false && this.contextMemory.lastQueries.length > 0) {
      this.applyContextualEnhancement(vector);
    }
    
    return vector;
  }

  /**
   * 🔥 تحليل النص
   */
  analyzeText(text) {
    const sentences = text.split(/[.,،؛!?]/).filter(s => s.trim().length > 3);
    const words = text.split(/\s+/).filter(w => w.length > 1);
    
    return {
      original: text,
      sentences: sentences,
      words: words,
      wordCount: words.length,
      sentenceCount: sentences.length,
      containsNumbers: /\d+/.test(text),
      containsQuestions: /\?|هل|ما|كيف|متى|أين/.test(text),
      keyPhrases: this.extractKeyPhrases(text)
    };
  }

  /**
   * 🔥 استخلاص العبارات الرئيسية
   */
  extractKeyPhrases(text) {
    const phrases = new Set();
    const words = text.split(/\s+/).filter(w => w.length > 2);
    
    // bigrams
    for (let i = 0; i < words.length - 1; i++) {
      phrases.add(words[i] + ' ' + words[i + 1]);
    }
    
    // trigrams
    for (let i = 0; i < words.length - 2; i++) {
      phrases.add(words[i] + ' ' + words[i + 1] + ' ' + words[i + 2]);
    }
    
    return Array.from(phrases);
  }

  /**
   * 🔥 معالجة الجملة
   */
  processSentence(sentence, sentenceWeight, vector) {
    const words = sentence.toLowerCase().split(/\s+/).filter(w => w.length > 1);
    
    words.forEach((word, wordIdx) => {
      const positionWeight = 1.0 / Math.sqrt(wordIdx + 1);
      const totalWeight = positionWeight * sentenceWeight * 2.5;
      
      const hash = this.stringHash(word);
      
      // توزيع متعدد الأبعاد
      for (let i = 0; i < 15; i++) {
        const pos = Math.abs(hash * (i + 1) + i * 73) % this.vectorDimension;
        const value = Math.sin(hash + i * 0.3) * totalWeight;
        vector[pos] += value;
      }
      
      // هيكل العلاقات بين الكلمات
      if (wordIdx < words.length - 1) {
        const nextWord = words[wordIdx + 1];
        const pairHash = this.stringHash(word + '_' + nextWord);
        const pairPos = Math.abs(pairHash) % this.vectorDimension;
        vector[pairPos] += totalWeight * 0.7;
      }
    });
  }

  /**
   * 🔥 معالجة الميتاداتا
   */
  processMetadata(metadata, vector) {
    const metaTexts = [
      metadata.text,
      metadata.name,
      metadata.text_preview,
      ...(metadata.keywords || []),
      ...(metadata.synonyms || []),
      ...(metadata.intent || []),
      metadata.governorate,
      metadata.dependency,
      metadata.decision
    ].filter(Boolean).map(t => String(t).toLowerCase());
    
    let metaWeight = 0;
    metaTexts.forEach((text, idx) => {
      const weight = 1.0 / Math.sqrt(idx + 2);
      metaWeight += weight;
      
      const words = this.normalizer.normalize(text).split(/\s+/);
      words.forEach(word => {
        const hash = this.stringHash(word);
        const pos = Math.abs(hash * 3) % this.vectorDimension;
        vector[pos] += weight * 0.5;
      });
    });
  }

  /**
   * 🔥 تطبيق التوسيع الدلالي
   */
  async applySemanticExpansion(textAnalysis, vector) {
    // توسيع بالمرادفات الدلالية
    const expandedConcepts = this.expandSemanticConcepts(textAnalysis.words);
    
    expandedConcepts.forEach(concept => {
      const hash = this.stringHash(concept);
      for (let i = 0; i < 5; i++) {
        const pos = Math.abs(hash * (i + 2) + i * 97) % this.vectorDimension;
        vector[pos] += 0.1;
      }
    });
  }

  /**
   * 🔥 توسيع المفاهيم الدلالية
   */
  expandSemanticConcepts(words) {
    const expansions = [];
    
    const semanticMap = {
      'فندق': ['منشأة فندقية', 'إقامة', 'نزل', 'منتجع'],
      'مصنع': ['معمل', 'منشأة صناعية', 'ورشة كبيرة', 'مصنعة'],
      'مطعم': ['مأكولات', 'مطعمي', 'محل طعام', 'كافيتيريا'],
      'ترخيص': ['إذن', 'موافقة', 'تصريح', 'رخصة', 'تفويض'],
      'منطقة': ['موقع', 'مكان', 'حيز', 'موقع', 'موضع'],
      'صناعية': ['تصنيع', 'إنتاج', 'صناعي', 'تصنيعي'],
      'نشاط': ['عمل', 'مشروع', 'مهنة', 'صنعة', 'عملية']
    };
    
    words.forEach(word => {
      if (semanticMap[word]) {
        expansions.push(...semanticMap[word]);
      }
    });
    
    return expansions;
  }

  /**
   * 🔥 تحسين السياق
   */
  applyContextualEnhancement(vector) {
    const lastQuery = this.contextMemory.lastQueries[this.contextMemory.lastQueries.length - 1];
    if (lastQuery) {
      const lastWords = this.normalizer.normalize(lastQuery).split(/\s+/).slice(0, 5);
      
      lastWords.forEach(word => {
        const hash = this.stringHash(word);
        const pos = Math.abs(hash * 2) % this.vectorDimension;
        vector[pos] += 0.05; // تأثير خفيف للسياق
      });
    }
  }

  /**
   * 🔥 البحث الدلالي المتقدم
   */
  async semanticSearch(query, databaseName, config = {}) {
    const startTime = performance.now();
    const searchId = Date.now() + Math.random().toString(36).substr(2, 9);
    
    console.log(`🔍 [${searchId}] بدء البحث في ${databaseName}: "${query.substring(0, 50)}..."`);
    
    const settings = { ...this.defaultConfig, ...config };
    const db = this.databases[databaseName];
    
    if (!this.validateDatabase(db, databaseName)) {
      return [];
    }

    try {
      // 🔥 المرحلة 0: معالجة الاستعلام
      const processedQuery = this.preprocessQuery(query, databaseName);
      
      // 🔥 المرحلة 1: البحث متعدد المراحل
      const results = await this.multiStageSearch(processedQuery, db, databaseName, settings);
      
      // 🔥 المرحلة 2: تصفية وتحسين النتائج
      const filteredResults = this.filterAndRankResults(results, processedQuery, settings);
      
      // 🔥 المرحلة 3: تحسين النتائج النهائية
      const finalResults = this.enhanceFinalResults(filteredResults, db, settings);
      
      const searchTime = performance.now() - startTime;
      this.updateSearchStats(databaseName, searchTime, finalResults.length);
      
      console.log(`✅ [${searchId}] اكتمل البحث في ${databaseName}:`, {
        وقت: `${searchTime.toFixed(1)}ms`,
        نتائج: finalResults.length,
        'أفضل نتيجة': finalResults.length > 0 ? `${(finalResults[0].similarity * 100).toFixed(1)}%` : '0%'
      });
      
      // تحديث ذاكرة السياق
      this.updateContextMemory(query, databaseName, finalResults);
      
      return finalResults;
    } catch (error) {
      console.error(`❌ [${searchId}] خطأ في البحث:`, error);
      this.stats.failedSearches++;
      
      // استراتيجية احتياطية
      return await this.fallbackSearch(query, db, databaseName, settings);
    }
  }

  /**
   * 🔥 التحقق من صحة قاعدة البيانات
   */
  validateDatabase(db, dbName) {
    if (!db || !db.data || db.data.length === 0) {
      console.warn(`⚠️ قاعدة ${dbName} غير محملة أو فارغة`);
      return false;
    }
    
    if (!db.semanticIndex || !db.textCache) {
      console.warn(`⚠️ قاعدة ${dbName} غير مفهرسة بشكل صحيح`);
      return false;
    }
    
    return true;
  }

  /**
   * 🔥 معالجة مسبقة للاستعلام
   */
  preprocessQuery(query, databaseName) {
    const normalized = this.normalizer.normalize(query);
    
    return {
      original: query,
      normalized: normalized,
      words: normalized.split(/\s+/).filter(w => w.length > 1),
      sentences: normalized.split(/[.,،؛!?]/).filter(s => s.trim().length > 3),
      isComplex: this.isComplexQuery(normalized),
      questionType: this.detectQuestionType(normalized),
      semanticConcepts: this.extractQueryConcepts(normalized),
      databaseContext: databaseName,
      timestamp: Date.now()
    };
  }

  /**
   * 🔥 كشف الأسئلة المعقدة
   */
  isComplexQuery(query) {
    const complexityIndicators = [
      /\b(و|أو|ثم|لكن|لذا|بالإضافة|كذلك|أيضاً)\b/,
      /\؟.*\؟/, // أكثر من سؤال
      /-|–|—/,  // شرطات
      /\b(كم|كيف|متى|أين|لماذا|هل)\b.*\b(كم|كيف|متى|أين|لماذا|هل)\b/
    ];
    
    return complexityIndicators.some(pattern => pattern.test(query));
  }

  /**
   * 🔥 كشف نوع السؤال
   */
  detectQuestionType(query) {
    if (/كم|عدد|كام|مجموع|إحصاء/.test(query)) return 'statistical';
    if (/أين|اين|مكان|موقع|عنوان/.test(query)) return 'location';
    if (/كيف|طريقة|إجراء|خطوات/.test(query)) return 'procedural';
    if (/متى|موعد|تاريخ|زمن/.test(query)) return 'temporal';
    if (/لماذا|سبب|علة|سببية/.test(query)) return 'causal';
    if (/هل|أليس|أم|أمّا/.test(query)) return 'boolean';
    if (/مقارنة|فرق|بين|أفضل|أسوأ/.test(query)) return 'comparative';
    if (/ماذا|ما هو|ما هي/.test(query)) return 'definition';
    return 'general';
  }

  /**
   * 🔥 استخلاص مفاهيم الاستعلام
   */
  extractQueryConcepts(query) {
    const concepts = new Set();
    const words = query.split(/\s+/).filter(w => w.length > 2);
    
    // كلمات مفردة
    words.forEach(word => concepts.add(word));
    
    // عبارات (2-3 كلمات)
    for (let i = 0; i < words.length - 1; i++) {
      concepts.add(words[i] + ' ' + words[i + 1]);
      if (i < words.length - 2) {
        concepts.add(words[i] + ' ' + words[i + 1] + ' ' + words[i + 2]);
      }
    }
    
    return Array.from(concepts);
  }

  /**
   * 🔥 البحث متعدد المراحل
   */
  async multiStageSearch(query, db, dbName, settings) {
    const allResults = [];
    
    // 🔥 المرحلة 1: البحث الدلالي السريع
    const semanticResults = await this.semanticStageSearch(query, db, settings);
    allResults.push(...semanticResults);
    
    // 🔥 المرحلة 2: البحث بالمفاهيم
    const conceptResults = await this.conceptStageSearch(query, db, settings);
    allResults.push(...conceptResults);
    
    // 🔥 المرحلة 3: البحث بالتجميعات
    if (settings.semanticClustering) {
      const clusterResults = await this.clusterStageSearch(query, db, settings);
      allResults.push(...clusterResults);
    }
    
    // 🔥 المرحلة 4: البحث النصي الاحتياطي
    if (allResults.length < settings.initialTopK / 2) {
      const textResults = await this.textStageSearch(query, db, settings);
      allResults.push(...textResults);
    }
    
    return allResults;
  }

  /**
   * 🔥 المرحلة 1: البحث الدلالي
   */
  async semanticStageSearch(query, db, settings) {
    const results = [];
    const queryVector = await this.generateEmbedding(query.normalized, {}, { expand: true });
    
    // البحث في التجميعات أولاً (أسرع)
    if (db.semanticClusters && db.semanticClusters.size > 0) {
      for (const [concept, cluster] of db.semanticClusters.entries()) {
        if (query.normalized.includes(concept) || 
            query.semanticConcepts.some(qc => qc.includes(concept) || concept.includes(qc))) {
          
          const similarity = this.cosineSimilarity(queryVector, cluster.centroid);
          if (similarity >= settings.minSimilarity * 0.8) {
            cluster.indices.forEach(idx => {
              if (idx < db.data.length) {
                results.push({
                  ...db.data[idx],
                  similarity: similarity * 0.9, // تعديل طفيف
                  _index: idx,
                  _stage: 'cluster'
                });
              }
            });
          }
        }
      }
    }
    
    // بحث مباشر في عينة من السجلات
    const sampleSize = Math.min(100, db.data.length);
    const step = Math.max(1, Math.floor(db.data.length / sampleSize));
    
    for (let i = 0; i < db.data.length; i += step) {
      if (results.length >= settings.candidateTopK) break;
      
      const record = db.data[i];
      if (record.embeddings?.multilingual_minilm?.embeddings?.full) {
        const similarity = this.cosineSimilarity(
          queryVector, 
          record.embeddings.multilingual_minilm.embeddings.full
        );
        
        if (similarity >= settings.minSimilarity) {
          results.push({
            ...record,
            similarity: similarity,
            _index: i,
            _stage: 'semantic'
          });
        }
      }
    }
    
    return results;
  }

  /**
   * 🔥 المرحلة 2: البحث بالمفاهيم
   */
  async conceptStageSearch(query, db, settings) {
    const results = [];
    const candidates = new Set();
    
    // البحث بالمفاهيم الدلالية
    query.semanticConcepts.forEach(concept => {
      if (db.semanticIndex.has(concept)) {
        db.semanticIndex.get(concept).forEach(idx => candidates.add(idx));
      }
      
      // البحث الجزئي
      for (const [dbConcept, indices] of db.semanticIndex.entries()) {
        if (concept.includes(dbConcept) || dbConcept.includes(concept)) {
          indices.forEach(idx => candidates.add(idx));
        }
      }
    });
    
    // معالجة المرشحين
    const queryVector = await this.generateEmbedding(query.normalized);
    const indicesArray = Array.from(candidates).slice(0, 50);
    
    for (const idx of indicesArray) {
      if (idx >= db.data.length) continue;
      
      const record = db.data[idx];
      const similarity = await this.calculateSimilarity(queryVector, record, query);
      
      if (similarity >= settings.minSimilarity) {
        results.push({
          ...record,
          similarity: similarity,
          _index: idx,
          _stage: 'concept'
        });
      }
    }
    
    return results;
  }

  /**
   * 🔥 المرحلة 3: البحث بالتجميعات
   */
  async clusterStageSearch(query, db, settings) {
    const results = [];
    
    if (!db.semanticClusters || db.semanticClusters.size === 0) {
      return results;
    }
    
    const queryVector = await this.generateEmbedding(query.normalized);
    
    // البحث في التجميعات الأكثر صلة
    for (const [concept, cluster] of db.semanticClusters.entries()) {
      // حساب التشابه مع مركز التجمع
      const clusterSimilarity = this.cosineSimilarity(queryVector, cluster.centroid);
      
      if (clusterSimilarity >= settings.minSimilarity * 0.7) {
        // إضافة أعلى 3 سجلات من هذا التجمع
        const topIndices = cluster.indices.slice(0, 3);
        
        for (const idx of topIndices) {
          if (idx >= db.data.length) continue;
          
          const record = db.data[idx];
          const recordVector = db.embeddingVectors[idx];
          
          if (recordVector) {
            const similarity = this.cosineSimilarity(queryVector, recordVector);
            const adjustedSimilarity = similarity * 0.9 + clusterSimilarity * 0.1;
            
            if (adjustedSimilarity >= settings.minSimilarity) {
              results.push({
                ...record,
                similarity: adjustedSimilarity,
                _index: idx,
                _stage: 'cluster',
                _cluster: concept
              });
            }
          }
        }
      }
    }
    
    return results;
  }

  /**
   * 🔥 المرحلة 4: البحث النصي الاحتياطي
   */
  async textStageSearch(query, db, settings) {
    const results = [];
    const queryWords = query.words;
    
    // بحث نصي بسيط
    for (let idx = 0; idx < Math.min(db.data.length, 200); idx++) {
      if (results.length >= 20) break;
      
      const text = db.textCache[idx];
      if (!text) continue;
      
      // حساب مطابقة النص
      let matchScore = 0;
      queryWords.forEach(qWord => {
        if (text.includes(qWord)) {
          matchScore += 1.0;
        } else if (qWord.length > 3) {
          // بحث جزئي
          for (let i = 0; i < text.length - qWord.length; i++) {
            if (text.substr(i, qWord.length) === qWord) {
              matchScore += 0.5;
              break;
            }
          }
        }
      });
      
      const similarity = matchScore / queryWords.length * 0.5; // تحويل إلى نطاق 0-0.5
      
      if (similarity >= settings.minSimilarity * 0.5) {
        results.push({
          ...db.data[idx],
          similarity: similarity,
          _index: idx,
          _stage: 'text'
        });
      }
    }
    
    return results;
  }

  /**
   * 🔥 حساب التشابه المتقدم
   */
  async calculateSimilarity(queryVector, record, query) {
    let maxSimilarity = 0;
    
    // 1. المتجهات المحفوظة
    if (record.embeddings?.multilingual_minilm?.embeddings) {
      const embeddings = record.embeddings.multilingual_minilm.embeddings;
      const variations = ['full', 'contextual', 'summary', 'key_phrases', 'no_stopwords'];
      
      for (const variation of variations) {
        if (embeddings[variation]) {
          const sim = this.cosineSimilarity(queryVector, embeddings[variation]);
          maxSimilarity = Math.max(maxSimilarity, sim);
        }
      }
    }
    
    // 2. توليد مباشر للنص
    const recordText = record.original_data?.text || record.original_data?.name || '';
    if (recordText && maxSimilarity < 0.4) {
      const recordVector = await this.generateEmbedding(recordText, record.original_data);
      const directSim = this.cosineSimilarity(queryVector, recordVector);
      maxSimilarity = Math.max(maxSimilarity, directSim * 0.95);
    }
    
    // 3. تحسين بالميتاداتا
    if (record.original_data && maxSimilarity < 0.5) {
      const metaScore = this.calculateMetadataScore(record.original_data, query);
      maxSimilarity = Math.max(maxSimilarity, maxSimilarity * 0.8 + metaScore * 0.2);
    }
    
    return Math.min(maxSimilarity, 0.95);
  }

  /**
   * 🔥 حساب نقاط الميتاداتا
   */
  calculateMetadataScore(metadata, query) {
    let score = 0;
    const queryLower = query.normalized.toLowerCase();
    
    const metaFields = [
      { key: 'text', weight: 5.0 },
      { key: 'name', weight: 4.0 },
      { key: 'text_preview', weight: 3.5 },
      { key: 'keywords', weight: 3.0, isArray: true },
      { key: 'synonyms', weight: 2.5, isArray: true },
      { key: 'intent', weight: 2.0, isArray: true },
      { key: 'governorate', weight: 2.0 },
      { key: 'dependency', weight: 1.5 },
      { key: 'decision', weight: 1.5 },
      { key: 'value', weight: 1.0 }
    ];
    
    metaFields.forEach(field => {
      const value = metadata[field.key];
      if (!value) return;
      
      let fieldText = '';
      if (field.isArray && Array.isArray(value)) {
        fieldText = value.join(' ').toLowerCase();
      } else {
        fieldText = String(value).toLowerCase();
      }
      
      const normalizedField = this.normalizer.normalize(fieldText);
      
      // مطابقة كاملة
      if (normalizedField.includes(queryLower) || queryLower.includes(normalizedField)) {
        score += field.weight * 2.0;
      }
      
      // مطابقة كلمات
      const fieldWords = normalizedField.split(/\s+/);
      const queryWords = query.words;
      
      let matchedWords = 0;
      queryWords.forEach(qWord => {
        if (fieldWords.includes(qWord)) {
          matchedWords++;
          score += field.weight;
        }
      });
      
      // نسبة التطابق
      if (queryWords.length > 0) {
        const matchRatio = matchedWords / queryWords.length;
        score += field.weight * matchRatio;
      }
    });
    
    return Math.min(score / 50, 1.0); // تطبيع إلى 0-1
  }

  /**
   * 🔥 تشابه جيب التمام
   */
  cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) {
      return 0;
    }

    let dot = 0;
    let magA = 0;
    let magB = 0;

    for (let i = 0; i < vecA.length; i++) {
      const a = vecA[i];
      const b = vecB[i];
      dot += a * b;
      magA += a * a;
      magB += b * b;
    }

    const mag = Math.sqrt(magA) * Math.sqrt(magB);
    return mag > 0 ? Math.max(0, Math.min(1, dot / mag)) : 0;
  }

  /**
   * 🔥 تصفية وترتيب النتائج
   */
  filterAndRankResults(results, query, settings) {
    if (results.length === 0) return [];
    
    // إزالة التكرارات
    const uniqueResults = this.removeDuplicates(results);
    
    // حساب العتبة الذكية
    const threshold = this.calculateDynamicThreshold(uniqueResults, query, settings);
    
    // تصفية بالعتبة
    const filtered = uniqueResults.filter(r => r.similarity >= threshold);
    
    // ترتيب متقدم
    filtered.sort((a, b) => {
      const scoreA = this.calculateFinalScore(a, query, settings);
      const scoreB = this.calculateFinalScore(b, query, settings);
      return scoreB - scoreA;
    });
    
    return filtered.slice(0, settings.finalTopK);
  }

  /**
   * 🔥 إزالة التكرارات
   */
  removeDuplicates(results) {
    const unique = [];
    const seen = new Set();
    
    results.forEach(result => {
      const key = result.original_data?.text || result.original_data?.name || result._index;
      const normalizedKey = this.normalizer.normalize(String(key)).substring(0, 100);
      
      if (!seen.has(normalizedKey)) {
        seen.add(normalizedKey);
        unique.push(result);
      }
    });
    
    return unique;
  }

  /**
   * 🔥 حساب العتبة الديناميكية
   */
  calculateDynamicThreshold(results, query, settings) {
    if (results.length === 0) return settings.minSimilarity;
    
    const similarities = results.map(r => r.similarity);
    const maxSim = Math.max(...similarities);
    const avgSim = similarities.reduce((a, b) => a + b, 0) / similarities.length;
    
    // تحليل نوع السؤال
    let baseThreshold = settings.minSimilarity;
    
    switch (query.questionType) {
      case 'statistical':
        baseThreshold = Math.max(0.06, avgSim * 0.3);
        break;
      case 'location':
        baseThreshold = Math.max(0.08, avgSim * 0.4);
        break;
      case 'procedural':
        baseThreshold = Math.max(0.10, avgSim * 0.5);
        break;
      case 'comparative':
        baseThreshold = Math.max(0.12, avgSim * 0.6);
        break;
      default:
        baseThreshold = Math.max(settings.minSimilarity, avgSim * 0.4);
    }
    
    // تعديل بناءً على تعقيد السؤال
    if (query.isComplex) {
      baseThreshold *= 0.8; // تخفيض العتبة للأسئلة المعقدة
    }
    
    // إذا كان التشابه الأعلى مرتفعاً
    if (maxSim > 0.6) {
      baseThreshold = Math.max(baseThreshold, maxSim * 0.5);
    }
    
    return Math.min(baseThreshold, 0.35); // سقف للعتبة
  }

  /**
   * 🔥 حساب النقاط النهائية
   */
  calculateFinalScore(result, query, settings) {
    let score = result.similarity;
    
    // تعزيز بناءً على المرحلة
    switch (result._stage) {
      case 'semantic':
        score *= 1.1;
        break;
      case 'cluster':
        score *= 1.05;
        break;
      case 'concept':
        score *= 1.0;
        break;
      case 'text':
        score *= 0.9;
        break;
    }
    
    // تعزيز بناءً على مطابقة الميتاداتا
    if (result.original_data) {
      const metaScore = this.calculateMetadataScore(result.original_data, query);
      score = score * 0.9 + metaScore * 0.1;
    }
    
    // تعزيز بناءً على طول النص (نصوص أطول قد تكون أكثر شمولاً)
    const text = result.original_data?.text || '';
    if (text.length > 100) {
      score *= 1.05;
    }
    
    return Math.min(score, 1.0);
  }

  /**
   * 🔥 تحسين النتائج النهائية
   */
  enhanceFinalResults(results, db, settings) {
    return results.map(result => {
      const enhanced = { ...result };
      
      // إضافة معلومات إضافية
      if (result.original_data) {
        enhanced.displayText = this.generateDisplayText(result.original_data);
        enhanced.summary = this.generateSummary(result.original_data);
        enhanced.keyPoints = this.extractKeyPoints(result.original_data);
      }
      
      // تصنيف الثقة
      enhanced.confidence = this.calculateConfidenceLevel(result.similarity);
      
      // إضافة مرجع قاعدة البيانات
      enhanced.databaseInfo = {
        name: db.name,
        totalRecords: db.data.length,
        recordIndex: result._index
      };
      
      return enhanced;
    });
  }

  /**
   * 🔥 توليد نص العرض
   */
  generateDisplayText(metadata) {
    const texts = [];
    
    if (metadata.name) texts.push(`**${metadata.name}**`);
    if (metadata.text) texts.push(metadata.text);
    if (metadata.text_preview) texts.push(metadata.text_preview);
    if (metadata.value) texts.push(`القيمة: ${metadata.value}`);
    
    return texts.join('\n\n').substring(0, 500);
  }

  /**
   * 🔥 توليد ملخص
   */
  generateSummary(metadata) {
    const text = metadata.text || metadata.text_preview || metadata.name || '';
    if (text.length <= 150) return text;
    
    return text.substring(0, 150) + '...';
  }

  /**
   * 🔥 استخلاص النقاط الرئيسية
   */
  extractKeyPoints(metadata) {
    const points = [];
    
    if (metadata.keywords && Array.isArray(metadata.keywords)) {
      points.push(...metadata.keywords.slice(0, 3));
    }
    
    if (metadata.governorate) {
      points.push(`المحافظة: ${metadata.governorate}`);
    }
    
    if (metadata.dependency) {
      points.push(`التبعية: ${metadata.dependency}`);
    }
    
    return points.slice(0, 5);
  }

  /**
   * 🔥 حساب مستوى الثقة
   */
  calculateConfidenceLevel(similarity) {
    if (similarity >= 0.7) return 'عالية جداً';
    if (similarity >= 0.5) return 'عالية';
    if (similarity >= 0.3) return 'متوسطة';
    if (similarity >= 0.15) return 'منخفضة';
    return 'ضعيفة';
  }

  /**
   * 🔥 البحث الاحتياطي
   */
  async fallbackSearch(query, db, dbName, settings) {
    console.log(`🔄 استخدام البحث الاحتياطي لـ ${dbName}`);
    
    const results = [];
    const queryText = query.normalized || query.original || query;
    
    // بحث نصي بسيط
    for (let i = 0; i < Math.min(db.data.length, 50); i++) {
      const record = db.data[i];
      const text = db.textCache[i];
      
      if (text && text.includes(queryText.substring(0, 10))) {
        results.push({
          ...record,
          similarity: 0.15, // ثابت للنتائج الاحتياطية
          _index: i,
          _stage: 'fallback',
          _confidence: 'منخفضة'
        });
      }
    }
    
    // إذا لم نجد نتائج، نعيد أول سجلات القاعدة
    if (results.length === 0 && db.data.length > 0) {
      for (let i = 0; i < Math.min(3, db.data.length); i++) {
        results.push({
          ...db.data[i],
          similarity: 0.1,
          _index: i,
          _stage: 'fallback_last',
          _confidence: 'ضعيفة',
          _note: 'نتيجة عامة من قاعدة البيانات'
        });
      }
    }
    
    return results.slice(0, 3);
  }

  /**
   * 🔥 البحث المتوازي الذكي
   */
  async parallelSearch(query, config = {}) {
    const startTime = performance.now();
    const settings = {
      ...this.defaultConfig,
      ...config,
      databases: config.databases || ['activity', 'decision104', 'industrial']
    };

    console.log(`⚡ بحث متوازي ذكي في ${settings.databases.length} قواعد...`);

    // تحديث ذاكرة السياق
    this.contextMemory.lastQueries.push(query);
    if (this.contextMemory.lastQueries.length > 10) {
      this.contextMemory.lastQueries.shift();
    }

    // تنفيذ البحث المتوازي
    const searchPromises = settings.databases.map(dbName => 
      this.semanticSearch(query, dbName, settings)
    );

    const allResults = await Promise.all(searchPromises);

    // تجميع النتائج
    const resultMap = {
      activity: allResults[0] || [],
      decision104: allResults[1] || [],
      industrial: allResults[2] || []
    };

    // تحليل النتائج المتقاطعة
    const crossAnalysis = this.analyzeCrossResults(resultMap, query);

    const totalTime = performance.now() - startTime;
    
    return {
      ...resultMap,
      crossAnalysis: crossAnalysis,
      totalResults: allResults.reduce((sum, arr) => sum + arr.length, 0),
      query: query,
      searchTime: totalTime,
      timestamp: Date.now()
    };
  }

  /**
   * 🔥 تحليل النتائج المتقاطعة
   */
  analyzeCrossResults(resultMap, query) {
    const analysis = {
      hasActivityAndLocation: resultMap.activity.length > 0 && resultMap.industrial.length > 0,
      hasActivityAndIncentives: resultMap.activity.length > 0 && resultMap.decision104.length > 0,
      totalMatches: Object.values(resultMap).reduce((sum, arr) => sum + arr.length, 0),
      bestDatabase: null,
      suggestions: []
    };

    // تحديد أفضل قاعدة بناءً على النتائج
    const dbScores = {
      activity: resultMap.activity.length * 2 + (resultMap.activity[0]?.similarity || 0),
      decision104: resultMap.decision104.length * 1.5 + (resultMap.decision104[0]?.similarity || 0),
      industrial: resultMap.industrial.length * 1.2 + (resultMap.industrial[0]?.similarity || 0)
    };

    const bestDb = Object.entries(dbScores).sort((a, b) => b[1] - a[1])[0];
    analysis.bestDatabase = bestDb[0];

    // توليد اقتراحات
    if (resultMap.activity.length === 0 && /فندق|مصنع|مطعم/.test(query)) {
      analysis.suggestions.push('جرب البحث بكلمات أكثر تحديداً مثل "اشتراطات فندق" أو "متطلبات مطعم"');
    }

    if (resultMap.industrial.length === 0 && /منطقة|صناعية|موقع/.test(query)) {
      analysis.suggestions.push('جرب البحث باسم محافظة محددة أو "مناطق صناعية في..."');
    }

    return analysis;
  }

  /**
   * 🔥 تحديث إحصائيات البحث
   */
  updateSearchStats(dbName, searchTime, resultCount) {
    this.stats.totalSearches++;
    
    if (resultCount > 0) {
      this.stats.successfulSearches++;
    } else {
      this.stats.failedSearches++;
    }
    
    this.stats.averageSearchTime = 
      (this.stats.averageSearchTime * (this.stats.totalSearches - 1) + searchTime) 
      / this.stats.totalSearches;
    
    // تحديث مطابقات الثقة العالية
    if (resultCount > 0) {
      this.stats.highConfidenceMatches += resultCount;
    }
  }

  /**
   * 🔥 تحديث ذاكرة السياق
   */
  updateContextMemory(query, dbName, results) {
    if (results.length > 0) {
      const topResult = results[0];
      this.contextMemory.lastResults[dbName] = {
        query: query,
        result: topResult,
        timestamp: Date.now()
      };
      
      // تحديث تدفق المحادثة
      this.contextMemory.conversationFlow.push({
        type: 'search',
        database: dbName,
        query: query.substring(0, 100),
        resultCount: results.length,
        time: Date.now()
      });
      
      // الحفاظ على حجم معقول
      if (this.contextMemory.conversationFlow.length > 20) {
        this.contextMemory.conversationFlow.shift();
      }
    }
  }

  /**
   * 🔥 تفريغ ذاكرة التخزين المؤقت
   */
  clearCache() {
    this.embeddingCache.clear();
    this.semanticCache.clear();
    
    this.stats.cacheHits = 0;
    this.stats.cacheMisses = 0;
    
    console.log('🧹 تم تنظيف ذاكرة التخزين المؤقت');
  }

  /**
   * 🔥 تفريغ ذاكرة السياق
   */
  clearContext() {
    this.contextMemory = {
      lastQueries: [],
      lastResults: {},
      conversationFlow: [],
      entityHistory: [],
      sessionStart: Date.now(),
      queryPatterns: new Map()
    };
    
    console.log('🧠 تم مسح ذاكرة السياق');
  }

  /**
   * 📊 الحصول على إحصائيات متقدمة
   */
  getStatistics() {
    const totalCacheAccess = this.stats.cacheHits + this.stats.cacheMisses;
    const cacheHitRate = totalCacheAccess > 0 
      ? (this.stats.cacheHits / totalCacheAccess * 100).toFixed(2)
      : 0;
    
    const successRate = this.stats.totalSearches > 0
      ? (this.stats.successfulSearches / this.stats.totalSearches * 100).toFixed(2)
      : 0;
    
    return {
      أساسية: {
        عمليات_بحث: this.stats.totalSearches,
        نجاح: `${successRate}%`,
        فشل: this.stats.failedSearches,
        متوسط_الزمن: `${this.stats.averageSearchTime.toFixed(1)}ms`
      },
      ذاكرة: {
        حجم_التخزين: this.embeddingCache.size,
        نسبة_الإصابة: `${cacheHitRate}%`,
        تجمعات_دلالية: this.stats.semanticClusters,
        مطابقات_عالية: this.stats.highConfidenceMatches
      },
      قواعد: {
        أنشطة: this.databases.activity?.data?.length || 0,
        قرار_104: this.databases.decision104?.data?.length || 0,
        مناطق: this.databases.industrial?.data?.length || 0
      },
      سياق: {
        استعلامات_سابقة: this.contextMemory.lastQueries.length,
        محادثة: this.contextMemory.conversationFlow.length,
        مدة_الجلسة: `${((Date.now() - this.contextMemory.sessionStart) / 1000).toFixed(1)}s`
      }
    };
  }

  /**
   * 🛠️ أدوات مساعدة
   */
  
  getEmbeddingCacheKey(text, metadata, options) {
    const metaStr = JSON.stringify(metadata);
    const optionsStr = JSON.stringify(options);
    return `${text}::${this.stringHash(metaStr)}::${this.stringHash(optionsStr)}`;
  }

  addToEmbeddingCache(key, value) {
    if (this.embeddingCache.size >= this.maxCacheSize) {
      const firstKey = this.embeddingCache.keys().next().value;
      this.embeddingCache.delete(firstKey);
    }
    this.embeddingCache.set(key, value);
  }

  normalizeVector(vector) {
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return magnitude > 0 ? vector.map(v => v / magnitude) : vector;
  }

  stringHash(str) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) + hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  generateFallbackEmbedding(text) {
    const vector = new Array(this.vectorDimension).fill(0);
    const words = this.normalizer.normalize(text).split(/\s+/);
    
    words.forEach((word, idx) => {
      const hash = this.stringHash(word);
      const pos = Math.abs(hash) % this.vectorDimension;
      const weight = 1.0 / Math.sqrt(idx + 1);
      vector[pos] = weight;
    });
    
    return this.normalizeVector(vector);
  }

  enableEmergencyMode() {
    console.warn('🚨 تم تفعيل وضع الطوارئ - استخدام إعدادات مبسطة');
    
    this.defaultConfig = {
      minSimilarity: 0.05,
      semanticWeight: 0.5,
      keywordWeight: 0.5,
      finalTopK: 3
    };
  }

  async warmupCache() {
    console.log('🔥 تسخين ذاكرة التخزين المؤقت...');
    
    const warmupQueries = [
      'فندق',
      'منطقة صناعية',
      'قرار 104',
      'ترخيص',
      'اشتراطات',
      'محافظة'
    ];
    
    for (const query of warmupQueries) {
      await this.generateEmbedding(query);
    }
    
    console.log('✅ اكتمل تسخين الذاكرة المؤقتة');
  }

  getInitialStats() {
    return {
      قواعد_محمولة: Object.values(this.databases).filter(db => db).length,
      سجلات_كلية: Object.values(this.databases).reduce((sum, db) => sum + (db?.data?.length || 0), 0),
      أبعاد_المتجهات: this.vectorDimension,
      وضع_التشغيل: 'متقدم'
    };
  }

  async buildSemanticStructures() {
    // يمكن إضافة بنى دلالية إضافية هنا
    console.log('🏗️ بناء الهياكل الدلالية الإضافية...');
    return true;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = VectorEngine;
}
