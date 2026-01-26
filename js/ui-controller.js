/**
 * 🎨 متحكم الواجهة - النسخة المحسنة
 * UI Controller - Enhanced with Thinking Indicator
 * 
 * @version 3.0.0 - Fixed
 */

class UIController {
  constructor(aiCore, voiceHandler, typewriterEffect, responseGenerator) {
    this.aiCore = aiCore;
    this.voiceHandler = voiceHandler;
    this.typewriter = typewriterEffect;
    this.responseGenerator = responseGenerator;

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

    this.isOpen = false;
    this.isMuted = false;
    this.isDragging = false;

    this.config = {
      enableVoice: true,
      enableTypewriter: true,
      maxMessages: 50
    };

    this.messages = [];
    this.currentThinkingIndicator = null;
  }

  async initialize() {
    console.log('🎨 تهيئة واجهة المستخدم...');

    this._createFloatingIcon();
    this._createAssistantPanel();
    this._bindEvents();
    await this._loadSavedState();

    console.log('✅ تم تهيئة الواجهة');
  }

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

    icon.title = 'مساعد الهيئة الذكي - اضغط للفتح';
    document.body.appendChild(icon);
    this.elements.floatingIcon = icon;
    this._makeDraggable(icon);
  }

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
            <div class="message-avatar">🤖</div>
            <div class="message-content">
              <p><strong>مرحباً بك في مساعد الهيئة الذكي!</strong></p>
              <p>أنا هنا لمساعدتك في الإجابة على أسئلتك حول:</p>
              <ul>
                <li>📋 الأنشطة الاستثمارية والتراخيص</li>
                <li>🏭 المناطق الصناعية ومواقعها</li>
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

    this._setupAutoResize();
  }

  _bindEvents() {
    this.elements.floatingIcon.addEventListener('click', () => this.togglePanel());
    this.elements.sendButton.addEventListener('click', () => this.sendMessage());
    this.elements.voiceButton.addEventListener('click', () => this.toggleVoice());
    this.elements.muteButton.addEventListener('click', () => this.toggleMute());
    this.elements.closeButton.addEventListener('click', () => this.closePanel());
    this.elements.minimizeButton.addEventListener('click', () => this.minimizePanel());
    this.elements.clearButton.addEventListener('click', () => this.clearChat());
    this.elements.exportButton.addEventListener('click', () => this.exportBrain());
    this.elements.importButton.addEventListener('click', () => this.importBrain());

    this.elements.inputField.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    const fileInput = document.getElementById('ai-import-file');
    fileInput.addEventListener('change', (e) => this._handleImport(e));

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

  _setupAutoResize() {
    const field = this.elements.inputField;
    
    field.addEventListener('input', () => {
      field.style.height = 'auto';
      field.style.height = Math.min(field.scrollHeight, 120) + 'px';
    });
  }

  // 🤔 إظهار مؤشر التفكير
  showThinkingIndicator(stage = 'thinking') {
    this.hideThinkingIndicator();

    const stageMessages = {
      thinking: '🤔 جاري التفكير...',
      analyzing: '🔍 تحليل السؤال...',
      searching: '🔎 البحث في قواعد البيانات...',
      processing: '⚙️ معالجة النتائج...',
      generating: '✍️ تجهيز الإجابة...'
    };

    const indicator = document.createElement('div');
    indicator.className = 'message assistant-message thinking-indicator';
    indicator.innerHTML = `
      <div class="message-avatar">🤖</div>
      <div class="message-content">
        <div class="thinking-content">
          <div class="thinking-dots">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>
          <div class="thinking-text">${stageMessages[stage] || stageMessages.thinking}</div>
        </div>
      </div>
    `;

    this.elements.messagesContainer.appendChild(indicator);
    this.currentThinkingIndicator = indicator;
    this.scrollToBottom();
  }

  // 🎯 تحديث مرحلة التفكير
  updateThinkingStage(stage) {
    if (!this.currentThinkingIndicator) return;

    const stageMessages = {
      thinking: '🤔 جاري التفكير...',
      analyzing: '🔍 تحليل السؤال...',
      searching: '🔎 البحث في قواعد البيانات...',
      processing: '⚙️ معالجة النتائج...',
      generating: '✍️ تجهيز الإجابة...'
    };

    const textEl = this.currentThinkingIndicator.querySelector('.thinking-text');
    if (textEl) {
      textEl.textContent = stageMessages[stage] || stageMessages.thinking;
    }
  }

  // ❌ إخفاء مؤشر التفكير
  hideThinkingIndicator() {
    if (this.currentThinkingIndicator) {
      this.currentThinkingIndicator.classList.add('fade-out');
      setTimeout(() => {
        if (this.currentThinkingIndicator && this.currentThinkingIndicator.parentNode) {
          this.currentThinkingIndicator.remove();
        }
        this.currentThinkingIndicator = null;
      }, 300);
    }
  }

  // باقي المشروع في الجزء الثاني...
}
/**
 * 🎨 متحكم الواجهة - الجزء 2
 * UI Controller - Part 2 (Remaining Functions)
 */

