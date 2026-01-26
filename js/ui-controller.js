/**
 * 🎨 متحكم الواجهة
 * UI Controller
 * 
 * الهدف: إدارة واجهة المساعد الذكي والتفاعلات
 * 
 * @author AI Expert System
 * @version 2.0.0
 */

class UIController {
  constructor(aiCore, voiceHandler, typewriterEffect, responseGenerator) {
    // المكونات
    this.aiCore = aiCore;
    this.voiceHandler = voiceHandler;
    this.typewriter = typewriterEffect;
    this.responseGenerator = responseGenerator;

    // عناصر الواجهة
    this.elements = {
      floatingIcon: null,
      assistantPanel: null,
      messagesContainer: null,
      inputField: null,
      sendButton: null,
      voiceButton: null,
      muteButton: null,
      closeButton: null,
      minimizeButton: null,
      clearButton: null,
      exportButton: null,
      importButton: null
    };

    // الحالة
    this.isOpen = false;
    this.isMuted = false;
    this.isDragging = false;
    this.dragOffset = { x: 0, y: 0 };

    // الإعدادات
    this.config = {
      enableVoice: true,
      enableTypewriter: true,
      maxMessages: 50
    };

    // سجل الرسائل
    this.messages = [];
  }

  /**
   * 🚀 تهيئة الواجهة
   */
  async initialize() {
    console.log('🎨 تهيئة واجهة المستخدم...');

    // إنشاء الأيقونة العائمة
    this._createFloatingIcon();

    // إنشاء لوحة المساعد
    this._createAssistantPanel();

    // ربط الأحداث
    this._bindEvents();

    // تحميل الحالة المحفوظة
    await this._loadSavedState();

    console.log('✅ تم تهيئة الواجهة');
  }

  /**
   * 🎯 إنشاء الأيقونة العائمة
   */
  _createFloatingIcon() {
    const icon = document.createElement('div');
    icon.id = 'ai-assistant-icon';
    icon.className = 'ai-floating-icon';
    icon.innerHTML = `
      <div class="icon-inner">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          <circle cx="9" cy="10" r="1"></circle>
          <circle cx="15" cy="10" r="1"></circle>
          <path d="M9 14c0 1 1 2 3 2s3-1 3-2"></path>
        </svg>
      </div>
      <div class="icon-badge">AI</div>
    `;

    // إضافة tooltip
    icon.title = 'مساعد الهيئة الذكي - اضغط للفتح';

    document.body.appendChild(icon);
    this.elements.floatingIcon = icon;

    // جعل الأيقونة قابلة للسحب
    this._makeDraggable(icon);
  }

