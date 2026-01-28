/**
 * 📝 مولد الردود الذكي
 * Response Generator
 * 
 * يحول النتائج الخام إلى ردود منسقة وجاهزة للعرض
 * 
 * @version 1.0.0
 * @date 2026-01-28
 */

class ResponseGenerator {
  constructor() {
    this.templates = {
      simple: this._generateSimpleResponse.bind(this),
      statistical: this._generateStatisticalResponse.bind(this),
      comparative: this._generateComparativeResponse.bind(this),
      cross_reference: this._generateCrossReferenceResponse.bind(this)
    };
  }

  /**
   * 🎯 توليد رد من النتائج
   */
  generateResponse(response, context, query) {
    if (!response || !response.success) {
      return {
        text: response?.message || 'عذراً، لم أتمكن من العثور على إجابة.',
        html: `<p>❌ ${response?.message || 'لم أتمكن من العثور على إجابة دقيقة.'}</p>
               <p>💡 <strong>اقتراحات:</strong></p>
               <ul>
                 <li>حاول استخدام كلمات أكثر وضوحاً</li>
                 <li>اذكر اسم المحافظة أو المنطقة إن كنت تسأل عن موقع</li>
                 <li>حدد نوع النشاط بوضوح (صناعي، تجاري، سياحي)</li>
               </ul>`
      };
    }

    const type = response.type || 'simple';
    const generator = this.templates[type] || this.templates.simple;
    
    return generator(response, query);
  }

  /**
   * 📄 رد بسيط
   */
  _generateSimpleResponse(response, query) {
    if (!response.results || response.results.length === 0) {
      return {
        text: 'لم أجد نتائج مطابقة لسؤالك.',
        html: '<p>❌ لم أجد نتائج مطابقة لسؤالك.</p>'
      };
    }

    const topResult = response.results[0];
    const data = topResult.original_data || topResult;
    
    // استخراج النص
    let text = '';
    let html = '';

    // العنوان
    const title = data.name || data.value || data.title || 'نتيجة البحث';
    const similarity = (topResult.similarity * 100).toFixed(1);

    text = `وجدت ${response.results.length} نتيجة متعلقة بسؤالك:\n\n`;
    html = `<div class="response-container">`;
    html += `<p><strong>🎯 وجدت ${response.results.length} نتيجة متعلقة بسؤالك:</strong></p>`;

    // النتائج
    response.results.forEach((result, index) => {
      const resultData = result.original_data || result;
      const resultTitle = resultData.name || resultData.value || resultData.title || `نتيجة ${index + 1}`;
      const resultSimilarity = (result.similarity * 100).toFixed(1);
      
      // النص
      text += `${index + 1}. ${resultTitle}\n`;
      
      // معلومات إضافية
      const details = this._extractDetails(resultData);
      if (details.length > 0) {
        text += `   ${details.join(' • ')}\n`;
      }
      text += '\n';

      // HTML
      html += `<div class="result-item" style="margin: 15px 0; padding: 15px; background: #f8f9fa; border-right: 4px solid #2563eb; border-radius: 8px;">`;
      html += `<h4 style="margin: 0 0 10px 0; color: #1e40af;">📌 ${resultTitle}</h4>`;
      
      if (details.length > 0) {
        html += `<ul style="margin: 5px 0; padding-right: 20px;">`;
        details.forEach(detail => {
          html += `<li style="margin: 3px 0;">${detail}</li>`;
        });
        html += `</ul>`;
      }
      
      html += `<p style="margin-top: 10px; font-size: 0.9em; color: #64748b;">🎯 التطابق: ${resultSimilarity}%</p>`;
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
    
    let text = `وجدت ${analysis.total} نتيجة:\n\n`;
    let html = `<div class="response-container">`;
    html += `<p><strong>📊 وجدت ${analysis.total} نتيجة إحصائية:</strong></p>`;
    
    // التوزيع حسب القاعدة
    html += `<div style="margin: 15px 0;">`;
    html += `<h4>📈 التوزيع:</h4>`;
    html += `<ul>`;
    
    for (const [db, count] of Object.entries(analysis.byDatabase)) {
      if (count > 0) {
        const dbName = this._translateDbName(db);
        text += `${dbName}: ${count} نتيجة\n`;
        html += `<li><strong>${dbName}:</strong> ${count} نتيجة</li>`;
      }
    }
    
    html += `</ul></div>`;
    
    // عرض بعض النتائج
    if (analysis.results && analysis.results.length > 0) {
      html += `<h4>📋 أمثلة من النتائج:</h4>`;
      const samples = analysis.results.slice(0, 5);
      
      samples.forEach((result, index) => {
        const data = result.original_data || result;
        const name = data.name || data.value || data.title || `نتيجة ${index + 1}`;
        html += `<p style="margin: 5px 0;">• ${name}</p>`;
        text += `• ${name}\n`;
      });
    }
    
    html += `</div>`;
    
    return { text, html };
  }

  /**
   * 🔄 رد مقارن
   */
  _generateComparativeResponse(response, query) {
    let text = 'نتائج المقارنة:\n\n';
    let html = `<div class="response-container">`;
    html += `<h3>🔄 نتائج المقارنة:</h3>`;
    
    for (const [db, results] of Object.entries(response.results)) {
      if (results && results.length > 0) {
        const dbName = this._translateDbName(db);
        text += `${dbName}:\n`;
        html += `<div style="margin: 15px 0;"><h4>${dbName}:</h4><ul>`;
        
        results.slice(0, 3).forEach(result => {
          const data = result.original_data || result;
          const name = data.name || data.value || data.title || 'نتيجة';
          text += `• ${name}\n`;
          html += `<li>${name}</li>`;
        });
        
        html += `</ul></div>`;
        text += '\n';
      }
    }
    
    html += `</div>`;
    
    return { text, html };
  }

  /**
   * 🔗 رد متقاطع
   */
  _generateCrossReferenceResponse(response, query) {
    return this._generateComparativeResponse(response, query);
  }

  /**
   * 🔍 استخراج التفاصيل من البيانات
   */
  _extractDetails(data) {
    const details = [];
    
    // الجهة المختصة
    if (data.authority || data.competent_authority) {
      details.push(`الجهة: ${data.authority || data.competent_authority}`);
    }
    
    // الموقع
    if (data.governorate) {
      details.push(`المحافظة: ${data.governorate}`);
    }
    
    if (data.location || data.city) {
      details.push(`الموقع: ${data.location || data.city}`);
    }
    
    // المعلومات الإضافية
    if (data.requirements) {
      details.push(`المتطلبات: ${data.requirements}`);
    }
    
    if (data.conditions) {
      details.push(`الشروط: ${data.conditions}`);
    }
    
    // النص المختصر
    if (data.text_preview && data.text_preview.length < 200) {
      details.push(data.text_preview);
    } else if (data.description && data.description.length < 200) {
      details.push(data.description);
    }
    
    return details;
  }

  /**
   * 🌐 ترجمة اسم القاعدة
   */
  _translateDbName(dbName) {
    const translations = {
      'activity': 'الأنشطة',
      'decision104': 'قرار 104 (الحوافز)',
      'industrial': 'المناطق الصناعية'
    };
    
    return translations[dbName] || dbName;
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ResponseGenerator;
}

if (typeof window !== 'undefined') {
  window.ResponseGenerator = ResponseGenerator;
}
