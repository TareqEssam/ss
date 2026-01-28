/**
 * 📝 مولد الردود الذكي - النسخة الذكية
 * Response Generator - SMART VERSION
 * 
 * يستخدم Answer Synthesizer لإجابات ذكية ومباشرة
 * 
 * @version 2.0.0 - Smart Answer Generation
 * @date 2026-01-28
 */

class ResponseGenerator {
  constructor() {
    // إنشاء المحلل الذكي
    this.synthesizer = null;
    this.smartMode = true; // تفعيل الوضع الذكي
  }

  /**
   * 🎯 توليد رد من النتائج
   */
  generateResponse(response, context, query) {
    if (!response || !response.success) {
      return this._generateErrorResponse(response);
    }

    // ⭐ الوضع الذكي: تحليل واستخراج الإجابة
    if (this.smartMode && response.results && response.results.length > 0) {
      // إنشاء المحلل إذا لم يكن موجوداً
      if (!this.synthesizer && window.ArabicNormalizer && window.AnswerSynthesizer) {
        const normalizer = new ArabicNormalizer();
        this.synthesizer = new AnswerSynthesizer(normalizer);
      }
      
      // استخدام المحلل الذكي
      if (this.synthesizer && query) {
        const smartAnswer = this.synthesizer.synthesizeAnswer(query, response);
        
        // إذا نجح التحليل، نستخدم الإجابة الذكية
        if (smartAnswer && smartAnswer.type !== 'not_found') {
          return smartAnswer;
        }
      }
    }
    
    // وضع الاحتياطي: العرض التقليدي
    const type = response.type || 'simple';
    
    switch (type) {
      case 'simple':
        return this._generateSimpleResponse(response, query);
      case 'statistical':
        return this._generateStatisticalResponse(response, query);
      case 'comparative':
        return this._generateComparativeResponse(response, query);
      case 'cross_reference':
        return this._generateCrossReferenceResponse(response, query);
      default:
        return this._generateSimpleResponse(response, query);
    }
  }

  /**
   * ❌ رد خطأ
   */
  _generateErrorResponse(response) {
    return {
      text: response?.message || 'عذراً، لم أتمكن من العثور على إجابة.',
      html: `<div style="padding: 15px;">
               <p style="color: #dc2626; font-weight: bold;">❌ ${response?.message || 'لم أتمكن من العثور على إجابة دقيقة.'}</p>
               <div style="margin-top: 15px; padding: 15px; background: #fef2f2; border-right: 3px solid #dc2626; border-radius: 8px;">
                 <p style="font-weight: bold; margin-bottom: 10px;">💡 اقتراحات للحصول على نتائج أفضل:</p>
                 <ul style="margin: 0; padding-right: 25px; line-height: 1.8;">
                   <li>استخدم كلمات أكثر وضوحاً ودقة</li>
                   <li>اذكر اسم النشاط بالتحديد (مثل: مطعم، مصنع، مزرعة)</li>
                   <li>حدد المحافظة أو المنطقة إن كان السؤال عن موقع</li>
                   <li>اسأل عن جزء محدد (مثل: التراخيص، الشروط، الجهة المختصة)</li>
                 </ul>
               </div>
             </div>`
    };
  }

  /**
   * 📄 رد بسيط - نسخة احتياطية
   */
  _generateSimpleResponse(response, query) {
    if (!response.results || response.results.length === 0) {
      return this._generateErrorResponse();
    }

    let text = `وجدت ${response.results.length} نتيجة:\n\n`;
    let html = `<div style="padding: 15px;">`;
    html += `<p style="font-size: 1.1em; font-weight: bold; margin-bottom: 15px;">📚 وجدت ${response.results.length} نتيجة:</p>`;

    response.results.forEach((result, index) => {
      const data = result.original_data || result;
      const title = data.name || data.value || data.title || `نتيجة ${index + 1}`;
      const similarity = (result.similarity * 100).toFixed(1);
      
      text += `${index + 1}. ${title} (${similarity}%)\n`;
      
      html += `<div style="margin: 10px 0; padding: 12px; background: #f8f9fa; border-right: 3px solid #2563eb; border-radius: 6px;">`;
      html += `<div style="font-weight: bold; color: #1e40af;">${index + 1}. ${title}</div>`;
      html += `<div style="margin-top: 5px; color: #64748b; font-size: 0.9em;">🎯 ${similarity}%</div>`;
      html += `</div>`;
    });

    html += `</div>`;
    return { text, html };
  }

  /**
   * 📊 رد إحصائي
   */
  _generateStatisticalResponse(response, query) {
    const analysis = response.analysis;
    
    let text = `وجدت ${analysis.total} نتيجة\n`;
    let html = `<div style="padding: 15px;">`;
    html += `<h3 style="color: #1e40af;">📊 وجدت ${analysis.total} نتيجة</h3>`;
    html += `</div>`;
    
    return { text, html };
  }

  /**
   * 🔄 رد مقارن
   */
  _generateComparativeResponse(response, query) {
    let text = 'نتائج المقارنة:\n';
    let html = `<div style="padding: 15px;"><h3>🔄 نتائج المقارنة</h3></div>`;
    return { text, html };
  }

  /**
   * 🔗 رد متقاطع
   */
  _generateCrossReferenceResponse(response, query) {
    return this._generateComparativeResponse(response, query);
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ResponseGenerator;
}

if (typeof window !== 'undefined') {
  window.ResponseGenerator = ResponseGenerator;
}