  /**
   * 🏗️ إنشاء لوحة المساعد
   */
  _createAssistantPanel() {
    const panel = document.createElement('div');
    panel.id = 'ai-assistant-panel';
    panel.className = 'ai-assistant-panel';
    panel.style.display = 'none';

    panel.innerHTML = `
      <div class="assistant-header">
        <div class="header-title">
          <div class="ai-logo">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
          </div>
          <div>
            <h3>مساعد الهيئة الذكي</h3>
            <p class="status-text">جاهز للمساعدة</p>
          </div>
        </div>
        <div class="header-controls">
          <button id="ai-export-btn" class="icon-btn" title="تصدير الذاكرة">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </button>
          <button id="ai-import-btn" class="icon-btn" title="استيراد الذاكرة">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
          </button>
          <button id="ai-clear-btn" class="icon-btn" title="مسح المحادثة">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
          <button id="ai-minimize-btn" class="icon-btn" title="تصغير">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
          <button id="ai-close-btn" class="icon-btn" title="إغلاق">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      <div class="assistant-body">
        <div id="ai-messages-container" class="messages-container">
          <div class="welcome-message">
            <div class="ai-avatar">🤖</div>
            <div class="message-content">
              <p><strong>مرحباً بك في مساعد الهيئة الذكي!</strong></p>
              <p>أنا هنا لمساعدتك في الإجابة على أسئلتك حول:</p>
              <ul>
                <li>📋 الأنشطة الاستثمارية والتراخيص</li>
                <li>📍 المناطق الصناعية ومواقعها</li>
                <li>🎁 حوافز القرار 104</li>
                <li>🏛️ الجهات المختصة والإجراءات</li>
              </ul>
              <p>يمكنك الكتابة أو استخدام المايك للتحدث معي!</p>
            </div>
          </div>
        </div>
      </div>

      <div class="assistant-footer">
        <div class="input-container">
          <textarea 
            id="ai-input-field" 
            class="input-field" 
            placeholder="اكتب سؤالك هنا... (أو اضغط على المايك)"
            rows="1"
          ></textarea>
          <div class="input-controls">
            <button id="ai-mute-btn" class="control-btn mute-btn" title="كتم الصوت">
              <svg class="icon-unmuted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              </svg>
              <svg class="icon-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:none;">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <line x1="23" y1="9" x2="17" y2="15"></line>
                <line x1="17" y1="9" x2="23" y2="15"></line>
              </svg>
            </button>
            <button id="ai-voice-btn" class="control-btn voice-btn" title="ابدأ التسجيل">
              <svg class="icon-mic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
              </svg>
              <svg class="icon-mic-active" viewBox="0 0 24 24" fill="currentColor" style="display:none;">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" stroke-width="2" fill="none"></line>
                <line x1="8" y1="23" x2="16" y2="23" stroke="currentColor" stroke-width="2" fill="none"></line>
              </svg>
            </button>
            <button id="ai-send-btn" class="control-btn send-btn" title="إرسال">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <input type="file" id="ai-import-file" accept=".json" style="display:none;">
    `;

    document.body.appendChild(panel);
    this.elements.assistantPanel = panel;

    // حفظ المراجع للعناصر
    this.elements.messagesContainer = panel.querySelector('#ai-messages-container');
    this.elements.inputField = panel.querySelector('#ai-input-field');
    this.elements.sendButton = panel.querySelector('#ai-send-btn');
    this.elements.voiceButton = panel.querySelector('#ai-voice-btn');
    this.elements.muteButton = panel.querySelector('#ai-mute-btn');
    this.elements.closeButton = panel.querySelector('#ai-close-btn');
    this.elements.minimizeButton = panel.querySelector('#ai-minimize-btn');
    this.elements.clearButton = panel.querySelector('#ai-clear-btn');
    this.elements.exportButton = panel.querySelector('#ai-export-btn');
    this.elements.importButton = panel.querySelector('#ai-import-btn');

    // Auto-resize textarea
    this._setupAutoResize();
  }

  /**
   * 🔗 ربط الأحداث
   */
  _bindEvents() {
    // الأيقونة العائمة
    this.elements.floatingIcon.addEventListener('click', () => this.togglePanel());

    // أزرار التحكم
    this.elements.sendButton.addEventListener('click', () => this.sendMessage());
    this.elements.voiceButton.addEventListener('click', () => this.toggleVoice());
    this.elements.muteButton.addEventListener('click', () => this.toggleMute());
    this.elements.closeButton.addEventListener('click', () => this.closePanel());
    this.elements.minimizeButton.addEventListener('click', () => this.minimizePanel());
    this.elements.clearButton.addEventListener('click', () => this.clearChat());
    this.elements.exportButton.addEventListener('click', () => this.exportBrain());
    this.elements.importButton.addEventListener('click', () => this.importBrain());

    // حقل الإدخال
    this.elements.inputField.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // ملف الاستيراد
    const fileInput = document.getElementById('ai-import-file');
    fileInput.addEventListener('change', (e) => this._handleImport(e));

    // Voice Handler Events
    if (this.voiceHandler) {
      this.voiceHandler.onResult((text, confidence) => {
        this.elements.inputField.value = text;
        this.sendMessage();
      });

      this.voiceHandler.onError((error) => {
        this.showNotification(error, 'error');
      });

      this.voiceHandler.onStart(() => {
        this._updateVoiceButton(true);
      });

      this.voiceHandler.onEnd(() => {
        this._updateVoiceButton(false);
      });
    }
  }

