/**
 * 📝 مولد الردود الذكية
 * Response Generator
 * 
 * الهدف: تنسيق وتحسين الردود لتكون طبيعية واحترافية
 * 
 * @author AI Expert System
 * @version 2.0.0
 */

class ResponseGenerator {
  constructor() {
    // قوالب الردود
    this.templates = {
      greeting: [
        'مرحباً! كيف يمكنني مساعدتك؟',
        'أهلاً بك! أنا هنا للإجابة على أسئلتك.',
        'تحياتي! ما الذي تود الاستفسار عنه؟'
      ],
      
      notFound: [
        'عذراً، لم أجد معلومات كافية للإجابة على سؤالك.',
        'للأسف، لا توجد معلومات متاحة حول هذا الموضوع في قاعدة البيانات.',
        'لم أتمكن من العثور على إجابة دقيقة. هل يمكنك إعادة صياغة السؤال؟'
      ],
      
      clarification: [
        'هل يمكنك توضيح سؤالك أكثر؟',
        'لم أفهم تماماً، هل تقصد...',
        'السؤال غير واضح، هل يمكنك إعادة الصياغة؟'
      ],
      
      success: [
        'وجدت المعلومات التالية:',
        'بالتأكيد! إليك ما أعرفه:',
        'بناءً على البيانات المتاحة:'
      ]
    };

    // رموز تعبيرية للسياقات المختلفة
    this.contextEmojis = {
      legal: '📋',
      location: '📍',
      activity: '🏭',
      incentive: '🎁',
      statistical: '📊',
      technical: '🔧',
      authority: '🏛️',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      info: 'ℹ️',
      question: '❓',
      map: '🗺️'
    };
  }

  /**
   * 🎯 توليد رد كامل من نتائج البحث
   */
  generateResponse(searchResults, queryClassification, userQuery) {
    if (!searchResults || !searchResults.success) {
      return this._generateErrorResponse(searchResults);
    }

    let response = {
      text: '',
      html: '',
      hasLinks: false,
      links: [],
      suggestions: []
    };

    // بناءً على نوع الرد
    switch (searchResults.type) {
      case 'simple':
        response = this._generateSimpleResponse(searchResults, queryClassification);
        break;
      
      case 'statistical':
        response = this._generateStatisticalResponse(searchResults);
        break;
      
      case 'comparative':
        response = this._generateComparativeResponse(searchResults);
        break;
      
      case 'cross_reference':
        response = this._generateCrossReferenceResponse(searchResults);
        break;
      
      case 'learned':
        response = this._generateLearnedResponse(searchResults);
        break;
      
      default:
        response.text = searchResults.message || 'حدث خطأ غير متوقع';
    }

    // إضافة الاقتراحات
    response.suggestions = this._generateSuggestions(queryClassification, searchResults);

    return response;
  }

  /**
   * ✅ توليد رد بسيط
   */
  _generateSimpleResponse(results, classification) {
    const response = {
      text: '',
      html: '',
      hasLinks: false,
      links: [],
      suggestions: []
    };

    const data = results.data?.original_data;
    if (!data) {
      return this._generateErrorResponse();
    }

    // العنوان
    response.text = this._pickRandom(this.templates.success) + '\n\n';

    // المحتوى حسب نوع القاعدة
    if (results.data.database === 'industrial') {
      response.text += this._formatIndustrialResponse(data);
      
      // إضافة رابط الخريطة
      if (data.x && data.y) {
        const mapLink = `https://www.google.com/maps?q=${data.y},${data.x}`;
        response.links.push({
          type: 'map',
          url: mapLink,
          text: 'عرض الموقع على الخريطة'
        });
        response.hasLinks = true;
      }
    } else if (results.data.database === 'activity') {
      response.text += this._formatActivityResponse(data, classification);
    } else if (results.data.database === 'decision104') {
      response.text += this._formatDecision104Response(data);
    }

    // إضافة درجة الثقة إذا كانت منخفضة
    if (results.confidence && results.confidence < 0.6) {
      response.text += '\n\n⚠️ ملاحظة: درجة التطابق منخفضة. قد لا تكون هذه الإجابة دقيقة تماماً.';
    }

    // تحويل النص إلى HTML
    response.html = this._convertToHTML(response.text, response.links);

    return response;
  }

