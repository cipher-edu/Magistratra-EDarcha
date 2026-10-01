# Magistratura - E-Darcha (v1.0.0)

Oliy ta’lim muassasasining magistratura bo‘limi faoliyatini yagona platformada yuritish, monitoring qilish va boshqarish tizimi.

Ushbu tizim Vazirlar Mahkamasining 2015-yil 2-martdagi 36-son nizomi hamda zamonaviy oliy ta'lim talablari asosida loyihalashtirilgan.

---

## 🚀 Texnologiyalar to'plami (Tech Stack)

- **Frontend / Backend:** Next.js 15 (App Router), React 19, TypeScript
- **Ma'lumotlar bazasi:** PostgreSQL (Docker) / SQLite fallback
- **Dizayn & Uslub:** Zamonaviy Dark/Light ERP dashboard interfeysi (Tailwind/CSS)
- **Konteynerizatsiya:** Docker Compose

---

## 👥 Foydalanuvchi rollari

1. **`MAGISTR` (Magistrant):**
   - Shaxsiy reja, hisobotlar va dissertatsiya holatini yuritish
   - Ilmiy faoliyat, maqolalar va amaliyot natijalarini kiritish
   - Ariza va hujjatlarni tasdiqqa yuborish
   - Admin xulosalari va izohlarini ko‘rish

2. **`ADMIN` (Magistratura bo‘limi / Administrator):**
   - Talabalar ro‘yxati va profil ma'lumotlarini boshqarish
   - Hujjatlar va arizalarni ko‘rib chiqish (qabul qilish, rad etish, tahrirga qaytarish)
   - Nizom bo‘yicha talablar monitoringi va KPI ko‘rsatkichlari tahlili
   - Fakultet va kafedralar kesimida tuzilma va statistika

---

## 📂 Loyiha tuzilishi

```text
├── 36_02.03.2015_Magitratura Nizom.pdf   # Asos nizom hujjati
├── ARXITEKTURA.md                         # Tizimning to'liq arxitektura hujjati
├── docker-compose.yml                     # PostgreSQL konteyner sozlamalari
├── magister.png                           # Tizim konsept va modullar diagrammasi
├── web/                                   # Next.js asosiy veb-platformasi
│   ├── app/                               # Next.js App Router (sahifalar va API)
│   ├── components/                        # UI komponentlar (ERP bloklar, formalar, grafiklar)
│   ├── lib/                               # Baza, autentifikatsiya, audit va yordamchi modullar
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

---

## ⚙️ Ishga tushirish (Local Setup)

### 1. PostgreSQL bazasini ishga tushirish (Docker orqali):
```bash
docker compose up -d
```

### 2. Veb platformani ishga tushirish:
```bash
cd web
npm install
cp .env.example .env
npm run dev
```

Brauzerda [http://localhost:3000](http://localhost:3000) manziliga kiring.

---

## 📦 Versiya

- **Versiya:** `1.0.0`
- **Holati:** Ishga tushirishga tayyor (Production-ready initial release)
