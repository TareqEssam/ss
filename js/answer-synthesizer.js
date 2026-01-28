/**
 * 🧠 محلل الإجابات الذكي
 * Answer Synthesizer - Smart Answer Extraction
 * 
 * يفهم السؤال، يحلل النتائج، ويستخرج الإجابة الدقيقة
 * 
 * @version 1.0.0
 * @date 2026-01-28
 */

class AnswerSynthesizer {
  constructor(normalizer) {
    this.normalizer = normalizer;
    
    // أنماط الأسئلة وكيفية الإجابة عليها
    this.questionPatterns = {
      // أسئلة "ما هي"
      whatIs: {
        patterns: [/^ما (هي|هو|هى)/i, /^ايه (هو|هي)/i, /^وش (هو|هي)/i],
        extractors: ['definition', 'description', 'overview']
      },
      
      // أسئلة عن التراخيص والإجراءات
      licenses: {
        patterns: [/ترخيص|رخص|تراخيص|إجازة/i, /إجراءات|خطوات|كيفية/i],
        extractors: ['requirements', 'procedures', 'authority', 'documents']
      },
      
      // أسئلة عن الشروط والمتطلبات
      requirements: {
        patterns: [/شروط|متطلبات|اشتراطات|مستندات|أوراق/i],
        extractors: ['requirements', 'conditions', 'documents', 'technical_notes']
      },
      
      // أسئلة عن الجهات
      authority: {
        patterns: [/جهة|جهات|مسؤول|مختص|وزارة|هيئة/i],
        extractors: ['authority', 'competent_authority', 'contact']
      },
      
      // أسئلة عن المواقع
      location: {
        patterns: [/موقع|مكان|أين|محافظة|منطقة|مدينة/i],
        extractors: ['location', 'governorate', 'area', 'coordinates']
      },
      
      // أسئلة عن الرسوم والتكاليف
      fees: {
        patterns: [/رسوم|تكلفة|سعر|مبلغ|كام|كم/i],
        extractors: ['fees', 'cost', 'price']
      },
      
      // أسئلة عن المدة الزمنية
      duration: {
        patterns: [/مدة|وقت|زمن|كم يوم|متى/i],
        extractors: ['duration', 'time', 'period']
      }
    };
  }

  /**
   * 🎯 تحليل السؤال واستخراج الإجابة الذكية
   */
  synthesizeAnswer(query, searchResults) {
    // 1. تحليل نوع السؤال
    const questionType = this._analyzeQuestionType(query);
    
    // 2. استخراج المعلومات المطلوبة فقط
    const relevantInfo = this._extractRelevantInfo(
      searchResults.results,
      questionType,
      query
    );
    
    // 3. تكوين إجابة مباشرة ومفيدة
    return this._constructAnswer(relevantInfo, questionType, query);
  }

  /**
   * 🔍 تحليل نوع السؤال
   */
  _analyzeQuestionType(query) {
    const normalized = this.normalizer.normalize(query.toLowerCase());
    
    const detected = {
      types: [],
      primary: null,
      focus: null
    };
    
    // فحص كل نمط
    for (const [type, config] of Object.entries(this.questionPatterns)) {
      for (const pattern of config.patterns) {
        if (pattern.test(normalized)) {
          detected.types.push(type);
          if (!detected.primary) {
            detected.primary = type;
          }
        }
      }
    }
    
    // إذا لم نجد نمط محدد، نعتبره سؤال عام
    if (detected.types.length === 0) {
      detected.primary = 'whatIs';
    }
    
    return detected;
  }

  /**
   * 📋 استخراج المعلومات ذات الصلة فقط
   */
  _extractRelevantInfo(results, questionType, query) {
    if (!results || results.length === 0) {
      return null;
    }
    
    const extractors = this.questionPatterns[questionType.primary]?.extractors || [];
    const extracted = {
      main: null,
      details: [],
      sources: []
    };
    
    // استخراج من أفضل نتيجة (الأعلى تشابهاً)
    const topResult = results[0];
    const data = topResult.original_data || topResult;
    
    // العنوان الرئيسي
    extracted.main = {
      title: data.name || data.value || data.title || 'النشاط',
      activity: data.name || data.value,
      similarity: (topResult.similarity * 100).toFixed(1)
    };
    
    // استخراج التفاصيل المطلوبة حسب نوع السؤال
    if (questionType.primary === 'licenses' || questionType.primary === 'requirements') {
      // ⭐ التركيز على التراخيص والمتطلبات
      extracted.details = this._extractLicenseInfo(data);
    } else if (questionType.primary === 'authority') {
      // ⭐ التركيز على الجهات
      extracted.details = this._extractAuthorityInfo(data);
    } else if (questionType.primary === 'location') {
      // ⭐ التركيز على الموقع
      extracted.details = this._extractLocationInfo(data);
    } else if (questionType.primary === 'fees') {
      // ⭐ التركيز على الرسوم
      extracted.details = this._extractFeesInfo(data);
    } else if (questionType.primary === 'duration') {
      // ⭐ التركيز على المدة
      extracted.details = this._extractDurationInfo(data);
    } else {
      // معلومات عامة
      extracted.details = this._extractGeneralInfo(data);
    }
    
    // إضافة نتائج إضافية إذا كانت مفيدة
    if (results.length > 1) {
      for (let i = 1; i < Math.min(3, results.length); i++) {
        const result = results[i];
        const resultData = result.original_data || result;
        
        if (questionType.primary === 'licenses') {
          const additionalInfo = this._extractLicenseInfo(resultData);
          if (additionalInfo.length > 0) {
            extracted.sources.push({
              name: resultData.name || resultData.value || `نتيجة ${i + 1}`,
              info: additionalInfo
            });
          }
        }
      }
    }
    
    return extracted;
  }

