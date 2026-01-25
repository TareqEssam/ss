/**
 * 🎤 معالج الصوت (تسجيل ونطق)
 * Voice Handler (Speech Recognition & Synthesis)
 * 
 * الهدف: التعامل مع المدخلات الصوتية والنطق الصوتي
 * 
 * @author AI Expert System
 * @version 2.0.0
 */

class VoiceHandler {
  constructor() {
    // التحقق من دعم المتصفح
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.isSupported = this._checkSupport();
    
    // الحالة
    this.isListening = false;
    this.isSpeaking = false;
    this.autoOpenMic = true; // فتح المايك تلقائياً بعد الرد
    
    // الإعدادات
    this.config = {
      language: 'ar-EG', // اللغة العربية (مصر)
      continuous: false,
      interimResults: false,
      maxAlternatives: 1
    };

    // معدل الصوت
    this.voiceSettings = {
      rate: 1.0,      // السرعة
      pitch: 1.0,     // النبرة
      volume: 1.0     // الحجم
    };

    // Callbacks
    this.onResultCallback = null;
    this.onErrorCallback = null;
    this.onStartCallback = null;
    this.onEndCallback = null;
    this.onSpeakEndCallback = null;

    // تهيئة
    if (this.isSupported) {
      this._initRecognition();
    }
  }

  /**
   * ✅ التحقق من دعم المتصفح
   */
  _checkSupport() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const SpeechSynthesis = window.speechSynthesis;
    
    if (!SpeechRecognition) {
      console.warn('⚠️ التعرف الصوتي غير مدعوم في هذا المتصفح');
      return false;
    }

    if (!SpeechSynthesis) {
      console.warn('⚠️ النطق الصوتي غير مدعوم في هذا المتصفح');
      return false;
    }

