# Magistratura boshqaruv tizimi — umumiy arxitektura

Oliy ta’lim muassasasining magistratura bo‘limi faoliyatini yagona platformada yuritish tizimi. Panel, hujjat oqimi, dissertatsiya, monitoring va KPI mikroservislar ko‘rinishida quriladi.

Hujjat ikki manbaga tayanadi:

- `magister.png` — modullar, dashboard, KPI ulushlari va tasdiqlash holatlari.
- `36_02.03.2015_Magitratura Nizom.pdf` — Vazirlar Mahkamasining 2015-yil 2-martdagi 36-son nizomi va 2024-yilgacha bo‘lgan tahrirlar.

## 1. Qoidalar

- HEMIS integratsiyasi yo‘q. Fan o‘zlashtirishi va seminar qatnashuvi qo‘lda yoki jadval importi bilan kiritiladi.
- Kirish email va parol bilan. Telegram alohida login emas: hisob Telegram tasdig‘isiz faollashmaydi.
- Tizimda ikki rol bor: `ADMIN` va `MAGISTR`. Boshqa rol yo‘q.
- Ochiq ro‘yxatdan o‘tish faqat `MAGISTR` beradi. `ADMIN` hisobini mavjud admin yaratadi.
- Har bir servisning o‘z bazasi, o‘z konteyneri va o‘z migratsiyasi bor. Servis boshqa servisning jadvaliga to‘g‘ridan-to‘g‘ri kirmaydi.
- Next.js faqat panel. Biznes qoidalari servislarda turadi.
- Yuridik tasdiq hujjat holatidan tashqari bayonnoma yoki buyruqqa bog‘lanadi.
- Admin hujjatni faqat uch qaror bilan yopadi: qabul qilish, rad etish, qayta tahrirga yuborish. Uchala qaror ham komment bilan yoziladi. Kommentsiz qaror saqlanmaydi. Talaba kommentni o‘z profilida ko‘radi.
- Nizom monitoringi va ichki KPI ikki alohida natija. Biri ikkinchisining o‘rnini bosmaydi.
- Qonuniy limitlar kod ichiga yozilmaydi. Ular mutaxassislik va qabul yili bo‘yicha sozlama.

## 2. Stack

| Qatlam | Tanlov |
|---|---|
| Panel | Next.js (App Router) |
| Servislar | TypeScript, NestJS |
| API | Gateway orqali HTTP JSON |
| Token | JWT, RS256. Access taxminan 15 daqiqa, refresh aylantiriladi |
| Parol | argon2id |
| Ma’lumot | PostgreSQL, servisga bitta baza |
| Hodisa | RabbitMQ va har servisdagi `outbox` jadvali |
| Keshlik va limit | Redis |
| Fayl | MinIO. Metadatalar `file-service` bazasida |
| Lokal ishga tushirish | Docker Compose |

Lokal muhitda bitta PostgreSQL konteyner ishlaydi. Ichida bazalar alohida. Servis faqat o‘z bazasiga ulanadi.

## 3. Rollar

Tizimga ikki turdagi hisob kiradi. Barcha adminlar teng huquqli.

| Rol | Kabinet | Vazifa |
|---|---|---|
| `MAGISTR` | Magistr kabineti | O‘z rejasi, hisoboti, dissertatsiyasi, amaliyoti va ijtimoiy faoliyati |
| `ADMIN` | Admin panel | Hisob, tasdiq va rad etish, mavzu, monitoring, dashboard, bayonnoma va buyruq |

Ilmiy rahbar, maslahatchi, taqrizchi, kafedra mudiri, prorektor va DAK alohida hisob emas. Ularning ismi hujjatdagi maydon. Shu ishni admin panelidan admin bajaradi.

JWT da `sub` va `role` turadi. `role` qiymati `ADMIN` yoki `MAGISTR`. Maxfiy kalit `identity-service` da, qolgan servislar ochiq kalit bilan tekshiradi.