  /**
   * 🔑 استخراج معلومات التراخيص
   */
  _extractLicenseInfo(data) {
    const info = [];
    
    // المتطلبات
    if (data.requirements) {
      const req = this._cleanText(data.requirements);
      if (req) {
        info.push({
          type: 'requirements',
          label: 'المتطلبات',
          value: req,
          icon: '📋'
        });
      }
    }
    
    // الإجراءات
    if (data.procedures || data.steps) {
      const proc = this._cleanText(data.procedures || data.steps);
      if (proc) {
        info.push({
          type: 'procedures',
          label: 'الإجراءات',
          value: proc,
          icon: '📝'
        });
      }
    }
    
    // الجهة المختصة
    if (data.authority || data.competent_authority) {
      info.push({
        type: 'authority',
        label: 'الجهة المختصة',
        value: data.authority || data.competent_authority,
        icon: '🏛️'
      });
    }
    
    // المستندات
    if (data.documents) {
      const docs = this._cleanText(data.documents);
      if (docs) {
        info.push({
          type: 'documents',
          label: 'المستندات المطلوبة',
          value: docs,
          icon: '📄'
        });
      }
    }
    
    // الشروط
    if (data.conditions) {
      const cond = this._cleanText(data.conditions);
      if (cond) {
        info.push({
          type: 'conditions',
          label: 'الشروط',
          value: cond,
          icon: '✅'
        });
      }
    }
    
    // القانون
    if (data.law || data.legislation) {
      const law = this._cleanText(data.law || data.legislation);
      if (law) {
        info.push({
          type: 'law',
          label: 'الأساس القانوني',
          value: law,
          icon: '⚖️'
        });
      }
    }
    
    // الملاحظات الفنية
    if (data.technical_notes || data.notes) {
      const notes = this._cleanText(data.technical_notes || data.notes);
      if (notes) {
        info.push({
          type: 'notes',
          label: 'ملاحظات مهمة',
          value: notes,
          icon: '⚠️'
        });
      }
    }
    
    return info;
  }

  /**
   * 🏛️ استخراج معلومات الجهات
   */
  _extractAuthorityInfo(data) {
    const info = [];
    
    if (data.authority || data.competent_authority) {
      info.push({
        type: 'authority',
        label: 'الجهة المختصة',
        value: data.authority || data.competent_authority,
        icon: '🏛️'
      });
    }
    
    if (data.phone) {
      info.push({
        type: 'phone',
        label: 'الهاتف',
        value: data.phone,
        icon: '📞'
      });
    }
    
    if (data.email) {
      info.push({
        type: 'email',
        label: 'البريد الإلكتروني',
        value: data.email,
        icon: '📧'
      });
    }
    
    if (data.location || data.address) {
      info.push({
        type: 'location',
        label: 'العنوان',
        value: data.location || data.address,
        icon: '📍'
      });
    }
    
    return info;
  }

  /**
   * 📍 استخراج معلومات الموقع
   */
  _extractLocationInfo(data) {
    const info = [];
    
    if (data.governorate) {
      info.push({
        type: 'governorate',
        label: 'المحافظة',
        value: data.governorate,
        icon: '🗺️'
      });
    }
    
    if (data.location || data.city) {
      info.push({
        type: 'location',
        label: 'الموقع',
        value: data.location || data.city,
        icon: '📍'
      });
    }
    
    if (data.area) {
      info.push({
        type: 'area',
        label: 'المساحة',
        value: `${data.area} فدان`,
        icon: '📏'
      });
    }
    
    if (data.dependency) {
      info.push({
        type: 'dependency',
        label: 'التبعية',
        value: data.dependency,
        icon: '🏢'
      });
    }
    
    return info;
  }

  /**
   * 💰 استخراج معلومات الرسوم
   */
  _extractFeesInfo(data) {
    const info = [];
    
    if (data.fees || data.cost || data.price) {
      info.push({
        type: 'fees',
        label: 'الرسوم',
        value: data.fees || data.cost || data.price,
        icon: '💰'
      });
    }
    
    return info;
  }

  /**
   * ⏱️ استخراج معلومات المدة
   */
  _extractDurationInfo(data) {
    const info = [];
    
    if (data.duration || data.time || data.period) {
      info.push({
        type: 'duration',
        label: 'المدة الزمنية',
        value: data.duration || data.time || data.period,
        icon: '⏱️'
      });
    }
    
    return info;
  }

