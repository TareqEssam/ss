/**
 * 🔄 مؤشر التقدم - Progress Indicator
 * 
 * يعرض للمستخدم أن النظام يعمل ويفكر
 * 
 * @version 1.0.0
 */

class ProgressIndicator {
  constructor() {
    this.indicatorElement = null;
    this.isShowing = false;
    this.currentStep = '';
    this.animationInterval = null;
    this.dots = 0;
    
    this._createIndicator();
  }

  /**
   * 🎨 إنشاء عنصر المؤشر
   */
  _createIndicator() {
    // إنشاء العنصر
    this.indicatorElement = document.createElement('div');
    this.indicatorElement.id = 'thinking-indicator';
    this.indicatorElement.style.cssText = `
      display: none;
      position: fixed;
      bottom: 80px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px 20px;
      border-radius: 25px;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
      font-size: 14px;
      font-weight: 500;
      z-index: 9998;
      animation: slideIn 0.3s ease-out;
      backdrop-filter: blur(10px);
    `;

    // إضافة الأنيميشن
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateY(20px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      @keyframes slideOut {
        from {
          transform: translateY(0);
          opacity: 1;
        }
        to {
          transform: translateY(20px);
          opacity: 0;
        }
      }

      @keyframes pulse {
        0%, 100% {
          opacity: 1;
        }
        50% {
          opacity: 0.6;
        }
      }

      #thinking-indicator .spinner {
        display: inline-block;
        width: 12px;
        height: 12px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        margin-right: 8px;
        vertical-align: middle;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(this.indicatorElement);
  }

  /**
   * 🔄 عرض المؤشر
   */
  show(step = 'جاري التفكير') {
    if (this.isShowing) {
      this.updateStep(step);
      return;
    }

    this.isShowing = true;
    this.currentStep = step;
    
    this.indicatorElement.innerHTML = `
      <span class="spinner"></span>
      <span class="step-text">${step}<span class="dots"></span></span>
    `;
    
    this.indicatorElement.style.display = 'block';
    
    // بدء أنيميشن النقاط
    this._startDotsAnimation();
  }

  /**
   * ✏️ تحديث الخطوة الحالية
   */
  updateStep(step) {
    this.currentStep = step;
    const stepElement = this.indicatorElement.querySelector('.step-text');
    if (stepElement) {
      stepElement.innerHTML = `${step}<span class="dots"></span>`;
    }
  }

  /**
   * ✨ أنيميشن النقاط
   */
  _startDotsAnimation() {
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
    }

    this.dots = 0;
    this.animationInterval = setInterval(() => {
      const dotsElement = this.indicatorElement.querySelector('.dots');
      if (dotsElement) {
        this.dots = (this.dots + 1) % 4;
        dotsElement.textContent = '.'.repeat(this.dots);
      }
    }, 500);
  }

  /**
   * ❌ إخفاء المؤشر
   */
  hide() {
    if (!this.isShowing) return;

    if (this.animationInterval) {
      clearInterval(this.animationInterval);
      this.animationInterval = null;
    }

    // أنيميشن الإخفاء
    this.indicatorElement.style.animation = 'slideOut 0.3s ease-out';
    
    setTimeout(() => {
      this.indicatorElement.style.display = 'none';
      this.indicatorElement.style.animation = 'slideIn 0.3s ease-out';
      this.isShowing = false;
    }, 300);
  }

  /**
   * 🎯 عرض رسالة نجاح سريعة
   */
  showSuccess(message = 'تم!', duration = 1500) {
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
    }

    this.indicatorElement.innerHTML = `
      <span style="font-size: 16px; margin-right: 5px;">✅</span>
      <span>${message}</span>
    `;

    this.indicatorElement.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    this.indicatorElement.style.display = 'block';
    this.isShowing = true;

    setTimeout(() => {
      this.hide();
    }, duration);
  }

  /**
   * ❌ عرض رسالة خطأ
   */
  showError(message = 'حدث خطأ', duration = 2000) {
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
    }

    this.indicatorElement.innerHTML = `
      <span style="font-size: 16px; margin-right: 5px;">❌</span>
      <span>${message}</span>
    `;

    this.indicatorElement.style.background = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
    this.indicatorElement.style.display = 'block';
    this.isShowing = true;

    setTimeout(() => {
      this.hide();
      this.indicatorElement.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }, duration);
  }

  /**
   * 🧹 تنظيف
   */
  destroy() {
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
    }
    if (this.indicatorElement && this.indicatorElement.parentNode) {
      this.indicatorElement.parentNode.removeChild(this.indicatorElement);
    }
  }
}

// تصدير
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProgressIndicator;
}