| Amal | MAGISTR | ADMIN |
|---|---|---|
| O‘z hujjatini yaratish va yuborish | ha | ha |
| Boshqa magistr hujjatini ko‘rish | yo‘q | ha |
| Tasdiqlash, qaytarish, rad etish | yo‘q | ha, faqat komment bilan |
| Mavzu, rahbar ismi, taqriz, himoya bahosi | yo‘q | ha |
| Dashboard va monitoring | o‘z kartasi | to‘liq |
| Bayonnoma va buyruq | yo‘q | ha |
| Admin hisobi yaratish | yo‘q | ha |

## 4. Servislar

```text
Brauzer
   │
   ▼
web (Next.js)
   │
   ▼
api-gateway
   │
   ├── identity-service       identity_db
   ├── directory-service      directory_db
   ├── workflow-service       workflow_db
   ├── dissertation-service   dissertation_db
   ├── practice-service       practice_db
   ├── governance-service     governance_db
   ├── file-service           file_db ── MinIO
   ├── kpi-service            kpi_db
   └── analytics-service      analytics_db

notification-service          notification_db ── Telegram Bot API
RabbitMQ  ← outbox
Redis     ← tasdiq tokeni, login limiti
```

Gateway marshrutlari:

| Yo‘l | Servis |
|---|---|
| `/api/auth` | identity-service |
| `/api/directory` | directory-service |
| `/api/workflow` | workflow-service |
| `/api/dissertation` | dissertation-service |
| `/api/practice` | practice-service |
| `/api/governance` | governance-service |
| `/api/files` | file-service |
| `/api/kpi` | kpi-service |
| `/api/dashboard` | analytics-service |

Tashqi so‘rov faqat gateway orqali kiradi. Servislararo buyruq ichki HTTP bilan, hodisa RabbitMQ bilan ketadi. Yozuv avval o‘z bazasidagi `outbox` ga tushadi, keyin navbatga chiqadi.

### 4.1. identity-service

Registratsiya, login, parol, rol, Telegram tasdiq, access va refresh token.

Oqim:

1. Magistr ism, email, telefon va parol bilan o‘zi ro‘yxatdan o‘tadi. Admin hisobini boshqa admin yaratadi.
2. Hisob `PENDING_TELEGRAM` holatida yaratiladi. `users.role` maydoni `MAGISTR` yoki `ADMIN`.
3. Ekranda `t.me/<bot>?start=<bir_martalik_token>` havolasi chiqadi.
4. Bot tokenni `notification-service` ga beradi, u identity ichki API siga tasdiq yuboradi.
5. Hisob `ACTIVE` bo‘ladi, `chat_id` foydalanuvchiga bog‘lanadi.
6. Login email va parol bilan ochiladi. Telegram tasdig‘i yo‘q bo‘lsa token berilmaydi.

Jadvallar: `users`, `user_credentials`, `refresh_tokens`, `telegram_links`, `confirmation_tokens`.

### 4.2. directory-service

Tashkiliy tuzilma va o‘quv fakti.

- Fakultet, kafedra, mutaxassislik.
- O‘qish muddati: 2 yil yoki 3 yil.
- Talaba: kurs, qabul yili, grant yoki kontrakt, ikkinchi oliy ta’lim belgisi.
- Ilmiy rahbar kartasi: F.I.O., ilmiy daraja, unvon, staj, rahbarlik limiti. Bu karta login emas, admin to‘ldiradi.
- Fan o‘zlashtirishi va ilmiy seminar qatnashuvi. HEMIS yo‘q, admin qo‘lda yoki import bilan kiritadi.

Rahbarlik limiti: professor yoki fan doktori 5 tagacha, dotsent, fan nomzodi va mutaxassis 3 tagacha. Ilmiy daraja va kamida 3 yil staj bo‘lmasa admin rahbar sifatida biriktira olmaydi.

### 4.3. workflow-service

Kalendar ish rejasi, oylik bajarilish va ijtimoiy faoliyat. Dissertatsiya bu servisda yuritilmaydi.

Nizom 2-ilovasidagi reja bo‘limlari:

1. O‘quv-metodik ishlar
2. Ilmiy-tadqiqot ishlari
3. Ilmiy-pedagogik ishlar
4. Pedagogik amaliyot
5. Dissertatsiya kalendar bosqichlari: tayyorgarlik, rejalashtirish, amalga oshirish, rasmiylashtirish, himoyaga taqdim

