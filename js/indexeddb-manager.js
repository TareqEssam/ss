/**
 * 💾 مدير قاعدة البيانات المحلية
 * IndexedDB Manager for Local Storage
 * 
 * الهدف: حفظ واسترجاع البيانات المتجهية والفهارس والذاكرة محلياً
 * يتم التحميل مرة واحدة فقط عند أول استخدام
 * 
 * @author AI Expert System
 * @version 2.0.0
 */

class IndexedDBManager {
  constructor() {
    this.dbName = 'GAFI_AI_Brain';
    this.version = 4;
    this.db = null;

    // أسماء المخازن (Stores)
    this.stores = {
      VECTORS: 'VectorsStore',           // المتجهات الأصلية
      META_INDEX: 'MetaIndex',           // الفهرس السريع
      LEARNED: 'LearnedKnowledge',       // الذاكرة والتعلم
      CONFIG: 'SystemConfig',            // الإعدادات
      CONTEXT: 'ContextMemory'           // الذاكرة السياقية
    };

    // حالة التهيئة
    this.initialized = false;
    this.initPromise = null;
  }

  /**
   * 🚀 تهيئة قاعدة البيانات
   */
  async init() {
    if (this.initialized) {
      return this.db;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('❌ فشل فتح قاعدة البيانات:', request.error);
        reject(request.error);
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        this.initialized = true;
        console.log('✅ تم فتح قاعدة البيانات بنجاح');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        console.log('🔧 تحديث بنية قاعدة البيانات...');

        // إنشاء المخازن إذا لم تكن موجودة
        
        // 1. مخزن المتجهات
        if (!db.objectStoreNames.contains(this.stores.VECTORS)) {
          const vectorStore = db.createObjectStore(this.stores.VECTORS, { 
            keyPath: 'id' 
          });
          vectorStore.createIndex('database', 'database', { unique: false });
          vectorStore.createIndex('type', 'type', { unique: false });
          console.log('  ✓ مخزن المتجهات جاهز');
        }

        // 2. مخزن الفهرس
        if (!db.objectStoreNames.contains(this.stores.META_INDEX)) {
          const metaStore = db.createObjectStore(this.stores.META_INDEX, { 
            keyPath: 'key' 
          });
          metaStore.createIndex('category', 'category', { unique: false });
          console.log('  ✓ مخزن الفهرس جاهز');
        }

        // 3. مخزن التعلم
        if (!db.objectStoreNames.contains(this.stores.LEARNED)) {
          db.createObjectStore(this.stores.LEARNED, { 
            keyPath: 'id',
            autoIncrement: true
          });
          console.log('  ✓ مخزن التعلم جاهز');
        }

        // 4. مخزن الإعدادات
        if (!db.objectStoreNames.contains(this.stores.CONFIG)) {
          db.createObjectStore(this.stores.CONFIG, { 
            keyPath: 'key' 
          });
          console.log('  ✓ مخزن الإعدادات جاهز');
        }

        // 5. مخزن الذاكرة السياقية
        if (!db.objectStoreNames.contains(this.stores.CONTEXT)) {
          db.createObjectStore(this.stores.CONTEXT, { 
            keyPath: 'id' 
          });
          console.log('  ✓ مخزن الذاكرة السياقية جاهز');
        }

        console.log('✅ اكتمل تحديث البنية');
      };
    });

    return this.initPromise;
  }

  /**
   * 💾 حفظ قاعدة بيانات متجهات كاملة
   */
  async saveVectorDatabase(databaseName, vectorData) {
    await this.init();

    const transaction = this.db.transaction([this.stores.VECTORS], 'readwrite');
    const store = transaction.objectStore(this.stores.VECTORS);

    // حذف البيانات القديمة لهذه القاعدة
    await this._clearByDatabase(databaseName);

    // حفظ البيانات الجديدة
    const promises = [];
    
    if (vectorData && vectorData.data && Array.isArray(vectorData.data)) {
      for (const record of vectorData.data) {
        const saveData = {
          ...record,
          database: databaseName,
          savedAt: new Date().toISOString()
        };
        promises.push(this._promisifyRequest(store.put(saveData)));
      }
    }

    await Promise.all(promises);

    // حفظ الميتاداتا
    await this.saveConfig(`${databaseName}_meta`, {
      name: vectorData.name,
      description: vectorData.description,
      version: vectorData.version,
      statistics: vectorData.statistics,
      savedAt: new Date().toISOString()
    });

    console.log(`✅ تم حفظ ${promises.length} سجل لقاعدة ${databaseName}`);
    return promises.length;
  }

  /**
   * 📂 تحميل قاعدة بيانات متجهات كاملة
   */
  async loadVectorDatabase(databaseName) {
    await this.init();

    const transaction = this.db.transaction([this.stores.VECTORS], 'readonly');
    const store = transaction.objectStore(this.stores.VECTORS);
    const index = store.index('database');

    const records = await this._promisifyRequest(index.getAll(databaseName));

    // تحميل الميتاداتا
    const meta = await this.loadConfig(`${databaseName}_meta`);

    console.log(`📂 تم تحميل ${records.length} سجل من قاعدة ${databaseName}`);

    return {
      ...meta,
      data: records
    };
  }

  /**
   * 🗂️ حفظ الفهرس (Meta Index)
   */
  async saveMetaIndex(indexData) {
    await this.init();

    const transaction = this.db.transaction([this.stores.META_INDEX], 'readwrite');
    const store = transaction.objectStore(this.stores.META_INDEX);

    const promises = [];
    
    for (const [category, items] of Object.entries(indexData)) {
      promises.push(
        this._promisifyRequest(store.put({
          key: category,
          category: category,
          items: items,
          updatedAt: new Date().toISOString()
        }))
      );
    }

    await Promise.all(promises);
    console.log(`🗂️ تم حفظ ${promises.length} فئة في الفهرس`);
  }

  /**
   * 📖 تحميل الفهرس
   */
  async loadMetaIndex() {
    await this.init();

    const transaction = this.db.transaction([this.stores.META_INDEX], 'readonly');
    const store = transaction.objectStore(this.stores.META_INDEX);

    const allRecords = await this._promisifyRequest(store.getAll());

    const index = {};
    for (const record of allRecords) {
      index[record.key] = record.items;
    }

    console.log(`📖 تم تحميل ${Object.keys(index).length} فئة من الفهرس`);
    return index;
  }

  /**
   * 🧠 حفظ معلومة متعلمة
   */
  async saveLearnedKnowledge(query, answer, metadata = {}) {
    await this.init();

    const transaction = this.db.transaction([this.stores.LEARNED], 'readwrite');
    const store = transaction.objectStore(this.stores.LEARNED);

    const record = {
      query: query,
      answer: answer,
      metadata: metadata,
      learnedAt: new Date().toISOString(),
      usageCount: 0
    };

    const id = await this._promisifyRequest(store.add(record));
    console.log(`🧠 تم حفظ معلومة متعلمة (ID: ${id})`);
    return id;
  }

  /**
   * 🔍 البحث في المعلومات المتعلمة
   */
  async searchLearnedKnowledge(query, normalizer) {
    await this.init();

    const transaction = this.db.transaction([this.stores.LEARNED], 'readonly');
    const store = transaction.objectStore(this.stores.LEARNED);

    const allRecords = await this._promisifyRequest(store.getAll());

    // البحث عن تطابق
    const normalizedQuery = normalizer.normalize(query);
    
    for (const record of allRecords) {
      const normalizedStoredQuery = normalizer.normalize(record.query);
      const similarity = normalizer.textSimilarity(normalizedQuery, normalizedStoredQuery);

      if (similarity > 0.85) {
        // تحديث عداد الاستخدام
        await this._updateUsageCount(record.id);
        return record;
      }
    }

    return null;
  }

  /**
   * تحديث عداد الاستخدام
   */
  async _updateUsageCount(id) {
    const transaction = this.db.transaction([this.stores.LEARNED], 'readwrite');
    const store = transaction.objectStore(this.stores.LEARNED);

    const record = await this._promisifyRequest(store.get(id));
    if (record) {
      record.usageCount = (record.usageCount || 0) + 1;
      record.lastUsedAt = new Date().toISOString();
      await this._promisifyRequest(store.put(record));
    }
  }

  /**
   * ⚙️ حفظ إعدادات
   */
  async saveConfig(key, value) {
    await this.init();

    const transaction = this.db.transaction([this.stores.CONFIG], 'readwrite');
    const store = transaction.objectStore(this.stores.CONFIG);

    await this._promisifyRequest(store.put({
      key: key,
      value: value,
      updatedAt: new Date().toISOString()
    }));
  }

  /**
   * 📥 تحميل إعدادات
   */
  async loadConfig(key) {
    await this.init();

    const transaction = this.db.transaction([this.stores.CONFIG], 'readonly');
    const store = transaction.objectStore(this.stores.CONFIG);

    const record = await this._promisifyRequest(store.get(key));
    return record ? record.value : null;
  }

  /**
   * 💭 حفظ الذاكرة السياقية
   */
  async saveContext(contextData) {
    await this.init();

    const transaction = this.db.transaction([this.stores.CONTEXT], 'readwrite');
    const store = transaction.objectStore(this.stores.CONTEXT);

    await this._promisifyRequest(store.put({
      id: 'current_context',
      ...contextData,
      updatedAt: new Date().toISOString()
    }));
  }

  /**
   * 📥 تحميل الذاكرة السياقية
   */
  async loadContext() {
    await this.init();

    const transaction = this.db.transaction([this.stores.CONTEXT], 'readonly');
    const store = transaction.objectStore(this.stores.CONTEXT);

    const record = await this._promisifyRequest(store.get('current_context'));
    return record || null;
  }

  /**
   * 🧹 تنظيف الذاكرة السياقية
   */
  async clearContext() {
    await this.init();

    const transaction = this.db.transaction([this.stores.CONTEXT], 'readwrite');
    const store = transaction.objectStore(this.stores.CONTEXT);

    await this._promisifyRequest(store.delete('current_context'));
  }

  /**
   * 📤 تصدير العقل الكامل (Brain Dump)
   */
  async exportBrain() {
    await this.init();

    const brain = {
      version: this.version,
      exportedAt: new Date().toISOString(),
      databases: {},
      metaIndex: {},
      learned: [],
      config: {}
    };

    // تصدير المتجهات
    for (const dbName of ['activity', 'decision104', 'industrial']) {
      brain.databases[dbName] = await this.loadVectorDatabase(dbName);
    }

    // تصدير الفهرس
    brain.metaIndex = await this.loadMetaIndex();

    // تصدير المعلومات المتعلمة
    const learnedTx = this.db.transaction([this.stores.LEARNED], 'readonly');
    brain.learned = await this._promisifyRequest(learnedTx.objectStore(this.stores.LEARNED).getAll());

    // تصدير الإعدادات
    const configTx = this.db.transaction([this.stores.CONFIG], 'readonly');
    const configs = await this._promisifyRequest(configTx.objectStore(this.stores.CONFIG).getAll());
    
    for (const conf of configs) {
      brain.config[conf.key] = conf.value;
    }

    console.log('📤 تم تصدير العقل الكامل');
    return brain;
  }

  /**
   * 📥 استيراد العقل (Brain Import)
   */
  async importBrain(brainData) {
    await this.init();

    console.log('📥 بدء استيراد العقل...');

    // استيراد المتجهات
    for (const [dbName, dbData] of Object.entries(brainData.databases || {})) {
      await this.saveVectorDatabase(dbName, dbData);
    }

    // استيراد الفهرس
    if (brainData.metaIndex) {
      await this.saveMetaIndex(brainData.metaIndex);
    }

    // استيراد المعلومات المتعلمة
    if (brainData.learned && Array.isArray(brainData.learned)) {
      const transaction = this.db.transaction([this.stores.LEARNED], 'readwrite');
      const store = transaction.objectStore(this.stores.LEARNED);
      
      for (const learned of brainData.learned) {
        await this._promisifyRequest(store.add(learned));
      }
    }

    // استيراد الإعدادات
    if (brainData.config) {
      for (const [key, value] of Object.entries(brainData.config)) {
        await this.saveConfig(key, value);
      }
    }

    console.log('✅ اكتمل استيراد العقل');
  }

  /**
   * 🗑️ مسح قاعدة بيانات محددة
   */
  async _clearByDatabase(databaseName) {
    const transaction = this.db.transaction([this.stores.VECTORS], 'readwrite');
    const store = transaction.objectStore(this.stores.VECTORS);
    const index = store.index('database');

    const records = await this._promisifyRequest(index.getAllKeys(databaseName));
    
    const promises = records.map(key => this._promisifyRequest(store.delete(key)));
    await Promise.all(promises);
  }

  /**
   * 🧹 مسح كل شيء
   */
  async clearAll() {
    await this.init();

    const stores = Object.values(this.stores);
    const transaction = this.db.transaction(stores, 'readwrite');

    const promises = stores.map(storeName => 
      this._promisifyRequest(transaction.objectStore(storeName).clear())
    );

    await Promise.all(promises);
    console.log('🧹 تم مسح جميع البيانات');
  }

  /**
   * 📊 الحصول على إحصائيات
   */
  async getStatistics() {
    await this.init();

    const stats = {
      vectorDatabases: {},
      metaIndexSize: 0,
      learnedCount: 0,
      configCount: 0
    };

    // إحصائيات المتجهات
    for (const dbName of ['activity', 'decision104', 'industrial']) {
      const db = await this.loadVectorDatabase(dbName);
      stats.vectorDatabases[dbName] = db?.data?.length || 0;
    }

    // حجم الفهرس
    const metaIndex = await this.loadMetaIndex();
    stats.metaIndexSize = Object.keys(metaIndex).length;

    // عدد المعلومات المتعلمة
    const learnedTx = this.db.transaction([this.stores.LEARNED], 'readonly');
    const learned = await this._promisifyRequest(learnedTx.objectStore(this.stores.LEARNED).getAll());
    stats.learnedCount = learned.length;

    // عدد الإعدادات
    const configTx = this.db.transaction([this.stores.CONFIG], 'readonly');
    const configs = await this._promisifyRequest(configTx.objectStore(this.stores.CONFIG).getAll());
    stats.configCount = configs.length;

    return stats;
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

  /**
   * 🚪 إغلاق قاعدة البيانات
   */
  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.initialized = false;
      console.log('🚪 تم إغلاق قاعدة البيانات');
    }
  }
}

// تصدير الكلاس
if (typeof module !== 'undefined' && module.exports) {
  module.exports = IndexedDBManager;

}