  /**
   * 🎭 جعل العنصر قابل للسحب
   */
  _makeDraggable(element) {
    let isDragging = false;
    let startX, startY, initialX, initialY;

    element.addEventListener('mousedown', startDrag);
    element.addEventListener('touchstart', startDrag, { passive: false });

    function startDrag(e) {
      if (e.type === 'mousedown') {
        startX = e.clientX;
        startY = e.clientY;
      } else {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      }

      const rect = element.getBoundingClientRect();
      initialX = rect.left;
      initialY = rect.top;

      isDragging = true;
      element.classList.add('dragging');

      document.addEventListener('mousemove', drag);
      document.addEventListener('touchmove', drag, { passive: false });
      document.addEventListener('mouseup', stopDrag);
      document.addEventListener('touchend', stopDrag);
    }

    function drag(e) {
      if (!isDragging) return;
      e.preventDefault();

      let currentX, currentY;
      if (e.type === 'mousemove') {
        currentX = e.clientX;
        currentY = e.clientY;
      } else {
        currentX = e.touches[0].clientX;
        currentY = e.touches[0].clientY;
      }

      const deltaX = currentX - startX;
      const deltaY = currentY - startY;

      let newX = initialX + deltaX;
      let newY = initialY + deltaY;

      // قيود الحدود
      const maxX = window.innerWidth - element.offsetWidth;
      const maxY = window.innerHeight - element.offsetHeight;

      newX = Math.max(0, Math.min(newX, maxX));
      newY = Math.max(0, Math.min(newY, maxY));

      element.style.left = newX + 'px';
      element.style.top = newY + 'px';
      element.style.right = 'auto';
      element.style.bottom = 'auto';
    }

    function stopDrag() {
      isDragging = false;
      element.classList.remove('dragging');

      document.removeEventListener('mousemove', drag);
      document.removeEventListener('touchmove', drag);
      document.removeEventListener('mouseup', stopDrag);
      document.removeEventListener('touchend', stopDrag);
    }
  }

  /**
   * 🔄 Auto-resize لحقل الإدخال
   */
  _setupAutoResize() {
    const field = this.elements.inputField;
    
    field.addEventListener('input', () => {
      field.style.height = 'auto';
      field.style.height = Math.min(field.scrollHeight, 120) + 'px';
    });
  }

  /**
   * 📤 إرسال رسالة
   */
  async sendMessage() {
    const message = this.elements.inputField.value.trim();
    
    if (!message) {
      return;
    }

    // عرض رسالة المستخدم
    this.addMessage(message, 'user');

    // مسح حقل الإدخال
    this.elements.inputField.value = '';
    this.elements.inputField.style.height = 'auto';

    // إظهار مؤشر الكتابة
    this.showTypingIndicator();

    try {
      // معالجة الاستعلام
      const response = await this.aiCore.processQuery(message, { isVoice: false });

      // إخفاء مؤشر الكتابة
      this.hideTypingIndicator();

      // عرض الرد
      if (response.success) {
        const formattedResponse = this.responseGenerator.generateResponse(
          response,
          null,
          message
        );
        
        await this.addMessage(formattedResponse.text, 'assistant', {
          html: formattedResponse.html,
          links: formattedResponse.links,
          useTypewriter: this.config.enableTypewriter
        });

        // النطق الصوتي
        if (this.config.enableVoice && !this.isMuted) {
          this.voiceHandler.speak(formattedResponse.text);
        }
      } else {
        this.addMessage(response.message || 'عذراً، حدث خطأ', 'assistant');
      }

    } catch (error) {
      console.error('❌ خطأ في المعالجة:', error);
      this.hideTypingIndicator();
      this.addMessage('عذراً، حدث خطأ غير متوقع. حاول مرة أخرى.', 'assistant');
    }
  }

