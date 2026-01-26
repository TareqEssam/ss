/**
 * 🔥 إضافة لـ ai-expert-core.js
 * معالج الأسئلة المركبة والمعقدة
 * 
 * استبدل الدوال التالية في الملف الأصلي:
 * - _handleStatisticalQuery
 * - _handleComparativeQuery
 * - _handleCrossReferenceQuery
 * - _handleSimpleQuery
 */

/**
 * 📊 معالجة السؤال الإحصائي - نسخة محسّنة
 */
async _handleStatisticalQuery(query, classification) {
  console.log('📊 معالجة سؤال إحصائي...');

  const results = await this.vectorEngine.parallelSearch(query, {
    topK: 200, // نحتاج كل البيانات للإحصائيات
    databases: classification.suggestedDatabases,
    queryType: 'statistical',
    minSimilarity: 0.20 // مرونة للإحصائيات
  });

  // تحليل النتائج
  const analysis = this._analyzeStatisticalResults(results, query, classification);

  // إذا لم نجد شيء
  if (analysis.total === 0) {
    return {
      success: false,
      message: this._generateIntelligentError(query, classification, 'statistical'),
      suggestion: this._generateSmartSuggestions(query, classification)
    };
  }

  return {
    success: true,
    type: 'statistical',
    message: this._formatStatisticalAnswer(analysis, query),
    data: analysis,
    sources: this._extractSources(results)
  };
}

/**
 * 🆚 معالجة السؤال المقارن - نسخة محسّنة
 */
async _handleComparativeQuery(query, classification) {
  console.log('🆚 معالجة سؤال مقارنة...');

  const entities = classification.entities;
  const comparisons = [];

  // مقارنة بين مواقع
  if (entities.locations && entities.locations.length >= 2) {
    for (const location of entities.locations.slice(0, 3)) {
      const results = await this.vectorEngine.semanticSearch(
        location,
        'industrial',
        1,
        { queryType: 'comparative' }
      );
      
      if (results.length > 0 && results[0].similarity > 0.35) {
        comparisons.push({
          entity: location,
          data: results[0].original_data,
          type: 'location',
          confidence: results[0].similarity
        });
      }
    }
  }

  // مقارنة بين أنشطة
  if (entities.activities && entities.activities.length >= 2) {
    for (const activity of entities.activities.slice(0, 3)) {
      const results = await this.vectorEngine.semanticSearch(
        activity,
        'activity',
        1,
        { queryType: 'comparative' }
      );
      
      if (results.length > 0 && results[0].similarity > 0.35) {
        comparisons.push({
          entity: activity,
          data: results[0].original_data,
          type: 'activity',
          confidence: results[0].similarity
        });
      }
    }
  }

  if (comparisons.length < 2) {
    return {
      success: false,
      message: this._generateIntelligentError(query, classification, 'comparative'),
      suggestion: 'يرجى تحديد عنصرين على الأقل للمقارنة بينهما.'
    };
  }

  return {
    success: true,
    type: 'comparative',
    message: this._formatComparativeAnswer(comparisons),
    data: { comparisons },
    sources: comparisons.map(c => ({ 
      type: c.type, 
      entity: c.entity,
      confidence: c.confidence
    }))
  };
}

/**
 * 🔗 معالجة السؤال المتقاطع - نسخة محسّنة
 */
async _handleCrossReferenceQuery(subQueries, classification) {
  console.log('🔗 معالجة سؤال متقاطع...');

  const crossResults = {
    activity: null,
    location: null,
    decision104: null,
    match: false,
    confidence: 0
  };

  // البحث عن النشاط
  if (subQueries.activity) {
    const activityResults = await this.vectorEngine.semanticSearch(
      subQueries.activity,
      'activity',
      3,
      { queryType: 'complex' }
    );
    
    if (activityResults.length > 0 && activityResults[0].similarity > 0.30) {
      crossResults.activity = activityResults[0];
      crossResults.confidence += activityResults[0].similarity * 0.4;
    }
  }

  // البحث عن الموقع
  if (subQueries.location) {
    const locationResults = await this.vectorEngine.semanticSearch(
      subQueries.location,
      'industrial',
      3,
      { queryType: 'complex' }
    );
    
    if (locationResults.length > 0 && locationResults[0].similarity > 0.30) {
      crossResults.location = locationResults[0];
      crossResults.confidence += locationResults[0].similarity * 0.3;
    }
  }

  // البحث في القرار 104
  if (crossResults.activity || subQueries.decision104) {
    const searchQuery = crossResults.activity 
      ? crossResults.activity.original_data.text_preview || subQueries.decision104
      : subQueries.decision104;
      
    const decision104Results = await this.vectorEngine.semanticSearch(
      searchQuery,
      'decision104',
      5,
      { queryType: 'complex' }
    );
    
    if (decision104Results.length > 0 && decision104Results[0].similarity > 0.25) {
      crossResults.decision104 = decision104Results;
      crossResults.confidence += decision104Results[0].similarity * 0.3;
    }
  }

  // التحقق من التطابق
  const foundComponents = [
    crossResults.activity,
    crossResults.location,
    crossResults.decision104
  ].filter(Boolean).length;

  crossResults.match = foundComponents >= 2;

  if (!crossResults.match) {
    return {
      success: false,
      message: this._generateIntelligentError(query, classification, 'cross_reference'),
      partialData: crossResults,
      suggestion: this._generateCrossReferenceHelp(crossResults)
    };
  }

  return {
    success: true,
    type: 'cross_reference',
    message: this._formatCrossReferenceAnswer(crossResults),
    data: crossResults,
    confidence: crossResults.confidence,
    sources: this._extractCrossReferenceSources(crossResults)
  };
}

