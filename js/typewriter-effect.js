/**
 * ⌨️ تأثير الطباعة البشرية
 * Typewriter Effect
 * 
 * الهدف: محاكاة الكتابة البشرية لإعطاء إحساس طبيعي
 * 
 * @author AI Expert System
 * @version 2.0.0
 */

class TypewriterEffect {
  constructor() {
    // الإعدادات الافتراضية
    this.defaultSpeed = 30;      // ميلي ثانية لكل حرف
    this.fastSpeed = 15;          // سرعة سريعة
    this.slowSpeed = 50;          // سرعة بطيئة
    
    // الحالة
    this.isTyping = false;
    this.currentTyping = null;
    this.isPaused = false;
    
    // Callbacks
    this.onCompleteCallback = null;
    this.onCharacterCallback = null;
  }

  /**
   * ⌨️ كتابة النص بتأثير الآلة الكاتبة
   * @param {HTMLElement} element - العنصر الذي سيتم الكتابة فيه
   * @param {string} text - النص المراد كتابته
   * @param {object} options - خيارات التأثير
   */
  async type(element, text, options = {}) {
    // الإعدادات
    const config = {
      speed: options.speed || this.defaultSpeed,
      cursor: options.cursor !== false,
      cursorChar: options.cursorChar || '|',
      html: options.html || false,
      delay: options.delay || 0,
      random: options.random !== false, // تباين عشوائي في السرعة
      randomness: options.randomness || 0.3,
      onComplete: options.onComplete || null,
      onCharacter: options.onCharacter || null
    };

    // إيقاف أي كتابة حالية
    this.stop();

    // انتظار التأخير الابتدائي
    if (config.delay > 0) {
      await this._sleep(config.delay);
    }

    this.isTyping = true;
    this.isPaused = false;

    // مسح المحتوى السابق
    element.innerHTML = '';

    // إضافة المؤشر
    let cursor = null;
    if (config.cursor) {
      cursor = document.createElement('span');
      cursor.className = 'typewriter-cursor';
      cursor.textContent = config.cursorChar;
      cursor.style.animation = 'blink 1s infinite';
      element.appendChild(cursor);
    }

    // معالجة HTML أو نص عادي
    const content = config.html ? this._parseHTML(text) : text;

    try {
      if (config.html) {
        await this._typeHTML(element, content, config, cursor);
      } else {
        await this._typeText(element, content, config, cursor);
      }

      // إزالة المؤشر عند الانتهاء
      if (cursor && cursor.parentNode) {
        cursor.remove();
      }

      this.isTyping = false;

      // استدعاء callback الاكتمال
      if (config.onComplete) {
        config.onComplete();
      }
      if (this.onCompleteCallback) {
        this.onCompleteCallback();
      }

    } catch (error) {
      if (error.message !== 'STOPPED') {
        console.error('❌ خطأ في تأثير الطباعة:', error);
      }
      this.isTyping = false;
    }
  }

  /**
   * 📝 كتابة نص عادي
   */
  async _typeText(element, text, config, cursor) {
    const chars = Array.from(text); // دعم الأحرف العربية المركبة

    for (let i = 0; i < chars.length; i++) {
      // التحقق من الإيقاف
      if (!this.isTyping) {
        throw new Error('STOPPED');
      }

      // الانتظار إذا كان متوقف مؤقتاً
      while (this.isPaused) {
        await this._sleep(100);
      }

      const char = chars[i];
      const textNode = document.createTextNode(char);

      // إدراج قبل المؤشر
      if (cursor && cursor.parentNode) {
        element.insertBefore(textNode, cursor);
      } else {
        element.appendChild(textNode);
      }

      // callback لكل حرف
      if (config.onCharacter) {
        config.onCharacter(char, i);
      }
      if (this.onCharacterCallback) {
        this.onCharacterCallback(char, i);
      }

      // حساب سرعة متغيرة
      const speed = config.random 
        ? this._getRandomSpeed(config.speed, config.randomness)
        : config.speed;

      // توقف إضافي بعد علامات الترقيم
      const pauseAfter = this._getPauseAfterChar(char);

      await this._sleep(speed + pauseAfter);
    }
  }

  /**
   * 🌐 كتابة HTML
   */
  async _typeHTML(element, htmlContent, config, cursor) {
    for (const item of htmlContent) {
      if (!this.isTyping) {
        throw new Error('STOPPED');
      }

      while (this.isPaused) {
        await this._sleep(100);
      }

      if (item.type === 'text') {
        // نص عادي
        await this._typeText(element, item.content, config, cursor);
      } else if (item.type === 'tag') {
        // عنصر HTML
        const htmlElement = this._createElementFromTag(item.content);
        
        if (cursor && cursor.parentNode) {
          element.insertBefore(htmlElement, cursor);
        } else {
          element.appendChild(htmlElement);
        }

        // توقف بسيط بعد العناصر
        await this._sleep(50);
      }
    }
  }