Har bir bandda tadbir, muddat va bajarilish belgisi bor.

Tasdiq zanjiri:

1. Magistr reja tuzadi va yuboradi.
2. Admin hujjatni ochadi va komment yozadi. Komment kamida 3 ta belgi, bo‘sh joy hisobga olinmaydi.
3. Komment yozilgach admin uchta qarordan birini beradi: qabul qilish, qayta tahrirga yuborish yoki rad etish. Kommentsiz tugma ishlamaydi, server ham bunday so‘rovni qabul qilmaydi.
4. Qaror va komment talaba profilida qoladi. Qayta tahrirda magistr tuzatib yana yuboradi, eski kommentlar o‘chmaydi.
5. Admin tasdiqqa bayonnoma yoki buyruqni biriktiradi.
6. Oylik hisobot ham shu qaror va komment qoidasidan o‘tadi.

Ijtimoiy faoliyat: sport, to‘garak, seminar, konferensiya, ko‘ngillilik.

Umumiy hujjat holatlari:

`DRAFT` → `SUBMITTED` → `IN_REVIEW` → `APPROVED`

`IN_REVIEW` dan `REVISION` yoki `REJECTED` ga o‘tish mumkin. Har bir o‘tish `audit_log` ga yoziladi: kim, qachon, eski holat, yangi holat. Tasdiq yozuvi `governance-service` dagi bayonnoma yoki buyruq identifikatorini saqlaydi.

### 4.4. dissertation-service

Magistrlik dissertatsiyasining alohida chegarasi.

- Mavzular banki. Magistr mavzu taklif qiladi, admin tasdiqlaydi.
- Ilmiy rahbar va kerak bo‘lsa maslahatchining F.I.O. si. Admin yozadi, alohida hisob ochilmaydi.
- Tuzilma ro‘yxati: titul varaq, ikki tilda annotatsiya, mundarija, kirish, kamida uch bob, xulosa, adabiyotlar, ilova. Materialni magistr yuklaydi.
- Kirish bandlari: dolzarblik, obyekt, predmet, maqsad, vazifalar, yangilik, faraz, adabiyot tahlili, metodika, ahamiyat, tuzilma.
- Nashr bog‘lanishi: maqola yoki tezis, respublika yoki xalqaro, mavzuga biriktirilgan.
- Ichki taqriz, tashqi taqriz, rahbar xulosasi, maslahatchi xulosasi. Matn va faylni admin kiritadi.
- Dastlabki himoya va rasmiy himoya. Bahoni 7 ta mezon bo‘yicha admin qo‘yadi. Taqdimot 20 daqiqagacha.
- Qayta himoya oynasi 3 yil.

Mavzu muddati — birinchi o‘quv yilining birinchi ikki oyi. Admin tasdiqqa buyruqni biriktiradi.

Tashqi rahbar yozilsa, admin maslahatchi F.I.O. sini ham kiritadi. Limit `directory-service` dan tekshiriladi.

Dastlabki himoya sanasi quyidagilar to‘liq bo‘lganda qo‘yiladi:

- ilmiy rahbar xulosasi;
- maslahatchi xulosasi, agar maslahatchi tayinlangan bo‘lsa;
- ichki va tashqi taqriz;
- mavzuga doir kamida 2 ta maqola yoki tezis;
- taqriz sanasi himoyadan kamida 3 kun oldin.

Admin plagiat, ma’lumotni soxtalashtirish yoki yolg‘on iqtibosni belgilasa, himoya zanjiri to‘xtaydi. Avtomatik plagiat tekshiruvi birinchi versiyada yo‘q.

Hajm bo‘yicha ro‘yxat: asosiy matn 70–80 sahifa, xulosa 4 sahifagacha, ilova umumiy hajmning uchdan biridan oshmasligi. Hoshiya va shrift birinchi versiyada bloklovchi qoida emas, admin tasdiqlaydigan band.

Rasmiy himoya sanasini admin buyruq bilan belgilaydi. «Qoniqarsiz» yoki himoyaga qo‘yilmagan ish 3 yil ichida qayta topshiriladi. Himoya qilingan fayl 3 yil qulflanadi.