  /**
   * 📊 توليد رد إحصائي
   */
  _generateStatisticalResponse(results) {
    const response = {
      text: '',
      html: '',
      hasLinks: false,
      links: [],
      suggestions: []
    };

    const analysis = results.data;

    response.text = `${this.contextEmojis.statistical} **نتائج البحث الإحصائي:**\n\n`;

    // الإجمالي
    response.text += `📈 **الإجمالي:** ${analysis.total} نتيجة\n\n`;

    // حسب المحافظة
    if (analysis.byGovernorate && Object.keys(analysis.byGovernorate).length > 0) {
      response.text += `${this.contextEmojis.location} **التوزيع حسب المحافظة:**\n`;
      
      const sortedGov = Object.entries(analysis.byGovernorate)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
      
      sortedGov.forEach(([gov, count]) => {
        response.text += `  • ${gov}: ${count}\n`;
      });
      response.text += '\n';
    }

    // حسب الجهة
    if (analysis.byAuthority && Object.keys(analysis.byAuthority).length > 0) {
      response.text += `${this.contextEmojis.authority} **التوزيع حسب جهة الولاية:**\n`;
      
      Object.entries(analysis.byAuthority).forEach(([auth, count]) => {
        response.text += `  • ${auth}: ${count}\n`;
      });
      response.text += '\n';
    }

    // حسب النوع
    if (analysis.byType && Object.keys(analysis.byType).length > 0) {
      response.text += `${this.contextEmojis.incentive} **التوزيع حسب القطاع:**\n`;
      
      Object.entries(analysis.byType).forEach(([type, count]) => {
        response.text += `  • ${type}: ${count}\n`;
      });
      response.text += '\n';
    }

    response.html = this._convertToHTML(response.text);
    return response;
  }

  /**
   * 🆚 توليد رد مقارنة
   */
  _generateComparativeResponse(results) {
    const response = {
      text: '',
      html: '',
      hasLinks: false,
      links: [],
      suggestions: []
    };

    const comparisons = results.data?.comparisons || [];

    if (comparisons.length < 2) {
      response.text = 'عذراً، لم أتمكن من العثور على معلومات كافية للمقارنة.';
      response.html = this._convertToHTML(response.text);
      return response;
    }

    response.text = `${this.contextEmojis.info} **المقارنة:**\n\n`;

    comparisons.forEach((comp, index) => {
      response.text += `**${index + 1}. ${comp.entity}:**\n`;
      
      if (comp.type === 'location') {
        const data = comp.data;
        response.text += `  ${this.contextEmojis.location} المحافظة: ${data.governorate || 'غير متوفر'}\n`;
        response.text += `  ${this.contextEmojis.authority} التبعية: ${data.dependency || 'غير متوفر'}\n`;
        response.text += `  📏 المساحة: ${data.area ? data.area + ' فدان' : 'غير متوفر'}\n`;
        
        if (data.x && data.y) {
          const mapLink = `https://www.google.com/maps?q=${data.y},${data.x}`;
          response.links.push({
            type: 'map',
            url: mapLink,
            text: `خريطة ${comp.entity}`
          });
          response.hasLinks = true;
        }
      }
      
      response.text += '\n';
    });

    // إضافة الفروقات
    if (comparisons.length === 2 && comparisons[0].type === 'location') {
      const diff = this._compareLocationData(comparisons[0].data, comparisons[1].data);
      response.text += `📌 **الفروقات الرئيسية:**\n${diff}\n`;
    }

    response.html = this._convertToHTML(response.text, response.links);
    return response;
  }

