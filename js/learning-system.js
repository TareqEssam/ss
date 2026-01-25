/**
 * 🧠 نظام التعلم والذاكرة
 * Learning System & Memory Manager
 * 
 * الهدف: تعلم من تصحيحات المستخدم وتحسين الإجابات تدريجياً
 * 
 * @author AI Expert System
 * @version 2.0.0
 */

class LearningSystem {
  constructor(dbManager, normalizer) {
    this.dbManager = dbManager;
    this.normalizer = normalizer;
    
    // ذاكرة التعلم المحلية (للوصول السريع)
    this.learnedKnowledge = new Map();
    
    // الإحصائيات
    this.stats = {
      totalLearned: 0,
      totalCorrections: 0,
      mostUsedAnswers: []
    };

    this.initialized = false;
  }

  /**
   * 🚀 تهيئة نظام التعلم
   */
  async initialize() {
    if (this.initialized) return;

    console.log('🧠 تهيئة نظام التعلم...');

    // تحميل المعرفة المتعلمة من قاعدة البيانات
    await this._loadLearnedKnowledge();

    this.initialized = true;
    console.log(`✅ تم تحميل ${this.learnedKnowledge.size} معلومة متعلمة`);
  }

  /**
   * 📚 تحميل المعرفة المتعلمة
   */
  async _loadLearnedKnowledge() {
    try {
      const transaction = this.dbManager.db.transaction(['LearnedKnowledge'], 'readonly');
      const store = transaction.objectStore('LearnedKnowledge');
      const allRecords = await this._promisifyRequest(store.getAll());

      this.learnedKnowledge.clear();
      
      allRecords.forEach(record => {
        const normalizedQuery = this.normalizer.normalize(record.query);
        this.learnedKnowledge.set(normalizedQuery, {
          id: record.id,
          query: record.query,
          answer: record.answer,
          metadata: record.metadata || {},
          learnedAt: record.learnedAt,
          usageCount: record.usageCount || 0,
          lastUsedAt: record.lastUsedAt
        });
      });

      this.stats.totalLearned = this.learnedKnowledge.size;
      this._updateMostUsedAnswers();

    } catch (error) {
      console.error('❌ خطأ في تحميل المعرفة المتعلمة:', error);
    }
  }

  /**
   * 🎓 تعلم معلومة جديدة
   * @param {string} query - السؤال الأصلي
   * @param {string} answer - الإجابة الصحيحة
   * @param {object} metadata - بيانات إضافية
   */
  async learn(query, answer, metadata = {}) {
    console.log('🎓 حفظ معلومة جديدة...');

    const normalizedQuery = this.normalizer.normalize(query);

    // التحقق من وجود معلومة مشابهة
    const existingEntry = this._findSimilarEntry(normalizedQuery);

    if (existingEntry) {
      // تحديث الإجابة الموجودة
      await this._updateExistingEntry(existingEntry.id, answer, metadata);
      console.log('🔄 تم تحديث معلومة موجودة');
    } else {
      // إضافة معلومة جديدة
      const id = await this.dbManager.saveLearnedKnowledge(query, answer, metadata);
      
      this.learnedKnowledge.set(normalizedQuery, {
        id: id,
        query: query,
        answer: answer,
        metadata: metadata,
        learnedAt: new Date().toISOString(),
        usageCount: 0
      });

      this.stats.totalLearned++;
      console.log(`✅ تم حفظ معلومة جديدة (ID: ${id})`);
    }

    this._updateMostUsedAnswers();
  }

  /**
   * 🔍 البحث في المعرفة المتعلمة
   * @param {string} query - استعلام المستخدم
   * @returns {object|null} الإجابة المتعلمة أو null
   */
  async searchLearned(query) {
    const normalizedQuery = this.normalizer.normalize(query);

    // البحث عن تطابق تام
    if (this.learnedKnowledge.has(normalizedQuery)) {
      const entry = this.learnedKnowledge.get(normalizedQuery);
      await this._incrementUsage(entry.id);
      console.log('🎯 تم العثور على إجابة متعلمة (تطابق تام)');
      return entry;
    }

    // البحث عن تطابق جزئي
    const similarEntry = this._findSimilarEntry(normalizedQuery);
    if (similarEntry) {
      await this._incrementUsage(similarEntry.id);
      console.log('🎯 تم العثور على إجابة متعلمة (تطابق جزئي)');
      return similarEntry;
    }

    return null;
  }

  /**
   * 🔎 البحث عن معلومة مشابهة
   */
  _findSimilarEntry(normalizedQuery) {
    let bestMatch = null;
    let bestSimilarity = 0;

    for (const [storedQuery, entry] of this.learnedKnowledge.entries()) {
      const similarity = this.normalizer.textSimilarity(normalizedQuery, storedQuery);
      
      if (similarity > 0.85 && similarity > bestSimilarity) {
        bestSimilarity = similarity;
        bestMatch = entry;
      }
    }

    return bestMatch;
  }

