/**
 * 🤖 محمل Transformers.js - نموذج متجهات حقيقي (مُصلح)
 * Real Embedding Model Loader - FIXED VERSION
 * 
 * استخدام نموذج حقيقي للمتجهات في المتصفح
 * 
 * @version 2.1.0 - FIXED CDN PATH
 * @date 2026-01-28
 */

class TransformersLoader {
  constructor() {
    this.pipeline = null;
    this.model = null;
    this.tokenizer = null;
    this.isLoading = false;
    this.isLoaded = false;
    this.loadError = null;
    this.transformers = null;
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

      // ✅ تحميل المكتبة باستخدام dynamic import
      try {
        console.log('🔄 محاولة التحميل الديناميكي للمكتبة...');
        this.transformers = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/transformers.min.js');
        console.log('✅ تم التحميل الديناميكي بنجاح');
      } catch (importError) {
        console.warn('⚠️ فشل التحميل الديناميكي، جاري المحاولة عبر script tag...');
        await this._loadTransformersScript();
        
        // الانتظار حتى تصبح المكتبة متاحة
        let attempts = 0;
        while (!window.transformers && attempts < 50) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }
        
        if (window.transformers) {
          this.transformers = window.transformers;
          console.log('✅ تم التحميل عبر script tag');
        } else {
          throw new Error('فشل تحميل المكتبة بعد 5 ثوانٍ من المحاولة');
        }
      }

      if (!this.transformers) {
        throw new Error('المكتبة غير متاحة بعد التحميل');
      }

      console.log('✅ تم تحميل مكتبة transformers.js');
      console.log('🔄 تهيئة النموذج...');

      // ✅ استخراج pipeline من المكتبة
      const { pipeline, env } = this.transformers;
      
      if (!pipeline) {
        throw new Error('دالة pipeline غير متاحة في المكتبة');
      }

      // 🔥 FIX: تعيين المسار للنماذج من HuggingFace CDN الرسمي
      if (env) {
        env.allowLocalModels = false;
        env.useBrowserCache = true;
        console.log('✅ تم تعيين استخدام CDN الرسمي فقط');
      }

      // ✅ تحميل النموذج من HuggingFace CDN (ليس من GitHub)
      console.log('📥 تحميل النموذج من HuggingFace CDN...');
      this.pipeline = await pipeline(
        'feature-extraction',
        'Xenova/paraphrase-multilingual-MiniLM-L12-v2',
        {
          quantized: true,
          progress_callback: (progress) => {
            if (progress.status === 'progress') {
              const percentage = Math.round(progress.progress || 0);
              console.log(`⏳ التحميل: ${progress.file} - ${percentage}%`);
            } else if (progress.status === 'done') {
              console.log(`✅ اكتمل: ${progress.file}`);
            } else if (progress.status === 'ready') {
              console.log(`🎯 جاهز: ${progress.file}`);
            } else if (progress.status === 'initiate') {
              console.log(`🔄 بدء: ${progress.file}`);
            }
          }
        }
      );

      this.isLoaded = true;
      this.isLoading = false;
      
      console.log('✅ تم تحميل نموذج المتجهات بنجاح!');
      console.log('📊 معلومات النموذج:', {
        type: 'feature-extraction',
        model: 'Xenova/paraphrase-multilingual-MiniLM-L12-v2',
        quantized: true,
        status: 'ready',
        source: 'HuggingFace CDN'
      });
      
