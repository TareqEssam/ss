/**
 * ═══════════════════════════════════════════════════════════════
 * 📦 IndexedDB Manager - إدارة التخزين المحلي
 * ═══════════════════════════════════════════════════════════════
 * الإصدار: 3.0 (حل نهائي لمشكلة TransactionInactiveError)
 */

class IndexedDBManager {
  constructor() {
    this.dbName = 'AIExpertDB';
    this.version = 3;
    this.db = null;
    
    this.stores = {
      vectors: 'vectors',
      metaIndex: 'metaIndex',
      learning: 'learning',
      settings: 'settings',
      context: 'contextMemory'
    };
  }

  /**
   * تهيئة قاعدة البيانات
   */
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('❌ فشل فتح قاعدة البيانات:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ تم فتح قاعدة البيانات بنجاح');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        console.log('🔧 تحديث بنية قاعدة البيانات...');
        const db = event.target.result;

        // مخزن المتجهات (vectors)
        if (!db.objectStoreNames.contains(this.stores.vectors)) {
          const vectorStore = db.createObjectStore(this.stores.vectors, { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          vectorStore.createIndex('dbName', 'dbName', { unique: false });
          console.log('  ✓ مخزن المتجهات جاهز');
        }

        // مخزن الفهرس (metaIndex)
        if (!db.objectStoreNames.contains(this.stores.metaIndex)) {
          db.createObjectStore(this.stores.metaIndex, { keyPath: 'category' });
          console.log('  ✓ مخزن الفهرس جاهز');
        }

        // مخزن التعلم (learning)
        if (!db.objectStoreNames.contains(this.stores.learning)) {
          db.createObjectStore(this.stores.learning, { keyPath: 'key' });
          console.log('  ✓ مخزن التعلم جاهز');
        }

        // مخزن الإعدادات (settings)
        if (!db.objectStoreNames.contains(this.stores.settings)) {
          db.createObjectStore(this.stores.settings, { keyPath: 'key' });
          console.log('  ✓ مخزن الإعدادات جاهز');
        }

        // مخزن الذاكرة السياقية (contextMemory)
        if (!db.objectStoreNames.contains(this.stores.context)) {
          db.createObjectStore(this.stores.context, { keyPath: 'timestamp' });
          console.log('  ✓ مخزن الذاكرة السياقية جاهز');
        }

        console.log('✅ اكتمل تحديث البنية');
      };
    });
  }

  /**
   * 🔧 حفظ قاعدة بيانات متجهات كاملة (الحل النهائي)
   */
  async saveVectorDatabase(dbName, data) {
    if (!this.db) {
      throw new Error('قاعدة البيانات غير مهيأة');
    }

    console.log(`💾 حفظ ${data.length} سجل في ${dbName}...`);

    // حذف البيانات القديمة أولاً
    await this.clearVectorDatabase(dbName);

    // حفظ دفعي (50 سجل في كل معاملة)
    const BATCH_SIZE = 50;
    let saved = 0;

    for (let i = 0; i < data.length; i += BATCH_SIZE) {
      const batch = data.slice(i, i + BATCH_SIZE);
      
      await new Promise((resolve, reject) => {
        // فتح معاملة جديدة لكل دفعة
        const transaction = this.db.transaction([this.stores.vectors], 'readwrite');
        const store = transaction.objectStore(this.stores.vectors);

        let completed = 0;
        let hasError = false;

        transaction.oncomplete = () => {
          if (!hasError) {
            saved += batch.length;
            console.log(`  ✓ تم حفظ ${saved}/${data.length} سجل`);
            resolve();
          }
        };

        transaction.onerror = () => {
          hasError = true;
          console.error('❌ خطأ في المعاملة:', transaction.error);
          reject(transaction.error);
        };

        transaction.onabort = () => {
          hasError = true;
          console.error('❌ تم إلغاء المعاملة');
          reject(new Error('Transaction aborted'));
        };

        // إضافة السجلات
        batch.forEach((record, index) => {
          try {
            const request = store.put({
              ...record,
              dbName: dbName
            });

            request.onsuccess = () => {
              completed++;
            };

            request.onerror = () => {
              hasError = true;
              console.error(`❌ خطأ في حفظ السجل ${i + index}:`, request.error);
            };
          } catch (error) {
            hasError = true;
            console.error(`❌ خطأ في معالجة السجل ${i + index}:`, error);
          }
        });
      });

      // تأخير صغير بين الدفعات لتجنب ضغط المتصفح
      if (i + BATCH_SIZE < data.length) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }

    console.log(`✅ تم حفظ ${saved} سجل في ${dbName}`);
    return saved;
  }

  /**
   * حذف قاعدة بيانات متجهات معينة
   */
  async clearVectorDatabase(dbName) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.stores.vectors], 'readwrite');
      const store = transaction.objectStore(this.stores.vectors);
      const index = store.index('dbName');
      const request = index.openCursor(IDBKeyRange.only(dbName));

      let deleteCount = 0;

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          cursor.delete();
          deleteCount++;
          cursor.continue();
        }
      };

      transaction.oncomplete = () => {
        if (deleteCount > 0) {
          console.log(`  🗑️ تم حذف ${deleteCount} سجل قديم من ${dbName}`);
        }
        resolve();
      };

      transaction.onerror = () => {
        console.error(`❌ خطأ في حذف ${dbName}:`, transaction.error);
        reject(transaction.error);
      };
    });
  }

  /**
   * تحميل قاعدة بيانات متجهات
   */
  async loadVectorDatabase(dbName) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.stores.vectors], 'readonly');
      const store = transaction.objectStore(this.stores.vectors);
      const index = store.index('dbName');
      const request = index.getAll(dbName);

      request.onsuccess = () => {
        const data = request.result;
        console.log(`📂 تم تحميل ${data.length} سجل من قاعدة ${dbName}`);
        resolve(data);
      };

      request.onerror = () => {
        console.error(`❌ فشل تحميل ${dbName}:`, request.error);
        reject(request.error);
      };
    });
  }

  /**
   * حفظ الفهرس الوصفي
   */
  async saveMetaIndex(index) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.stores.metaIndex], 'readwrite');
      const store = transaction.objectStore(this.stores.metaIndex);

      const entries = Object.entries(index);
      let savedCount = 0;

      transaction.oncomplete = () => {
        console.log(`💾 تم حفظ ${savedCount} فئة في الفهرس`);
        resolve();
      };

      transaction.onerror = () => {
        console.error('❌ فشل حفظ الفهرس:', transaction.error);
        reject(transaction.error);
      };

      // حفظ كل فئة
      entries.forEach(([category, items]) => {
        const request = store.put({
          category: category,
          items: items,
          timestamp: Date.now()
        });

        request.onsuccess = () => {
          savedCount++;
        };
      });
    });
  }

  /**
   * تحميل الفهرس الوصفي
   */
  async loadMetaIndex() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.stores.metaIndex], 'readonly');
      const store = transaction.objectStore(this.stores.metaIndex);
      const request = store.getAll();

      request.onsuccess = () => {
        const data = request.result;
        const index = {};
        
        data.forEach(item => {
          index[item.category] = item.items;
        });

        console.log(`📖 تم تحميل ${data.length} فئة من الفهرس`);
        resolve(index);
      };

      request.onerror = () => {
        console.error('❌ فشل تحميل الفهرس:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * حفظ بيانات التعلم
   */
  async saveLearning(key, value) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.stores.learning], 'readwrite');
      const store = transaction.objectStore(this.stores.learning);

      const request = store.put({
        key: key,
        value: value,
        timestamp: Date.now()
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * تحميل بيانات التعلم
   */
  async loadLearning(key) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.stores.learning], 'readonly');
      const store = transaction.objectStore(this.stores.learning);
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result ? request.result.value : null);
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * حفظ الذاكرة السياقية
   */
  async saveContext(context) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.stores.context], 'readwrite');
      const store = transaction.objectStore(this.stores.context);

      const request = store.put({
        timestamp: Date.now(),
        data: context
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * مسح الذاكرة السياقية
   */
  async clearContext() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.stores.context], 'readwrite');
      const store = transaction.objectStore(this.stores.context);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * تحميل آخر سياق
   */
  async loadContext() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.stores.context], 'readonly');
      const store = transaction.objectStore(this.stores.context);
      const request = store.openCursor(null, 'prev');

      request.onsuccess = () => {
        const cursor = request.result;
        resolve(cursor ? cursor.value.data : null);
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * الحصول على إحصائيات قاعدة البيانات
   */
  async getStatistics() {
    const stats = {
      vectorDatabases: {},
      metaIndexSize: 0,
      learnedCount: 0
    };

    try {
      // عدد المتجهات في كل قاعدة
      const dbNames = ['activity', 'decision104', 'industrial'];
      for (const dbName of dbNames) {
        const data = await this.loadVectorDatabase(dbName);
        stats.vectorDatabases[dbName] = data.length;
      }

      // حجم الفهرس
      const index = await this.loadMetaIndex();
      stats.metaIndexSize = Object.keys(index).length;

      // عدد المعارف المتعلمة
      const transaction = this.db.transaction([this.stores.learning], 'readonly');
      const store = transaction.objectStore(this.stores.learning);
      const countRequest = store.count();

      await new Promise((resolve) => {
        countRequest.onsuccess = () => {
          stats.learnedCount = countRequest.result;
          resolve();
        };
      });

    } catch (error) {
      console.error('❌ خطأ في جمع الإحصائيات:', error);
    }

    return stats;
  }

  /**
   * تصدير جميع البيانات
   */
  async exportAllData() {
    const data = {
      vectors: {},
      metaIndex: await this.loadMetaIndex(),
      timestamp: Date.now()
    };

    const dbNames = ['activity', 'decision104', 'industrial'];
    for (const dbName of dbNames) {
      data.vectors[dbName] = await this.loadVectorDatabase(dbName);
    }

    return data;
  }

  /**
   * استيراد جميع البيانات
   */
  async importAllData(data) {
    console.log('📥 استيراد البيانات...');

    // استيراد المتجهات
    for (const [dbName, records] of Object.entries(data.vectors)) {
      if (records && records.length > 0) {
        await this.saveVectorDatabase(dbName, records);
      }
    }

    // استيراد الفهرس
    if (data.metaIndex) {
      await this.saveMetaIndex(data.metaIndex);
    }

    console.log('✅ تم استيراد البيانات بنجاح');
  }

  /**
   * حذف جميع البيانات
   */
  async clearAll() {
    const storeNames = Object.values(this.stores);
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeNames, 'readwrite');

      transaction.oncomplete = () => {
        console.log('🗑️ تم حذف جميع البيانات');
        resolve();
      };

      transaction.onerror = () => {
        console.error('❌ فشل حذف البيانات:', transaction.error);
        reject(transaction.error);
      };

      storeNames.forEach(storeName => {
        transaction.objectStore(storeName).clear();
      });
    });
  }

  /**
   * إغلاق قاعدة البيانات
   */
  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
      console.log('🔒 تم إغلاق قاعدة البيانات');
    }
  }
}

// التصدير
if (typeof module !== 'undefined' && module.exports) {
  module.exports = IndexedDBManager;
}
