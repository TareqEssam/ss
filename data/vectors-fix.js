/**
 * 🔧 إصلاح سريع لملفات المتجهات
 * Quick Fix for Vector Files
 * 
 * ضع هذا الملف في /data/ واستدعه بعد تحميل ملفات المتجهات
 * 
 * في index.html:
 * <script src="data/activity_vectors.js"></script>
 * <script src="data/decision104_vectors.js"></script>
 * <script src="data/industrial_vectors.js"></script>
 * <script src="data/vectors-fix.js"></script> <!-- أضف هذا السطر -->
 */

(function() {
  console.log('🔧 تشغيل إصلاح سريع لملفات المتجهات...');
  
  let fixed = 0;
  let errors = [];
  
  // ================================================================
  // إصلاح activity_vectors
  // ================================================================
  if (typeof activityVectorsData !== 'undefined') {
    try {
      window.activityVectors = {
        data: activityVectorsData.vectors || [],
        name: activityVectorsData.name || 'Activity Vectors',
        version: activityVectorsData.version || '3.1.0',
        dimension: activityVectorsData.dimension || 384,
        total_vectors: activityVectorsData.total_vectors || activityVectorsData.vectors?.length || 0
      };
      console.log('✅ تم إصلاح activityVectors:', window.activityVectors.data.length, 'متجه');
      fixed++;
    } catch (e) {
      errors.push('activity: ' + e.message);
      console.error('❌ خطأ في إصلاح activityVectors:', e);
    }
  } else if (typeof activityVectors === 'undefined') {
    errors.push('activity: المتغير غير موجود');
    console.warn('⚠️ activityVectorsData غير موجود');
  } else {
    console.log('✅ activityVectors موجود مسبقاً');
    fixed++;
  }
  
  // ================================================================
  // إصلاح decision104_vectors
  // ================================================================
  if (typeof decisionVectorsData !== 'undefined') {
    try {
      window.decision104Vectors = {
        data: decisionVectorsData.vectors || [],
        name: decisionVectorsData.name || 'Decision104 Vectors',
        version: decisionVectorsData.version || '3.1.0',
        dimension: decisionVectorsData.dimension || 384,
        total_vectors: decisionVectorsData.total_vectors || decisionVectorsData.vectors?.length || 0
      };
      console.log('✅ تم إصلاح decision104Vectors:', window.decision104Vectors.data.length, 'متجه');
      fixed++;
    } catch (e) {
      errors.push('decision104: ' + e.message);
      console.error('❌ خطأ في إصلاح decision104Vectors:', e);
    }
  } else if (typeof decision104Vectors === 'undefined') {
    errors.push('decision104: المتغير غير موجود');
    console.warn('⚠️ decisionVectorsData غير موجود');
  } else {
    console.log('✅ decision104Vectors موجود مسبقاً');
    fixed++;
  }
  
  // ================================================================
  // إصلاح industrial_vectors
  // ================================================================
  if (typeof industrialVectorsData !== 'undefined') {
    try {
      window.industrialVectors = {
        data: industrialVectorsData.vectors || [],
        name: industrialVectorsData.name || 'Industrial Vectors',
        version: industrialVectorsData.version || '3.1.0',
        dimension: industrialVectorsData.dimension || 384,
        total_vectors: industrialVectorsData.total_vectors || industrialVectorsData.vectors?.length || 0
      };
      console.log('✅ تم إصلاح industrialVectors:', window.industrialVectors.data.length, 'متجه');
      fixed++;
    } catch (e) {
      errors.push('industrial: ' + e.message);
      console.error('❌ خطأ في إصلاح industrialVectors:', e);
    }
  } else if (typeof industrialVectors === 'undefined') {
    errors.push('industrial: المتغير غير موجود');
    console.warn('⚠️ industrialVectorsData غير موجود');
  } else {
    console.log('✅ industrialVectors موجود مسبقاً');
    fixed++;
  }
  
  // ================================================================
  // النتيجة النهائية
  // ================================================================
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  
  if (fixed === 3 && errors.length === 0) {
    console.log('✅ ✅ ✅  تم إصلاح جميع ملفات المتجهات!  ✅ ✅ ✅');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log('📊 البيانات المتاحة:');
    console.log('   • activityVectors:', window.activityVectors?.data?.length || 0);
    console.log('   • decision104Vectors:', window.decision104Vectors?.data?.length || 0);
    console.log('   • industrialVectors:', window.industrialVectors?.data?.length || 0);
    console.log('');
    console.log('💡 يمكنك الآن إعادة تحميل الصفحة');
  } else {
    console.warn('⚠️  تم إصلاح ' + fixed + '/3 ملفات');
    console.log('═══════════════════════════════════════════════════════════');
    
    if (errors.length > 0) {
      console.log('');
      console.log('❌ الأخطاء:');
      errors.forEach(err => console.log('   • ' + err));
    }
    
    console.log('');
    console.log('💡 تأكد من:');
    console.log('   1. تحميل ملفات المتجهات قبل هذا السكريبت');
    console.log('   2. وجود الملفات في /data/');
    console.log('   3. عدم وجود أخطاء في ملفات المتجهات');
  }
  
  console.log('');
  
})();