// 📤 إرسال رسالة (محسّن مع مؤشر التفكير)
UIController.prototype.sendMessage = async function() {
  const message = this.elements.inputField.value.trim();
  
  if (!message) {
    return;
  }

  this.addMessage(message, 'user');
  this.elements.inputField.value = '';
  this.elements.inputField.style.height = 'auto';

  // 🤔 إظهار مؤشر التفكير بدلاً من مؤشر الكتابة القديم
  this.showThinkingIndicator('analyzing');

  // تأخير بسيط لإظهار المؤشر
  await new Promise(resolve => setTimeout(resolve, 300));

  try {
    // تحديث المراحل أثناء المعالجة
    this.updateThinkingStage('searching');
    
    const response = await this.aiCore.processQuery(message, { isVoice: false });

    this.updateThinkingStage('generating');
    await new Promise(resolve => setTimeout(resolve, 200));

    this.hideThinkingIndicator();

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

      if (this.config.enableVoice && !this.isMuted && this.voiceHandler) {
        this.voiceHandler.speak(formattedResponse.text);
      }
    } else {
      this.addMessage(response.message || 'عذراً، حدث خطأ', 'assistant');
    }

  } catch (error) {
    console.error('❌ خطأ في المعالجة:', error);
    this.hideThinkingIndicator();
    this.addMessage('عذراً، حدث خطأ غير متوقع. حاول مرة أخرى.', 'assistant');
  }
};

// 💬 إضافة رسالة
UIController.prototype.addMessage = async function(content, sender, options = {}) {
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

  this.scrollToBottom();

  if (this.messages.length > this.config.maxMessages) {
    const oldMessage = this.elements.messagesContainer.querySelector('.message');
    if (oldMessage && !oldMessage.classList.contains('welcome-message')) {
      oldMessage.remove();
    }
    this.messages.shift();
  }
};

// ⌨️ مؤشر الكتابة القديم (للتوافق)
UIController.prototype.showTypingIndicator = function() {
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
};

UIController.prototype.hideTypingIndicator = function() {
  const indicator = this.elements.messagesContainer.querySelector('.typing-indicator');
  if (indicator) {
    indicator.remove();
  }
};

// 📜 Scroll to bottom
UIController.prototype.scrollToBottom = function() {
  this.elements.messagesContainer.scrollTop = this.elements.messagesContainer.scrollHeight;
};

// 🎤 تبديل حالة المايك
UIController.prototype.toggleVoice = function() {
  if (!this.voiceHandler || !this.voiceHandler.isSupported) {
    this.showNotification('المتصفح لا يدعم التعرف الصوتي', 'error');
    return;
  }

  this.voiceHandler.toggleListening();
};

// 🔇 تبديل كتم الصوت
UIController.prototype.toggleMute = function() {
  this.isMuted = !this.isMuted;
  
  const unmutedIcon = this.elements.muteButton.querySelector('.icon-unmuted');
  const mutedIcon = this.elements.muteButton.querySelector('.icon-muted');

  if (this.isMuted) {
    unmutedIcon.style.display = 'none';
    mutedIcon.style.display = 'block';
    this.elements.muteButton.classList.add('muted');
    if (this.voiceHandler) {
      this.voiceHandler.stopSpeaking();
    }
    this.showNotification('تم كتم الصوت', 'info');
  } else {
    unmutedIcon.style.display = 'block';
    mutedIcon.style.display = 'none';
    this.elements.muteButton.classList.remove('muted');
    this.showNotification('تم تشغيل الصوت', 'info');
  }
};