      return { success: true, model: this.pipeline };

    } catch (error) {
      console.error('❌ فشل تحميل النموذج:', error);
      console.error('تفاصيل الخطأ:', {
        message: error.message,
        stack: error.stack,
        transformersAvailable: !!this.transformers
      });
      
      console.warn('⚠️ سيتم استخدام Fallback embeddings');
      
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
   * 📥 تحميل سكريبت transformers.js (طريقة بديلة)
   */
  async _loadTransformersScript() {
    return new Promise((resolve, reject) => {
      if (window.transformers) {
        console.log('✅ المكتبة موجودة مسبقاً في window');
        resolve();
        return;
      }

      console.log('📥 جاري تحميل السكريبت من CDN...');
      
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/transformers.min.js';
      script.type = 'module';
      script.crossOrigin = 'anonymous';
      
      script.onload = () => {
        console.log('✅ تم تحميل السكريبت بنجاح');
        setTimeout(() => {
          if (window.transformers) {
            console.log('✅ المكتبة متاحة في window.transformers');
            resolve();
          } else {
            console.warn('⚠️ السكريبت محمل لكن window.transformers غير متاح');
            resolve();
          }
        }, 200);
      };

      script.onerror = (error) => {
        console.error('❌ فشل تحميل السكريبت:', error);
        reject(new Error('فشل تحميل مكتبة Transformers.js من CDN'));
      };

      document.head.appendChild(script);
      console.log('📌 تم إضافة السكريبت إلى <head>');
    });
  }

  /**
   * 🔢 توليد متجه من نص
   */
  async generateEmbedding(text) {
    if (!this.isLoaded) {
      console.log('⏳ النموذج غير محمل، جاري التحميل...');
      const loadResult = await this.load();
      if (!loadResult.success) {
        throw new Error('النموذج غير محمل: ' + (loadResult.error || 'خطأ غير معروف'));
      }
    }

    if (!text || typeof text !== 'string') {
      throw new Error('النص المدخل غير صالح');
    }

    try {
      console.log(`🔢 توليد متجه للنص: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);
      
      const output = await this.pipeline(text, {
        pooling: 'mean',
        normalize: true
      });

      const embedding = Array.from(output.data);
      
      console.log(`✅ تم توليد متجه بطول: ${embedding.length}`);
      
      return embedding;

    } catch (error) {
      console.error('❌ خطأ في توليد المتجه:', error);
      console.error('تفاصيل:', {
        text: text.substring(0, 100),
        error: error.message,
        pipeline: !!this.pipeline
      });
      throw error;
    }
  }

  /**
   * 🔢 توليد متجهات لعدة نصوص دفعة واحدة
   */
  async generateEmbeddings(texts) {
    if (!Array.isArray(texts)) {
      throw new Error('يجب أن يكون المدخل مصفوفة من النصوص');
    }

    console.log(`🔢 توليد متجهات لـ ${texts.length} نص...`);
    
    const embeddings = [];
    for (let i = 0; i < texts.length; i++) {
      try {
        const embedding = await this.generateEmbedding(texts[i]);
        embeddings.push(embedding);
        
        if ((i + 1) % 10 === 0) {
          console.log(`⏳ تم معالجة ${i + 1}/${texts.length} نص`);
        }
      } catch (error) {
        console.error(`❌ خطأ في معالجة النص ${i + 1}:`, error);
        embeddings.push(null);
      }
    }
    
    console.log(`✅ اكتمل توليد ${embeddings.filter(e => e !== null).length}/${texts.length} متجه`);
    
    return embeddings;
  }

  /**
   * 📊 الحصول على الحالة
   */
  getStatus() {
    return {
      isLoaded: this.isLoaded,
      isLoading: this.isLoading,
      hasError: !!this.loadError,
      error: this.loadError?.message,
      transformersAvailable: !!this.transformers,
      pipelineReady: !!this.pipeline
    };
  }

  /**
   * 🔄 إعادة تعيين المحمل
   */
  reset() {
    console.log('🔄 إعادة تعيين المحمل...');
    this.pipeline = null;
    this.model = null;
    this.tokenizer = null;
    this.isLoading = false;
    this.isLoaded = false;
    this.loadError = null;
    this.transformers = null;
    console.log('✅ تم إعادة التعيين');
  }

  /**
   * 🧪 اختبار النموذج
   */
  async test() {
    console.log('🧪 بدء اختبار النموذج...');
    
    try {
      const testTexts = [
        'مرحبا',
        'شركة استيراد وتصدير',
        'مصنع منتجات غذائية'
      ];
      
      console.log('📝 نصوص الاختبار:', testTexts);
      
      for (const text of testTexts) {
        console.log(`\n🔍 اختبار: "${text}"`);
        const embedding = await this.generateEmbedding(text);
        console.log(`✅ طول المتجه: ${embedding.length}`);
        console.log(`📊 أول 5 قيم:`, embedding.slice(0, 5));
      }
      
      console.log('\n✅ اكتملت جميع الاختبارات بنجاح!');
      return true;
      
    } catch (error) {
      console.error('❌ فشل الاختبار:', error);
      return false;
    }
  }
}

// ✅ Singleton - إنشاء نسخة واحدة فقط
if (typeof window !== 'undefined') {
  window.transformersLoader = window.transformersLoader || new TransformersLoader();
  console.log('✅ تم تهيئة TransformersLoader في window');
}

// ✅ دعم CommonJS للاستخدام في Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TransformersLoader;
}