Rasmiy himoya mezonlari:

1. Mavzuning dolzarbligi va amaliyot bilan bog‘liqligi.
2. Mustaqil yondashuv.
3. Adabiyot, normativ hujjat, statistika va xorijiy manba tahlilining to‘liqligi.
4. Tadqiqot usulining amaliyotda qo‘llanilishi.
5. Tavsiyalarning amaliy ahamiyati.
6. Natijani rivojlantirish istiqboli.
7. Nazariy va amaliy qismning mantiqiy bog‘liqligi.

### 4.5. practice-service

- Tashkilot, shartnoma va yo‘llanma.
- Pedagogik amaliyot, stajirovka, dissertatsiyaning tajriba-sinov qismi.
- Kundalik va hisobot.
- GPS nuqta, foto va video. Baytlar `file-service` da, bu yerda `fileId`.

### 4.6. governance-service

Yuridik hujjat. Yozish va tasdiqlash faqat admin da.

- Bayonnoma: raqam, sana, ishtirokchilar, qaror.
- Buyruq: mavzu tasdiqi, himoya jadvali, monitoring guruhi.
- Yig‘ilish turi maydoni: kafedra, o‘quv-metodik kengash, ilmiy kengash.

Boshqa servislar tasdiqni shu yerdagi identifikator bilan bog‘laydi.

### 4.7. file-service

PDF, sertifikat, dissertatsiya, foto va video. Metadatalar `file_db` da: bucket, kalit, egasi, checksum, hujjat turi, saqlash muddati. Himoya qilingan dissertatsiya 3 yil o‘chirishdan yopiladi. Tasdiqlangan reja va himoya bayonnomasiga QR qo‘yiladi, QR hujjat versiyasining xeshiga bog‘lanadi.

### 4.8. kpi-service

Ikki qatlam.

Ichki KPI, poster bo‘yicha, sozlamada turadi:

| Yo‘nalish | Ulush |
|---|---|
| O‘quv faoliyati | 25% |
| Ilmiy faoliyat | 25% |
| Amaliyot | 20% |
| Ijtimoiy faoliyat | 15% |
| Hisobotlar va rejalar | 15% |

Baho: 90–100 A+, 80–89 A, 70–79 B, 60–69 C, 0–59 D.

Nizom monitoringi alohida, kurs bo‘yicha:

- 1-kurs: kalendar reja o‘z vaqtida, 1 ta maqola yoki 1 ta tezis, seminar, mutaxassislik fanlarini o‘zlashtirish.
- 2-kurs: kalendar reja o‘z vaqtida, 2 ta maqola yoki 2 ta tezis, rejadagi dastlabki himoya, seminar, barcha fanlar.
- 3 yillik mutaxassislik: shu mutaxassislik uchun alohida ko‘rsatkich to‘plami.

Qoida qabul yiliga biriktiriladi. Eski oqim o‘z qoidasida qoladi. Monitoring ma’lumoti yil davomida yig‘iladi, rasmiy kampaniya aprel–may, yakuniy hisobot o‘quv yili oxirida Ilmiy kengashga chiqadi.

### 4.9. analytics-service

Dashboard uchun oldindan yig‘ilgan ko‘rsatkichlar. Sahifa ochilganda barcha servislarga so‘rov ketmaydi.

Poster dagi kartalar shu yerda jonli hisoblanadi: talabalar soni, faol foydalanuvchilar, tasdiqlanmagan hujjatlar, o‘rtacha KPI, fakultet reytingi, BMI tayyorgarligi, nashrlar, oylik hisobot, amaliyot xaritasi, bildirishnomalar, TOP talabalar. Nizom monitoringining o‘tish ulushi alohida karta.

### 4.10. notification-service

Telegram bot va xabar jurnali. Keyinroq SMS va email shu servisga qo‘shiladi.

Eslatmalar:

- Telegram tasdiq havolasi.
- Mavzu muddati tugashidan oldin magistrga eslatma.
- Oylik reja bandlari magistrga.
- Taqriz muddati adminlarga.
- Aprel–may monitoring kampaniyasi adminlarga.
- Hujjat holati o‘zgarganda magistrga, yangi yuborilgan hujjat adminlarga.

