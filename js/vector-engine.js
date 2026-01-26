/**
 * 🚀 محرك المتجهات الذكي المتقدم - البحث الدلالي الفعال
 * Smart Vector Engine - Effective Semantic Search
 * 
 * @author AI Expert System
 * @version 9.0.0 - Intelligent Arabic Search
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
      highConfidenceResults: 0,
      queryExpansions: 0
    };

    // 🔥 ذاكرة تخزين مؤقت متقدمة
    this.embeddingCache = new Map();
    this.queryCache = new Map();
    this.semanticCache = new Map();
    this.maxCacheSize = 5000;

    // 🔥 إعدادات البحث المتقدمة
    this.defaultConfig = {
      // المراحل
      initialCandidates: 200,           // مرشحين أوليين
      refineCandidates: 50,            // مرشحين للتحسين
      finalResults: 5,                 // نتائج نهائية
      
      // العتبات الذكية
      absoluteMinSimilarity: 0.05,     // الحد الأدنى المطلق
      minSimilarity: 0.12,             // الحد الأدنى للعرض
      goodSimilarity: 0.25,            // تشابه جيد
      highSimilarity: 0.45,            // تشابه عالي
      
      // الأوزان المتقدمة
      semanticWeight: 0.90,            // وزن التضمينات الدلالية
      textMatchWeight: 0.30,           // وزن المطابقة النصية
      metadataWeight: 0.25,            // وزن الميتاداتا
      expansionWeight: 0.15,           // وزن التوسيع
      
      // الميزات
      enableSmartExpansion: true,      // توسيع ذكي
      enableQueryReformulation: true,  // إعادة صياغة
      enableHybridSearch: true,        // بحث هجين
      enableFallbackStrategies: true,  // استراتيجيات احتياطية
      enableAdaptiveThreshold: true,   // عتبة تكيفية
      enableContextAwareness: true,    // مراعاة السياق
      forceResults: true,              // إجبار العثور على نتائج
      
      // الأداء
      maxSearchTime: 3000,             // أقصى وقت بحث (3 ثوان)
      quickSearchLimit: 100,           // حد البحث السريع
      deepSearchLimit: 500             // حد البحث العميق
    };

    // 🔥 قاموس التوسيع العربي المتخصص
    this.semanticExpansion = {
      // أنشطة
      'فندق': ['فندق', 'فندق سياحي', 'فندق تجاري', 'منتجع', 'نزل', 'سكن فندقي', 'مبيت وإفطار', 'شقق فندقية', 'منشأة فندقية'],
      'مصنع': ['مصنع', 'معمل', 'منشأة صناعية', 'ورشة كبيرة', 'مصنع إنتاج', 'مصنع تصنيع', 'مصنع تجميع'],
      'مطعم': ['مطعم', 'مطعمي', 'محل طعام', 'مأكولات', 'وجبات سريعة', 'مطعم عائلي', 'مطعم راقي', 'كافيتيريا'],
      'مقهى': ['مقهى', 'كافيه', 'كوفي شوب', 'مقهى إنترنت', 'مقهى ثقافي', 'صالة شاي'],
      
      // إجراءات
      'انشاء': ['إنشاء', 'تأسيس', 'بناء', 'تشييد', 'تكوين', 'تأسيس', 'إقامة', 'تشييد'],
      'تشغيل': ['تشغيل', 'إدارة', 'تشغيل وإدارة', 'إدارة وتشغيل', 'تشغيل مستمر', 'إدارة منشأة'],
      'ترخيص': ['ترخيص', 'رخصة', 'تصريح', 'إذن', 'موافقة', 'ترخيص رسمي', 'تصريح مزاولة'],
      
      // مفاهيم
      'نشاط': ['نشاط', 'عمل', 'مشروع', 'مهنة', 'صنعة', 'وظيفة', 'ممارسة', 'عملية'],
      'منطقة': ['منطقة', 'موقع', 'مكان', 'حيز', 'موقع', 'موضع', 'مساحة', 'نطاق'],
      'صناعية': ['صناعية', 'تصنيع', 'إنتاج', 'صناعي', 'تصنيعي', 'صناعي']
    };

    // 🔥 كلمات توقف عربية
    this.arabicStopWords = new Set([
      'في', 'من', 'على', 'إلى', 'عن', 'مع', 'بين', 'حتى', 'إلا', 'لكن',
      'إن', 'أن', 'أو', 'إما', 'إذ', 'إذا', 'لما', 'لن', 'لم', 'لا',
      'ما', 'منذ', 'هو', 'هي', 'هم', 'هنا', 'هناك', 'ذلك', 'هذا', 'هذه'
    ]);

    // 🔥 ذاكرة السياق
    this.context = {
      sessionQueries: [],
      successfulPatterns: new Map(),
      failedPatterns: new Map(),
      entityHistory: [],
      crossReferences: []
    };
  }

  /**
   * 🚀 تهيئة المحرك
   */
  async initialize(vectorDatabases) {
    console.log('🚀 تهيئة محرك البحث الذكي...');
    
    try {
      await this.loadDatabases(vectorDatabases);
      await this.prepareForSearch();
      await this.warmupSystem();
      
      console.log('✅ اكتمل تحميل النظام الذكي');
      this.printSystemStatus();
      
      return true;
    } catch (error) {
      console.error('❌ خطأ في تهيئة النظام:', error);
      this.activateEmergencyMode();
      return false;
    }
  }

  /**
   * 📦 تحميل قواعد البيانات
   */
  async loadDatabases(vectorDatabases) {
    console.log('📦 تحميل قواعد البيانات...');
    
    try {
      this.databases.activity = vectorDatabases.activity;
      this.databases.decision104 = vectorDatabases.decision104;
      this.databases.industrial = vectorDatabases.industrial;

      // التحقق من جودة البيانات
      this.validateAndPrepareDatabases();

      console.log('✅ تم تحميل القواعد:');
      console.log(`   📊 الأنشطة: ${this.databases.activity?.data?.length || 0} سجل`);
      console.log(`   📊 القرار 104: ${this.databases.decision104?.data?.length || 0} سجل`);
      console.log(`   📊 المناطق: ${this.databases.industrial?.data?.length || 0} سجل`);

      return true;
    } catch (error) {
      console.error('❌ خطأ في تحميل القواعد:', error);
      throw error;
    }
  }

  /**
   * 🔍 التحقق وإعداد قواعد البيانات
   */
  validateAndPrepareDatabases() {
    for (const [dbName, db] of Object.entries(this.databases)) {
      if (!db || !db.data) {
        throw new Error(`قاعدة ${dbName} غير موجودة`);
      }

      // التحضير للبحث السريع
      db.quickAccess = {
        texts: [],
        embeddings: [],
        metadata: []
      };

      // استخلاص البيانات للبحث السريع
      db.data.forEach((record, idx) => {
        const data = record.original_data || {};
        
        // نص البحث السريع
        const searchText = [
          data.text || '',
          data.name || '',
          data.text_preview || '',
          ...(data.keywords || []),
          ...(data.synonyms || [])
        ].join(' ').toLowerCase();
        
        db.quickAccess.texts[idx] = this.normalizer.normalize(searchText);
        
        // التضمينات
        if (record.embeddings?.multilingual_minilm?.embeddings?.full) {
          db.quickAccess.embeddings[idx] = record.embeddings.multilingual_minilm.embeddings.full;
        }
        
        // الميتاداتا
        db.quickAccess.metadata[idx] = {
          governorate: data.governorate || '',
          dependency: data.dependency || '',
          decision: data.decision || '',
          value: data.value || '',
          intent: data.intent || []
        };
      });

      console.log(`   ✅ ${dbName}: جاهز للبحث (${db.data.length} سجل)`);
    }
  }

  /**
   * ⚡ التحضير للبحث
   */
  async prepareForSearch() {
    console.log('⚡ تجهيز النظام للبحث السريع...');
    
    // إنشاء فهارس سريعة
    for (const [dbName, db] of Object.entries(this.databases)) {
      db.keywordIndex = this.buildKeywordIndex(db);
      db.semanticIndex = this.buildSemanticIndex(db);
    }
    
    console.log('✅ تم تجهيز الفهارس السريعة');
  }

  /**
   * 🏗️ بناء فهرس الكلمات الرئيسية
   */
  buildKeywordIndex(db) {
    const index = new Map();
    
    db.data.forEach((record, idx) => {
      const text = db.quickAccess.texts[idx];
      if (!text) return;
      
      const words = text.split(/\s+/).filter(word => 
        word.length > 2 && !this.arabicStopWords.has(word)
      );
      
      words.forEach(word => {
        if (!index.has(word)) {
          index.set(word, []);
        }
        if (!index.get(word).includes(idx)) {
          index.get(word).push(idx);
        }
      });
    });
    
    return index;
  }

  /**
   * 🏗️ بناء فهرس دلالي
   */
  buildSemanticIndex(db) {
    const index = new Map();
    
    // تجميع السجلات بالمفاهيم المشتركة
    db.data.forEach((record, idx) => {
      const text = db.quickAccess.texts[idx];
      if (!text || text.length < 10) return;
      
      // استخلاص المفاهيم الرئيسية (كلمات متعددة)
      const words = text.split(/\s+/).filter(w => w.length > 3);
      
      // إنشاء مفاهيم من 2-3 كلمات
      for (let i = 0; i < words.length - 1; i++) {
        const bigram = words[i] + ' ' + words[i + 1];
        const trigram = i < words.length - 2 ? words[i] + ' ' + words[i + 1] + ' ' + words[i + 2] : null;
        
        [bigram, trigram].filter(Boolean).forEach(concept => {
          if (!index.has(concept)) {
            index.set(concept, []);
          }
          if (!index.get(concept).includes(idx)) {
            index.get(concept).push(idx);
          }
        });
      }
    });
    
    return index;
  }

  /**
   * 🔥 تسخين النظام
   */
  async warmupSystem() {
    console.log('🔥 تسخين النظام...');
    
    // استعلامات تسخين شائعة
    const warmupQueries = [
      'فندق',
      'منطقة صناعية',
      'قرار 104',
      'ترخيص',
      'نشاط',
      'مصنع',
      'مطعم',
      'إنشاء',
      'تشغيل'
    ];
    
    for (const query of warmupQueries) {
      await this.generateEmbedding(query);
    }
    
    console.log('✅ اكتمل تسخين النظام');
  }

  /**
   * 🖨️ طباعة حالة النظام
   */
  printSystemStatus() {
    const status = {
      قواعد: {
        الأنشطة: this.databases.activity?.data?.length || 0,
        القرار_104: this.databases.decision104?.data?.length || 0,
        المناطق: this.databases.industrial?.data?.length || 0
      },
      ذاكرة: {
        تضمينات: this.embeddingCache.size,
        استعلامات: this.queryCache.size,
        سياق: this.context.sessionQueries.length
      },
      إعدادات: {
        وضع_البحث: 'ذكي متقدم',
        عتبة_الحد_الأدنى: `${(this.defaultConfig.absoluteMinSimilarity * 100).toFixed(1)}%`,
        توسيع_تلقائي: this.defaultConfig.enableSmartExpansion ? 'نعم' : 'لا',
        إجبار_النتائج: this.defaultConfig.forceResults ? 'نعم' : 'لا'
      }
    };
    
    console.log('📊 حالة النظام:', status);
  }

  /**
   * 🔥 البحث الدلالي الرئيسي
   */
  async semanticSearch(query, databaseName, config = {}) {
    const searchId = 'search_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    const startTime = performance.now();
    
    console.log(`🔍 [${searchId}] بدء البحث: "${query}" في ${databaseName}`);
    
    const settings = { ...this.defaultConfig, ...config };
    const db = this.databases[databaseName];
    
    if (!this.validateDatabase(db, databaseName)) {
      console.warn(`⚠️ قاعدة ${databaseName} غير صالحة للبحث`);
      return this.getEmergencyResults(db, query);
    }

    try {
      // 🔥 المرحلة 0: تحضير الاستعلام
      const processedQuery = await this.prepareQuery(query, databaseName, settings);
      
      // 🔥 المرحلة 1: البحث السريع
      const quickResults = await this.quickSearchPhase(processedQuery, db, settings);
      
      // 🔥 المرحلة 2: إذا كانت النتائج غير كافية، البحث العميق
      let finalResults = quickResults;
      if (quickResults.length < settings.finalResults && settings.enableFallbackStrategies) {
        console.log(`   🔄 نتائج سريعة غير كافية (${quickResults.length})، بدء البحث العميق`);
        const deepResults = await this.deepSearchPhase(processedQuery, db, settings);
        finalResults = this.mergeResults(quickResults, deepResults, settings);
      }
      
      // 🔥 المرحلة 3: إذا لم توجد نتائج، استخدام الاستراتيجيات الاحتياطية
      if (finalResults.length === 0 && settings.forceResults) {
        console.log(`   🚨 لم يتم العثور على نتائج، استخدام الاستراتيجيات الاحتياطية`);
        finalResults = await this.executeFallbackStrategies(processedQuery, db, settings);
      }
      
      // 🔥 المرحلة 4: تحسين النتائج النهائية
      finalResults = this.enhanceFinalResults(finalResults, processedQuery, settings);
      
      const searchTime = performance.now() - startTime;
      this.updateStatistics(searchTime, finalResults.length, databaseName);
      
      console.log(`✅ [${searchId}] اكتمل البحث:`, {
        وقت: `${searchTime.toFixed(1)}ms`,
        نتائج: finalResults.length,
        أفضل_تشابه: finalResults.length > 0 ? `${(finalResults[0].similarity * 100).toFixed(1)}%` : '0%',
        نوع_البحث: quickResults.length >= settings.finalResults ? 'سريع' : 'عميق'
      });
      
      // تحديث السياق
      this.updateContext(processedQuery, finalResults, databaseName);
      
      return finalResults;
      
    } catch (error) {
      console.error(`❌ [${searchId}] خطأ في البحث:`, error);
      this.stats.failedSearches++;
      return this.getEmergencyResults(db, query);
    }
  }

  /**
   * 🔥 تحضير الاستعلام
   */
  async prepareQuery(query, databaseName, settings) {
    const cacheKey = `query_${databaseName}_${this.normalizer.normalize(query)}`;
    
    if (this.queryCache.has(cacheKey)) {
      return this.queryCache.get(cacheKey);
    }
    
    const processed = {
      original: query,
      normalized: this.normalizer.normalize(query.toLowerCase()),
      timestamp: Date.now(),
      database: databaseName,
      expansions: [],
      reformulations: []
    };
    
    // 🔥 التوسيع الدلالي
    if (settings.enableSmartExpansion) {
      processed.expansions = this.expandQuery(processed.normalized);
      this.stats.queryExpansions++;
    }
    
    // 🔥 إعادة الصياغة
    if (settings.enableQueryReformulation) {
      processed.reformulations = this.reformulateQuery(processed.normalized, databaseName);
    }
    
    // 🔥 توليد التضمين
    processed.embedding = await this.generateEmbedding(
      processed.expansions.length > 0 ? 
      processed.normalized + ' ' + processed.expansions.join(' ') : 
      processed.normalized
    );
    
    // 🔥 تحليل الاستعلام
    processed.analysis = this.analyzeQuery(processed.normalized, databaseName);
    
    // التخزين المؤقت
    this.queryCache.set(cacheKey, processed);
    if (this.queryCache.size > 1000) {
      const firstKey = this.queryCache.keys().next().value;
      this.queryCache.delete(firstKey);
    }
    
    return processed;
  }

  /**
   * 🔥 توسيع الاستعلام
   */
  expandQuery(query) {
    const expansions = [];
    const words = query.split(/\s+/);
    
    words.forEach(word => {
      if (this.semanticExpansion[word]) {
        expansions.push(...this.semanticExpansion[word]);
      }
      
      // توسيع جزئي للكلمات
      if (word.length > 3) {
        for (const [key, synonyms] of Object.entries(this.semanticExpansion)) {
          if (word.includes(key) || key.includes(word)) {
            expansions.push(...synonyms.slice(0, 3));
          }
        }
      }
    });
    
    // إزالة التكرارات
    return [...new Set(expansions)];
  }

  /**
   * 🔥 إعادة صياغة الاستعلام
   */
  reformulateQuery(query, databaseName) {
    const reformulations = [];
    
    // إعادة صياغة حسب قاعدة البيانات
    switch(databaseName) {
      case 'activity':
        if (query.includes('فندق') && !query.includes('نشاط')) {
          reformulations.push('نشاط ' + query);
          reformulations.push(query + ' متطلبات ترخيص');
        }
        if (query.includes('إنشاء') || query.includes('تشغيل')) {
          reformulations.push(query + ' اشتراطات فنية');
          reformulations.push(query + ' متطلبات إنشاء');
        }
        break;
        
      case 'industrial':
        if (query.includes('منطقة') && !query.includes('صناعية')) {
          reformulations.push(query + ' صناعية');
          reformulations.push('منطقة صناعية ' + query);
        }
        break;
        
      case 'decision104':
        if (query.includes('فندق') || query.includes('مصنع')) {
          reformulations.push(query + ' حوافز');
          reformulations.push(query + ' قرار 104');
        }
        break;
    }
    
    return reformulations;
  }

  /**
   * 🔥 تحليل الاستعلام
   */
  analyzeQuery(query, databaseName) {
    const words = query.split(/\s+/).filter(w => w.length > 1);
    
    return {
      wordCount: words.length,
      containsHotel: /فندق/.test(query),
      containsFactory: /مصنع/.test(query),
      containsRestaurant: /مطعم/.test(query),
      containsActivity: /نشاط/.test(query),
      containsIndustrial: /صناعية/.test(query),
      containsIncentive: /حوافز|قرار/.test(query),
      keyWords: words.filter(w => w.length > 3 && !this.arabicStopWords.has(w)),
      isComplex: words.length > 4 || /و|أو|ثم/.test(query),
      database: databaseName
    };
  }

  /**
   * 🔥 البحث السريع
   */
  async quickSearchPhase(query, db, settings) {
    const results = [];
    const searchLimit = Math.min(settings.quickSearchLimit, db.data.length);
    
    // 🔍 الاستراتيجية 1: البحث بالمطابقة النصية المباشرة
    const textMatches = this.findDirectTextMatches(query.normalized, db, Math.floor(searchLimit / 2));
    results.push(...textMatches);
    
    // 🔍 الاستراتيجية 2: البحث في الفهرس الدلالي
    const semanticMatches = await this.findSemanticMatches(query, db, Math.floor(searchLimit / 2));
    results.push(...semanticMatches);
    
    // دمج وترتيب النتائج
    const merged = this.mergeAndRank(results, query, settings);
    
    return merged.slice(0, settings.finalResults);
  }

  /**
   * 🔥 البحث العميق
   */
  async deepSearchPhase(query, db, settings) {
    const results = [];
    const searchLimit = Math.min(settings.deepSearchLimit, db.data.length);
    
    console.log(`   🔍 بدء البحث العميق في ${searchLimit} سجل`);
    
    // البحث في مجموعة أكبر من السجلات
    const step = Math.max(1, Math.floor(db.data.length / searchLimit));
    
    for (let i = 0; i < db.data.length; i += step) {
      if (results.length >= settings.refineCandidates) break;
      
      const record = db.data[i];
      const similarity = await this.calculateComprehensiveSimilarity(query, record, db, settings);
      
      if (similarity >= settings.absoluteMinSimilarity) {
        results.push({
          ...record,
          similarity: similarity,
          _index: i,
          _searchType: 'deep'
        });
      }
    }
    
    return results.sort((a, b) => b.similarity - a.similarity).slice(0, settings.finalResults * 2);
  }

  /**
   * 🔍 إيجاد المطابقات النصية المباشرة
   */
  findDirectTextMatches(queryText, db, limit) {
    const matches = [];
    
    // البحث في الفهرس السريع
    const queryWords = queryText.split(/\s+/).filter(w => w.length > 2);
    
    queryWords.forEach(word => {
      if (db.keywordIndex.has(word)) {
        db.keywordIndex.get(word).forEach(idx => {
          if (matches.length >= limit) return;
          
          if (!matches.some(m => m._index === idx)) {
            const record = db.data[idx];
            const text = db.quickAccess.texts[idx];
            
            // حساب درجة المطابقة النصية
            let textScore = 0;
            queryWords.forEach(qWord => {
              if (text.includes(qWord)) {
                textScore += 2.0;
              } else if (qWord.length > 3) {
                // مطابقة جزئية
                for (let i = 0; i < text.length - qWord.length; i++) {
                  if (text.substr(i, qWord.length) === qWord) {
                    textScore += 1.0;
                    break;
                  }
                }
              }
            });
            
            const similarity = Math.min(textScore / (queryWords.length * 2), 0.6);
            
            if (similarity >= this.defaultConfig.absoluteMinSimilarity) {
              matches.push({
                ...record,
                similarity: similarity,
                _index: idx,
                _searchType: 'text_match'
              });
            }
          }
        });
      }
    });
    
    return matches.sort((a, b) => b.similarity - a.similarity).slice(0, limit);
  }

  /**
   * 🔍 إيجاد المطابقات الدلالية
   */
  async findSemanticMatches(query, db, limit) {
    const matches = [];
    
    // البحث في الفهرس الدلالي
    const queryWords = query.analysis.keyWords;
    
    for (const word of queryWords) {
      if (matches.length >= limit) break;
      
      // البحث بالمفاهيم
      for (const [concept, indices] of db.semanticIndex.entries()) {
        if (concept.includes(word) || word.includes(concept)) {
          for (const idx of indices) {
            if (matches.length >= limit) break;
            
            if (!matches.some(m => m._index === idx)) {
              const record = db.data[idx];
              const vector = db.quickAccess.embeddings[idx];
              
              if (vector) {
                const similarity = this.cosineSimilarity(query.embedding, vector);
                
                if (similarity >= this.defaultConfig.absoluteMinSimilarity) {
                  matches.push({
                    ...record,
                    similarity: similarity,
                    _index: idx,
                    _searchType: 'semantic'
                  });
                }
              }
            }
          }
        }
      }
    }
    
    return matches.sort((a, b) => b.similarity - a.similarity).slice(0, limit);
  }

  /**
   * 🔥 حساب التشابه الشامل
   */
  async calculateComprehensiveSimilarity(query, record, db, settings) {
    let maxSimilarity = 0;
    
    // 1. التضمينات المحفوظة
    if (record.embeddings?.multilingual_minilm?.embeddings) {
      const embeddings = record.embeddings.multilingual_minilm.embeddings;
      const variations = ['full', 'contextual', 'summary', 'key_phrases'];
      
      for (const variation of variations) {
        if (embeddings[variation]) {
          const sim = this.cosineSimilarity(query.embedding, embeddings[variation]);
          const weightedSim = sim * settings.semanticWeight;
          maxSimilarity = Math.max(maxSimilarity, weightedSim);
        }
      }
    }
    
    // 2. التضمين المباشر من النص
    const recordText = record.original_data?.text || record.original_data?.name || '';
    if (recordText && maxSimilarity < 0.4) {
      const recordEmbedding = await this.generateEmbedding(recordText);
      const directSim = this.cosineSimilarity(query.embedding, recordEmbedding);
      maxSimilarity = Math.max(maxSimilarity, directSim * 0.9);
    }
    
    // 3. المطابقة النصية
    const textMatchScore = this.calculateTextMatchScore(query, record);
    maxSimilarity = Math.max(maxSimilarity, textMatchScore * settings.textMatchWeight);
    
    // 4. تعزيز الميتاداتا
    const metadataScore = this.calculateMetadataScore(query, record);
    maxSimilarity = Math.max(maxSimilarity, metadataScore * settings.metadataWeight);
    
    // 5. التعزيز الإضافي للاستعلامات الموسعة
    if (query.expansions.length > 0) {
      const expansionScore = this.calculateExpansionScore(query, record);
      maxSimilarity = Math.max(maxSimilarity, expansionScore * settings.expansionWeight);
    }
    
    // 6. تعزيز بناءً على قاعدة البيانات
    if (query.analysis.database === 'activity' && record.original_data?.text?.includes('نشاط')) {
      maxSimilarity *= 1.1;
    }
    
    return Math.min(maxSimilarity, 0.95);
  }

  /**
   * 🔥 حساب درجة المطابقة النصية
   */
  calculateTextMatchScore(query, record) {
    const recordText = [
      record.original_data?.text || '',
      record.original_data?.name || '',
      record.original_data?.text_preview || ''
    ].join(' ').toLowerCase();
    
    const normalizedRecord = this.normalizer.normalize(recordText);
    const queryText = query.normalized;
    
    let score = 0;
    
    // مطابقة كاملة
    if (normalizedRecord.includes(queryText) || queryText.includes(normalizedRecord)) {
      score += 3.0;
    }
    
    // مطابقة كلمات
    const queryWords = queryText.split(/\s+/);
    const recordWords = normalizedRecord.split(/\s+/);
    
    let matchedWords = 0;
    queryWords.forEach(qWord => {
      if (recordWords.includes(qWord)) {
        matchedWords++;
        score += 1.5;
      } else if (qWord.length > 3) {
        // مطابقة جزئية
        for (const rWord of recordWords) {
          if (rWord.includes(qWord) || qWord.includes(rWord)) {
            matchedWords += 0.5;
            score += 0.8;
            break;
          }
        }
      }
    });
    
    // نسبة التطابق
    if (queryWords.length > 0) {
      const matchRatio = matchedWords / queryWords.length;
      score += matchRatio * 2.0;
    }
    
    return Math.min(score / 10, 1.0);
  }

  /**
   * 🔥 حساب درجة الميتاداتا
   */
  calculateMetadataScore(query, record) {
    const metadata = record.original_data;
    if (!metadata) return 0;
    
    let score = 0;
    const queryText = query.normalized;
    
    // التحقق من الحقول المهمة
    const fields = [
      { value: metadata.keywords?.join(' ') || '', weight: 3.0 },
      { value: metadata.synonyms?.join(' ') || '', weight: 2.5 },
      { value: metadata.intent?.join(' ') || '', weight: 2.0 },
      { value: metadata.governorate || '', weight: 1.5 },
      { value: metadata.dependency || '', weight: 1.5 },
      { value: metadata.decision || '', weight: 1.0 }
    ];
    
    fields.forEach(field => {
      if (field.value) {
        const fieldText = field.value.toLowerCase();
        
        // مطابقة مباشرة
        if (fieldText.includes(queryText) || queryText.includes(fieldText)) {
          score += field.weight * 2.0;
        }
        
        // مطابقة كلمات
        const queryWords = queryText.split(/\s+/);
        queryWords.forEach(word => {
          if (fieldText.includes(word)) {
            score += field.weight;
          }
        });
      }
    });
    
    return Math.min(score / 10, 1.0);
  }

  /**
   * 🔥 حساب درجة التوسيع
   */
  calculateExpansionScore(query, record) {
    const recordText = [
      record.original_data?.text || '',
      record.original_data?.name || ''
    ].join(' ').toLowerCase();
    
    const normalizedRecord = this.normalizer.normalize(recordText);
    let score = 0;
    
    // التحقق من المترادفات الموسعة
    query.expansions.forEach(expansion => {
      if (normalizedRecord.includes(expansion)) {
        score += 0.3;
      }
    });
    
    return Math.min(score, 1.0);
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
      const a = vecA[i] || 0;
      const b = vecB[i] || 0;
      dot += a * b;
      magA += a * a;
      magB += b * b;
    }

    const magnitude = Math.sqrt(magA) * Math.sqrt(magB);
    
    if (magnitude === 0) return 0;
    
    let similarity = dot / magnitude;
    
    // معالجة خاصة للتشابهات المنخفضة
    if (similarity < 0.1) {
      similarity *= 1.3; // رفع التشابهات المنخفضة
    } else if (similarity > 0.7) {
      similarity = 0.7 + (similarity - 0.7) * 0.5; // تخفيف التشابهات العالية جداً
    }
    
    return Math.max(0, Math.min(1, similarity));
  }

  /**
   * 🔥 دمج وترتيب النتائج
   */
  mergeAndRank(results, query, settings) {
    if (results.length === 0) return [];
    
    // إزالة التكرارات
    const uniqueResults = [];
    const seen = new Set();
    
    results.forEach(result => {
      const key = result.original_data?.text || result._index;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueResults.push(result);
      }
    });
    
    // ترتيب النتائج
    uniqueResults.sort((a, b) => {
      const scoreA = this.calculateFinalScore(a, query, settings);
      const scoreB = this.calculateFinalScore(b, query, settings);
      return scoreB - scoreA;
    });
    
    return uniqueResults;
  }

  /**
   * 🔥 حساب النتيجة النهائية
   */
  calculateFinalScore(result, query, settings) {
    let score = result.similarity;
    
    // تعزيز بناءً على نوع البحث
    switch (result._searchType) {
      case 'text_match':
        score *= 1.1;
        break;
      case 'semantic':
        score *= 1.05;
        break;
      case 'deep':
        score *= 1.0;
        break;
    }
    
    // تعزيز بناءً على طول النص (نصوص أطول قد تكون أكثر تفصيلاً)
    const textLength = result.original_data?.text?.length || 0;
    if (textLength > 100) {
      score *= 1.05;
    }
    
    // تعزيز بناءً على وجود كلمات الاستعلام
    const hasQueryWords = this.checkQueryWordsInResult(query, result);
    if (hasQueryWords) {
      score *= 1.08;
    }
    
    return score;
  }

  /**
   * 🔥 التحقق من وجود كلمات الاستعلام في النتيجة
   */
  checkQueryWordsInResult(query, result) {
    const recordText = [
      result.original_data?.text || '',
      result.original_data?.name || ''
    ].join(' ').toLowerCase();
    
    const normalizedRecord = this.normalizer.normalize(recordText);
    const queryWords = query.normalized.split(/\s+/).filter(w => w.length > 2);
    
    let matchedWords = 0;
    queryWords.forEach(word => {
      if (normalizedRecord.includes(word)) {
        matchedWords++;
      }
    });
    
    return matchedWords >= Math.min(2, queryWords.length);
  }

  /**
   * 🔥 دمج النتائج
   */
  mergeResults(quickResults, deepResults, settings) {
    const allResults = [...quickResults, ...deepResults];
    const merged = [];
    const seen = new Set();
    
    allResults.forEach(result => {
      const key = result.original_data?.text || result._index;
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(result);
      }
    });
    
    return merged.sort((a, b) => b.similarity - a.similarity).slice(0, settings.finalResults);
  }

  /**
   * 🔥 تنفيذ الاستراتيجيات الاحتياطية
   */
  async executeFallbackStrategies(query, db, settings) {
    const results = [];
    
    console.log(`   🛡️ تنفيذ الاستراتيجيات الاحتياطية (${db.data.length} سجل)`);
    
    // الاستراتيجية 1: البحث عن أي كلمة من الاستعلام
    const wordResults = this.fallbackWordSearch(query, db, 10);
    results.push(...wordResults);
    
    // الاستراتيجية 2: البحث في السجلات الأولى
    if (results.length < 3) {
      const firstResults = this.fallbackFirstRecords(db, 5);
      results.push(...firstResults);
    }
    
    // الاستراتيجية 3: البحث العشوائي
    if (results.length < 3) {
      const randomResults = this.fallbackRandomRecords(db, 5);
      results.push(...randomResults);
    }
    
    // ترتيب النتائج
    return results.sort((a, b) => b.similarity - a.similarity).slice(0, settings.finalResults);
  }

  /**
   * 🔍 البحث الاحتياطي بالكلمات
   */
  fallbackWordSearch(query, db, limit) {
    const results = [];
    const queryWords = query.normalized.split(/\s+/).filter(w => w.length > 2);
    
    if (queryWords.length === 0) return [];
    
    for (let i = 0; i < Math.min(50, db.data.length); i++) {
      if (results.length >= limit) break;
      
      const record = db.data[i];
      const text = db.quickAccess.texts[i];
      
      if (!text) continue;
      
      let foundAny = false;
      queryWords.forEach(word => {
        if (text.includes(word)) {
          foundAny = true;
        }
      });
      
      if (foundAny) {
        results.push({
          ...record,
          similarity: 0.18,
          _index: i,
          _searchType: 'fallback_word',
          _confidence: 'متوسطة'
        });
      }
    }
    
    return results;
  }

  /**
   * 🔍 البحث في السجلات الأولى
   */
  fallbackFirstRecords(db, limit) {
    const results = [];
    const count = Math.min(limit, db.data.length);
    
    for (let i = 0; i < count; i++) {
      results.push({
        ...db.data[i],
        similarity: 0.15,
        _index: i,
        _searchType: 'fallback_first',
        _confidence: 'منخفضة'
      });
    }
    
    return results;
  }

  /**
   * 🔍 البحث العشوائي
   */
  fallbackRandomRecords(db, limit) {
    const results = [];
    const total = db.data.length;
    
    if (total === 0) return [];
    
    for (let i = 0; i < limit; i++) {
      const randomIndex = Math.floor(Math.random() * total);
      results.push({
        ...db.data[randomIndex],
        similarity: 0.12,
        _index: randomIndex,
        _searchType: 'fallback_random',
        _confidence: 'ضعيفة'
      });
    }
    
    return results;
  }

  /**
   * 🔥 تحسين النتائج النهائية
   */
  enhanceFinalResults(results, query, settings) {
    if (results.length === 0) return [];
    
    return results.map((result, index) => {
      const enhanced = { ...result };
      
      // إضافة معلومات العرض
      enhanced.displayInfo = this.generateDisplayInfo(result, query);
      
      // تحديد مستوى الثقة
      enhanced.confidence = this.determineConfidenceLevel(result.similarity);
      
      // إضافة ترتيب
      enhanced.rank = index + 1;
      
      // تعزيز التشابه بناءً على الترتيب
      if (settings.enableAdaptiveThreshold && index < 3) {
        enhanced.similarity = Math.min(result.similarity * (1 + (3 - index) * 0.05), 0.9);
      }
      
      return enhanced;
    });
  }

  /**
   * 🔥 توليد معلومات العرض
   */
  generateDisplayInfo(result, query) {
    const data = result.original_data || {};
    
    return {
      title: data.name || 'نشاط غير معروف',
      summary: data.text_preview || data.text?.substring(0, 150) || 'لا يوجد وصف',
      keyPoints: [
        ...(data.keywords?.slice(0, 3) || []),
        data.governorate ? `المحافظة: ${data.governorate}` : null,
        data.dependency ? `التبعية: ${data.dependency}` : null
      ].filter(Boolean),
      relevance: this.calculateRelevanceDescription(result.similarity),
      matchType: result._searchType || 'غير معروف'
    };
  }

  /**
   * 🔥 تحديد مستوى الثقة
   */
  determineConfidenceLevel(similarity) {
    if (similarity >= 0.6) return 'عالية جداً';
    if (similarity >= 0.4) return 'عالية';
    if (similarity >= 0.25) return 'متوسطة';
    if (similarity >= 0.15) return 'منخفضة';
    return 'ضعيفة';
  }

  /**
   * 🔥 حساب وصف الصلة
   */
  calculateRelevanceDescription(similarity) {
    if (similarity >= 0.5) return 'صلة عالية جداً';
    if (similarity >= 0.35) return 'صلة عالية';
    if (similarity >= 0.2) return 'صلة متوسطة';
    if (similarity >= 0.12) return 'صلة منخفضة';
    return 'صلة ضعيفة';
  }

  /**
   * 🔥 تحديث الإحصائيات
   */
  updateStatistics(searchTime, resultCount, databaseName) {
    this.stats.totalSearches++;
    
    if (resultCount > 0) {
      this.stats.successfulSearches++;
      
      if (resultCount >= 3) {
        this.stats.highConfidenceResults++;
      }
    } else {
      this.stats.failedSearches++;
    }
    
    this.stats.averageSearchTime = 
      (this.stats.averageSearchTime * (this.stats.totalSearches - 1) + searchTime) 
      / this.stats.totalSearches;
  }

  /**
   * 🔥 تحديث السياق
   */
  updateContext(query, results, databaseName) {
    // حفظ الاستعلام
    this.context.sessionQueries.push({
      query: query.original,
      database: databaseName,
      timestamp: query.timestamp,
      resultCount: results.length
    });
    
    // حفظ الأنماط الناجحة
    if (results.length > 0) {
      const pattern = query.normalized.substring(0, 30);
      if (!this.context.successfulPatterns.has(pattern)) {
        this.context.successfulPatterns.set(pattern, 1);
      } else {
        this.context.successfulPatterns.set(pattern, this.context.successfulPatterns.get(pattern) + 1);
      }
    }
    
    // الحفاظ على حجم معقول
    if (this.context.sessionQueries.length > 20) {
      this.context.sessionQueries.shift();
    }
  }

  /**
   * 🔥 الحصول على نتائج الطوارئ
   */
  getEmergencyResults(db, query) {
    console.log(`   🚑 إرجاع نتائج الطوارئ للاستعلام: "${query}"`);
    
    const results = [];
    const count = Math.min(3, db.data.length);
    
    for (let i = 0; i < count; i++) {
      results.push({
        ...db.data[i],
        similarity: 0.1,
        _index: i,
        _searchType: 'emergency',
        _confidence: 'ضعيفة جداً',
        displayInfo: {
          title: 'نتيجة طوارئ',
          summary: 'هذه نتيجة عامة من قاعدة البيانات بسبب مشكلة في البحث',
          keyPoints: ['نتيجة طوارئ', 'يوصى بإعادة صياغة الاستعلام'],
          relevance: 'صلة ضعيفة',
          matchType: 'emergency'
        }
      });
    }
    
    return results;
  }

  /**
   * 🔥 تفعيل وضع الطوارئ
   */
  activateEmergencyMode() {
    console.warn('🚨 تفعيل وضع الطوارئ - استخدام إعدادات مبسطة');
    
    this.defaultConfig = {
      absoluteMinSimilarity: 0.03,
      minSimilarity: 0.08,
      semanticWeight: 0.6,
      textMatchWeight: 0.4,
      forceResults: true,
      enableFallbackStrategies: true
    };
  }

  /**
   * 🔥 البحث المتوازي
   */
  async parallelSearch(query, config = {}) {
    const startTime = performance.now();
    const settings = {
      ...this.defaultConfig,
      ...config,
      databases: config.databases || ['activity', 'decision104', 'industrial']
    };

    console.log(`⚡ بحث متوازي في ${settings.databases.length} قواعد...`);

    const searchPromises = settings.databases.map(dbName => 
      this.semanticSearch(query, dbName, settings)
    );

    const allResults = await Promise.all(searchPromises);

    const resultMap = {
      activity: allResults[0] || [],
      decision104: allResults[1] || [],
      industrial: allResults[2] || []
    };

    const totalTime = performance.now() - startTime;
    const totalResults = allResults.reduce((sum, arr) => sum + arr.length, 0);
    
    console.log(`✅ اكتمل البحث المتوازي: ${totalResults} نتيجة (${totalTime.toFixed(1)}ms)`);

    return {
      ...resultMap,
      totalResults: totalResults,
      query: query,
      searchTime: totalTime,
      success: totalResults > 0
    };
  }

  /**
   * 🔥 توليد التضمين
   */
  async generateEmbedding(text, metadata = {}) {
    const cacheKey = `emb_${this.normalizer.normalize(text)}_${JSON.stringify(metadata)}`;
    
    if (this.embeddingCache.has(cacheKey)) {
      this.stats.cacheHits++;
      return this.embeddingCache.get(cacheKey);
    }

    this.stats.cacheMisses++;
    
    const vector = this.createArabicEmbedding(text, metadata);
    this.embeddingCache.set(cacheKey, vector);
    
    if (this.embeddingCache.size > this.maxCacheSize) {
      const firstKey = this.embeddingCache.keys().next().value;
      this.embeddingCache.delete(firstKey);
    }
    
    return vector;
  }

  /**
   * 🔥 إنشاء تضمين عربي
   */
  createArabicEmbedding(text, metadata = {}) {
    const vector = new Array(this.vectorDimension).fill(0);
    const normalized = this.normalizer.normalize(text.toLowerCase());
    const words = normalized.split(/\s+/).filter(w => w.length > 1 && !this.arabicStopWords.has(w));
    
    if (words.length === 0) return vector;
    
    // تمثيل الكلمات
    words.forEach((word, idx) => {
      const importance = 1.5 / Math.sqrt(idx + 1);
      const hash = this.stringHash(word);
      
      // توزيع على 15 موقع
      for (let i = 0; i < 15; i++) {
        const pos = Math.abs(hash * (i + 1) + i * 67) % this.vectorDimension;
        const value = Math.sin(hash + i * 0.3) * importance;
        vector[pos] += value;
      }
    });
    
    // تمثيل العبارات (2 كلمات)
    for (let i = 0; i < words.length - 1; i++) {
      const phrase = words[i] + words[i + 1];
      const hash = this.stringHash(phrase);
      
      for (let j = 0; j < 8; j++) {
        const pos = Math.abs(hash * (j + 2) + j * 89) % this.vectorDimension;
        vector[pos] += 0.6;
      }
    }
    
    // إضافة الميتاداتا
    if (Object.keys(metadata).length > 0) {
      const metaText = Object.values(metadata).filter(v => typeof v === 'string').join(' ');
      const metaWords = this.normalizer.normalize(metaText.toLowerCase()).split(/\s+/);
      
      metaWords.forEach((word, idx) => {
        const hash = this.stringHash(word);
        const pos = Math.abs(hash + idx * 17) % this.vectorDimension;
        vector[pos] += 0.3;
      });
    }
    
    return this.normalizeVector(vector);
  }

  /**
   * 🛠️ أدوات مساعدة
   */
  
  validateDatabase(db, dbName) {
    if (!db || !db.data || db.data.length === 0) {
      console.warn(`⚠️ قاعدة ${dbName} فارغة`);
      return false;
    }
    
    if (!db.quickAccess || !db.quickAccess.texts) {
      console.warn(`⚠️ قاعدة ${dbName} غير مجهزة للبحث السريع`);
      return false;
    }
    
    return true;
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

  normalizeVector(vector) {
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return magnitude > 0 ? vector.map(v => v / magnitude) : vector;
  }

  /**
   * 📊 الحصول على إحصائيات
   */
  getStatistics() {
    const totalCache = this.stats.cacheHits + this.stats.cacheMisses;
    const cacheRate = totalCache > 0 ? (this.stats.cacheHits / totalCache * 100).toFixed(1) : 0;
    const successRate = this.stats.totalSearches > 0 ? 
      (this.stats.successfulSearches / this.stats.totalSearches * 100).toFixed(1) : 0;
    
    return {
      بحث: {
        إجمالي_البحث: this.stats.totalSearches,
        نجاح: `${successRate}%`,
        فشل: this.stats.failedSearches,
        متوسط_الزمن: `${this.stats.averageSearchTime.toFixed(1)}ms`,
        نتائج_عالية_الثقة: this.stats.highConfidenceResults
      },
      ذاكرة: {
        تضمينات_مخزنة: this.embeddingCache.size,
        استعلامات_مخزنة: this.queryCache.size,
        نسبة_ضربات_الذاكرة: `${cacheRate}%`,
        توسيع_استعلامات: this.stats.queryExpansions
      },
      سياق: {
        استعلامات_الجلسة: this.context.sessionQueries.length,
        أنماط_ناجحة: this.context.successfulPatterns.size,
        مراجع_متقاطعة: this.context.crossReferences.length
      }
    };
  }

  /**
   * 🧹 تنظيف الذاكرة
   */
  clearCache() {
    this.embeddingCache.clear();
    this.queryCache.clear();
    this.semanticCache.clear();
    
    this.stats.cacheHits = 0;
    this.stats.cacheMisses = 0;
    
    console.log('🧹 تم تنظيف ذاكرة التخزين المؤقت');
  }

  /**
   * 🧠 مسح السياق
   */
  clearContext() {
    this.context = {
      sessionQueries: [],
      successfulPatterns: new Map(),
      failedPatterns: new Map(),
      entityHistory: [],
      crossReferences: []
    };
    
    console.log('🧠 تم مسح ذاكرة السياق');
  }

  /**
   * 🔧 إعادة الضبط
   */
  reset() {
    this.clearCache();
    this.clearContext();
    
    this.stats = {
      totalSearches: 0,
      successfulSearches: 0,
      failedSearches: 0,
      averageSearchTime: 0,
      cacheHits: 0,
      cacheMisses: 0,
      highConfidenceResults: 0,
      queryExpansions: 0
    };
    
    console.log('🔧 تم إعادة ضبط النظام بالكامل');
  }
}

// تصدير للاستخدام في Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VectorEngine;
}

// تصدير للاستخدام في المتصفح
if (typeof window !== 'undefined') {
  window.VectorEngine = VectorEngine;
}