    return true;
  }

  /**
   * 🚀 تهيئة محرك التعرف الصوتي
   */
  _initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();

    // تطبيق الإعدادات
    this.recognition.lang = this.config.language;
    this.recognition.continuous = this.config.continuous;
    this.recognition.interimResults = this.config.interimResults;
    this.recognition.maxAlternatives = this.config.maxAlternatives;

    // معالجة الأحداث
    this.recognition.onstart = () => {
      this.isListening = true;
      console.log('🎤 بدء التسجيل...');
      if (this.onStartCallback) {
        this.onStartCallback();
      }
    };

    this.recognition.onresult = (event) => {
      const result = event.results[0][0];
      const transcript = result.transcript;
      const confidence = result.confidence;

      console.log(`📝 النص المسجل: "${transcript}" (الثقة: ${(confidence * 100).toFixed(2)}%)`);

      if (this.onResultCallback) {
        this.onResultCallback(transcript, confidence);
      }
    };

    this.recognition.onerror = (event) => {
      console.error('❌ خطأ في التسجيل:', event.error);
      this.isListening = false;

      let errorMessage = 'حدث خطأ في التسجيل الصوتي';
      
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'لم يتم اكتشاف صوت';
          break;
        case 'audio-capture':
          errorMessage = 'لا يمكن الوصول إلى الميكروفون';
          break;
        case 'not-allowed':
          errorMessage = 'تم رفض إذن الميكروفون';
          break;
        case 'network':
          errorMessage = 'خطأ في الاتصال بالإنترنت';
          break;
      }

      if (this.onErrorCallback) {
        this.onErrorCallback(errorMessage);
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      console.log('🛑 انتهى التسجيل');
      if (this.onEndCallback) {
        this.onEndCallback();
      }
    };
  }

  /**
   * 🎤 بدء التسجيل
   */
  startListening() {
    if (!this.isSupported) {
      console.error('❌ التعرف الصوتي غير مدعوم');
      if (this.onErrorCallback) {
        this.onErrorCallback('المتصفح لا يدعم التعرف الصوتي');
      }
      return false;
    }

    if (this.isListening) {
      console.warn('⚠️ التسجيل قيد التشغيل بالفعل');
      return false;
    }

    // إيقاف النطق إذا كان قيد التشغيل
    if (this.isSpeaking) {
      this.stopSpeaking();
    }

    try {
      this.recognition.start();
      return true;
    } catch (error) {
      console.error('❌ فشل بدء التسجيل:', error);
      if (this.onErrorCallback) {
        this.onErrorCallback('فشل بدء التسجيل');
      }
      return false;
    }
  }

  /**
   * 🛑 إيقاف التسجيل
   */
  stopListening() {
    if (!this.isListening) {
      return;
    }

    try {
      this.recognition.stop();
    } catch (error) {
      console.error('❌ خطأ في إيقاف التسجيل:', error);
    }
  }

  /**
   * 🔊 نطق النص
   */
  speak(text, options = {}) {
    if (!this.isSupported) {
      console.error('❌ النطق الصوتي غير مدعوم');
      return false;
    }

    // إيقاف أي نطق سابق
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // تطبيق الإعدادات
    utterance.lang = options.lang || this.config.language;
    utterance.rate = options.rate || this.voiceSettings.rate;
    utterance.pitch = options.pitch || this.voiceSettings.pitch;
    utterance.volume = options.volume || this.voiceSettings.volume;

    // اختيار الصوت العربي
    const voices = this.synthesis.getVoices();
    const arabicVoice = voices.find(voice => 
      voice.lang.startsWith('ar') || voice.lang === this.config.language
    );
    
    if (arabicVoice) {
      utterance.voice = arabicVoice;
    }

    // معالجة الأحداث
    utterance.onstart = () => {
      this.isSpeaking = true;
      console.log('🔊 بدء النطق...');
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      console.log('✅ انتهى النطق');

      // فتح المايك تلقائياً بعد الانتهاء من النطق
      if (this.autoOpenMic && options.autoOpenMic !== false) {
        setTimeout(() => {
          this.startListening();
        }, 500);
      }

      if (this.onSpeakEndCallback) {
        this.onSpeakEndCallback();
      }
    };

    utterance.onerror = (event) => {
      this.isSpeaking = false;
      console.error('❌ خطأ في النطق:', event.error);
    };

    // بدء النطق
    this.synthesis.speak(utterance);
    return true;
  }

  /**
   * 🛑 إيقاف النطق
   */
  stopSpeaking() {
    if (this.synthesis.speaking) {
      this.synthesis.cancel();
      this.isSpeaking = false;
      console.log('🛑 تم إيقاف النطق');
    }
  }

  /**
   * ⏸️ إيقاف مؤقت للنطق
   */
  pauseSpeaking() {
    if (this.synthesis.speaking && !this.synthesis.paused) {
      this.synthesis.pause();
      console.log('⏸️ إيقاف مؤقت للنطق');
    }
  }

  /**
   * ▶️ استئناف النطق
   */
  resumeSpeaking() {
    if (this.synthesis.paused) {
      this.synthesis.resume();
      console.log('▶️ استئناف النطق');
    }
  }

  /**
   * 🔄 تبديل حالة التسجيل
   */
  toggleListening() {
    if (this.isListening) {
      this.stopListening();
    } else {
      this.startListening();
    }
  }

  /**
   * 🔄 تبديل الفتح التلقائي للمايك
   */
  toggleAutoOpenMic() {
    this.autoOpenMic = !this.autoOpenMic;
    console.log(`🔄 الفتح التلقائي للمايك: ${this.autoOpenMic ? 'مفعّل' : 'معطّل'}`);
    return this.autoOpenMic;
  }

  /**
   * ⚙️ تحديث إعدادات اللغة
   */
  setLanguage(lang) {
    this.config.language = lang;
    if (this.recognition) {
      this.recognition.lang = lang;
    }
    console.log(`🌍 تم تغيير اللغة إلى: ${lang}`);
  }

  /**
   * ⚙️ تحديث إعدادات الصوت
   */
  setVoiceSettings(settings) {
    this.voiceSettings = { ...this.voiceSettings, ...settings };
    console.log('⚙️ تم تحديث إعدادات الصوت:', this.voiceSettings);
  }

  /**
   * 📋 الحصول على قائمة الأصوات المتاحة
   */
  getAvailableVoices() {
    const voices = this.synthesis.getVoices();
    const arabicVoices = voices.filter(voice => voice.lang.startsWith('ar'));
    
    console.log(`🎙️ الأصوات العربية المتاحة: ${arabicVoices.length}`);
    return arabicVoices;
  }

  /**
   * 🎙️ اختبار الميكروفون
   */
  async testMicrophone() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      console.log('✅ الميكروفون يعمل بشكل صحيح');
      return true;
    } catch (error) {
      console.error('❌ فشل اختبار الميكروفون:', error);
      return false;
    }
  }

  /**
   * 📊 الحصول على الحالة
   */
  getStatus() {
    return {
      isSupported: this.isSupported,
      isListening: this.isListening,
      isSpeaking: this.isSpeaking,
      autoOpenMic: this.autoOpenMic,
      language: this.config.language,
      voiceSettings: this.voiceSettings
    };
  }

  /**
   * 🎯 تسجيل Callbacks
   */
  onResult(callback) {
    this.onResultCallback = callback;
  }

  onError(callback) {
    this.onErrorCallback = callback;
  }

  onStart(callback) {
    this.onStartCallback = callback;
  }

  onEnd(callback) {
    this.onEndCallback = callback;
  }

  onSpeakEnd(callback) {
    this.onSpeakEndCallback = callback;
  }

  /**
   * 🧹 تنظيف
   */
  destroy() {
    this.stopListening();
    this.stopSpeaking();
    this.recognition = null;
    console.log('🧹 تم تنظيف معالج الصوت');
  }
}

// تصدير الكلاس
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VoiceHandler;
}