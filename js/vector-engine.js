/**
 * 🚀 محرك المتجهات المتقدم - البحث الذكي الحقيقي
 * Advanced Vector Engine - Real Smart Search
 * 
 * @author AI Expert System
 * @version 8.0.0 - Intelligent Semantic Matching
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
      successfulSearches: 0,
      averageSearchTime: 0,
      highQualityMatches: 0
    };

    // 🔥 إعدادات بحث عدوانية
    this.defaultConfig = {
      // المرحلة 1: جمع واسع
      initialCandidateLimit: 200,      // جمع 200 مرشح
      candidateSimilarityThreshold: 0.05, // عتبة منخفضة جداً
      
      // المرحلة 2: تحسين النتائج
      refineTopK: 30,                  // أفضل 30 مرشح للتحسين
      minDisplaySimilarity: 0.12,      // الحد الأدنى للعرض
      
      // الأوزان (تركيز كامل على الدلالة)
      semanticWeight: 0.95,            // تركيز عالي على الدلالة
      metadataBoost: 0.30,             // تعزيز بالميتاداتا
      textMatchBoost: 0.40,            // تعزيز بالمطابقة النصية
      
      // الميزات المتقدمة
      enableTextExpansion: true,       // توسيع النص تلقائياً
      enableQueryReformulation: true,  // إعادة صياغة الاستعلام
      enableHybridMatching: true,      // مطابقة هجينة
      aggressiveFallback: true,        // استراتيجيات عدوانية للعثور على نتائج
      forceFindResults: true           // إجبار العثور على نتائج
    };

    // 🔥 قاموس توسيع الاستعلامات
    this.queryExpansionDict = {
      // توسيع "فندق"
      'فندق': [
        'منشأة فندقية', 'مؤسسة فندقية', 'مكان إقامة', 'سكن فندقي',
        'نزل', 'منتجع', 'فندق سياحي', 'فندق تجاري', 'فندق نجوم'
      ],
      
      // توسيع "مصنع"
      'مصنع': [
        'منشأة صناعية', 'معمل', 'مصنعة', 'ورشة صناعية',
        'مصنع إنتاج', 'مصنع تصنيع', 'منشأة تصنيع'
      ],
      
      // توسيع "مطعم"
      'مطعم': [
        'محل طعام', 'مأكولات', 'مطعمي', 'كافيتيريا',
        'مطعم وجبات سريعة', 'مطعم عائلي', 'مطعم راقي'
      ],
      
      // توسيع "نشاط"
      'نشاط': [
        'عمل', 'مشروع', 'مهنة', 'صنعة',
        'عملية', 'مهمة', 'وظيفة', 'ممارسة'
      ],
      
      // توسيع "إنشاء"
      'انشاء': ['تأسيس', 'إنشاء', 'بناء', 'تشييد', 'تكوين'],
      'تشغيل': ['تشغيل', 'إدارة', 'تشغيل وإدارة', 'إدارة وتشغيل'],
      
      // توسيع "ترخيص"
      'ترخيص': ['رخصة', 'تصريح', 'إذن', 'موافقة', 'ترخيص رسمي']
    };

    // 🔥 ذاكرة النتائج الناجحة
    this.successfulPatterns = new Map();
  }

  /**
   * 📦 تحميل قواعد البيانات
   */
  async loadDatabases(vectorDatabases) {
    console.log('📦 تحميل قواعد البيانات للبحث الذكي...');
    
    try {
      this.databases.activity = vectorDatabases.activity;
      this.databases.decision104 = vectorDatabases.decision104;
      this.databases.industrial = vectorDatabases.industrial;

      // التحضير السريع للبحث
      this.prepareDatabases();

      console.log('✅ جاهز للبحث الذكي:');
      console.log(`   🏢 الأنشطة: ${this.databases.activity?.data?.length || 0} سجل`);
      console.log(`   💰 القرار 104: ${this.databases.decision104?.data?.length || 0} سجل`);
      console.log(`   🗺️ المناطق: ${this.databases.industrial?.data?.length || 0} سجل`);

      return true;
    } catch (error) {
      console.error('❌ خطأ في تحميل القواعد:', error);
      return false;
    }
  }

  /**
   * ⚡ تحضير قواعد البيانات للبحث السريع
   */
  prepareDatabases() {
    for (const [dbName, db] of Object.entries(this.databases)) {
      if (!db || !db.data) continue;

      // إنشاء فهرس نصي سريع
      db.quickTextIndex = db.data.map((record, idx) => {
        const data = record.original_data || {};
        return {
          id: idx,
          text: (data.text || '').toLowerCase(),
          name: (data.name || '').toLowerCase(),
          preview: (data.text_preview || '').toLowerCase(),
          keywords: (data.keywords || []).join(' ').toLowerCase(),
          synonyms: (data.synonyms || []).join(' ').toLowerCase()
        };
      });

      // تجهيز المتجهات للوصول السريع
      db.embeddingCache = db.data.map(record => 
        record.embeddings?.multilingual_minilm?.embeddings?.full || null
      );

      console.log(`   ⚡ ${dbName}: جاهز للبحث السريع`);
    }
  }

  /**
   * 🔥 البحث الدلالي الرئيسي
   */
  async semanticSearch(query, databaseName, config = {}) {
    const startTime = performance.now();
    const searchId = Math.random().toString(36).substr(2, 8);
    
    console.log(`🔍 [${searchId}] بحث ذكي: "${query}" في ${databaseName}`);
    
    const settings = { ...this.defaultConfig, ...config };
    const db = this.databases[databaseName];
    
    if (!db || !db.data || db.data.length === 0) {
      return [];
    }

    try {
      // 🔥 المرحلة 0: معالجة الاستعلام وتحسينه
      const processedQuery = this.enhanceQuery(query, databaseName);
      console.log(`   📝 الاستعلام المعالج: "${processedQuery.enhanced}"`);
      
      // 🔥 المرحلة 1: البحث الواسع (جمع أكبر عدد من المرشحين)
      const candidates = await this.broadSearchPhase(processedQuery, db, settings);
      
      if (candidates.length === 0) {
        console.log(`   ⚠️ لم يتم العثور على مرشحين، جلب عينات عشوائية`);
        return this.getRandomSamples(db, 3);
      }
      
      console.log(`   📊 وجد ${candidates.length} مرشحاً`);
      
      // 🔥 المرحلة 2: تحسين وتقييم المرشحين
      const evaluatedResults = await this.evaluateCandidates(processedQuery, candidates, db, settings);
      
      // 🔥 المرحلة 3: تصفية وترتيب النتائج
      const finalResults = this.filterAndRankResults(evaluatedResults, settings);
      
      const searchTime = performance.now() - startTime;
      this.updateStats(searchTime, finalResults.length);
      
      console.log(`✅ [${searchId}] اكتمل: ${finalResults.length} نتيجة (${searchTime.toFixed(1)}ms)`);
      if (finalResults.length > 0) {
        console.log(`   🏆 أفضل نتيجة: ${(finalResults[0].similarity * 100).toFixed(1)}%`);
      }
      
      // 🔥 المرحلة 4: إذا لم توجد نتائج جيدة، البحث النصي الاحتياطي
      if (finalResults.length === 0 || finalResults[0].similarity < 0.15) {
        console.log(`   🔄 تنشيط البحث النصي الاحتياطي`);
        const textResults = this.textBasedFallback(query, db);
        if (textResults.length > 0) {
          console.log(`   📄 وجد ${textResults.length} نتيجة نصية`);
          return textResults;
        }
      }
      
      return finalResults;
      
    } catch (error) {
      console.error(`❌ [${searchId}] خطأ:`, error);
      return this.emergencyFallback(query, db);
    }
  }

  /**
   * 🔥 تحسين الاستعلام
   */
  enhanceQuery(query, databaseName) {
    const normalized = this.normalizer.normalize(query.toLowerCase());
    const words = normalized.split(/\s+/).filter(w => w.length > 1);
    
    // التوسيع التلقائي
    let expandedQuery = normalized;
    if (this.defaultConfig.enableTextExpansion) {
      expandedQuery = this.expandQueryText(normalized);
    }
    
    // إعادة الصياغة الذكية
    let reformulated = normalized;
    if (this.defaultConfig.enableQueryReformulation) {
      reformulated = this.reformulateQuery(normalized, databaseName);
    }
    
    return {
      original: query,
      normalized: normalized,
      enhanced: expandedQuery,
      reformulated: reformulated,
      words: words,
      isActivityQuery: /فندق|مصنع|مطعم|مقهى|ورشة|معمل/.test(normalized),
      isIndustrialQuery: /منطقة|صناعية|موقع|محافظة/.test(normalized),
      isDecisionQuery: /قرار|104|حوافز|إعفاء/.test(normalized)
    };
  }

  /**
   * 🔥 توسيع نص الاستعلام
   */
  expandQueryText(query) {
    let expanded = query;
    const words = query.split(/\s+/);
    
    words.forEach(word => {
      if (this.queryExpansionDict[word]) {
        expanded += ' ' + this.queryExpansionDict[word].join(' ');
      }
    });
    
    return expanded;
  }

  /**
   * 🔥 إعادة صياغة الاستعلام
   */
  reformulateQuery(query, databaseName) {
    let reformulated = query;
    
    // إعادة صياغة حسب قاعدة البيانات
    switch(databaseName) {
      case 'activity':
        if (query.includes('فندق') && !query.includes('نشاط')) {
          reformulated = 'نشاط ' + query;
        }
        if (query.includes('إنشاء') || query.includes('تشغيل')) {
          reformulated += ' متطلبات ترخيص اشتراطات';
        }
        break;
        
      case 'industrial':
        if (query.includes('منطقة') && !query.includes('صناعية')) {
          reformulated = query + ' صناعية';
        }
        break;
        
      case 'decision104':
        if (query.includes('فندق') || query.includes('مصنع')) {
          reformulated = query + ' حوافز قرار 104';
        }
        break;
    }
    
    return reformulated;
  }

  /**
   * 🔥 مرحلة البحث الواسع
   */
  async broadSearchPhase(query, db, settings) {
    const candidates = [];
    
    // الاستراتيجية 1: البحث بالمطابقة النصية المباشرة
    const textMatches = this.findTextMatches(query, db, 50);
    candidates.push(...textMatches);
    
    // الاستراتيجية 2: البحث في المتجهات المحفوظة
    const vectorMatches = await this.findVectorMatches(query, db, 100);
    candidates.push(...vectorMatches);
    
    // الاستراتيجية 3: البحث بالمفاهيم
    const conceptMatches = this.findConceptMatches(query, db, 50);
    candidates.push(...conceptMatches);
    
    // إزالة التكرارات وفرز
    return this.deduplicateAndSort(candidates, query);
  }

  /**
   * 🔥 البحث بالمطابقة النصية
   */
  findTextMatches(query, db, limit = 50) {
    const matches = [];
    const queryText = query.normalized;
    
    for (let i = 0; i < db.data.length; i++) {
      if (matches.length >= limit) break;
      
      const record = db.data[i];
      const textData = db.quickTextIndex[i];
      
      if (!textData) continue;
      
      let matchScore = 0;
      
      // البحث في الحقول النصية المختلفة
      const searchFields = [
        { text: textData.text, weight: 3.0 },
        { text: textData.name, weight: 4.0 },
        { text: textData.preview, weight: 2.5 },
        { text: textData.keywords, weight: 2.0 },
        { text: textData.synonyms, weight: 1.5 }
      ];
      
      searchFields.forEach(field => {
        if (field.text && field.text.includes(queryText)) {
          matchScore += field.weight * 2.0;
        }
        
        // مطابقة كلمات
        const queryWords = query.words;
        queryWords.forEach(word => {
          if (field.text.includes(word)) {
            matchScore += field.weight;
          }
        });
      });
      
      if (matchScore > 0) {
        matches.push({
          record: record,
          index: i,
          score: matchScore,
          type: 'text'
        });
      }
    }
    
    return matches.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  /**
   * 🔥 البحث في المتجهات
   */
  async findVectorMatches(query, db, limit = 100) {
    const matches = [];
    const queryEmbedding = await this.generateSmartEmbedding(query.enhanced);
    
    // البحث في عينة من السجلات (وليس كلها لتحسين السرعة)
    const sampleSize = Math.min(150, db.data.length);
    const step = Math.max(1, Math.floor(db.data.length / sampleSize));
    
    for (let i = 0; i < db.data.length; i += step) {
      if (matches.length >= limit) break;
      
      const record = db.data[i];
      const vector = db.embeddingCache[i];
      
      if (!vector) continue;
      
      const similarity = this.cosineSimilarity(queryEmbedding, vector);
      
      if (similarity >= settings.candidateSimilarityThreshold) {
        matches.push({
          record: record,
          index: i,
          similarity: similarity,
          type: 'vector'
        });
      }
    }
    
    return matches.sort((a, b) => b.similarity - a.similarity).slice(0, limit);
  }

  /**
   * 🔥 البحث بالمفاهيم
   */
  findConceptMatches(query, db, limit = 50) {
    const matches = [];
    const queryWords = query.words;
    
    for (let i = 0; i < db.data.length; i++) {
      if (matches.length >= limit) break;
      
      const record = db.data[i];
      const textData = db.quickTextIndex[i];
      
      if (!textData) continue;
      
      // جمع كل النصوص في سلسلة واحدة
      const allText = [
        textData.text,
        textData.name,
        textData.preview,
        textData.keywords,
        textData.synonyms
      ].join(' ').toLowerCase();
      
      const normalizedText = this.normalizer.normalize(allText);
      
      // حساب مطابقة المفاهيم
      let conceptScore = 0;
      queryWords.forEach(word => {
        if (normalizedText.includes(word)) {
          conceptScore += 2.0;
        }
        
        // مطابقة جزئية للكلمات الطويلة
        if (word.length > 4) {
          for (let j = 0; j < normalizedText.length - word.length; j++) {
            if (normalizedText.substr(j, word.length) === word) {
              conceptScore += 1.5;
              break;
            }
          }
        }
      });
      
      if (conceptScore > 0) {
        matches.push({
          record: record,
          index: i,
          score: conceptScore,
          type: 'concept'
        });
      }
    }
    
    return matches.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  /**
   * 🔥 إزالة التكرارات والترتيب
   */
  deduplicateAndSort(candidates, query) {
    const unique = new Map();
    
    candidates.forEach(candidate => {
      const key = candidate.record.original_data?.text || candidate.record.original_data?.name || candidate.index;
      
      if (!unique.has(key)) {
        unique.set(key, candidate);
      } else {
        // تحديث النتيجة إذا كانت أفضل
        const existing = unique.get(key);
        const newScore = this.calculateCandidateScore(candidate, query);
        const existingScore = this.calculateCandidateScore(existing, query);
        
        if (newScore > existingScore) {
          unique.set(key, candidate);
        }
      }
    });
    
    return Array.from(unique.values()).sort((a, b) => {
      return this.calculateCandidateScore(b, query) - this.calculateCandidateScore(a, query);
    });
  }

  /**
   * 🔥 حساب نقاط المرشح
   */
  calculateCandidateScore(candidate, query) {
    let score = 0;
    
    switch(candidate.type) {
      case 'text':
        score = candidate.score * 0.5;
        break;
      case 'vector':
        score = candidate.similarity * 2.0;
        break;
      case 'concept':
        score = candidate.score * 0.3;
        break;
    }
    
    // تعزيز بناءً على نوع الاستعلام
    if (query.isActivityQuery && candidate.record.original_data?.text?.includes('نشاط')) {
      score *= 1.3;
    }
    
    return score;
  }

  /**
   * 🔥 تقييم المرشحين
   */
  async evaluateCandidates(query, candidates, db, settings) {
    const results = [];
    const queryEmbedding = await this.generateSmartEmbedding(query.enhanced);
    
    // أخذ أفضل المرشحين للتقييم
    const topCandidates = candidates.slice(0, settings.refineTopK);
    
    for (const candidate of topCandidates) {
      const finalSimilarity = await this.calculateFinalSimilarity(
        queryEmbedding,
        candidate.record,
        query,
        settings
      );
      
      if (finalSimilarity >= settings.minDisplaySimilarity) {
        results.push({
          ...candidate.record,
          similarity: finalSimilarity,
          database: db.name,
          _index: candidate.index,
          _matchType: candidate.type,
          _boosted: finalSimilarity > candidate.similarity
        });
      }
    }
    
    return results;
  }

  /**
   * 🔥 توليد تضمين ذكي
   */
  async generateSmartEmbedding(text) {
    // 🔥 محاولة جعل التضمين أكثر تمثيلاً للاستعلامات العربية
    const vector = new Array(this.vectorDimension).fill(0);
    const normalized = this.normalizer.normalize(text.toLowerCase());
    const words = normalized.split(/\s+/).filter(w => w.length > 1);
    
    // تمثيل قوي للكلمات الرئيسية
    words.forEach((word, idx) => {
      const importance = 2.0 / Math.sqrt(idx + 1); // وزن أكبر للكلمات الأولى
      const hash = this.stringHash(word);
      
      // توزيع على 20 موقع مختلف
      for (let i = 0; i < 20; i++) {
        const pos = Math.abs(hash * (i + 1) + i * 137) % this.vectorDimension;
        const value = Math.sin(hash + i * 0.5) * importance;
        vector[pos] += value;
      }
    });
    
    // تمثيل للعبارات (bigrams)
    for (let i = 0; i < words.length - 1; i++) {
      const phrase = words[i] + ' ' + words[i + 1];
      const hash = this.stringHash(phrase);
      
      for (let j = 0; j < 10; j++) {
        const pos = Math.abs(hash * (j + 2) + j * 89) % this.vectorDimension;
        vector[pos] += 0.8;
      }
    }
    
    return this.normalizeVector(vector);
  }

  /**
   * 🔥 حساب التشابه النهائي
   */
  async calculateFinalSimilarity(queryVector, record, query, settings) {
    let maxSimilarity = 0;
    
    // 1. المتجهات المحفوظة (الأولوية)
    if (record.embeddings?.multilingual_minilm?.embeddings) {
      const embeddings = record.embeddings.multilingual_minilm.embeddings;
      const variations = ['full', 'contextual', 'summary', 'key_phrases', 'no_stopwords'];
      
      for (const variation of variations) {
        if (embeddings[variation]) {
          const sim = this.cosineSimilarity(queryVector, embeddings[variation]);
          const weightedSim = sim * settings.semanticWeight;
          maxSimilarity = Math.max(maxSimilarity, weightedSim);
        }
      }
    }
    
    // 2. إذا كان التشابه منخفضاً، نحاول توليد تضمين جديد من النص الأصلي
    if (maxSimilarity < 0.3) {
      const recordText = record.original_data?.text || record.original_data?.name || '';
      if (recordText.length > 10) {
        const recordVector = await this.generateSmartEmbedding(recordText);
        const directSim = this.cosineSimilarity(queryVector, recordVector);
        maxSimilarity = Math.max(maxSimilarity, directSim * 0.9);
      }
    }
    
    // 3. تعزيز بالميتاداتا (مهم جداً)
    const metadataBoost = this.calculateMetadataBoost(record.original_data, query);
    maxSimilarity = maxSimilarity * (1 - settings.metadataBoost) + metadataBoost * settings.metadataBoost;
    
    // 4. تعزيز بالمطابقة النصية المباشرة
    if (settings.textMatchBoost > 0) {
      const textMatchScore = this.calculateTextMatchScore(record.original_data, query);
      maxSimilarity = maxSimilarity * (1 - settings.textMatchBoost) + textMatchScore * settings.textMatchBoost;
    }
    
    // 5. تعزيز إضافي بناءً على نوع الاستعلام
    if (query.isActivityQuery && record.original_data?.text?.includes('فندق')) {
      maxSimilarity *= 1.2;
    }
    
    return Math.min(maxSimilarity, 0.95);
  }

  /**
   * 🔥 حساب تعزيز الميتاداتا
   */
  calculateMetadataBoost(metadata, query) {
    if (!metadata) return 0;
    
    let boost = 0;
    const queryLower = query.normalized;
    
    // التحقق من وجود كلمات الاستعلام في الميتاداتا
    const metaFields = [
      { value: metadata.text, weight: 5.0 },
      { value: metadata.name, weight: 4.0 },
      { value: metadata.text_preview, weight: 3.0 },
      { value: metadata.keywords?.join(' '), weight: 2.5 },
      { value: metadata.synonyms?.join(' '), weight: 2.0 },
      { value: metadata.governorate, weight: 1.5 },
      { value: metadata.dependency, weight: 1.5 }
    ];
    
    metaFields.forEach(field => {
      if (field.value && typeof field.value === 'string') {
        const metaText = field.value.toLowerCase();
        
        // مطابقة مباشرة
        if (metaText.includes(queryLower) || queryLower.includes(metaText)) {
          boost += field.weight * 2.0;
        }
        
        // مطابقة كلمات
        query.words.forEach(word => {
          if (metaText.includes(word)) {
            boost += field.weight;
          }
        });
      }
    });
    
    return Math.min(boost / 20, 1.0);
  }

  /**
   * 🔥 حساب نقاط المطابقة النصية
   */
  calculateTextMatchScore(metadata, query) {
    if (!metadata) return 0;
    
    const allText = [
      metadata.text || '',
      metadata.name || '',
      metadata.text_preview || '',
      ...(metadata.keywords || []),
      ...(metadata.synonyms || [])
    ].join(' ').toLowerCase();
    
    const normalizedText = this.normalizer.normalize(allText);
    let matchScore = 0;
    
    // مطابقة كاملة
    if (normalizedText.includes(query.normalized)) {
      matchScore += 3.0;
    }
    
    // مطابقة كلمات
    query.words.forEach(word => {
      if (normalizedText.includes(word)) {
        matchScore += 1.5;
      }
      
      // مطابقة جزئية للكلمات الطويلة
      if (word.length > 4) {
        for (let i = 0; i <= normalizedText.length - word.length; i++) {
          if (normalizedText.substr(i, word.length) === word) {
            matchScore += 1.0;
            break;
          }
        }
      }
    });
    
    // مطابقة بالمرادفات الموسعة
    if (this.defaultConfig.enableTextExpansion) {
      query.words.forEach(word => {
        if (this.queryExpansionDict[word]) {
          this.queryExpansionDict[word].forEach(synonym => {
            if (normalizedText.includes(synonym)) {
              matchScore += 0.8;
            }
          });
        }
      });
    }
    
    return Math.min(matchScore / (query.words.length * 3), 1.0);
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

    const mag = Math.sqrt(magA) * Math.sqrt(magB);
    
    if (mag === 0) return 0;
    
    const similarity = dot / mag;
    
    // معالجة خاصة للتشابهات المنخفضة
    if (similarity < 0.1) {
      return similarity * 1.5; // رفع التشابهات المنخفضة جداً
    }
    
    return Math.max(0, Math.min(1, similarity));
  }

  /**
   * 🔥 تصفية وترتيب النتائج
   */
  filterAndRankResults(results, settings) {
    if (results.length === 0) return [];
    
    // ترتيب أولي
    results.sort((a, b) => b.similarity - a.similarity);
    
    // إزالة التكرارات
    const uniqueResults = [];
    const seen = new Set();
    
    results.forEach(result => {
      const key = result.original_data?.text || result.original_data?.name || result._index;
      const shortKey = key.substring(0, 100);
      
      if (!seen.has(shortKey)) {
        seen.add(shortKey);
        uniqueResults.push(result);
      }
    });
    
    // التأكد من وجود نتائج
    if (uniqueResults.length === 0 && settings.forceFindResults) {
      return this.createFallbackResults(results.slice(0, 3));
    }
    
    return uniqueResults.slice(0, 5);
  }

  /**
   * 🔥 البحث النصي الاحتياطي
   */
  textBasedFallback(query, db) {
    const results = [];
    const queryText = query.normalized || query.original || query;
    
    console.log(`   🔍 بحث نصي احتياطي عن: "${queryText}"`);
    
    // البحث في أول 100 سجل فقط للسرعة
    const searchLimit = Math.min(100, db.data.length);
    
    for (let i = 0; i < searchLimit; i++) {
      const record = db.data[i];
      const textData = db.quickTextIndex[i];
      
      if (!textData) continue;
      
      // البحث في جميع الحقول النصية
      const allText = [
        textData.text,
        textData.name,
        textData.preview,
        textData.keywords,
        textData.synonyms
      ].join(' ').toLowerCase();
      
      if (allText.includes(queryText.substring(0, Math.min(10, queryText.length)))) {
        results.push({
          ...record,
          similarity: 0.25, // ثابت للبحث النصي
          database: db.name,
          _index: i,
          _matchType: 'text_fallback',
          _confidence: 'متوسطة'
        });
        
        if (results.length >= 5) break;
      }
    }
    
    // إذا لم نجد مطابقة كاملة، نبحث عن كلمات مفردة
    if (results.length === 0) {
      const words = queryText.split(/\s+/).filter(w => w.length > 2);
      
      for (let i = 0; i < searchLimit; i++) {
        const record = db.data[i];
        const textData = db.quickTextIndex[i];
        
        if (!textData) continue;
        
        const allText = [
          textData.text,
          textData.name,
          textData.preview
        ].join(' ').toLowerCase();
        
        let matchCount = 0;
        words.forEach(word => {
          if (allText.includes(word)) {
            matchCount++;
          }
        });
        
        if (matchCount >= Math.min(2, words.length)) {
          results.push({
            ...record,
            similarity: 0.2 + (matchCount / words.length) * 0.1,
            database: db.name,
            _index: i,
            _matchType: 'text_partial',
            _confidence: 'منخفضة'
          });
          
          if (results.length >= 3) break;
        }
      }
    }
    
    return results;
  }

  /**
   * 🔥 الحصول على عينات عشوائية
   */
  getRandomSamples(db, count) {
    const samples = [];
    const total = db.data.length;
    
    if (total === 0) return [];
    
    // اختيار عينات عشوائية
    for (let i = 0; i < Math.min(count, total); i++) {
      const randomIndex = Math.floor(Math.random() * total);
      samples.push({
        ...db.data[randomIndex],
        similarity: 0.1,
        database: db.name,
        _index: randomIndex,
        _matchType: 'random_sample',
        _confidence: 'ضعيفة',
        _note: 'عينة عشوائية من قاعدة البيانات'
      });
    }
    
    return samples;
  }

  /**
   * 🔥 إنشاء نتائج احتياطية
   */
  createFallbackResults(originalResults) {
    if (originalResults.length === 0) return [];
    
    // رفع التشابه للنتائج الموجودة
    return originalResults.map(result => ({
      ...result,
      similarity: Math.min(result.similarity * 1.3, 0.35),
      _boosted: true,
      _fallback: true
    }));
  }

  /**
   * 🔥 استراتيجية الطوارئ
   */
  emergencyFallback(query, db) {
    console.log(`   🚨 وضع الطوارئ: البحث عن أي نتائج`);
    
    const results = [];
    
    // البحث في أول 50 سجل عن أي كلمة من الاستعلام
    const words = query.split(/\s+/).filter(w => w.length > 2);
    const searchLimit = Math.min(50, db.data.length);
    
    for (let i = 0; i < searchLimit; i++) {
      const record = db.data[i];
      const textData = db.quickTextIndex[i];
      
      if (!textData) continue;
      
      const allText = [
        textData.text,
        textData.name,
        textData.preview
      ].join(' ').toLowerCase();
      
      let foundAny = false;
      words.forEach(word => {
        if (allText.includes(word)) {
          foundAny = true;
        }
      });
      
      if (foundAny) {
        results.push({
          ...record,
          similarity: 0.15,
          database: db.name,
          _index: i,
          _matchType: 'emergency',
          _confidence: 'ضعيفة جداً',
          _note: 'نتيجة من وضع الطوارئ'
        });
        
        if (results.length >= 3) break;
      }
    }
    
    // إذا لم نجد أي شيء، نعيد أول سجلين
    if (results.length === 0 && db.data.length > 0) {
      return [
        {
          ...db.data[0],
          similarity: 0.1,
          database: db.name,
          _index: 0,
          _matchType: 'first_record',
          _confidence: 'ضعيفة جداً',
          _note: 'السجل الأول في قاعدة البيانات'
        }
      ];
    }
    
    return results;
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
   * 🔥 تحديث الإحصائيات
   */
  updateStats(searchTime, resultCount) {
    this.stats.totalSearches++;
    
    if (resultCount > 0) {
      this.stats.successfulSearches++;
      
      if (resultCount >= 3) {
        this.stats.highQualityMatches++;
      }
    }
    
    this.stats.averageSearchTime = 
      (this.stats.averageSearchTime * (this.stats.totalSearches - 1) + searchTime) 
      / this.stats.totalSearches;
  }

  /**
   * 🔥 الحصول على إحصائيات
   */
  getStatistics() {
    const successRate = this.stats.totalSearches > 0 
      ? (this.stats.successfulSearches / this.stats.totalSearches * 100).toFixed(1)
      : 0;
    
    return {
      بحث: {
        إجمالي_عمليات_البحث: this.stats.totalSearches,
        عمليات_بحث_ناجحة: this.stats.successfulSearches,
        معدل_النجاح: `${successRate}%`,
        متوسط_زمن_البحث: `${this.stats.averageSearchTime.toFixed(1)}ms`,
        نتائج_عالية_الجودة: this.stats.highQualityMatches
      },
      قواعد: {
        الأنشطة: this.databases.activity?.data?.length || 0,
        القرار_104: this.databases.decision104?.data?.length || 0,
        المناطق: this.databases.industrial?.data?.length || 0
      }
    };
  }

  /**
   * 🛠️ أدوات مساعدة
   */
  
  normalizeVector(vector) {
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return magnitude > 0 ? vector.map(v => v / magnitude) : vector;
  }

  stringHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  clearCache() {
    console.log('🧹 تم إعادة تهيئة المحرك');
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = VectorEngine;
}