### 4.11. web va api-gateway

`web` ikki kabinet chizadi: `/magistr` va `/admin`. `api-gateway` JWT dagi `role` ni tekshiradi va marshrutni servisga uzatadi. `MAGISTR` admin yo‘llariga kira olmaydi.

## 5. Hodisalar

Navbat nomi: `magister.events`.

| Hodisa | Kim chiqaradi | Kim o‘qiydi |
|---|---|---|
| `user.registered` | identity | notification |
| `user.telegram_confirmed` | identity | notification, analytics |
| `user.activated` | identity | directory, analytics |
| `calendar.submitted` | workflow | notification, governance |
| `calendar.approved` | workflow | kpi, analytics, notification |
| `document.approved` | workflow | kpi, analytics, notification |
| `document.rejected` | workflow | notification, analytics |
| `topic.assignment_requested` | dissertation | directory |
| `topic.approved` | dissertation | kpi, analytics, notification, file |
| `review.submitted` | dissertation | notification |
| `defense.scheduled` | dissertation | notification, analytics |
| `defense.completed` | dissertation | file, kpi, analytics, notification |
| `practice.checked_in` | practice | kpi, analytics |
| `mastery.recorded` | directory | kpi |
| `kpi.recalculated` | kpi | analytics |
| `monitoring.evaluated` | kpi | analytics, notification, governance |
| `order.issued` | governance | dissertation, workflow, notification |

## 6. Nizom bosqichlari va qamrov

| Bosqich | Muddat | Qamrov |
|---|---|---|
| Hujjat qabul | Iyul | Birinchi versiyada yo‘q. Talaba qabul qilingan holatda ochiladi |
| Kirish imtihoni | Avgust | 118-son nizom. Shu loyihaga kirmaydi |
| Pedagoglar tarkibi | Avgust–sentabr | directory-service |
| Ta’lim jarayoni | Kamida 2 yil | directory-service, workflow-service |
| Mavzu va rahbar | 1-kursning dastlabki 2 oyi | dissertation-service, governance-service |
| Dissertatsiyani tayyorlash | Kalendar reja bo‘yicha | workflow-service, dissertation-service |
| Monitoring | Aprel–may | kpi-service, governance-service |
| Dastlabki va rasmiy himoya | Jadval asosida | dissertation-service, governance-service |

Birinchi versiyaga kirmaydi: HEMIS, qabul kampaniyasi, stipendiya hisobi, avtomatik plagiat, elektron hukumat. Moliyaviy tur talaba kartasida saqlanadi. Bitiruvchining ishga joylashuvi keyingi modul.

## 7. Docker Compose

Servislar: `web`, `api-gateway`, `identity-service`, `directory-service`, `workflow-service`, `dissertation-service`, `practice-service`, `governance-service`, `file-service`, `kpi-service`, `analytics-service`, `notification-service`.

Infratuzilma: `postgres`, `rabbitmq`, `redis`, `minio`.

Bazalar: `identity_db`, `directory_db`, `workflow_db`, `dissertation_db`, `practice_db`, `governance_db`, `file_db`, `kpi_db`, `analytics_db`, `notification_db`.

## 8. Ishga tushirish tartibi

1. `web`, `api-gateway`, `identity-service`, `directory-service`, `workflow-service`, `notification-service`, PostgreSQL, Redis, RabbitMQ. Natija: registratsiya, Telegram tasdiq, login, kalendar reja va oylik hisobot.
2. `governance-service`, `dissertation-service`, `file-service`, MinIO. Natija: bayonnoma, buyruq, mavzu, taqriz, himoya, fayl va QR.
3. `practice-service`, `kpi-service`, `analytics-service`. Natija: amaliyot, ikki qatlamli baho, dashboard.
4. Email, SMS, ishga joylashuv moduli, avtomatik o‘xshashlik tekshiruvi.

Har bir bosqich oldingi servislarning bazasiga kirmasdan, hodisa va HTTP orqali ulanadi.