  /**
   * 🔗 توليد رد متقاطع
   */
  _generateCrossReferenceResponse(results) {
    const response = {
      text: '',
      html: '',
      hasLinks: false,
      links: [],
      suggestions: []
    };

    const crossData = results.data;

    response.text = `${this.contextEmojis.success} **نتائج البحث المتقاطع:**\n\n`;

    // النشاط
    if (crossData.activity) {
      response.text += `${this.contextEmojis.activity} **النشاط:**\n`;
      const actData = crossData.activity.original_data;
      const preview = actData.text_preview || '';
      response.text += preview.substring(0, 300) + '...\n\n';
    }

    // الموقع
    if (crossData.location) {
      response.text += `${this.contextEmojis.location} **الموقع:**\n`;
      const locData = crossData.location.original_data;
      response.text += `  • المنطقة: ${locData.name || 'غير متوفر'}\n`;
      response.text += `  • المحافظة: ${locData.governorate || 'غير متوفر'}\n`;
      response.text += `  • التبعية: ${locData.dependency || 'غير متوفر'}\n\n`;
      
      if (locData.x && locData.y) {
        const mapLink = `https://www.google.com/maps?q=${locData.y},${locData.x}`;
        response.links.push({
          type: 'map',
          url: mapLink,
          text: 'عرض الموقع على الخريطة'
        });
        response.hasLinks = true;
      }
    }

    // الحوافز
    if (crossData.decision104 && crossData.decision104.length > 0) {
      response.text += `${this.contextEmojis.incentive} **الحوافز (القرار 104):**\n`;
      response.text += `  • تم العثور على ${crossData.decision104.length} حافز مرتبط\n`;
      
      const topIncentive = crossData.decision104[0];
      const preview = topIncentive.original_data.text_preview || '';
      const sector = preview.includes('sectorA') ? 'القطاع (أ)' : 'القطاع (ب)';
      response.text += `  • القطاع: ${sector}\n\n`;
    }

    // التوافق
    if (crossData.match) {
      response.text += `${this.contextEmojis.success} النشاط متوافق مع المنطقة المحددة.\n`;
    }

    response.html = this._convertToHTML(response.text, response.links);
    return response;
  }

  /**
   * 🧠 توليد رد من الذاكرة المتعلمة
   */
  _generateLearnedResponse(results) {
    const response = {
      text: `${this.contextEmojis.info} ${results.message}`,
      html: '',
      hasLinks: false,
      links: [],
      suggestions: []
    };

    response.text += `\n\n💡 (من الذاكرة المتعلمة - استخدمت ${results.usageCount} مرة)`;
    response.html = this._convertToHTML(response.text);
    
    return response;
  }

  /**
   * ❌ توليد رد خطأ
   */
  _generateErrorResponse(results) {
    const response = {
      text: '',
      html: '',
      hasLinks: false,
      links: [],
      suggestions: []
    };

    response.text = `${this.contextEmojis.error} `;
    
    if (results && results.message) {
      response.text += results.message;
    } else {
      response.text += this._pickRandom(this.templates.notFound);
    }

    // اقتراحات
    response.text += '\n\n💡 **اقتراحات:**\n';
    response.text += '  • حاول استخدام كلمات أكثر وضوحاً\n';
    response.text += '  • اذكر اسم المحافظة أو المنطقة إن كنت تسأل عن موقع\n';
    response.text += '  • حدد نوع النشاط بوضوح (صناعي، تجاري، سياحي)\n';

    response.html = this._convertToHTML(response.text);
    return response;
  }

  /**
   * 🏭 تنسيق رد النشاط
   */
  _formatActivityResponse(data, classification) {
    const preview = data.text_preview || '';
    let text = '';

    // استخراج معلومات النشاط
    const lines = preview.split('\n').filter(l => l.trim());
    
    if (lines.length > 0) {
      text += `${this.contextEmojis.activity} **النشاط:**\n${lines[0]}\n\n`;
    }

    // إذا كان السؤال قانوني
    if (classification?.primaryIntent === 'legal') {
      text += `${this.contextEmojis.legal} **التراخيص المطلوبة:**\n`;
      text += 'يتطلب هذا النشاط استخراج تراخيص من الجهات المختصة.\n\n';
    }

    // إذا كان السؤال فني
    if (classification?.primaryIntent === 'technical') {
      text += `${this.contextEmojis.technical} **الاشتراطات الفنية:**\n`;
      text += 'يخضع هذا النشاط لاشتراطات فنية محددة للسلامة والجودة.\n\n';
    }

    return text;
  }