  /**
   * ℹ️ استخراج معلومات عامة
   */
  _extractGeneralInfo(data) {
    const info = [];
    
    // الوصف
    if (data.procedures || data.description) {
      const desc = this._cleanText(data.procedures || data.description);
      if (desc) {
        info.push({
          type: 'description',
          label: 'الوصف',
          value: desc,
          icon: 'ℹ️'
        });
      }
    }
    
    // باقي المعلومات
    const additional = this._extractLicenseInfo(data);
    info.push(...additional);
    
    return info;
  }

  /**
   * 🧹 تنظيف النص
   */
  _cleanText(text) {
    if (!text) return '';
    
    if (typeof text !== 'string') {
      text = JSON.stringify(text);
    }
    
    // إزالة الأسطر الزائدة
    text = text.replace(/\\n/g, '\n');
    text = text.trim();
    
    // إذا كان النص طويل جداً، نختصره
    if (text.length > 800) {
      text = text.substring(0, 800) + '...';
    }
    
    return text;
  }

  /**
   * ✍️ تكوين الإجابة النهائية
   */
  _constructAnswer(extracted, questionType, query) {
    if (!extracted || !extracted.details || extracted.details.length === 0) {
      return {
        text: 'عذراً، لم أتمكن من العثور على إجابة دقيقة لسؤالك في البيانات المتاحة.',
        html: '<p>❌ عذراً، لم أتمكن من العثور على إجابة دقيقة لسؤالك.</p>',
        type: 'not_found'
      };
    }
    
    let text = '';
    let html = '<div class="synthesized-answer" style="padding: 15px;">';
    
    // العنوان
    const activityName = extracted.main.title;
    
    if (questionType.primary === 'licenses' || questionType.primary === 'requirements') {
      // إجابة مباشرة عن التراخيص
      text = `بخصوص تراخيص "${activityName}":\n\n`;
      html += `<h3 style="color: #1e40af; margin-bottom: 15px;">📋 ${activityName}</h3>`;
    } else {
      text = `معلومات عن "${activityName}":\n\n`;
      html += `<h3 style="color: #1e40af; margin-bottom: 15px;">${activityName}</h3>`;
    }
    
    // التفاصيل
    extracted.details.forEach((detail, index) => {
      text += `${detail.icon} ${detail.label}:\n`;
      text += `${detail.value}\n\n`;
      
      html += `<div style="margin: 12px 0; padding: 12px; background: #f8f9fa; border-right: 3px solid #2563eb; border-radius: 6px;">`;
      html += `<div style="font-weight: bold; color: #1e40af; margin-bottom: 6px;">${detail.icon} ${detail.label}:</div>`;
      html += `<div style="color: #374151; line-height: 1.6; white-space: pre-wrap;">${this._formatHTML(detail.value)}</div>`;
      html += `</div>`;
    });
    
    // مصادر إضافية
    if (extracted.sources && extracted.sources.length > 0) {
      text += `\n📚 معلومات إضافية:\n\n`;
      html += `<h4 style="margin: 20px 0 10px 0; color: #64748b;">📚 معلومات إضافية:</h4>`;
      
      extracted.sources.forEach(source => {
        text += `• ${source.name}\n`;
        html += `<details style="margin: 10px 0; padding: 10px; background: #f1f5f9; border-radius: 6px;">`;
        html += `<summary style="cursor: pointer; font-weight: 500; color: #475569;">${source.name}</summary>`;
        html += `<div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #cbd5e1;">`;
        
        source.info.forEach(info => {
          html += `<p style="margin: 5px 0;"><strong>${info.icon} ${info.label}:</strong> ${this._formatHTML(info.value)}</p>`;
        });
        
        html += `</div></details>`;
      });
    }
    
    // التطابق
    html += `<div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 0.9em;">`;
    html += `🎯 دقة التطابق: <strong>${extracted.main.similarity}%</strong>`;
    html += `</div>`;
    
    html += '</div>';
    
    return {
      text,
      html,
      type: 'synthesized',
      questionType: questionType.primary
    };
  }

  /**
   * 🎨 تنسيق HTML
   */
  _formatHTML(text) {
    if (!text) return '';
    
    // تحويل الأسطر الجديدة إلى <br>
    text = text.replace(/\n/g, '<br>');
    
    // تحويل النقاط إلى قوائم
    if (text.includes('- ')) {
      const lines = text.split('<br>');
      let formatted = '';
      let inList = false;
      
      lines.forEach(line => {
        if (line.trim().startsWith('- ')) {
          if (!inList) {
            formatted += '<ul style="margin: 5px 0; padding-right: 20px;">';
            inList = true;
          }
          formatted += `<li style="margin: 3px 0;">${line.trim().substring(2)}</li>`;
        } else {
          if (inList) {
            formatted += '</ul>';
            inList = false;
          }
          if (line.trim()) {
            formatted += line + '<br>';
          }
        }
      });
      
      if (inList) {
        formatted += '</ul>';
      }
      
      return formatted;
    }
    
    return text;
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AnswerSynthesizer;
}

if (typeof window !== 'undefined') {
  window.AnswerSynthesizer = AnswerSynthesizer;
}