  /**
   * 💬 إضافة رسالة إلى المحادثة
   */
  async addMessage(content, sender, options = {}) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = sender === 'user' ? '👤' : '🤖';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    if (sender === 'user') {
      contentDiv.textContent = content;
      messageDiv.appendChild(avatar);
      messageDiv.appendChild(contentDiv);
    } else {
      messageDiv.appendChild(avatar);
      messageDiv.appendChild(contentDiv);

      // استخدام تأثير الكتابة
      if (options.useTypewriter && this.typewriter) {
        await this.typewriter.type(contentDiv, options.html || content, {
          html: !!options.html,
          speed: 30,
          random: true
        });
      } else {
        if (options.html) {
          contentDiv.innerHTML = options.html;
        } else {
          contentDiv.textContent = content;
        }
      }
    }

    this.elements.messagesContainer.appendChild(messageDiv);
    this.messages.push({ sender, content, timestamp: new Date() });

    // Scroll to bottom
    this.scrollToBottom();

    // حذف الرسائل القديمة
    if (this.messages.length > this.config.maxMessages) {
      const oldMessage = this.elements.messagesContainer.querySelector('.message');
      if (oldMessage) {
        oldMessage.remove();
      }
      this.messages.shift();
    }
  }

  /**
   * ⌨️ إظهار مؤشر الكتابة
   */
  showTypingIndicator() {
    const existing = this.elements.messagesContainer.querySelector('.typing-indicator');
    if (existing) return;

    const indicator = document.createElement('div');
    indicator.className = 'message assistant-message typing-indicator';
    indicator.innerHTML = `
      <div class="message-avatar">🤖</div>
      <div class="message-content">
        <div class="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `;

    this.elements.messagesContainer.appendChild(indicator);
    this.scrollToBottom();
  }

  /**
   * 🚫 إخفاء مؤشر الكتابة
   */
  hideTypingIndicator() {
    const indicator = this.elements.messagesContainer.querySelector('.typing-indicator');
    if (indicator) {
      indicator.remove();
    }
  }

  /**
   * 📜 Scroll to bottom
   */
  scrollToBottom() {
    this.elements.messagesContainer.scrollTop = this.elements.messagesContainer.scrollHeight;
  }

  /**
   * 🎤 تبديل حالة المايك
   */
  toggleVoice() {
    if (!this.voiceHandler || !this.voiceHandler.isSupported) {
      this.showNotification('المتصفح لا يدعم التعرف الصوتي', 'error');
      return;
    }

    this.voiceHandler.toggleListening();
  }

  /**
   * 🔇 تبديل كتم الصوت
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    
    const unmutedIcon = this.elements.muteButton.querySelector('.icon-unmuted');
    const mutedIcon = this.elements.muteButton.querySelector('.icon-muted');

    if (this.isMuted) {
      unmutedIcon.style.display = 'none';
      mutedIcon.style.display = 'block';
      this.elements.muteButton.classList.add('muted');
      this.voiceHandler.stopSpeaking();
      this.showNotification('تم كتم الصوت', 'info');
    } else {
      unmutedIcon.style.display = 'block';
      mutedIcon.style.display = 'none';
      this.elements.muteButton.classList.remove('muted');
      this.showNotification('تم تشغيل الصوت', 'info');
    }
  }

  /**
   * 🔄 تحديث زر المايك
   */
  _updateVoiceButton(isActive) {
    const micIcon = this.elements.voiceButton.querySelector('.icon-mic');
    const micActiveIcon = this.elements.voiceButton.querySelector('.icon-mic-active');

    if (isActive) {
      micIcon.style.display = 'none';
      micActiveIcon.style.display = 'block';
      this.elements.voiceButton.classList.add('active');
    } else {
      micIcon.style.display = 'block';
      micActiveIcon.style.display = 'none';
      this.elements.voiceButton.classList.remove('active');
    }
  }

  /**
   * 🔄 تبديل حالة اللوحة
   */
  togglePanel() {
    if (this.isOpen) {
      this.closePanel();
    } else {
      this.openPanel();
    }
  }

  /**
   * ✅ فتح اللوحة
   */
  openPanel() {
    this.elements.assistantPanel.style.display = 'flex';
    this.elements.floatingIcon.classList.add('panel-open');
    this.isOpen = true;
    
    setTimeout(() => {
      this.elements.inputField.focus();
    }, 300);
  }

  /**
   * ❌ إغلاق اللوحة
   */
  closePanel() {
    this.elements.assistantPanel.style.display = 'none';
    this.elements.floatingIcon.classList.remove('panel-open');
    this.isOpen = false;
    
    // إيقاف الصوت
    if (this.voiceHandler) {
      this.voiceHandler.stopListening();
      this.voiceHandler.stopSpeaking();
    }
  }

  /**
   * ➖ تصغير اللوحة
   */
  minimizePanel() {
    this.closePanel();
  }

  /**
   * 🗑️ مسح المحادثة
   */
  async clearChat() {
    if (!confirm('هل تريد مسح المحادثة؟')) {
      return;
    }

    // حذف جميع الرسائل ما عدا الترحيب
    const messages = this.elements.messagesContainer.querySelectorAll('.message:not(.welcome-message)');
    messages.forEach(msg => msg.remove());

    this.messages = [];
    
    // مسح السياق
    await this.aiCore.clearContext();

    this.showNotification('تم مسح المحادثة', 'success');
  }

  /**
   * 📤 تصدير العقل
   */
  async exportBrain() {
    try {
      await this.aiCore.exportBrain();
      this.showNotification('تم تصدير الذاكرة بنجاح', 'success');
    } catch (error) {
      console.error('❌ خطأ في التصدير:', error);
      this.showNotification('فشل التصدير', 'error');
    }
  }

  /**
   * 📥 استيراد العقل
   */
  importBrain() {
    document.getElementById('ai-import-file').click();
  }

  /**
   * 📂 معالجة ملف الاستيراد
   */
  async _handleImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      await this.aiCore.importBrain(file);
      this.showNotification('تم استيراد الذاكرة بنجاح', 'success');
      
      // إعادة تحميل الواجهة
      window.location.reload();
    } catch (error) {
      console.error('❌ خطأ في الاستيراد:', error);
      this.showNotification('فشل الاستيراد', 'error');
    }

    // مسح حقل الملف
    event.target.value = '';
  }

  /**
   * 📢 إظهار إشعار
   */
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `ai-notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('show');
    }, 10);

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  /**
   * 💾 حفظ الحالة
   */
  async _saveState() {
    const state = {
      isOpen: this.isOpen,
      isMuted: this.isMuted,
      messages: this.messages.slice(-10) // آخر 10 رسائل
    };

    localStorage.setItem('ai_assistant_state', JSON.stringify(state));
  }

  /**
   * 📥 تحميل الحالة المحفوظة
   */
  async _loadSavedState() {
    try {
      const saved = localStorage.getItem('ai_assistant_state');
      if (saved) {
        const state = JSON.parse(saved);
        
        if (state.isMuted) {
          this.toggleMute();
        }
      }
    } catch (error) {
      console.error('خطأ في تحميل الحالة:', error);
    }
  }

  /**
   * 🧹 تنظيف
   */
  destroy() {

// إيقاف الصوت

if (this.voiceHandler) {

this.voiceHandler.destroy();

}
  // إيقاف الكتابة
if (this.typewriter) {
  this.typewriter.stop();
}

// حفظ الحالة
this._saveState();

// حذف العناصر
if (this.elements.floatingIcon) {
  this.elements.floatingIcon.remove();
}
if (this.elements.assistantPanel) {
  this.elements.assistantPanel.remove();
}

console.log('🧹 تم تنظيف الواجهة');
}
}
