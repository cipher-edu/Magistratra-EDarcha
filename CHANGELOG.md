# O‘zgarishlar jurnali (Changelog)

Barcha rasmiy versiyalar va ulardagi o‘zgarishlar ushbu hujjatda [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) standarti hamda [SemVer](https://semver.org/lang/uz/) (Semantik versiyalash) qoidalari asosida qayd etib boriladi.

---

## [1.2.0] - 2026-10-02

### 🚀 Yangiliklar (Added)
- **Ilmiy maqolalar va nashrlar moduli (ARTICLE):**
  - Vazirlar Mahkamasining 36-son Nizomi (2.7, 4.4, 4.8-bandlari) talablariga muvofiq ilmiy nashrlar hujjat turi sifatida to‘liq joriy etildi.
  - Maxsus metadatalar kiritish shakli: Indekslangan baza (`Scopus`, `Web of Science`, `OAK xalqaro/respublika jurnali`, `Xalqaro/respublika anjumani`), Jurnal yoki to‘plam nomi, Jild/Son/Betlar, DOI / elektron havola hamda hammualliflar ro‘yxati.
- **Yuridik Governance (Bayonnoma va Buyruq tasdiqlari):**
  - Hujjatlar bo‘yicha administrator qarori qabul qilinganda rasmiy yuridik hujjat ma’lumotlarini biriktirish imkoniyati (Kafedra bayonnomasi, Ilmiy kengash qarori yoki Rektorat buyrug‘i).
  - Arizalar tarixida va talaba profilida rasmiy tasdiq yozuvi va yuridik gerb/muhr ko‘rinishidagi vizual indikator.
- **Nizom 36-son monitoring kartasi (`NizomMonitoringCard`):**
  - Talaba va admin kabinetlarida kurs bo‘yicha majburiy mezonlar (1-kursda kamida 1 ta maqola/tezis, tasdiqlangan reja, mavzu; 2-kursda kamida 2 ta maqola/tezis, dastlabki himoya tayyorgarligi, amaliyot) monitoringi.
  - Jonli muvofiqlik darajasi (foizda) va yetishmayotgan hujjatlarni to‘g‘ridan-to‘g‘ri yuborish havolalari.
- **Yangi 3D Taktil Izometrik Iconlar:**
  - `ThreeDIcon` tizimiga ilmiy nashrlar uchun `article` hamda yuridik asoslar uchun `governance` piktogrammalari va ularning CSS rang mavzulari qo‘shildi.
  - Reestr jadvallarida hujjat nomlari oldiga 3D tur belgilari kiritildi.

### 🎨 O‘zgarishlar va Yaxshilanishlar (Changed)
- Boshqaruv panelidagi Blueprint tahlil blokida ilmiy nashrlar soni (Scopus, WoS, OAK) dinamik hisoblash parametrlariga ulandi.
- Talaba profilidagi filtrlash shaklida hujjat turlari dinamik katalogdan olinadigan qilindi.
- `reviews` ma’lumotlar bazasi jadvaliga `governance_ref` maydoni qo‘shildi va avtomatik migratsiya o‘rnatildi.

---

## [1.1.0] - 2026-10-02

### 🚀 Yangiliklar (Added)
- **3D Izometrik Iconlar Tizimi:** Boshqaruv paneli, talabalar, arizalar, tuzilma, audit va barcha qaror holatlari uchun taktil 3D piktogrammalar joriy etildi (`ThreeDIcon.tsx`).
- **Yangilangan Boshqaruv Paneli:**
  - 4 ta asosiy Hero KPI kartalari (Magistrantlar soni, Faol foydalanuvchilar, Navbatdagi arizalar, O‘rtacha KPI).
  - Tezkor ogohlantirish banniri (Alert Banner) — tasdiq kutayotgan hisoblar va navbatdagi arizalar haqida xabardor qiladi.
  - Blueprint tahlil moduli (`magister.png` 2.10 andozasi): KPI mezonlari taqsimoti, BMI tayyorgarligi (68%) hamda ilmiy maqolalar hisoblagichlari (Scopus, WoS, OAK).
  - Eng faol magistrantlar TOP 3 reytingi.
- **Enterprise Arxitektura Auth Sahifalari:**
  - Avvalgi sodda shakllar to‘liq tozalanib, tizim arxitekturasiga moslashtirilgan Split-Screen ko‘rinishida noldan qayta qurildi.
  - Vektorli arxitektura SVG illyustratsiyasi (`AuthIllustration.tsx`).
  - Rolni bir klik bilan tanlash (Admin va Magistrant) hamda 1-klikli demo hisoblar.
  - Parol ko‘rinishini boshqarish (Show/Hide password).
- **Mavzular almashtirgichi (ThemeToggle):** Topbarga o‘rnatildi, barcha elementlar Dark va Light rejimlariga to‘liq moslashtirildi.

### 🎨 O‘zgarishlar va Yaxshilanishlar (Changed)
- 3D iconlarning yotiq burchagi to‘g‘rilanib, foydalanuvchiga to‘g‘ri qaraydigan, aniq va sifatli burchakka (`perspective(350px) rotateX(10deg) rotateY(-10deg)`) keltirildi.
- Status badge'lar ichiga mikro 3D qaror indikatorlari o‘rnatildi.
- Ro‘yxatdan o‘tish shakliga 36-son Nizom bo‘yicha akademik bosqichlar va yo‘riqnoma biriktirildi.

---

## [1.0.0] - 2026-10-01

### 🚀 Dastlabki reliz (Initial Release)
- **Yadro Tizim:** Next.js 15 App Router, React 19, TypeScript va PostgreSQL / SQLite integratsiyasi.
- **Rollar va Xavfsizlik:** `ADMIN` va `MAGISTR` rollari, xavfsiz seanslar va parollarni bcrypt orqali shifrlash.
- **Hujjatlar aylanishi:** Arizalarni yaratish, ko‘rib chiqish, qabul qilish, tahrirga qaytarish va rad etish (kommentlar bilan birga).
- **Audit tizimi:** Barcha o‘zgarishlarni qayd etib boruvchi mustahkam audit log jurnali.
- **Konteynerizatsiya:** Docker Compose orqali PostgreSQL bazasini boshqarish.
- **Hujjatlar:** Tizim arxitekturasi (`ARXITEKTURA.md`), Nizom hujjati (`36_02.03.2015_Magitratura Nizom.pdf`) va loyiha blueprinti (`magister.png`).
