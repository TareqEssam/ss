/**
 * 🤖 محمل Transformers.js - نموذج متجهات حقيقي
 * Real Embedding Model Loader
 * 
 * استخدام نموذج حقيقي للمتجهات في المتصفح
 * 
 * @version 1.0.0
 */

class TransformersLoader {
  constructor() {
    this.pipeline = null;
    this.model = null;
    this.tokenizer = null;
    this.isLoading = false;
    this.isLoaded = false;
    this.loadError = null;
  }

  /**
   * 🚀 تحميل نموذج Transformers.js
   */
  async load() {
    if (this.isLoaded) {
      return { success: true, model: this.pipeline };
    }

    if (this.isLoading) {
      console.log('⏳ النموذج قيد التحميل...');
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (this.isLoaded) {
            clearInterval(checkInterval);
            resolve({ success: true, model: this.pipeline });
          } else if (this.loadError) {
            clearInterval(checkInterval);
            resolve({ success: false, error: this.loadError });
          }
        }, 500);
      });
    }

    this.isLoading = true;

    try {
      console.log('📦 بدء تحميل نموذج المتجهات...');

      // محاولة تحميل transformers.js من CDN
      if (!window.transformers) {
        await this._loadTransformersScript();
      }

      console.log('✅ تم تحميل مكتبة transformers.js');
      console.log('🔄 تهيئة النموذج...');

      // استخدام النموذج المناسب
      const { pipeline } = window.transformers;
      
      this.pipeline = await pipeline(
        'feature-extraction',
        'Xenova/paraphrase-multilingual-MiniLM-L12-v2',
        {
          quantized: true, // استخدام النموذج المضغوط للسرعة
          progress_callback: (progress) => {
            if (progress.status === 'progress') {
              console.log(`⏳ التحميل: ${progress.file} - ${Math.round(progress.progress || 0)}%`);
            }
          }
        }
      );

      this.isLoaded = true;
      this.isLoading = false;
      
      console.log('✅ تم تحميل نموذج المتجهات بنجاح!');
      
      return { success: true, model: this.pipeline };

    } catch (error) {
      console.error('❌ فشل تحميل النموذج:', error);
      this.loadError = error;
      this.isLoading = false;
      
      return { 
        success: false, 
        error: error.message,
        fallback: true 
      };
    }
  }

  /**
   * 📥 تحميل سكريبت transformers.js
   */
  async _loadTransformersScript() {
    return new Promise((resolve, reject) => {
      if (window.transformers) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/transformers.min.js';
      script.type = 'module';  
      script.crossOrigin = 'anonymous';
      
      script.onload = () => {
        console.log('✅ تم تحميل Transformers.js من CDN');
        // الانتظار قليلاً للتأكد من تحميل المكتبة
        setTimeout(resolve, 100);
      };

      script.onerror = (error) => {
        console.error('❌ فشل تحميل Transformers.js:', error);
        reject(new Error('فشل تحميل مكتبة Transformers.js'));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * 🔢 توليد متجه من نص
   */
  async generateEmbedding(text) {
    if (!this.isLoaded) {
      const loadResult = await this.load();
      if (!loadResult.success) {
        throw new Error('النموذج غير محمل');
      }
    }

    try {
      const output = await this.pipeline(text, {
        pooling: 'mean',
        normalize: true
      });

      // استخراج المتجه
      const embedding = Array.from(output.data);
      return embedding;

    } catch (error) {
      console.error('❌ خطأ في توليد المتجه:', error);
      throw error;
    }
  }

  /**
   * 📊 الحصول على الحالة
   */
  getStatus() {
    return {
      isLoaded: this.isLoaded,
      isLoading: this.isLoading,
      hasError: !!this.loadError,
      error: this.loadError?.message
    };
  }
}

// Singleton
window.transformersLoader = window.transformersLoader || new TransformersLoader();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = TransformersLoader;
}
