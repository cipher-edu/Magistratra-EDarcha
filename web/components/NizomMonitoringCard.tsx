import Link from "next/link";
import { ThreeDIcon } from "./ThreeDIcon";
import type { DocumentRow } from "@/lib/db";

export function NizomMonitoringCard({
  course = 1,
  documents,
  isStudent = false,
}: {
  course: number | null;
  documents: DocumentRow[];
  isStudent?: boolean;
}) {
  const currentCourse = course === 2 ? 2 : 1;

  // Criteria calculations based on VM No. 36
  const planApproved = documents.some((d) => d.type === "PLAN" && d.status === "APPROVED");
  const planSubmitted = documents.some((d) => d.type === "PLAN");

  const articles = documents.filter((d) => d.type === "ARTICLE");
  const articlesApproved = articles.filter((d) => d.status === "APPROVED").length;
  const articlesTotal = articles.length;
  const requiredArticles = currentCourse === 1 ? 1 : 2;
  const articleMet = articlesTotal >= requiredArticles;

  const dissSubmitted = documents.some((d) => d.type === "DISSERTATION");
  const dissApproved = documents.some((d) => d.type === "DISSERTATION" && d.status === "APPROVED");

  const practiceSubmitted = documents.some((d) => d.type === "PRACTICE");
  const reportSubmitted = documents.some((d) => d.type === "REPORT");

  // Checklist items
  const items = currentCourse === 1
    ? [
        {
          id: "plan",
          title: "Kalendar ish rejasi",
          desc: "Kafedra va ilmiy rahbar tomonidan tasdiqlangan reja",
          met: planApproved,
          statusText: planApproved ? "Tasdiqlangan" : planSubmitted ? "Ko‘rib chiqilmoqda" : "Topshirilmagan",
          missingLink: isStudent && !planSubmitted ? "/magistr/hujjat/yangi" : undefined,
        },
        {
          id: "article",
          title: `Ilmiy nashrlar (kamida ${requiredArticles} ta maqola/tezis)`,
          desc: "Scopus, WoS, OAK yoki respublika konferensiyasi",
          met: articleMet,
          statusText: `${articlesTotal}/${requiredArticles} ta taqdim etilgan (${articlesApproved} ta tasdiqlangan)`,
          missingLink: isStudent && !articleMet ? "/magistr/hujjat/yangi" : undefined,
        },
        {
          id: "diss",
          title: "Dissertatsiya mavzusi va rejasi",
          desc: "Dastlabki 2 oyda mavzu va ilmiy rahbar biriktirilishi",
          met: dissSubmitted,
          statusText: dissApproved ? "Tasdiqlangan" : dissSubmitted ? "Mavzu taqdim etilgan" : "Kiritilmagan",
          missingLink: isStudent && !dissSubmitted ? "/magistr/hujjat/yangi" : undefined,
        },
        {
          id: "report",
          title: "Oylik hisobotlar monitoringi",
          desc: "O‘quv va tadqiqot faoliyati bo‘yicha hisobotlar",
          met: reportSubmitted,
          statusText: reportSubmitted ? "Hisobotlar yuritilmoqda" : "Topshirilmagan",
          missingLink: isStudent && !reportSubmitted ? "/magistr/hujjat/yangi" : undefined,
        },
      ]
    : [
        {
          id: "plan",
          title: "Kalendar ish rejasi",
          desc: "2-o‘quv yili uchun kalendar ish rejasi",
          met: planApproved,
          statusText: planApproved ? "Tasdiqlangan" : planSubmitted ? "Ko‘rib chiqilmoqda" : "Topshirilmagan",
          missingLink: isStudent && !planSubmitted ? "/magistr/hujjat/yangi" : undefined,
        },
        {
          id: "article",
          title: `Ilmiy nashrlar (kamida ${requiredArticles} ta maqola/tezis)`,
          desc: "Kamida 2 ta OAK / xalqaro bazalardagi ilmiy ishlar",
          met: articleMet,
          statusText: `${articlesTotal}/${requiredArticles} ta taqdim etilgan (${articlesApproved} ta tasdiqlangan)`,
          missingLink: isStudent && !articleMet ? "/magistr/hujjat/yangi" : undefined,
        },
        {
          id: "diss",
          title: "Dissertatsiya bo‘limlari va dastlabki himoya",
          desc: "BMI boblari va kafedra muhokamasi xulosasi",
          met: dissSubmitted,
          statusText: dissApproved ? "Dastlabki himoyaga tayyor" : dissSubmitted ? "Qoralamalar yuborilgan" : "Kiritilmagan",
          missingLink: isStudent && !dissSubmitted ? "/magistr/hujjat/yangi" : undefined,
        },
        {
          id: "practice",
          title: "Pedagogik / Ilmiy amaliyot",
          desc: "Amaliyot kundaligi va taqriz hisoboti",
          met: practiceSubmitted,
          statusText: practiceSubmitted ? "Amaliyot topshirilgan" : "Topshirilmagan",
          missingLink: isStudent && !practiceSubmitted ? "/magistr/hujjat/yangi" : undefined,
        },
      ];

  const metCount = items.filter((item) => item.met).length;
  const progressPercent = Math.round((metCount / items.length) * 100);

  return (
    <article className="card nizom-monitoring-card" style={{ marginBottom: "16px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", borderBottom: "1px solid var(--line)", paddingBottom: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <ThreeDIcon kind="structure" size="compact" />
          <div>
            <h3 style={{ margin: 0, fontSize: "16px" }}>Nizom 36-son mezonlari monitoringi</h3>
            <span style={{ fontSize: "12px", color: "var(--muted)" }}>
              {currentCourse}-kurs magistranti uchun o‘quv-ilmiy talablar ijrosi
            </span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "4px 10px",
              borderRadius: "12px",
              fontSize: "12px",
              fontWeight: 600,
              background: progressPercent >= 75 ? "rgba(22, 163, 74, 0.12)" : "rgba(234, 179, 8, 0.12)",
              color: progressPercent >= 75 ? "var(--ok, #16a34a)" : "var(--wait, #ca8a04)",
              border: `1px solid ${progressPercent >= 75 ? "rgba(22, 163, 74, 0.3)" : "rgba(234, 179, 8, 0.3)"}`,
            }}
          >
            Muvofiqlik: {progressPercent}%
          </span>
        </div>
      </header>

      <div style={{ margin: "14px 0 10px" }}>
        <div className="stage-card-bar" style={{ height: "7px", borderRadius: "4px", background: "var(--track, #e2e8f0)" }}>
          <b
            className="stage-card-fill"
            style={{
              width: `${progressPercent}%`,
              background: progressPercent >= 75 ? "var(--ok, #16a34a)" : "var(--wait, #eab308)",
              height: "100%",
              display: "block",
              borderRadius: "4px",
              transition: "width 0.4s ease",
            }}
          />
        </div>
      </div>

      <div
        className="monitoring-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "12px",
          marginTop: "12px",
        }}
      >
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              padding: "10px 12px",
              borderRadius: "8px",
              border: "1px solid var(--line)",
              background: item.met ? "var(--bg-subtle, rgba(22, 163, 74, 0.04))" : "var(--bg-subtle, rgba(245, 158, 11, 0.04))",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: "6px",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px", marginBottom: "4px" }}>
                <strong style={{ fontSize: "13px" }}>{item.title}</strong>
                {item.met ? (
                  <span style={{ color: "var(--ok, #16a34a)", display: "flex" }}>
                    <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </span>
                ) : (
                  <span style={{ color: "var(--wait, #d97706)", display: "flex" }}>
                    <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </div>
              <p style={{ margin: 0, fontSize: "11px", color: "var(--muted)" }}>{item.desc}</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "4px" }}>
              <span style={{ fontSize: "11px", fontWeight: 600, color: item.met ? "var(--ok, #16a34a)" : "var(--muted)" }}>
                {item.statusText}
              </span>
              {item.missingLink ? (
                <Link href={item.missingLink} style={{ fontSize: "11px", color: "var(--accent)", textDecoration: "underline" }}>
                  Yuborish
                </Link>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
