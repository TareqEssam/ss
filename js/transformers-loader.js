/**
 * 🤖 محمل Transformers.js - نموذج متجهات حقيقي
 * Real Embedding Model Loader
 * 
 * استخدام نموذج حقيقي للمتجهات في المتصفح
 * 
 * @version 1.1.0
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

      // انتظار تحميل مكتبة Transformers.js
								 
      await this._waitForTransformers();
	   

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
   * ⏳ الانتظار حتى يتم تحميل Transformers.js
   */
  async _waitForTransformers() {
    return new Promise((resolve, reject) => {
      // إذا كانت المكتبة موجودة بالفعل
      if (window.transformers && window.transformers.pipeline) {
        console.log('📚 مكتبة Transformers.js محملة مسبقًا');
        resolve();
        return;
      }

      console.log('⏳ في انتظار تحميل مكتبة Transformers.js...');
																									   
							 
									   
      
      let attempts = 0;
      const maxAttempts = 30; // 30 محاولة × 500ms = 15 ثانية كحد أقصى
      
      const checkInterval = setInterval(() => {
        attempts++;
        
        if (window.transformers && window.transformers.pipeline) {
          clearInterval(checkInterval);
          console.log(`✅ تم تحميل Transformers.js بعد ${attempts} محاولات`);
          resolve();
        } else if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          reject(new Error('انتهت مهلة انتظار تحميل Transformers.js. تأكد من اتصال الإنترنت.'));
        } else if (attempts % 5 === 0) {
		

								   
          console.log(`⏳ لا يزال في انتظار Transformers.js... (المحاولة ${attempts}/${maxAttempts})`);
        }
      }, 500);

										
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

  /**
   * 🔄 إعادة تحميل النموذج
   */
  async reload() {
    this.isLoaded = false;
    this.isLoading = false;
    this.loadError = null;
    this.pipeline = null;
    return this.load();
  }
}

// Singleton
window.transformersLoader = window.transformersLoader || new TransformersLoader();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = TransformersLoader;
}