  /**
   * 🔍 تحليل HTML إلى أجزاء
   */
  _parseHTML(html) {
    const parts = [];
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    const traverse = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        if (node.textContent.trim()) {
          parts.push({
            type: 'text',
            content: node.textContent
          });
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // حفظ العنصر كاملاً
        parts.push({
          type: 'tag',
          content: node.outerHTML
        });
      }
    };

    Array.from(tempDiv.childNodes).forEach(traverse);
    return parts;
  }

  /**
   * 🏗️ إنشاء عنصر من HTML
   */
  _createElementFromTag(html) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.firstChild;
  }

  /**
   * 🎲 حساب سرعة عشوائية
   */
  _getRandomSpeed(baseSpeed, randomness) {
    const variation = baseSpeed * randomness;
    const random = Math.random() * variation * 2 - variation;
    return Math.max(10, baseSpeed + random);
  }

  /**
   * ⏸️ توقف إضافي بعد علامات الترقيم
   */
  _getPauseAfterChar(char) {
    switch (char) {
      case '.':
      case '。':
      case '؟':
      case '?':
      case '!':
      case '！':
        return 300;
      
      case ',':
      case '،':
      case ';':
      case '؛':
      case ':':
      case '：':
        return 150;
      
      case '\n':
        return 200;
      
      default:
        return 0;
    }
  }

  /**
   * 💤 Sleep مساعد
   */
  _sleep(ms) {
    return new Promise(resolve => {
      this.currentTyping = setTimeout(resolve, ms);
    });
  }

  /**
   * 🛑 إيقاف الكتابة
   */
  stop() {
    this.isTyping = false;
    this.isPaused = false;
    
    if (this.currentTyping) {
      clearTimeout(this.currentTyping);
      this.currentTyping = null;
    }
  }

  /**
   * ⏸️ إيقاف مؤقت
   */
  pause() {
    if (this.isTyping && !this.isPaused) {
      this.isPaused = true;
      console.log('⏸️ إيقاف مؤقت للكتابة');
    }
  }

  /**
   * ▶️ استئناف
   */
  resume() {
    if (this.isTyping && this.isPaused) {
      this.isPaused = false;
      console.log('▶️ استئناف الكتابة');
    }
  }

  /**
   * ⚡ كتابة فورية (بدون تأثير)
   */
  instant(element, text, options = {}) {
    const config = {
      html: options.html || false
    };

    element.innerHTML = config.html ? text : this._escapeHTML(text);

    if (options.onComplete) {
      options.onComplete();
    }
  }

  /**
   * 🔄 إعادة الكتابة
   */
  async rewrite(element, newText, options = {}) {
    // مسح النص الحالي بتأثير عكسي
    if (options.eraseFirst) {
      await this.erase(element, {
        speed: options.eraseSpeed || this.fastSpeed
      });
    }

    // كتابة النص الجديد
    await this.type(element, newText, options);
  }

  /**
   * 🗑️ مسح النص بتأثير عكسي
   */
  async erase(element, options = {}) {
    const config = {
      speed: options.speed || this.defaultSpeed,
      onComplete: options.onComplete || null
    };

    const text = element.textContent;
    const chars = Array.from(text);

    for (let i = chars.length - 1; i >= 0; i--) {
      if (!this.isTyping) break;

      element.textContent = chars.slice(0, i).join('');
      await this._sleep(config.speed);
    }

    if (config.onComplete) {
      config.onComplete();
    }
  }

  /**
   * 🎯 Callbacks
   */
  onComplete(callback) {
    this.onCompleteCallback = callback;
  }

  onCharacter(callback) {
    this.onCharacterCallback = callback;
  }

  /**
   * 📊 الحصول على الحالة
   */
  getStatus() {
    return {
      isTyping: this.isTyping,
      isPaused: this.isPaused
    };
  }

  /**
   * 🔒 Escape HTML
   */
  _escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// إضافة CSS للمؤشر (إذا لم يكن موجوداً)
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes blink {
      0%, 49% { opacity: 1; }
      50%, 100% { opacity: 0; }
    }
    
    .typewriter-cursor {
      display: inline-block;
      margin-left: 2px;
      animation: blink 1s infinite;
    }
  `;
  
  if (document.head && !document.querySelector('style[data-typewriter]')) {
    style.setAttribute('data-typewriter', 'true');
    document.head.appendChild(style);
  }
}

// تصدير الكلاس
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TypewriterEffect;
}