  /**
   * 📍 تنسيق رد المنطقة الصناعية
   */
  _formatIndustrialResponse(data) {
    let text = '';

    text += `${this.contextEmojis.location} **المنطقة:** ${data.name || 'غير متوفر'}\n\n`;
    text += `**المعلومات الجغرافية:**\n`;
    text += `  • المحافظة: ${data.governorate || 'غير متوفر'}\n`;
    text += `  • التبعية: ${data.dependency || 'غير متوفر'}\n`;
    text += `  • المساحة: ${data.area ? data.area + ' فدان' : 'غير متوفر'}\n\n`;

    if (data.decision) {
      text += `${this.contextEmojis.legal} **السند القانوني:**\n${data.decision}\n\n`;
    }

    return text;
  }

  /**
   * 🎁 تنسيق رد القرار 104
   */
  _formatDecision104Response(data) {
    const preview = data.text_preview || '';
    let text = '';

    const sector = preview.includes('sectorA') ? 'القطاع (أ)' : 'القطاع (ب)';
    text += `${this.contextEmojis.incentive} **القطاع:** ${sector}\n\n`;

    text += `**الحوافز المتاحة:**\n`;
    if (sector === 'القطاع (أ)') {
      text += '  • إعفاء من ضريبة الدمغة\n';
      text += '  • إعفاء من رسوم التوثيق\n';
      text += '  • خصم 50% من تكلفة توصيل المرافق\n';
      text += '  • خصم 50% من سعر الأرض\n\n';
    } else {
      text += '  • إعفاء من ضريبة الدمغة\n';
      text += '  • إعفاء من رسوم التوثيق\n';
      text += '  • خصم 30% من تكلفة توصيل المرافق\n';
      text += '  • خصم 30% من سعر الأرض\n\n';
    }

    // وصف النشاط
    const parts = preview.split('|');
    if (parts.length > 2) {
      text += `**النشاط:**\n${parts[2].trim()}\n\n`;
    }

    return text;
  }

  /**
   * 🔍 مقارنة بيانات موقعين
   */
  _compareLocationData(loc1, loc2) {
    let diff = '';

    if (loc1.dependency !== loc2.dependency) {
      diff += `  • التبعية: ${loc1.dependency} ≠ ${loc2.dependency}\n`;
    }

    if (loc1.governorate !== loc2.governorate) {
      diff += `  • المحافظة: ${loc1.governorate} ≠ ${loc2.governorate}\n`;
    }

    if (loc1.area && loc2.area) {
      const areaDiff = Math.abs(loc1.area - loc2.area);
      diff += `  • فرق المساحة: ${areaDiff.toFixed(2)} فدان\n`;
    }

    return diff || '  • لا توجد فروقات جوهرية';
  }

  /**
   * 💡 توليد اقتراحات
   */
  _generateSuggestions(classification, results) {
    const suggestions = [];

    if (results.success && results.data) {
      // اقتراحات بناءً على النتيجة
      if (results.data.database === 'industrial') {
        suggestions.push('هل تريد معرفة الأنشطة المسموحة في هذه المنطقة؟');
        suggestions.push('هل تحتاج معلومات عن التراخيص المطلوبة؟');
      } else if (results.data.database === 'activity') {
        suggestions.push('هل تريد معرفة المناطق المتاحة لهذا النشاط؟');
        suggestions.push('هل تحتاج معلومات عن الحوافز المتاحة؟');
      } else if (results.data.database === 'decision104') {
        suggestions.push('هل تريد معرفة شروط الحصول على هذه الحوافز؟');
      }
    }

    return suggestions;
  }

  /**
   * 🎲 اختيار عشوائي من قائمة
   */
  _pickRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * 🔄 تحويل النص إلى HTML
   */
  _convertToHTML(text, links = []) {
    let html = text;

    // تحويل العناوين (نص بين **)
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // تحويل الأسطر الجديدة إلى <br>
    html = html.replace(/\n/g, '<br>');

    // إضافة الروابط
    if (links && links.length > 0) {
      html += '<br><br><div class="response-links">';
      links.forEach(link => {
        html += `<a href="${link.url}" target="_blank" class="response-link">${this.contextEmojis.map} ${link.text}</a>`;
      });
      html += '</div>';
    }

    return html;
  }
}

// تصدير الكلاس
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ResponseGenerator;
}