/**
 * ✅ معالجة السؤال البسيط - نسخة محسّنة
 */
async _handleSimpleQuery(query, classification) {
  console.log('✅ معالجة سؤال بسيط...');

  const results = await this.vectorEngine.parallelSearch(query, {
    topK: 5,
    databases: classification.suggestedDatabases,
    queryType: 'simple'
  });

  // جمع كل النتائج
  const allResults = [
    ...(results.activity || []),
    ...(results.decision104 || []),
    ...(results.industrial || [])
  ];

  allResults.sort((a, b) => b.similarity - a.similarity);

  const bestResult = allResults[0];

  // إذا لم نجد شيء أو التطابق ضعيف جداً
  if (!bestResult || bestResult.similarity < 0.30) {
    return {
      success: false,
      message: this._generateIntelligentError(query, classification, 'simple'),
      suggestion: this._generateSmartSuggestions(query, classification),
      partialResults: allResults.slice(0, 3).filter(r => r.similarity > 0.20)
    };
  }

  return {
    success: true,
    type: 'simple',
    message: this._formatSimpleAnswer(bestResult, classification),
    data: bestResult,
    confidence: bestResult.similarity,
    sources: [{ 
      database: bestResult.database, 
      id: bestResult.id,
      similarity: bestResult.similarity 
    }]
  };
}

/**
 * 🧠 توليد رسالة خطأ ذكية (بدلاً من "عذراً لم أجد")
 */
_generateIntelligentError(query, classification, queryType) {
  const messages = {
    statistical: `لم أتمكن من العثور على بيانات إحصائية كافية حول "${query}".`,
    comparative: `لم أستطع إجراء المقارنة المطلوبة في "${query}".`,
    cross_reference: `لم أجد تطابقاً كاملاً لجميع عناصر سؤالك "${query}".`,
    simple: `لم أجد معلومات دقيقة كافية للإجابة على "${query}".`
  };

  let message = messages[queryType] || messages.simple;

  // إضافة معلومات عن التصنيف
  if (classification.suggestedDatabases.length > 0) {
    message += `\n\nلقد بحثت في: ${classification.suggestedDatabases.join('، ')}.`;
  }

  return message;
}

/**
 * 💡 توليد اقتراحات ذكية
 */
_generateSmartSuggestions(query, classification) {
  const suggestions = [];

  // اقتراحات حسب النية
  if (classification.primaryIntent === 'legal') {
    suggestions.push('• جرّب السؤال عن نشاط محدد، مثل: "ما تراخيص فتح فندق؟"');
  }

  if (classification.primaryIntent === 'geographic') {
    suggestions.push('• اذكر اسم المنطقة أو المحافظة بوضوح');
    suggestions.push('• مثال: "أين توجد المناطق الصناعية في القاهرة؟"');
  }

  if (classification.primaryIntent === 'incentive') {
    suggestions.push('• جرّب السؤال: "ما حوافز القرار 104 للقطاع أ؟"');
  }

  // اقتراحات عامة
  if (suggestions.length === 0) {
    suggestions.push('• استخدم كلمات أكثر وضوحاً ودقة');
    suggestions.push('• اذكر نوع النشاط أو المنطقة بالتحديد');
    suggestions.push('• جرّب إعادة صياغة السؤال بطريقة مختلفة');
  }

  return suggestions.join('\n');
}

/**
 * 🔍 مساعدة للأسئلة المتقاطعة
 */
