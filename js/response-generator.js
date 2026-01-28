/**
 * 📝 مولد الردود الذكي - النسخة المُصلحة النهائية
 * Response Generator - FINAL FIXED VERSION
 * 
 * @version 1.1.0 - يعمل مع البيانات الفعلية
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
   * 📄 رد بسيط - مُحسّن
   */
  _generateSimpleResponse(response, query) {
    if (!response.results || response.results.length === 0) {
      return {
        text: 'لم أجد نتائج مطابقة لسؤالك.',
        html: '<p>❌ لم أجد نتائج مطابقة لسؤالك.</p>'
      };
    }

    let text = `وجدت ${response.results.length} نتيجة متعلقة بسؤالك:\n\n`;
    let html = `<div class="response-container" style="padding: 10px;">`;
    html += `<p style="font-size: 1.1em; font-weight: bold; margin-bottom: 15px;">🎯 وجدت ${response.results.length} نتيجة متعلقة بسؤالك:</p>`;

    // معالجة كل نتيجة
    response.results.forEach((result, index) => {
      // 🔥 استخراج البيانات بطريقة آمنة
      const data = this._extractData(result);
      const title = this._extractTitle(data);
      const similarity = (result.similarity * 100).toFixed(1);
      
      // النص العادي
      text += `${index + 1}. ${title}\n`;
      
      // التفاصيل
      const details = this._extractAllDetails(data);
      if (details.length > 0) {
        details.forEach(detail => {
          text += `   • ${detail}\n`;
        });
      }
      
      text += `   🎯 التطابق: ${similarity}%\n\n`;

      // HTML منسق
      html += `<div class="result-item" style="margin: 15px 0; padding: 15px; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-right: 4px solid #2563eb; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">`;
      html += `<h4 style="margin: 0 0 12px 0; color: #1e40af; font-size: 1.1em;">📌 ${title}</h4>`;
      
      if (details.length > 0) {
        html += `<ul style="margin: 8px 0; padding-right: 25px; line-height: 1.8;">`;
        details.forEach(detail => {
          html += `<li style="margin: 5px 0; color: #374151;">${detail}</li>`;
        });
        html += `</ul>`;
      }
      
      html += `<div style="margin-top: 12px; padding-top: 10px; border-top: 1px solid #cbd5e1;">`;
      html += `<span style="font-size: 0.95em; color: #64748b; font-weight: 500;">🎯 دقة التطابق: <strong style="color: #2563eb;">${similarity}%</strong></span>`;
      html += `</div>`;
      html += `</div>`;
    });

    html += `</div>`;

    return { text, html };
  }

  /**
   * 🔍 استخراج البيانات بطريقة آمنة
   */
  _extractData(result) {
    // محاولة الوصول للبيانات من مصادر متعددة
    return result.original_data || 
           result.data || 
           result || 
           {};
  }

  /**
   * 📝 استخراج العنوان
   */
  _extractTitle(data) {
    // محاولة الحصول على العنوان من عدة حقول
    return data.name || 
           data.value || 
           data.title || 
           data.activity_name ||
           data.enriched_text ||
           data.text_preview ||
           data.text ||
           'نتيجة البحث';
  }

  /**
   * 🔍 استخراج جميع التفاصيل
   */
  _extractAllDetails(data) {
    const details = [];
    
    // الجهة المختصة
    if (data.authority || data.competent_authority) {
      details.push(`الجهة المختصة: ${data.authority || data.competent_authority}`);
    }
    
    // المحافظة/الموقع
    if (data.governorate) {
      details.push(`المحافظة: ${data.governorate}`);
    }
    
    if (data.location || data.city) {
      details.push(`الموقع: ${data.location || data.city}`);
    }
    
    if (data.dependency) {
      details.push(`التبعية: ${data.dependency}`);
    }
    
    // المساحة (للمناطق الصناعية)
    if (data.area) {
      details.push(`المساحة: ${data.area} فدان`);
    }
    
    // المتطلبات والشروط
    if (data.requirements) {
      const req = typeof data.requirements === 'string' ? 
                  data.requirements : 
                  JSON.stringify(data.requirements);
      if (req.length < 200) {
        details.push(`المتطلبات: ${req}`);
      }
    }
    
    if (data.conditions) {
      const cond = typeof data.conditions === 'string' ? 
                   data.conditions : 
                   JSON.stringify(data.conditions);
      if (cond.length < 200) {
        details.push(`الشروط: ${cond}`);
      }
    }
    
    // الرسوم
    if (data.fees) {
      details.push(`الرسوم: ${data.fees}`);
    }
    
    // المدة
    if (data.duration) {
      details.push(`المدة: ${data.duration}`);
    }
    
    // القطاع (قرار 104)
    if (data.sector) {
      details.push(`القطاع: ${data.sector}`);
    }
    
    if (data.sector_type) {
      details.push(`نوع القطاع: ${data.sector_type}`);
    }
    
    // الحوافز
    if (data.incentives) {
      const inc = typeof data.incentives === 'string' ? 
                  data.incentives : 
                  JSON.stringify(data.incentives);
      if (inc.length < 300) {
        details.push(`الحوافز: ${inc}`);
      }
    }
    
    // معلومات الاتصال
    if (data.phone) {
      details.push(`هاتف: ${data.phone}`);
    }
    
    if (data.email) {
      details.push(`بريد: ${data.email}`);
    }
    
    // النص المختصر (إذا لم تكن هناك تفاصيل أخرى)
    if (details.length === 0) {
      if (data.text_preview && data.text_preview.length < 300) {
        details.push(data.text_preview);
      } else if (data.description && data.description.length < 300) {
        details.push(data.description);
      } else if (data.text && data.text.length < 300) {
        details.push(data.text);
      }
    }
    
    return details;
  }

  /**
   * 📊 رد إحصائي
   */
  _generateStatisticalResponse(response, query) {
    const analysis = response.analysis;
    
    let text = `وجدت ${analysis.total} نتيجة:\n\n`;
    let html = `<div class="response-container" style="padding: 10px;">`;
    html += `<p style="font-size: 1.1em; font-weight: bold;">📊 وجدت ${analysis.total} نتيجة إحصائية:</p>`;
    
    // التوزيع
    if (analysis.byDatabase) {
      html += `<div style="margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 8px;">`;
      html += `<h4 style="margin: 0 0 10px 0;">📈 التوزيع:</h4>`;
      html += `<ul style="list-style: none; padding: 0;">`;
      
      for (const [db, count] of Object.entries(analysis.byDatabase)) {
        if (count > 0) {
          const dbName = this._translateDbName(db);
          text += `${dbName}: ${count} نتيجة\n`;
          html += `<li style="margin: 5px 0; padding: 8px; background: white; border-radius: 5px;">
                     <strong>${dbName}:</strong> ${count} نتيجة
                   </li>`;
        }
      }
      
      html += `</ul></div>`;
    }
    
    // عينات من النتائج
    if (analysis.results && analysis.results.length > 0) {
      html += `<h4 style="margin: 15px 0 10px 0;">📋 أمثلة من النتائج:</h4>`;
      const samples = analysis.results.slice(0, 5);
      
      samples.forEach((result, index) => {
        const data = this._extractData(result);
        const name = this._extractTitle(data);
        html += `<p style="margin: 5px 0; padding: 8px; background: #f1f5f9; border-radius: 5px;">
                   ${index + 1}. ${name}
                 </p>`;
        text += `${index + 1}. ${name}\n`;
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
    let html = `<div class="response-container" style="padding: 10px;">`;
    html += `<h3 style="margin: 0 0 15px 0;">🔄 نتائج المقارنة:</h3>`;
    
    for (const [db, results] of Object.entries(response.results)) {
      if (results && results.length > 0) {
        const dbName = this._translateDbName(db);
        text += `${dbName}:\n`;
        html += `<div style="margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                   <h4 style="margin: 0 0 10px 0;">${dbName}:</h4>
                   <ul style="padding-right: 20px;">`;
        
        results.slice(0, 3).forEach(result => {
          const data = this._extractData(result);
          const name = this._extractTitle(data);
          text += `• ${name}\n`;
          html += `<li style="margin: 5px 0;">${name}</li>`;
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