  /**
   * 🔄 تحديث معلومة موجودة
   */
  async _updateExistingEntry(id, newAnswer, newMetadata) {
    try {
      const transaction = this.dbManager.db.transaction(['LearnedKnowledge'], 'readwrite');
      const store = transaction.objectStore('LearnedKnowledge');
      
      const record = await this._promisifyRequest(store.get(id));
      
      if (record) {
        record.answer = newAnswer;
        record.metadata = { ...record.metadata, ...newMetadata };
        record.updatedAt = new Date().toISOString();
        record.correctionCount = (record.correctionCount || 0) + 1;
        
        await this._promisifyRequest(store.put(record));
        
        // تحديث الذاكرة المحلية
        const normalizedQuery = this.normalizer.normalize(record.query);
        if (this.learnedKnowledge.has(normalizedQuery)) {
          const entry = this.learnedKnowledge.get(normalizedQuery);
          entry.answer = newAnswer;
          entry.metadata = record.metadata;
        }

        this.stats.totalCorrections++;
      }
    } catch (error) {
      console.error('❌ خطأ في تحديث المعلومة:', error);
    }
  }

  /**
   * ➕ زيادة عداد الاستخدام
   */
  async _incrementUsage(id) {
    try {
      const transaction = this.dbManager.db.transaction(['LearnedKnowledge'], 'readwrite');
      const store = transaction.objectStore('LearnedKnowledge');
      
      const record = await this._promisifyRequest(store.get(id));
      
      if (record) {
        record.usageCount = (record.usageCount || 0) + 1;
        record.lastUsedAt = new Date().toISOString();
        
        await this._promisifyRequest(store.put(record));
        
        // تحديث الذاكرة المحلية
        const normalizedQuery = this.normalizer.normalize(record.query);
        if (this.learnedKnowledge.has(normalizedQuery)) {
          const entry = this.learnedKnowledge.get(normalizedQuery);
          entry.usageCount = record.usageCount;
          entry.lastUsedAt = record.lastUsedAt;
        }

        this._updateMostUsedAnswers();
      }
    } catch (error) {
      console.error('❌ خطأ في تحديث العداد:', error);
    }
  }

  /**
   * 📊 تحديث قائمة الإجابات الأكثر استخداماً
   */
  _updateMostUsedAnswers() {
    const entries = Array.from(this.learnedKnowledge.values());
    
    this.stats.mostUsedAnswers = entries
      .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
      .slice(0, 10)
      .map(entry => ({
        query: entry.query,
        usageCount: entry.usageCount,
        learnedAt: entry.learnedAt
      }));
  }

  /**
   * 🗑️ حذف معلومة متعلمة
   */
  async deleteLearnedEntry(id) {
    try {
      const transaction = this.dbManager.db.transaction(['LearnedKnowledge'], 'readwrite');
      const store = transaction.objectStore('LearnedKnowledge');
      
      await this._promisifyRequest(store.delete(id));
      
      // حذف من الذاكرة المحلية
      for (const [key, entry] of this.learnedKnowledge.entries()) {
        if (entry.id === id) {
          this.learnedKnowledge.delete(key);
          break;
        }
      }

      this.stats.totalLearned--;
      console.log(`🗑️ تم حذف المعلومة (ID: ${id})`);
      
    } catch (error) {
      console.error('❌ خطأ في حذف المعلومة:', error);
    }
  }

  /**
   * 📋 الحصول على جميع المعلومات المتعلمة
   */
  getAllLearned() {
    return Array.from(this.learnedKnowledge.values());
  }

  /**
   * 📊 الحصول على الإحصائيات
   */
  getStatistics() {
    return {
      totalLearned: this.stats.totalLearned,
      totalCorrections: this.stats.totalCorrections,
      mostUsedAnswers: this.stats.mostUsedAnswers,
      cacheSize: this.learnedKnowledge.size
    };
  }

  /**
   * 🧹 مسح جميع المعلومات المتعلمة
   */
  async clearAll() {
    try {
      const transaction = this.dbManager.db.transaction(['LearnedKnowledge'], 'readwrite');
      const store = transaction.objectStore('LearnedKnowledge');
      
      await this._promisifyRequest(store.clear());
      
      this.learnedKnowledge.clear();
      this.stats = {
        totalLearned: 0,
        totalCorrections: 0,
        mostUsedAnswers: []
      };

      console.log('🧹 تم مسح جميع المعلومات المتعلمة');
      
    } catch (error) {
      console.error('❌ خطأ في المسح:', error);
    }
  }

  /**
   * 📤 تصدير المعرفة المتعلمة
   */
  exportLearned() {
    const learned = this.getAllLearned();
    
    const exportData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      totalEntries: learned.length,
      entries: learned.map(entry => ({
        query: entry.query,
        answer: entry.answer,
        metadata: entry.metadata,
        usageCount: entry.usageCount,
        learnedAt: entry.learnedAt,
        lastUsedAt: entry.lastUsedAt
      }))
    };

    return exportData;
  }

  /**
   * 📥 استيراد معرفة متعلمة
   */
  async importLearned(importData) {
    if (!importData || !importData.entries) {
      throw new Error('بيانات غير صالحة للاستيراد');
    }

    console.log(`📥 استيراد ${importData.entries.length} معلومة...`);

    for (const entry of importData.entries) {
      await this.learn(entry.query, entry.answer, entry.metadata);
    }

    console.log('✅ اكتمل الاستيراد');
  }

  /**
   * 🔧 تحويل Request إلى Promise
   */
  _promisifyRequest(request) {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

// تصدير الكلاس
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LearningSystem;
}