_generateCrossReferenceHelp(partialResults) {
  const found = [];
  const missing = [];

  if (partialResults.activity) {
    found.push('✅ النشاط');
  } else {
    missing.push('❌ النشاط');
  }

  if (partialResults.location) {
    found.push('✅ الموقع');
  } else {
    missing.push('❌ الموقع');
  }

  if (partialResults.decision104) {
    found.push('✅ الحوافز');
  } else {
    missing.push('❌ الحوافز');
  }

  let help = `\n\n**ما وجدته:**\n${found.join('\n')}`;
  help += `\n\n**ما لم أجده:**\n${missing.join('\n')}`;
  help += '\n\nيرجى إعادة صياغة السؤال مع التركيز على العناصر المفقودة.';

  return help;
}

/**
 * 📊 تحليل النتائج الإحصائية - نسخة محسّنة
 */
_analyzeStatisticalResults(results, query, classification) {
  const analysis = {
    total: 0,
    byGovernorate: {},
    byAuthority: {},
    byType: {},
    bySector: {},
    topResults: [],
    databases: {}
  };

  // تحليل المناطق الصناعية
  if (results.industrial && results.industrial.length > 0) {
    analysis.databases.industrial = results.industrial.length;
    
    results.industrial.forEach(record => {
      const data = record.original_data;
      
      if (data.governorate) {
        analysis.byGovernorate[data.governorate] = 
          (analysis.byGovernorate[data.governorate] || 0) + 1;
      }

      if (data.dependency) {
        analysis.byAuthority[data.dependency] = 
          (analysis.byAuthority[data.dependency] || 0) + 1;
      }

      analysis.total++;
    });

    analysis.topResults = results.industrial
      .filter(r => r.similarity > 0.25)
      .slice(0, 10)
      .map(r => ({
        ...r.original_data,
        confidence: r.similarity
      }));
  }

  // تحليل الأنشطة
  if (results.activity && results.activity.length > 0) {
    analysis.databases.activity = results.activity.length;
    analysis.total += results.activity.filter(r => r.similarity > 0.30).length;
  }

  // تحليل القرار 104
  if (results.decision104 && results.decision104.length > 0) {
    analysis.databases.decision104 = results.decision104.length;
    
    results.decision104.forEach(record => {
      const preview = record.original_data.text_preview || '';
      
      if (preview.includes('sectorA') || preview.includes('القطاع أ')) {
        analysis.bySector['قطاع أ'] = (analysis.bySector['قطاع أ'] || 0) + 1;
      } else if (preview.includes('sectorB') || preview.includes('القطاع ب')) {
        analysis.bySector['قطاع ب'] = (analysis.bySector['قطاع ب'] || 0) + 1;
      }
    });

    analysis.total += results.decision104.filter(r => r.similarity > 0.25).length;
  }

  return analysis;
}

/**
 * 📝 تنسيق الإجابة الإحصائية - نسخة محسّنة
 */
_formatStatisticalAnswer(analysis, query) {
  let answer = `بناءً على البحث في قواعد البيانات:\n\n`;

  answer += `📊 **الإجمالي: ${analysis.total}**\n\n`;

  // التوزيع الجغرافي
  if (Object.keys(analysis.byGovernorate).length > 0) {
    answer += `🗺️ **التوزيع الجغرافي:**\n`;
    const sorted = Object.entries(analysis.byGovernorate)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    sorted.forEach(([gov, count]) => {
      answer += `   • ${gov}: ${count}\n`;
    });
    answer += `\n`;
  }

  // جهات الولاية
  if (Object.keys(analysis.byAuthority).length > 0) {
    answer += `🏛️ **جهات الولاية:**\n`;
    Object.entries(analysis.byAuthority)
      .sort((a, b) => b[1] - a[1])
      .forEach(([auth, count]) => {
        answer += `   • ${auth}: ${count}\n`;
      });
    answer += `\n`;
  }

  // القطاعات
  if (Object.keys(analysis.bySector).length > 0) {
    answer += `📋 **التوزيع حسب القطاع:**\n`;
    Object.entries(analysis.bySector).forEach(([sector, count]) => {
      answer += `   • ${sector}: ${count}\n`;
    });
    answer += `\n`;
  }

  // أمثلة
  if (analysis.topResults.length > 0) {
    answer += `💼 **أمثلة:**\n`;
    analysis.topResults.slice(0, 3).forEach((item, idx) => {
      const name = item.name || item.text || 'غير محدد';
      answer += `   ${idx + 1}. ${name.substring(0, 80)}...\n`;
    });
  }

  return answer;
}

// استبدل باقي الدوال في الملف الأصلي بهذه النسخ