// 🔄 تحديث زر المايك
UIController.prototype._updateVoiceButton = function(isActive) {
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
};

// 🔄 تبديل حالة اللوحة
UIController.prototype.togglePanel = function() {
  if (this.isOpen) {
    this.closePanel();
  } else {
    this.openPanel();
  }
};

// ✅ فتح اللوحة
UIController.prototype.openPanel = function() {
  this.elements.assistantPanel.style.display = 'flex';
  this.elements.floatingIcon.classList.add('panel-open');
  this.isOpen = true;
  
  setTimeout(() => {
    this.elements.inputField.focus();
  }, 300);
};

// ❌ إغلاق اللوحة
UIController.prototype.closePanel = function() {
  this.elements.assistantPanel.style.display = 'none';
  this.elements.floatingIcon.classList.remove('panel-open');
  this.isOpen = false;
  
  if (this.voiceHandler) {
    this.voiceHandler.stopListening();
    this.voiceHandler.stopSpeaking();
  }
};

// ➖ تصغير اللوحة
UIController.prototype.minimizePanel = function() {
  this.closePanel();
};

// 🗑️ مسح المحادثة
UIController.prototype.clearChat = async function() {
  if (!confirm('هل تريد مسح المحادثة؟')) {
    return;
  }

  const messages = this.elements.messagesContainer.querySelectorAll('.message:not(.welcome-message)');
  messages.forEach(msg => msg.remove());

  this.messages = [];
  
  await this.aiCore.clearContext();

  this.showNotification('تم مسح المحادثة', 'success');
};

// 📤 تصدير العقل
UIController.prototype.exportBrain = async function() {
  try {
    await this.aiCore.exportBrain();
    this.showNotification('تم تصدير الذاكرة بنجاح', 'success');
  } catch (error) {
    console.error('❌ خطأ في التصدير:', error);
    this.showNotification('فشل التصدير', 'error');
  }
};

// 📥 استيراد العقل
UIController.prototype.importBrain = function() {
  document.getElementById('ai-import-file').click();
};

// 📂 معالجة ملف الاستيراد
UIController.prototype._handleImport = async function(event) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    await this.aiCore.importBrain(file);
    this.showNotification('تم استيراد الذاكرة بنجاح', 'success');
    
    window.location.reload();
  } catch (error) {
    console.error('❌ خطأ في الاستيراد:', error);
    this.showNotification('فشل الاستيراد', 'error');
  }

  event.target.value = '';
};

// 📢 إظهار إشعار
UIController.prototype.showNotification = function(message, type = 'info') {
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
};

// 💾 حفظ الحالة
UIController.prototype._saveState = async function() {
  const state = {
    isOpen: this.isOpen,
    isMuted: this.isMuted,
    messages: this.messages.slice(-10)
  };

  try {
    localStorage.setItem('ai_assistant_state', JSON.stringify(state));
  } catch (error) {
    console.warn('تعذر حفظ الحالة:', error);
  }
};

// 📥 تحميل الحالة المحفوظة
UIController.prototype._loadSavedState = async function() {
  try {
    const saved = localStorage.getItem('ai_assistant_state');
    if (saved) {
      const state = JSON.parse(saved);
      
      if (state.isMuted) {
        this.toggleMute();
      }
    }
  } catch (error) {
    console.warn('تعذر تحميل الحالة:', error);
  }
};

// 🧹 تنظيف
UIController.prototype.destroy = function() {
  if (this.voiceHandler) {
    this.voiceHandler.destroy();
  }

  if (this.typewriter) {
    this.typewriter.stop();
  }

  this._saveState();

  if (this.elements.floatingIcon) {
    this.elements.floatingIcon.remove();
  }
  if (this.elements.assistantPanel) {
    this.elements.assistantPanel.remove();
  }

  console.log('🧹 تم تنظيف الواجهة');
};

// تصدير الكلاس
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UIController;
}
