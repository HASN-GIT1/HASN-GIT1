import { AssessmentResult, Student, Project, InterventionPlan, Passage } from "../types";

// Helper to translate statuses
const getStatusLabel = (status: string) => {
  switch (status) {
    case "correct": return "سليم ✅";
    case "incorrect": return "خطأ تشكيل ❌";
    case "skipped": return "متروك / متخطى ⚠️";
    case "mispronounced": return "لحن لغوي / نطق غير دقيق 🔊";
    default: return status;
  }
};

const getStatusColorClass = (status: string) => {
  switch (status) {
    case "correct": return "color: #10b981; font-weight: bold;";
    case "incorrect": return "color: #ef4444; font-weight: bold;";
    case "skipped": return "color: #f59e0b; font-weight: bold;";
    case "mispronounced": return "color: #3b82f6; font-weight: bold;";
    default: return "";
  }
};

// Beautiful Arabic assessment session dynamic printable report
export const printAssessmentReport = (
  assessment: AssessmentResult,
  student: Student,
  project: Project | undefined,
  passage: Passage | undefined
) => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("الرجاء السماح للنوافذ المنبثقة لتتمكن من طباعة وتصدير ملف التقرير كـ PDF.");
    return;
  }

  // Generate word breakdown list
  const wordsHtml = assessment.wordsAnalyzed.map((w, index) => {
    return `
      <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 12px; text-align: center; background-color: #f8fafc;">
        <div style="font-size: 16px; font-weight: bold; color: #1e293b; margin-bottom: 4px;">${w.word}</div>
        <div style="font-size: 11px; ${getStatusColorClass(w.status)}">${getStatusLabel(w.status)}</div>
        ${w.feedback ? `<div style="font-size: 10px; color: #64748b; margin-top: 4px; border-t: 1px dashed #cbd5e1; padding-top: 4px;">${w.feedback}</div>` : ""}
      </div>
    `;
  }).join("");

  // Generate pronunciation errors list
  const errorsHtml = assessment.pronunciationErrors && assessment.pronunciationErrors.length > 0
    ? assessment.pronunciationErrors.map((e, idx) => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px; font-weight: bold; color: #ef4444;">${idx + 1}</td>
          <td style="padding: 10px; font-weight: bold; color: #1e293b;">${e.example}</td>
          <td style="padding: 10px; color: #475569;">${e.errorType}</td>
          <td style="padding: 10px; color: #059669; font-style: italic;">${e.remediation}</td>
        </tr>
      `).join("")
    : `<tr><td colspan="4" style="padding: 20px; text-align: center; color: #10b981; font-weight: bold;">أداء قرائي متميز، لا توجد أخطاء مشخصة أو هفوات في مخارج الحروف الشائعة!</td></tr>`;

  const dateFormatted = new Date(assessment.date).toLocaleDateString("ar-EG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  const languageLabel = student.languageClassification === 'B' 
    ? "الفئة B (العربية لغة ثانية)" 
    : "الفئة A (العربية لغة أولى)";

  const content = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <title>تقرير جلسة قياس طلاقة قرائية - ${student.name}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap');
        body {
          font-family: 'Cairo', 'Inter', sans-serif;
          margin: 40px;
          color: #1e293b;
          line-height: 1.6;
          background-color: #ffffff;
        }
        .header-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
          border-bottom: 3px double #4f46e5;
          padding-bottom: 20px;
        }
        .text-center { text-align: center; }
        .text-left { text-align: left; }
        .text-right { text-align: right; }
        .badge {
          background-color: #f1f5f9;
          border: 1.5px solid #cbd5e1;
          border-radius: 8px;
          padding: 4px 10px;
          font-size: 11px;
          font-weight: bold;
          display: inline-block;
        }
        .badge-ai {
          background-color: #ecfdf5;
          color: #047857;
          border-color: #a7f3d0;
        }
        .badge-manual {
          background-color: #eef2ff;
          color: #3730a3;
          border-color: #c7d2fe;
        }
        .title {
          font-size: 26px;
          font-weight: 800;
          color: #1e1b4b;
          margin-bottom: 15px;
          text-align: center;
        }
        .subtitle {
          font-size: 14px;
          color: #64748b;
          text-align: center;
          margin-bottom: 30px;
        }
        .card {
          border: 2px solid #e2e8f0;
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 25px;
          background-color: #ffffff;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
        }
        .card h2 {
          color: #1e1b4b;
          font-size: 18px;
          font-weight: 700;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 10px;
          margin-top: 0;
          margin-bottom: 15px;
        }
        .grid-info {
          display: grid;
          grid-template-cols: 1fr 1fr;
          gap: 15px;
        }
        .info-field {
          font-size: 13px;
          color: #475569;
        }
        .info-field strong {
          color: #0f172a;
        }
        .metric-box {
          text-align: center;
          padding: 15px;
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
        }
        .metric-value {
          font-size: 24px;
          font-weight: 800;
          color: #4f46e5;
          margin-top: 5px;
        }
        .metric-grid {
          display: grid;
          grid-template-cols: 1fr 1fr 1fr;
          gap: 15px;
          margin-top: 15px;
        }
        .table-data {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
        }
        .table-data th {
          background-color: #f1f5f9;
          color: #475569;
          padding: 12px;
          font-weight: 700;
          font-size: 13px;
          border-bottom: 2px solid #cbd5e1;
        }
        .table-data td {
          padding: 12px;
          font-size: 13px;
          border-bottom: 1px solid #e2e8f0;
        }
        .words-grid {
          display: grid;
          grid-template-cols: repeat(auto-fill, minmax(130px, 1fr));
          gap: 10px;
          margin-top: 10px;
        }
        .footer-signatures {
          margin-top: 50px;
          display: grid;
          grid-template-cols: 1fr 1fr;
          gap: 40px;
          text-align: center;
          font-size: 13px;
        }
        .signature-line {
          margin-top: 50px;
          border-top: 1px solid #94a3b8;
          width: 200px;
          margin-left: auto;
          margin-right: auto;
        }
        @media print {
          body {
            margin: 20px;
            font-size: 12px;
          }
          .title { font-size: 22px; }
          .card { page-break-inside: avoid; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div style="text-align: left;" class="no-print">
        <button onclick="window.print()" style="background-color: #4f46e5; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; font-family: 'Cairo', sans-serif; font-size: 14px;">📄 طباعة أو حفظ بتنسيق PDF</button>
      </div>

      <table class="header-table">
        <tr>
          <td style="width: 30%;" class="text-right">
            <h4 style="margin: 0; color: #4f46e5;">وزارة التعليم العالي والبحث</h4>
            <p style="margin: 3px 0 0 0; font-size: 11px; color: #64748b;">المشروع الوطني للطلاقة والقرائية اللفظية</p>
          </td>
          <td style="width: 40%;" class="text-center">
            <h2 style="margin: 0; font-weight: 800; color: #1e1b4b; background-color: #f1f5f9; padding: 8px 15px; border-radius: 30px; display: inline-block;">قرابة وعروبة اللسان اللساني</h2>
          </td>
          <td style="width: 30%;" class="text-left">
            <p style="margin: 0; font-size: 11px; color: #64748b;">رقم التقرير: ${assessment.id}</p>
            <p style="margin: 3px 0 0 0; font-size: 11px; color: #64748b;">تاريخ التوليد: ${new Date().toLocaleDateString("ar-EG")}</p>
          </td>
        </tr>
      </table>

      <div class="title">تقرير جلسة فحص وتشخيص الطلاقة اللغوية</div>
      <div class="subtitle">تم قياس مهارات النطق، السرعة القرائية، الفهم القرائي كمعيار جودة معتمد</div>

      <!-- Section: Student Information -->
      <div class="card">
        <h2>أولاً: بيانات المستجوب المعتمدة</h2>
        <div class="grid-info">
          <div>
            <div class="info-field" style="margin-bottom: 8px;">اسم الطالب الكامل: <strong>${student.name}</strong></div>
            <div class="info-field" style="margin-bottom: 8px;">التصنيف واللغة: <span class="badge" style="background-color: #f0fdf4; color: #166534; border-color: #bbf7d0; font-weight: 800;">${languageLabel}</span></div>
            <div class="info-field">الصف والسن: <strong>الصف ${student.grade} الابتدائي — (${student.age} سنة)</strong></div>
          </div>
          <div>
            <div class="info-field" style="margin-bottom: 8px;">جهة الانتساب والمراسلات: <strong>${project?.school || "غير متوفر"}</strong></div>
            <div class="info-field" style="margin-bottom: 8px;">الباحث / الإخصائي المتابع: <strong>${project?.researcherName || "أخصائي التدقيق اللغوي"}</strong></div>
            <div class="info-field">تاريخ وتوقيت الجلسة: <strong>${dateFormatted}</strong></div>
          </div>
        </div>
      </div>

      <!-- Section: Evaluation Results Metrics -->
      <div class="card">
        <h2>ثانياً: مؤشرات اللسان القياسية ومخرجات الجلسة</h2>
        <div class="metric-grid">
          <div class="metric-box">
            <div style="font-size: 11px; font-weight: bold; color: #64748b;">سرعة القراءة</div>
            <div class="metric-value">${assessment.wordsPerMinute} <span style="font-size: 12px; font-weight: normal; color: #64748b;">كلمة/دقيقة</span></div>
            <div style="font-size: 10px; color: #475569; margin-top: 5px;">المعدل المقبول لصفّه: ${student.grade === 1 ? "15" : student.grade === 2 ? "30" : "50"} ك/د</div>
          </div>
          <div class="metric-box" style="border-color: #a7f3d0; background-color: #f0fdf4;">
            <div style="font-size: 11px; font-weight: bold; color: #065f46;">نسبة دقة التشكيل واللفظ</div>
            <div class="metric-value" style="color: #059669;">${assessment.accuracy}%</div>
            <div style="font-size: 10px; color: #047857; margin-top: 5px;">المستهدف: 85% فما فوق</div>
          </div>
          <div class="metric-box" style="border-color: #fed7aa; background-color: #fff7ed;">
            <div style="font-size: 11px; font-weight: bold; color: #9a3412;">الفهم والاستيعاب القرائي</div>
            <div class="metric-value" style="color: #ea580c;">${assessment.comprehensionScore} <span style="font-size: 12px; font-weight: normal; color: #64748b;">من ${assessment.totalComprehensionQuestions}</span></div>
            <div style="font-size: 10px; color: #c2410c; margin-top: 5px;">مؤشر فهم السياق الأدبي</div>
          </div>
        </div>

        <div style="margin-top: 20px; font-size: 12px; color: #475569; border-top: 1px solid #f1f5f9; padding-top: 10px;">
          نوع الفحص والتقييم: <span class="badge ${assessment.evaluatedBy === "AI" ? "badge-ai" : "badge-manual"}">${assessment.evaluatedBy === "AI" ? "تحليل صوتي مؤتمت بالذكاء الاصطناعي" : "تدقيق وفحص يدوي من الإخصائي اللساني"}</span>
        </div>
      </div>

      <!-- Section: Details breakdown -->
      <div class="card" style="page-break-before: always;">
        <h2>ثالثاً: تفكيك وتحليل القطعة القرائية (${passage?.title || "سند النثر"})</h2>
        <p style="font-size: 12px; color: #64748b; margin-top: -5px; margin-bottom: 15px;">يظهر بالأسفل حالة قراءة الكلمات بشكل مجرود لتحديد مواضع اللحن أو الانحراف القرائي وملاحظة التشديد:</p>
        <div class="words-grid">
          ${wordsHtml}
        </div>
      </div>

      <!-- Section: Pronunciation Errors -->
      <div class="card">
        <h2>رابعاً: سجل الهفوات التعبيرية وخطط العلاج الموصى بها</h2>
        <table class="table-data">
          <thead>
            <tr>
              <th style="width: 5%; text-align: right;">#</th>
              <th style="width: 25%; text-align: right;">الكلمة المخطأ بها</th>
              <th style="width: 30%; text-align: right;">توصيف اللحن أو العجز اللفظي</th>
              <th style="width: 40%; text-align: right;">الخطة العلاجية والتدخل الفوري المقترح</th>
            </tr>
          </thead>
          <tbody>
            ${errorsHtml}
          </tbody>
        </table>
      </div>

      <!-- Section: General Feedback -->
      <div class="card">
        <h2>خامساً: التعليق والأثر اللساني التراكمي للإخصائي المستجوب</h2>
        <div style="padding: 15px; border-radius: 10px; background-color: #fdf6b2; border: 1px solid #fde047; color: #723b13; font-size: 13px; font-style: italic;">
          "${assessment.generalFeedback}"
        </div>
      </div>

      <!-- Footer Signatures -->
      <div class="footer-signatures">
        <div>
          <strong>توقيع الباحث / المحكم العلمي</strong>
          <p style="font-size: 11px; color: #64748b; margin: 5px 0;">أخصائي تقويم اللسان ولغة التطوير بالطفولة</p>
          <div class="signature-line"></div>
        </div>
        <div>
          <strong>اعتماد مدير مدرسة / جهة البحث</strong>
          <p style="font-size: 11px; color: #64748b; margin: 5px 0;">لتحسين الأثر اللغوي المتكامل والتمكين العربي</p>
          <div class="signature-line"></div>
        </div>
      </div>

      <script>
        // Automatic triggering of print
        window.onload = function() {
          // Allow small timeout for styles rendering
          setTimeout(function() {
            window.print();
          }, 500);
        }
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(content);
  printWindow.document.close();
};

// Beautiful Arabic intervention plan dynamic printable report
export const printInterventionReport = (
  plan: InterventionPlan,
  student: Student,
  project: Project | undefined
) => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("الرجاء السماح للنوافذ المنبثقة لتتمكن من طباعة وتصدير ملف التقرير كـ PDF.");
    return;
  }

  const dateFormatted = new Date(plan.createdAt).toLocaleDateString("ar-EG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const languageLabel = student.languageClassification === 'B' 
    ? "الفئة B (العربية لغة ثانية)" 
    : "الفئة A (العربية لغة أولى)";

  // Generate targets / objectives html list
  const objectivesHtml = plan.objectives.map(obj => `
    <li style="margin-bottom: 8px; font-size: 13.5px; color: #334155; font-weight: 600;">🎯 ${obj}</li>
  `).join("");

  // Generate activities details
  const activitiesHtml = plan.activities.map((act, index) => {
    let detailHtml = "";
    if (act.type === "syllables") {
      detailHtml = `تقطيع الكلمة اللولبية <strong>"${act.data.word || ""}"</strong> إلى تفاصيلها الصوتية المقترحة: <span style="background-color: #f1f5f9; padding: 2px 8px; border-radius: 4px; font-weight: bold; border: 1px solid #cbd5e1; direction: ltr; display: inline-block;">${(act.data.parts || []).join(" + ")}</span>`;
    } else if (act.type === "multiple-choice") {
      detailHtml = `سؤال الاختيارات المتعددة: <strong style="color: #312e81;">"${act.data.question || ""}"</strong> مع اقتراحات متعددة لتأكيد إدراك الكلمة.`;
    } else if (act.type === "scramble") {
      detailHtml = `إعادة بناء وتركيب الحروف المبعثرة للكلمة المستهدفة <strong>"${act.data.correctWord || ""}"</strong> لتأكيد حفظ الحروف وترابطها المقطعي.`;
    }

    return `
      <div style="border-right: 4px solid #4f46e5; background-color: #fdfdfd; padding: 15px; border-radius: 0 12px 12px 0; border: 1px solid #e2e8f0; border-right: 4px solid #4f46e5; margin-bottom: 12px;">
        <h4 style="margin: 0 0 5px 0; color: #1e1b4b; font-size: 14.5px;">لعبة ${index + 1}: ${act.activityTitle}</h4>
        <p style="margin: 0 0 8px 0; font-size: 12px; color: #64748b;"><strong>الإرشادات للحل:</strong> ${act.instructions}</p>
        <p style="margin: 0; font-size: 12.5px; color: #1e293b;">${detailHtml}</p>
      </div>
    `;
  }).join("");

  const content = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <title>خطة التدخل الفردية والألعاب العلاجية - ${student.name}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap');
        body {
          font-family: 'Cairo', 'Inter', sans-serif;
          margin: 40px;
          color: #1e293b;
          line-height: 1.6;
          background-color: #ffffff;
        }
        .header-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
          border-bottom: 3px double #059669;
          padding-bottom: 20px;
        }
        .text-center { text-align: center; }
        .text-left { text-align: left; }
        .text-right { text-align: right; }
        .badge {
          background-color: #e6f4ea;
          border: 1.5px solid #a3cfbb;
          border-radius: 8px;
          padding: 4px 10px;
          font-size: 11px;
          color: #0c63e4;
          font-weight: bold;
          display: inline-block;
        }
        .title {
          font-size: 26px;
          font-weight: 800;
          color: #064e3b;
          margin-bottom: 15px;
          text-align: center;
        }
        .subtitle {
          font-size: 14px;
          color: #475569;
          text-align: center;
          margin-bottom: 30px;
        }
        .card {
          border: 2px solid #e2e8f0;
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 25px;
          background-color: #ffffff;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
        }
        .card h2 {
          color: #064e3b;
          font-size: 18px;
          font-weight: 700;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 10px;
          margin-top: 0;
          margin-bottom: 15px;
        }
        .grid-info {
          display: grid;
          grid-template-cols: 1fr 1fr;
          gap: 15px;
        }
        .info-field {
          font-size: 13px;
          color: #475569;
        }
        .info-field strong {
          color: #0f172a;
        }
        .footer-signatures {
          margin-top: 50px;
          display: grid;
          grid-template-cols: 1fr 1fr;
          gap: 40px;
          text-align: center;
          font-size: 13px;
        }
        .signature-line {
          margin-top: 50px;
          border-top: 1px solid #94a3b8;
          width: 200px;
          margin-left: auto;
          margin-right: auto;
        }
        @media print {
          body {
            margin: 20px;
            font-size: 12px;
          }
          .title { font-size: 22px; }
          .card { page-break-inside: avoid; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div style="text-align: left;" class="no-print">
        <button onclick="window.print()" style="background-color: #059669; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; font-family: 'Cairo', sans-serif; font-size: 14px;">📄 طباعة أو حفظ الخطة كـ PDF</button>
      </div>

      <table class="header-table">
        <tr>
          <td style="width: 30%;" class="text-right">
            <h4 style="margin: 0; color: #059669;">خطة التمكين والتدخل اللغوي الفردي</h4>
            <p style="margin: 3px 0 0 0; font-size: 11px; color: #64748b;">تأهيل اللسان العربي لنجوم الغد</p>
          </td>
          <td style="width: 40%;" class="text-center">
            <h2 style="margin: 0; font-weight: 800; color: #064e3b; background-color: #e6f4ea; padding: 8px 15px; border-radius: 30px; display: inline-block;">برنامج فصاحة لتعزيز الطلاقة</h2>
          </td>
          <td style="width: 30%;" class="text-left">
            <p style="margin: 0; font-size: 11px; color: #64748b;">رقم الخطة: ${plan.id}</p>
            <p style="margin: 3px 0 0 0; font-size: 11px; color: #64748b;">الحالة: خطة علاجية مخصصة نشطة 🌟</p>
          </td>
        </tr>
      </table>

      <div class="title">برنامج وألعاب التدخل اللساني المقترح</div>
      <div class="subtitle">وثيقة علاجية مبرمجة إلكترونياً بالتوافق مع صعوبات الطفل اللفظية وأخطاء مخارج الصوت</div>

      <!-- Student details -->
      <div class="card">
        <h2>بيانات الطالب والأخصائي المشرف</h2>
        <div class="grid-info">
          <div>
            <div class="info-field" style="margin-bottom: 8px;">اسم الطالب الكامل: <strong>${student.name}</strong></div>
            <div class="info-field" style="margin-bottom: 8px;">التصنيف القرائي: <span class="badge" style="background-color: #ecfdf5; color: #047857; border-color: #a7f3d0; font-weight: 800;">${languageLabel}</span></div>
            <div class="info-field">الملامح العمرية والأكاديمية: <strong>الصف ${student.grade} الابتدائي — (${student.age} سنة)</strong></div>
          </div>
          <div>
            <div class="info-field" style="margin-bottom: 8px;">المشروع والمدرسة الحاضنة: <strong>${project?.school || "غير متوفر"}</strong></div>
            <div class="info-field" style="margin-bottom: 8px;">الأخصائي المسؤول: <strong>${project?.researcherName || "أخصائي التدقيق اللغوي"}</strong></div>
            <div class="info-field">تاريخ إصدار وثيقة التدخل: <strong>${dateFormatted}</strong></div>
          </div>
        </div>
      </div>

      <!-- Weakness Identified -->
      <div class="card">
        <h2>التشخيص العياني واللغوي المشخّص</h2>
        <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-right: 4px solid #d97706; padding: 15px; border-radius: 4px; color: #92400e; font-size: 13.5px; font-weight: 600;">
          ⚠️ العجز والصعوبة القرائية المرصودة:
          <p style="margin: 8px 0 0 0; color: #78350f; font-weight: normal; font-size: 13px;">"${plan.weakness}"</p>
        </div>
      </div>

      <!-- Objectives -->
      <div class="card">
        <h2>الأهداف اللفظية العامة للخطة العلاجية والقصصية</h2>
        <p style="font-size: 12px; color: #64748b; margin-top: -5px; margin-bottom: 15px;">يجب على المعلم أو الولي مواكبة الطفل لتحقيق المؤشرات السلوكية التالية:</p>
        <ul style="list-style-type: none; padding: 0; margin: 0;">
          ${objectivesHtml}
        </ul>
      </div>

      <!-- Interactive Activities Generated -->
      <div class="card" style="page-break-before: always;">
        <h2>العينات التفاعلية ومسارات الألعاب الداعمة للطفل</h2>
        <p style="font-size: 12px; color: #64748b; margin-top: -5px; margin-bottom: 15px;">إليك الألعاب التفاعلية المدمجة بالبوابة اللغوية للتدريب واللعب الهادف:</p>
        <div style="margin-top: 15px;">
          ${activitiesHtml}
        </div>
      </div>

      <!-- Teacher's Advice -->
      <div class="card">
        <h2>توصيات الإخصائي لتطوير اللسان الفصيح للمتعلم</h2>
        <div style="background-color: #f0fdf4; border: 1px solid #d1fae5; border-right: 4px solid #059669; padding: 15px; border-radius: 4px; color: #065f46; font-size: 13px; line-height: 1.7;">
          💡 نصائح وتوجيهات للتمكين:
          <p style="margin: 8px 0 0 0; color: #047857;">"${plan.teacherAdvice}"</p>
        </div>
      </div>

      <!-- Signatures -->
      <div class="footer-signatures">
        <div>
          <strong>توقيع واشراف الإخصائي</strong>
          <p style="font-size: 11px; color: #64748b; margin: 5px 0;">برنامج فصاحة والتهيئة الصوتية اللغوية</p>
          <div class="signature-line"></div>
        </div>
        <div>
          <strong>موافقة والالتزام من ولي أمر</strong>
          <p style="font-size: 11px; color: #64748b; margin: 5px 0;">لمتابعة مسارات اللعب اللفظي المتكامل بالمنزل</p>
          <div class="signature-line"></div>
        </div>
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 500);
        }
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(content);
  printWindow.document.close();
};
