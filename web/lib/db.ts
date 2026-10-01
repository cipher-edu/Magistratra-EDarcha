import fs from "fs";
import path from "path";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { DatabaseSync } from "node:sqlite";
import { FACULTIES } from "./catalog";
import type { ReviewAction } from "./labels";

const globalDb = globalThis as unknown as { magisterDb?: DatabaseSync };

function database() {
  if (!globalDb.magisterDb) {
    const dir = path.join(process.cwd(), "data");
    fs.mkdirSync(dir, { recursive: true });
    const db = new DatabaseSync(path.join(dir, "magister.sqlite"));
    db.exec("PRAGMA foreign_keys = ON");
    globalDb.magisterDb = db;
  }
  return globalDb.magisterDb;
}

export type Role = "ADMIN" | "MAGISTR";
export type AccountStatus = "PENDING" | "ACTIVE" | "REJECTED";

export type UserRow = {
  id: string;
  full_name: string;
  email: string;
  role: Role;
  phone: string | null;
  faculty: string | null;
  department: string | null;
  specialty: string | null;
  course: number | null;
  funding: string | null;
  account_status: AccountStatus;
  status_note: string | null;
};

export type DocumentRow = {
  id: string;
  owner_id: string;
  type: string;
  title: string;
  body: string;
  status: string;
  created_at: string;
  updated_at: string;
  owner_name?: string;
  faculty?: string | null;
  department?: string | null;
  course?: number | null;
  funding?: string | null;
  last_comment?: string | null;
  last_action?: string | null;
};

export type ReviewRow = {
  id: string;
  document_id: string;
  admin_id: string;
  admin_name: string;
  action: ReviewAction;
  comment: string;
  governance_ref?: string | null;
  created_at: string;
};

export type NewFile = {
  label: string;
  storedName: string;
  originalName: string;
  mime: string;
  size: number;
};

export type SubmissionFile = {
  id: string;
  round_id: string;
  label: string;
  original_name: string;
  mime: string | null;
  size: number;
  created_at: string;
};

export type SubmissionRound = {
  id: string;
  document_id: string;
  version: number;
  note: string;
  created_at: string;
  files: SubmissionFile[];
};

export type StoredFile = SubmissionFile & {
  stored_name: string;
  owner_id: string;
};

let ready: Promise<void> | null = null;

export function initDb() {
  if (!ready) {
    ready = Promise.resolve()
      .then(() => migrate())
      .catch((error) => {
        ready = null;
        throw error;
      });
  }
  return ready;
}

function seedCatalog(db: DatabaseSync, studentHash: string) {
  const insertUser = db.prepare(`
    INSERT INTO users (id, full_name, email, password_hash, role, phone, faculty, department, specialty, course, funding, created_at)
    VALUES (?, ?, ?, ?, 'MAGISTR', ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT (email) DO NOTHING
  `);
  const people: Array<[string, string, string, string, string, string, string, number, string, string]> = [
    ["44444444-4444-4444-8444-444444444444", "Rahimov Jasur", "rahimov@magister.local", "+998901110001", "Texnika", "Energetika", "Energetika", 1, "Grant", "2025-09-02T08:00:00.000Z"],
    ["55555555-5555-4555-8555-555555555555", "Saidova Madina", "saidova@magister.local", "+998901110002", "Pedagogika", "Pedagogika", "Pedagogika", 2, "Kontrakt", "2025-09-02T08:10:00.000Z"],
    ["66666666-6666-4666-8666-666666666666", "Tursunov Bekzod", "tursunov@magister.local", "+998901110003", "Yuridik", "Yurisprudensiya", "Yurisprudensiya", 1, "Grant", "2025-09-03T08:00:00.000Z"],
    ["77777777-7777-4777-8777-777777777777", "Eshonova Nilufar", "eshonova@magister.local", "+998901110004", "Iqtisodiyot", "Moliya", "Moliya", 2, "Grant", "2025-09-03T08:20:00.000Z"],
  ];
  for (const person of people) insertUser.run(person[0], person[1], person[2], studentHash, person[3], person[4], person[5], person[6], person[7], person[8], person[9]);

  const insertDoc = db.prepare(`
    INSERT OR IGNORE INTO documents (id, owner_id, type, title, body, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const docs: Array<[string, string, string, string, string, string, string]> = [
    ["ccccccc1-cccc-4ccc-8ccc-ccccccccccc1", "44444444-4444-4444-8444-444444444444", "PLAN", "Energetika kalendar rejasi", "O‘quv, laboratoriya va amaliyot bandlari semestr bo‘yicha yozilgan.", "APPROVED", "2025-10-04T09:00:00.000Z"],
    ["ccccccc2-cccc-4ccc-8ccc-ccccccccccc2", "44444444-4444-4444-8444-444444444444", "REPORT", "Oktabr oyi hisoboti", "Laboratoriya ishi topshirildi. Maqola hali tayyor emas.", "SUBMITTED", "2025-11-02T11:20:00.000Z"],
    ["ccccccc3-cccc-4ccc-8ccc-ccccccccccc3", "55555555-5555-4555-8555-555555555555", "DISSERTATION", "Pedagogik texnologiya mavzusi", "Mavzu: Boshlang‘ich sinfda baholash mezonlari.", "IN_REVIEW", "2025-11-12T14:00:00.000Z"],
    ["ccccccc4-cccc-4ccc-8ccc-ccccccccccc4", "55555555-5555-4555-8555-555555555555", "SOCIAL", "Ko‘ngillilar haftaligi", "Sertifikat ilova qilinmagan.", "REJECTED", "2025-10-20T10:00:00.000Z"],
    ["ccccccc5-cccc-4ccc-8ccc-ccccccccccc5", "66666666-6666-4666-8666-666666666666", "PRACTICE", "Yuridik klinika kundaligi", "Qoralama. Joy va rahbar hali yozilmagan.", "DRAFT", "2025-11-18T09:30:00.000Z"],
    ["ccccccc6-cccc-4ccc-8ccc-ccccccccccc6", "66666666-6666-4666-8666-666666666666", "PLAN", "1-kurs ish rejasi", "Dissertatsiya bosqichi muddatsiz qoldirilgan.", "REVISION", "2025-10-28T16:10:00.000Z"],
    ["ccccccc7-cccc-4ccc-8ccc-ccccccccccc7", "77777777-7777-4777-8777-777777777777", "REPORT", "Sentabr moliyaviy hisobot", "Uchta manba va seminar bayonnomasi ilova qilingan.", "APPROVED", "2025-10-08T12:00:00.000Z"],
    ["ccccccc8-cccc-4ccc-8ccc-ccccccccccc8", "77777777-7777-4777-8777-777777777777", "DISSERTATION", "Byudjet nazorati mavzusi", "Mavzu taklifi va dolzarblik yozilgan.", "SUBMITTED", "2025-11-21T08:40:00.000Z"],
    ["ccccccc9-cccc-4ccc-8ccc-ccccccccccc9", "77777777-7777-4777-8777-777777777777", "SOCIAL", "Ilmiy to‘garak", "Noyabr oyidagi to‘garak qatnashuvi, qoralama.", "DRAFT", "2025-11-22T08:40:00.000Z"],
    ["ccccccca-cccc-4ccc-8ccc-ccccccccccc0", "77777777-7777-4777-8777-777777777777", "ARTICLE", "Scopus: Moliya tizimida ekonometrik modellashtirish", "[ILMIY NASHR MA’LUMOTLARI]\nBaza: Scopus\nJurnal / To‘plam: Finance Research Letters\nJild / Son / Bet: 2025-yil, Vol. 56, 210-218-betlar\nDOI / Havola: https://doi.org/10.1016/j.frl.2025.104\nHammualliflar: dots. B. Qodirov", "APPROVED", "2025-11-05T10:00:00.000Z"],
  ];
  for (const doc of docs) insertDoc.run(doc[0], doc[1], doc[2], doc[3], doc[4], doc[5], doc[6], doc[6]);

  const insertReview = db.prepare(`
    INSERT OR IGNORE INTO reviews (id, document_id, admin_id, action, comment, governance_ref, created_at)
    VALUES (?, ?, '11111111-1111-4111-8111-111111111111', ?, ?, ?, ?)
  `);
  insertReview.run("ddddddd1-dddd-4ddd-8ddd-ddddddddddd1", "ccccccc1-cccc-4ccc-8ccc-ccccccccccc1", "APPROVE", "Beshta bo‘lim muddati bilan yozilgan. Kalendar reja qabul qilindi.", "Kafedra bayonnomasi №2, 02.10.2025", "2025-10-04T09:30:00.000Z");
  insertReview.run("ddddddd2-dddd-4ddd-8ddd-ddddddddddd2", "ccccccc4-cccc-4ccc-8ccc-ccccccccccc4", "REJECT", "Tasdiqlovchi sertifikat yo‘q. Hujjatni rad etaman.", null, "2025-10-20T10:20:00.000Z");
  insertReview.run("ddddddd3-dddd-4ddd-8ddd-ddddddddddd3", "ccccccc6-cccc-4ccc-8ccc-ccccccccccc6", "REVISION", "Dissertatsiya bosqichiga aniq oy yozib, qayta yuboring.", null, "2025-10-28T16:40:00.000Z");
  insertReview.run("ddddddd4-dddd-4ddd-8ddd-ddddddddddd4", "ccccccc7-cccc-4ccc-8ccc-ccccccccccc7", "APPROVE", "Manbalar va seminar bayonnomasi yetarli. Hisobot qabul qilindi.", "Kafedra bayonnomasi №3, 08.10.2025", "2025-10-08T12:30:00.000Z");
  insertReview.run("ddddddd5-dddd-4ddd-8ddd-ddddddddddd5", "ccccccca-cccc-4ccc-8ccc-ccccccccccc0", "APPROVE", "Xalqaro Scopus bazasida indekslangan ilmiy maqola to‘liq tasdiqlandi.", "Kafedra bayonnomasi №4, 05.11.2025", "2025-11-05T10:30:00.000Z");
}

function migrate() {
  const db = database();
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id text PRIMARY KEY,
      full_name text NOT NULL,
      email text UNIQUE NOT NULL,
      password_hash text NOT NULL,
      role text NOT NULL CHECK (role IN ('ADMIN', 'MAGISTR')),
      phone text,
      faculty text,
      department text,
      specialty text,
      course integer,
      funding text,
      created_at text NOT NULL
    );

    CREATE TABLE IF NOT EXISTS documents (
      id text PRIMARY KEY,
      owner_id text NOT NULL REFERENCES users(id),
      type text NOT NULL,
      title text NOT NULL,
      body text NOT NULL,
      status text NOT NULL CHECK (status IN ('DRAFT','SUBMITTED','IN_REVIEW','APPROVED','REVISION','REJECTED')),
      created_at text NOT NULL,
      updated_at text NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id text PRIMARY KEY,
      document_id text NOT NULL REFERENCES documents(id),
      admin_id text NOT NULL REFERENCES users(id),
      action text NOT NULL CHECK (action IN ('APPROVE','REJECT','REVISION')),
      comment text NOT NULL CHECK (length(trim(comment)) >= 3),
      created_at text NOT NULL
    );

    CREATE TABLE IF NOT EXISTS submission_rounds (
      id text PRIMARY KEY,
      document_id text NOT NULL REFERENCES documents(id),
      version integer NOT NULL,
      note text NOT NULL,
      created_at text NOT NULL
    );

    CREATE TABLE IF NOT EXISTS submission_files (
      id text PRIMARY KEY,
      round_id text NOT NULL REFERENCES submission_rounds(id),
      label text NOT NULL,
      stored_name text NOT NULL,
      original_name text NOT NULL,
      mime text,
      size integer NOT NULL,
      created_at text NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_events (
      id text PRIMARY KEY,
      created_at text NOT NULL,
      user_id text,
      user_name text,
      user_email text,
      role text,
      action text NOT NULL,
      path text,
      ip text,
      user_agent text,
      target text,
      ok integer NOT NULL,
      detail text
    );
    CREATE INDEX IF NOT EXISTS audit_events_created ON audit_events(created_at);

    CREATE TABLE IF NOT EXISTS faculties (
      id text PRIMARY KEY,
      name text NOT NULL UNIQUE,
      created_at text NOT NULL
    );
    CREATE TABLE IF NOT EXISTS departments (
      id text PRIMARY KEY,
      faculty_id text NOT NULL REFERENCES faculties(id),
      name text NOT NULL,
      created_at text NOT NULL,
      UNIQUE (faculty_id, name)
    );
    CREATE TABLE IF NOT EXISTS specialties (
      id text PRIMARY KEY,
      department_id text NOT NULL REFERENCES departments(id),
      name text NOT NULL,
      created_at text NOT NULL,
      UNIQUE (department_id, name)
    );
  `);

  const userColumns = new Set(
    (db.prepare(`PRAGMA table_info(users)`).all() as Array<{ name: string }>).map((column) => column.name),
  );
  if (!userColumns.has("account_status")) {
    db.exec(
      `ALTER TABLE users ADD COLUMN account_status text NOT NULL DEFAULT 'ACTIVE' CHECK (account_status IN ('PENDING', 'ACTIVE', 'REJECTED'))`,
    );
  }
  if (!userColumns.has("status_note")) {
    db.exec(`ALTER TABLE users ADD COLUMN status_note text`);
  }

  const reviewColumns = new Set(
    (db.prepare(`PRAGMA table_info(reviews)`).all() as Array<{ name: string }>).map((column) => column.name),
  );
  if (!reviewColumns.has("governance_ref")) {
    db.exec(`ALTER TABLE reviews ADD COLUMN governance_ref text`);
  }

  const now = new Date().toISOString();
  const adminHash = bcrypt.hashSync("Admin123!", 10);
  const studentHash = bcrypt.hashSync("Magistr123!", 10);
  const insertUser = db.prepare(`
    INSERT INTO users (id, full_name, email, password_hash, role, phone, faculty, department, specialty, course, funding, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT (email) DO NOTHING
  `);
  insertUser.run("11111111-1111-4111-8111-111111111111", "Nodira Karimova", "admin@magister.local", adminHash, "ADMIN", "+998901112233", "Magistratura bo‘limi", null, null, null, null, now);
  insertUser.run("22222222-2222-4222-8222-222222222222", "Aliyev Akmal", "aliyev@magister.local", studentHash, "MAGISTR", "+998907770011", "Iqtisodiyot", "Menejment", "Menejment", 1, "Grant", now);
  insertUser.run("33333333-3333-4333-8333-333333333333", "Karimova Dilnoza", "karimova@magister.local", studentHash, "MAGISTR", "+998907770022", "Filologiya", "Adabiyot", "Adabiyotshunoslik", 2, "Kontrakt", now);

  const count = db.prepare("SELECT count(*) AS count FROM documents").get() as { count: number };
  if (count.count === 0) {

  const insertDoc = db.prepare(`
    INSERT INTO documents (id, owner_id, type, title, body, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertDoc.run(
    "aaaaaaa1-aaaa-4aaa-8aaa-aaaaaaaaaaa1",
    "22222222-2222-4222-8222-222222222222",
    "PLAN",
    "1-kurs kalendar ish rejasi",
    "O‘quv-metodik ishlar: sentabr–oktabr fanlar bo‘yicha konspekt.\nIlmiy-tadqiqot: mavzu bo‘yicha 15 ta manba kartotekasi.\nIlmiy-pedagogik: 2 ta seminar.\nPedagogik amaliyot: noyabr, 3-maktab.\nDissertatsiya: kirish qoralamasi dekabrda.",
    "SUBMITTED",
    now,
    now,
  );
  insertDoc.run(
    "aaaaaaa2-aaaa-4aaa-8aaa-aaaaaaaaaaa2",
    "22222222-2222-4222-8222-222222222222",
    "REPORT",
    "Sentabr oyi hisoboti",
    "1-band bajarildi: 4 ta manba o‘qildi.\n2-band natijasi hali yozilmagan.\nSeminar 12-sentabrda o‘tildi.",
    "REVISION",
    now,
    now,
  );
  insertDoc.run(
    "aaaaaaa3-aaaa-4aaa-8aaa-aaaaaaaaaaa3",
    "22222222-2222-4222-8222-222222222222",
    "PRACTICE",
    "Pedagogik amaliyot kundaligi",
    "Amaliyot joyi hali tasdiqlanmagan. Kundalik keyinroq to‘ldiriladi.",
    "DRAFT",
    now,
    now,
  );
  insertDoc.run(
    "aaaaaaa4-aaaa-4aaa-8aaa-aaaaaaaaaaa4",
    "33333333-3333-4333-8333-333333333333",
    "DISSERTATION",
    "Mavzu taklifi",
    "Mavzu: Zamonaviy o‘zbek romanida shahar obrazi.\nDolzarblik: shahar makoni adabiy qahramonning tanloviga ta’sir qiladi.\nMaqsad: 1991-yildan keyingi romanlarda shahar obrazini tahlil qilish.",
    "SUBMITTED",
    now,
    now,
  );
  insertDoc.run(
    "aaaaaaa5-aaaa-4aaa-8aaa-aaaaaaaaaaa5",
    "33333333-3333-4333-8333-333333333333",
    "SOCIAL",
    "Xalqaro konferensiya ishtiroki",
    "Toshkentdagi filologiya anjumanida tezis bilan qatnashdim. Sertifikat ilova qilinadi.",
    "APPROVED",
    now,
    now,
  );
  insertDoc.run(
    "aaaaaaa6-aaaa-4aaa-8aaa-aaaaaaaaaaa6",
    "22222222-2222-4222-8222-222222222222",
    "ARTICLE",
    "Scopus: Raqamli iqtisodiyotda intellektual boshqaruv tizimlari",
    "[ILMIY NASHR MA’LUMOTLARI]\nBaza: Scopus\nJurnal / To‘plam: International Journal of Information Management\nJild / Son / Bet: 2025-yil, Vol. 48, 112-124-betlar\nDOI / Havola: https://doi.org/10.1016/j.ijinfomgt.2025.102\nHammualliflar: dots. A. Karimov",
    "APPROVED",
    now,
    now,
  );

  const insertReview = db.prepare(`
    INSERT INTO reviews (id, document_id, admin_id, action, comment, governance_ref, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  insertReview.run(
    "bbbbbbb1-bbbb-4bbb-8bbb-bbbbbbbbbbb1",
    "aaaaaaa2-aaaa-4aaa-8aaa-aaaaaaaaaaa2",
    "11111111-1111-4111-8111-111111111111",
    "REVISION",
    "Oylik hisobotda 2-band natijasi yozilmagan. Shu bandni to‘ldirib, qayta yuboring.",
    null,
    now,
  );
  insertReview.run(
    "bbbbbbb2-bbbb-4bbb-8bbb-bbbbbbbbbbb2",
    "aaaaaaa5-aaaa-4aaa-8aaa-aaaaaaaaaaa5",
    "11111111-1111-4111-8111-111111111111",
    "APPROVE",
    "Konferensiya sertifikati qabul qilindi. Ijtimoiy faoliyat tasdiqlandi.",
    "Kafedra bayonnomasi №1, 15.09.2025",
    now,
  );
  insertReview.run(
    "bbbbbbb3-bbbb-4bbb-8bbb-bbbbbbbbbbb3",
    "aaaaaaa6-aaaa-4aaa-8aaa-aaaaaaaaaaa6",
    "11111111-1111-4111-8111-111111111111",
    "APPROVE",
    "Xalqaro Scopus bazasida indekslangan ilmiy maqola Nizom 36-son bo‘yicha to‘liq tasdiqlandi.",
    "Kafedra bayonnomasi №3, 14.10.2025",
    now,
  );
  }
  seedCatalog(db, studentHash);
  seedOrg(db);
}

const USER_COLUMNS = `id, full_name, email, role, phone, faculty, department, specialty, course, funding, account_status, status_note`;

export async function findUserByEmail(email: string) {
  await initDb();
  const row = database()
    .prepare(`SELECT ${USER_COLUMNS}, password_hash FROM users WHERE email = ?`)
    .get(email.trim().toLowerCase()) as (UserRow & { password_hash: string }) | undefined;
  return row ?? null;
}

export async function registerMagistr(input: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  faculty: string;
  department: string;
  specialty: string;
  course: number;
  funding: string;
}) {
  await initDb();
  const email = input.email.trim().toLowerCase();
  const existing = await findUserByEmail(email);
  if (existing) return { error: "Bu email allaqachon ro‘yxatdan o‘tgan." as const };
  const id = crypto.randomUUID();
  database()
    .prepare(
      `INSERT INTO users (id, full_name, email, password_hash, role, phone, faculty, department, specialty, course, funding, account_status, created_at)
       VALUES (?, ?, ?, ?, 'MAGISTR', ?, ?, ?, ?, ?, ?, 'PENDING', ?)`,
    )
    .run(
      id,
      input.fullName.trim(),
      email,
      bcrypt.hashSync(input.password, 10),
      input.phone.trim(),
      input.faculty.trim(),
      input.department.trim(),
      input.specialty.trim(),
      input.course,
      input.funding,
      new Date().toISOString(),
    );
  return { id, role: "MAGISTR" as const, account_status: "PENDING" as const };
}

export type AccountRequest = UserRow & { created_at: string };

export async function listAccountsByStatus(status: "PENDING" | "REJECTED") {
  await initDb();
  return database()
    .prepare(
      `SELECT ${USER_COLUMNS}, created_at FROM users WHERE role = 'MAGISTR' AND account_status = ? ORDER BY created_at DESC`,
    )
    .all(status) as unknown as AccountRequest[];
}

export async function countPendingAccounts() {
  await initDb();
  const row = database()
    .prepare(`SELECT count(*) AS n FROM users WHERE role = 'MAGISTR' AND account_status = 'PENDING'`)
    .get() as { n: number };
  return Number(row?.n ?? 0);
}

export async function decideAccount(input: { id: string; action: "APPROVE" | "REJECT"; note: string }) {
  await initDb();
  const note = input.note.trim();
  if (note.length < 3) return { error: "Komment kamida 3 ta belgidan iborat bo‘lsin." as const };
  const row = database()
    .prepare(`SELECT role, account_status FROM users WHERE id = ?`)
    .get(input.id) as { role: string; account_status: AccountStatus } | undefined;
  if (!row || row.role !== "MAGISTR") return { error: "So‘rov topilmadi." as const };
  if (input.action === "APPROVE") {
    if (row.account_status === "ACTIVE") return { error: "Hisob allaqachon ochiq." as const };
    database().prepare(`UPDATE users SET account_status = 'ACTIVE', status_note = ? WHERE id = ?`).run(note, input.id);
    return { ok: true as const };
  }
  if (row.account_status !== "PENDING") return { error: "Bu so‘rovni rad etib bo‘lmaydi." as const };
  database().prepare(`UPDATE users SET account_status = 'REJECTED', status_note = ? WHERE id = ?`).run(note, input.id);
  return { ok: true as const };
}

export async function updateOwnProfile(
  user: UserRow,
  input: {
    fullName: string;
    email: string;
    phone: string;
    faculty?: string;
    department?: string;
    specialty?: string;
    course?: number;
    funding?: string;
  },
) {
  await initDb();
  const email = input.email.trim().toLowerCase();
  const taken = database().prepare(`SELECT id FROM users WHERE email = ? AND id <> ?`).get(email, user.id) as
    | { id: string }
    | undefined;
  if (taken) return { error: "Bu email allaqachon ishlatilgan." as const };
  if (user.role === "ADMIN") {
    database()
      .prepare(`UPDATE users SET full_name = ?, email = ?, phone = ? WHERE id = ?`)
      .run(input.fullName.trim(), email, input.phone.trim() || null, user.id);
    return { ok: true as const };
  }
  database()
    .prepare(
      `UPDATE users SET full_name = ?, email = ?, phone = ?, faculty = ?, department = ?, specialty = ?, course = ?, funding = ? WHERE id = ? AND account_status = 'ACTIVE'`,
    )
    .run(
      input.fullName.trim(),
      email,
      input.phone.trim(),
      input.faculty?.trim() ?? "",
      input.department?.trim() ?? "",
      input.specialty?.trim() ?? "",
      input.course ?? null,
      input.funding ?? "",
      user.id,
    );
  return { ok: true as const };
}

export async function changeOwnPassword(userId: string, currentPassword: string, nextPassword: string) {
  await initDb();
  const row = database().prepare(`SELECT password_hash FROM users WHERE id = ?`).get(userId) as
    | { password_hash: string }
    | undefined;
  if (!row || !bcrypt.compareSync(currentPassword, row.password_hash)) {
    return { error: "Joriy parol noto‘g‘ri." as const };
  }
  database().prepare(`UPDATE users SET password_hash = ? WHERE id = ?`).run(bcrypt.hashSync(nextPassword, 10), userId);
  return { ok: true as const };
}

export type AuditInput = {
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  role: string | null;
  action: string;
  path: string | null;
  ip: string;
  userAgent: string;
  target: string | null;
  ok: boolean;
  detail: string | null;
};

export async function insertAudit(input: AuditInput) {
  await initDb();
  const db = database();
  const now = new Date().toISOString();
  if (input.action === "PAGE_VIEW") {
    const since = new Date(Date.now() - 90_000).toISOString();
    const existing = db
      .prepare(
        `SELECT id FROM audit_events WHERE action = 'PAGE_VIEW' AND ifnull(path, '') = ? AND ifnull(user_id, '') = ? AND ifnull(ip, '') = ? AND created_at >= ?`,
      )
      .get(input.path ?? "", input.userId ?? "", input.ip, since);
    if (existing) return;
  }
  db.prepare(
    `INSERT INTO audit_events (id, created_at, user_id, user_name, user_email, role, action, path, ip, user_agent, target, ok, detail)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    crypto.randomUUID(),
    now,
    input.userId,
    input.userName,
    input.userEmail,
    input.role,
    input.action,
    input.path,
    input.ip,
    input.userAgent.slice(0, 180),
    input.target,
    input.ok ? 1 : 0,
    input.detail,
  );
}

export type AuditEvent = {
  id: string;
  created_at: string;
  user_id: string | null;
  user_name: string | null;
  user_email: string | null;
  role: string | null;
  action: string;
  path: string | null;
  ip: string | null;
  user_agent: string | null;
  target: string | null;
  ok: number;
  detail: string | null;
};

export async function queryAudit(input: {
  from: string;
  to: string;
  q: string;
  role: string;
  action: string;
  ip: string;
  path: string;
  ok: string;
}) {
  await initDb();
  const where = ["created_at >= ?", "created_at < ?"];
  const args: Array<string | number> = [input.from, input.to];
  if (input.q) {
    where.push("(ifnull(user_name, '') LIKE ? OR ifnull(user_email, '') LIKE ? OR ifnull(detail, '') LIKE ?)");
    const like = `%${input.q}%`;
    args.push(like, like, like);
  }
  if (input.role === "ADMIN" || input.role === "MAGISTR") {
    where.push("role = ?");
    args.push(input.role);
  }
  if (input.action) {
    where.push("action = ?");
    args.push(input.action);
  }
  if (input.ip) {
    where.push("ifnull(ip, '') LIKE ?");
    args.push(`%${input.ip}%`);
  }
  if (input.path) {
    where.push("ifnull(path, '') LIKE ?");
    args.push(`%${input.path}%`);
  }
  if (input.ok === "1" || input.ok === "0") {
    where.push("ok = ?");
    args.push(Number(input.ok));
  }
  return database()
    .prepare(`SELECT * FROM audit_events WHERE ${where.join(" AND ")} ORDER BY created_at DESC LIMIT 200`)
    .all(...args) as unknown as AuditEvent[];
}

export type DashDoc = {
  id: string;
  type: string;
  status: string;
  title: string;
  created_at: string;
  owner_name: string;
  faculty: string | null;
  specialty: string | null;
  funding: string | null;
  course: number | null;
};

export type DashReview = {
  created_at: string;
  action: string;
  comment: string;
  admin_name: string;
  title: string;
  doc_created: string;
  owner_name: string;
  faculty: string | null;
  specialty: string | null;
};

export type DashPerson = {
  full_name: string;
  faculty: string | null;
  specialty: string | null;
  course: number | null;
  funding: string | null;
  account_status: string;
  created_at: string;
};

export async function loadDashSource() {
  await initDb();
  const db = database();
  const docs = db
    .prepare(
      `SELECT d.id, d.type, d.status, d.title, d.created_at, u.full_name AS owner_name, u.faculty, u.specialty, u.funding, u.course
       FROM documents d JOIN users u ON u.id = d.owner_id`,
    )
    .all() as unknown as DashDoc[];
  const reviews = db
    .prepare(
      `SELECT r.created_at, r.action, r.comment, a.full_name AS admin_name, d.title, d.created_at AS doc_created,
              u.full_name AS owner_name, u.faculty, u.specialty
       FROM reviews r
       JOIN users a ON a.id = r.admin_id
       JOIN documents d ON d.id = r.document_id
       JOIN users u ON u.id = d.owner_id`,
    )
    .all() as unknown as DashReview[];
  const people = db
    .prepare(
      `SELECT full_name, faculty, specialty, course, funding, account_status, created_at FROM users WHERE role = 'MAGISTR'`,
    )
    .all() as unknown as DashPerson[];
  return { docs, reviews, people };
}

export async function findUserById(id: string) {
  await initDb();
  return (database().prepare(`SELECT ${USER_COLUMNS} FROM users WHERE id = ?`).get(id) as UserRow | undefined) ?? null;
}

export async function listStudents() {
  await initDb();
  return database().prepare(`SELECT ${USER_COLUMNS} FROM users WHERE role = 'MAGISTR' ORDER BY full_name`).all() as unknown as UserRow[];
}

const DOCUMENT_SELECT = `
  SELECT d.id, d.owner_id, d.type, d.title, d.body, d.status, d.created_at, d.updated_at,
         u.full_name AS owner_name, u.faculty, u.department, u.course, u.funding,
         (SELECT comment FROM reviews r WHERE r.document_id = d.id ORDER BY r.created_at DESC LIMIT 1) AS last_comment,
         (SELECT action FROM reviews r WHERE r.document_id = d.id ORDER BY r.created_at DESC LIMIT 1) AS last_action
  FROM documents d
  JOIN users u ON u.id = d.owner_id
`;

export type DocQuery = {
  ownerId?: string;
  q?: string;
  status?: string;
  type?: string;
  faculty?: string;
  course?: string;
  funding?: string;
};

export async function queryDocuments(filter: DocQuery = {}) {
  await initDb();
  const where: string[] = [];
  const args: Array<string | number> = [];
  if (filter.ownerId) {
    where.push("d.owner_id = ?");
    args.push(filter.ownerId);
  }
  if (filter.status) {
    where.push("d.status = ?");
    args.push(filter.status);
  }
  if (filter.type) {
    where.push("d.type = ?");
    args.push(filter.type);
  }
  if (filter.faculty) {
    where.push("u.faculty = ?");
    args.push(filter.faculty);
  }
  if (filter.course) {
    where.push("u.course = ?");
    args.push(Number(filter.course));
  }
  if (filter.funding) {
    where.push("u.funding = ?");
    args.push(filter.funding);
  }
  if (filter.q) {
    where.push("(d.title LIKE ? OR d.body LIKE ? OR u.full_name LIKE ? OR ifnull(u.specialty, '') LIKE ?)");
    const like = `%${filter.q}%`;
    args.push(like, like, like, like);
  }
  const sql = `${DOCUMENT_SELECT} ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY d.updated_at DESC`;
  return database().prepare(sql).all(...args) as unknown as DocumentRow[];
}

export async function listFaculties() {
  await initDb();
  return database().prepare(`SELECT name AS faculty FROM faculties ORDER BY name`).all() as unknown as { faculty: string }[];
}

export type OrgSpecialty = { id: string; name: string };
export type OrgDepartment = { id: string; name: string; specialties: OrgSpecialty[] };
export type OrgFaculty = { id: string; name: string; departments: OrgDepartment[] };

function seedOrg(db: DatabaseSync) {
  const now = new Date().toISOString();
  const insertFaculty = db.prepare(`INSERT OR IGNORE INTO faculties (id, name, created_at) VALUES (?, ?, ?)`);
  const findFaculty = db.prepare(`SELECT id FROM faculties WHERE name = ?`);
  const insertDepartment = db.prepare(`INSERT OR IGNORE INTO departments (id, faculty_id, name, created_at) VALUES (?, ?, ?, ?)`);
  const findDepartment = db.prepare(`SELECT id FROM departments WHERE faculty_id = ? AND name = ?`);
  const insertSpecialty = db.prepare(`INSERT OR IGNORE INTO specialties (id, department_id, name, created_at) VALUES (?, ?, ?, ?)`);
  for (const name of FACULTIES) insertFaculty.run(crypto.randomUUID(), name, now);
  const people = db
    .prepare(`SELECT faculty, department, specialty FROM users WHERE role = 'MAGISTR'`)
    .all() as Array<{ faculty: string | null; department: string | null; specialty: string | null }>;
  for (const person of people) {
    const faculty = person.faculty?.trim() ?? "";
    if (faculty.length < 2) continue;
    insertFaculty.run(crypto.randomUUID(), faculty, now);
    const facultyId = (findFaculty.get(faculty) as { id: string }).id;
    const department = person.department?.trim() ?? "";
    if (department.length < 2) continue;
    insertDepartment.run(crypto.randomUUID(), facultyId, department, now);
    const departmentId = (findDepartment.get(facultyId, department) as { id: string }).id;
    const specialty = person.specialty?.trim() ?? "";
    if (specialty.length < 2) continue;
    insertSpecialty.run(crypto.randomUUID(), departmentId, specialty, now);
  }
}

export async function loadOrg() {
  await initDb();
  const db = database();
  const faculties = db.prepare(`SELECT id, name FROM faculties ORDER BY name`).all() as Array<{ id: string; name: string }>;
  const departments = db.prepare(`SELECT id, faculty_id, name FROM departments ORDER BY name`).all() as Array<{
    id: string;
    faculty_id: string;
    name: string;
  }>;
  const specialties = db.prepare(`SELECT id, department_id, name FROM specialties ORDER BY name`).all() as Array<{
    id: string;
    department_id: string;
    name: string;
  }>;
  return faculties.map((faculty) => ({
    id: faculty.id,
    name: faculty.name,
    departments: departments
      .filter((department) => department.faculty_id === faculty.id)
      .map((department) => ({
        id: department.id,
        name: department.name,
        specialties: specialties
          .filter((specialty) => specialty.department_id === department.id)
          .map((specialty) => ({ id: specialty.id, name: specialty.name })),
      })),
  })) satisfies OrgFaculty[];
}

export async function orgLinked(faculty: string, department: string, specialty: string) {
  await initDb();
  const row = database()
    .prepare(
      `SELECT s.id FROM specialties s
       JOIN departments d ON d.id = s.department_id
       JOIN faculties f ON f.id = d.faculty_id
       WHERE f.name = ? AND d.name = ? AND s.name = ?`,
    )
    .get(faculty, department, specialty);
  return Boolean(row);
}

export async function addOrgItem(input: { kind: "faculty" | "department" | "specialty"; name: string; parentId?: string }) {
  await initDb();
  const name = input.name.trim();
  if (name.length < 2) return { error: "Nom kamida 2 ta belgidan iborat bo‘lsin." as const };
  const db = database();
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  try {
    if (input.kind === "faculty") {
      db.prepare(`INSERT INTO faculties (id, name, created_at) VALUES (?, ?, ?)`).run(id, name, now);
    } else if (input.kind === "department") {
      if (!input.parentId) return { error: "Avval fakultetni tanlang." as const };
      db.prepare(`INSERT INTO departments (id, faculty_id, name, created_at) VALUES (?, ?, ?, ?)`).run(id, input.parentId, name, now);
    } else {
      if (!input.parentId) return { error: "Avval kafedrani tanlang." as const };
      db.prepare(`INSERT INTO specialties (id, department_id, name, created_at) VALUES (?, ?, ?, ?)`).run(id, input.parentId, name, now);
    }
  } catch {
    return { error: "Bu nom allaqachon bor." as const };
  }
  return { id };
}

export async function removeOrgItem(input: { kind: "faculty" | "department" | "specialty"; id: string }) {
  await initDb();
  const db = database();
  if (input.kind === "faculty") {
    const faculty = db.prepare(`SELECT name FROM faculties WHERE id = ?`).get(input.id) as { name: string } | undefined;
    if (!faculty) return { error: "Fakultet topilmadi." as const };
    const used = db.prepare(`SELECT count(*) AS count FROM users WHERE faculty = ?`).get(faculty.name) as { count: number };
    const children = db.prepare(`SELECT count(*) AS count FROM departments WHERE faculty_id = ?`).get(input.id) as { count: number };
    if (used.count || children.count) return { error: "Avval kafedralar va shu fakultetdagi talabalar bo‘lmasligi kerak." as const };
    db.prepare(`DELETE FROM faculties WHERE id = ?`).run(input.id);
  } else if (input.kind === "department") {
    const department = db.prepare(
      `SELECT d.name, f.name AS faculty FROM departments d JOIN faculties f ON f.id = d.faculty_id WHERE d.id = ?`,
    ).get(input.id) as { name: string; faculty: string } | undefined;
    if (!department) return { error: "Kafedra topilmadi." as const };
    const used = db.prepare(`SELECT count(*) AS count FROM users WHERE faculty = ? AND department = ?`).get(department.faculty, department.name) as { count: number };
    const children = db.prepare(`SELECT count(*) AS count FROM specialties WHERE department_id = ?`).get(input.id) as { count: number };
    if (used.count || children.count) return { error: "Avval mutaxassisliklar va shu kafedradagi talabalar bo‘lmasligi kerak." as const };
    db.prepare(`DELETE FROM departments WHERE id = ?`).run(input.id);
  } else {
    const specialty = db.prepare(
      `SELECT s.name, d.name AS department, f.name AS faculty
       FROM specialties s JOIN departments d ON d.id = s.department_id JOIN faculties f ON f.id = d.faculty_id
       WHERE s.id = ?`,
    ).get(input.id) as { name: string; department: string; faculty: string } | undefined;
    if (!specialty) return { error: "Mutaxassislik topilmadi." as const };
    const used = db.prepare(`SELECT count(*) AS count FROM users WHERE faculty = ? AND department = ? AND specialty = ?`).get(
      specialty.faculty,
      specialty.department,
      specialty.name,
    ) as { count: number };
    if (used.count) return { error: "Bu mutaxassislikda talaba bor. O‘chirib bo‘lmaydi." as const };
    db.prepare(`DELETE FROM specialties WHERE id = ?`).run(input.id);
  }
  return { ok: true as const };
}

export type StudentStat = UserRow & {
  docs: number;
  awaiting: number;
  approved: number;
  revision: number;
};

export async function queryStudents(filter: { q?: string; faculty?: string; course?: string; funding?: string } = {}) {
  await initDb();
  const where = ["u.role = 'MAGISTR'", "u.account_status = 'ACTIVE'"];
  const args: Array<string | number> = [];
  if (filter.faculty) {
    where.push("u.faculty = ?");
    args.push(filter.faculty);
  }
  if (filter.course) {
    where.push("u.course = ?");
    args.push(Number(filter.course));
  }
  if (filter.funding) {
    where.push("u.funding = ?");
    args.push(filter.funding);
  }
  if (filter.q) {
    where.push("(u.full_name LIKE ? OR u.email LIKE ? OR ifnull(u.specialty, '') LIKE ? OR ifnull(u.department, '') LIKE ?)");
    const like = `%${filter.q}%`;
    args.push(like, like, like, like);
  }
  return database()
    .prepare(`
      SELECT ${USER_COLUMNS.split(", ").map((column) => `u.${column}`).join(", ")},
        (SELECT count(*) FROM documents d WHERE d.owner_id = u.id) AS docs,
        (SELECT count(*) FROM documents d WHERE d.owner_id = u.id AND d.status IN ('SUBMITTED','IN_REVIEW')) AS awaiting,
        (SELECT count(*) FROM documents d WHERE d.owner_id = u.id AND d.status = 'APPROVED') AS approved,
        (SELECT count(*) FROM documents d WHERE d.owner_id = u.id AND d.status = 'REVISION') AS revision
      FROM users u
      WHERE ${where.join(" AND ")}
      ORDER BY u.faculty, u.full_name
    `)
    .all(...args) as unknown as StudentStat[];
}

export async function listDocumentsByOwner(ownerId: string) {
  await initDb();
  return database().prepare(`${DOCUMENT_SELECT} WHERE d.owner_id = ? ORDER BY d.updated_at DESC`).all(ownerId) as unknown as DocumentRow[];
}

export async function listQueue() {
  await initDb();
  return database()
    .prepare(`${DOCUMENT_SELECT} WHERE d.status IN ('SUBMITTED', 'IN_REVIEW') ORDER BY d.updated_at ASC`)
    .all() as unknown as DocumentRow[];
}

export async function listRecentReviews() {
  await initDb();
  return database()
    .prepare(`
      SELECT r.id, r.document_id, r.admin_id, a.full_name AS admin_name,
             r.action, r.comment, r.governance_ref, r.created_at, d.title, u.full_name AS owner_name
      FROM reviews r
      JOIN users a ON a.id = r.admin_id
      JOIN documents d ON d.id = r.document_id
      JOIN users u ON u.id = d.owner_id
      ORDER BY r.created_at DESC
      LIMIT 8
    `)
    .all() as unknown as (ReviewRow & { title: string; owner_name: string })[];
}

export async function getDocument(id: string) {
  await initDb();
  return (database().prepare(`${DOCUMENT_SELECT} WHERE d.id = ?`).get(id) as DocumentRow | undefined) ?? null;
}

export async function listReviews(documentId: string) {
  await initDb();
  return database()
    .prepare(`
      SELECT r.id, r.document_id, r.admin_id, a.full_name AS admin_name, r.action, r.comment, r.governance_ref, r.created_at
      FROM reviews r
      JOIN users a ON a.id = r.admin_id
      WHERE r.document_id = ?
      ORDER BY r.created_at ASC
    `)
    .all(documentId) as unknown as ReviewRow[];
}

export async function createDocument(input: {
  ownerId: string;
  type: string;
  title: string;
  body: string;
  submit: boolean;
}) {
  await initDb();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  database()
    .prepare(`INSERT INTO documents (id, owner_id, type, title, body, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, input.ownerId, input.type, input.title.trim(), input.body.trim(), input.submit ? "SUBMITTED" : "DRAFT", now, now);
  return id;
}

export async function updateDocument(input: {
  id: string;
  ownerId: string;
  title: string;
  body: string;
  submit: boolean;
}) {
  await initDb();
  const existing = await getDocument(input.id);
  if (!existing || existing.owner_id !== input.ownerId) return { error: "Hujjat topilmadi" };
  if (existing.status !== "DRAFT" && existing.status !== "REVISION") {
    return { error: "Bu hujjatni tahrirlab bo‘lmaydi" };
  }
  const status = input.submit ? "SUBMITTED" : existing.status;
  database()
    .prepare(`UPDATE documents SET title = ?, body = ?, status = ?, updated_at = ? WHERE id = ? AND owner_id = ?`)
    .run(input.title.trim(), input.body.trim(), status, new Date().toISOString(), input.id, input.ownerId);
  return { ok: true as const };
}

export async function markInReview(id: string) {
  await initDb();
  database()
    .prepare(`UPDATE documents SET status = 'IN_REVIEW', updated_at = ? WHERE id = ? AND status = 'SUBMITTED'`)
    .run(new Date().toISOString(), id);
}

export class ReviewError extends Error {}

export async function reviewDocument(input: {
  documentId: string;
  adminId: string;
  action: ReviewAction;
  comment: string;
  governanceRef?: string;
}) {
  await initDb();
  const comment = input.comment.trim();
  const governanceRef = input.governanceRef?.trim() || null;
  if (comment.length < 3) throw new ReviewError("Qaror faqat komment bilan saqlanadi.");
  if (!["APPROVE", "REJECT", "REVISION"].includes(input.action)) throw new ReviewError("Noto‘g‘ri qaror.");
  const status = input.action === "APPROVE" ? "APPROVED" : input.action === "REJECT" ? "REJECTED" : "REVISION";
  const db = database();
  db.exec("BEGIN");
  try {
    const current = db.prepare(`SELECT status FROM documents WHERE id = ?`).get(input.documentId) as { status: string } | undefined;
    if (!current) throw new ReviewError("Hujjat topilmadi.");
    if (current.status !== "SUBMITTED" && current.status !== "IN_REVIEW") {
      throw new ReviewError("Bu hujjat qaror kutmayapti.");
    }
    db.prepare(`INSERT INTO reviews (id, document_id, admin_id, action, comment, governance_ref, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(
      crypto.randomUUID(),
      input.documentId,
      input.adminId,
      input.action,
      comment,
      governanceRef,
      new Date().toISOString(),
    );
    db.prepare(`UPDATE documents SET status = ?, updated_at = ? WHERE id = ?`).run(status, new Date().toISOString(), input.documentId);
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

function rejectFiles(files: NewFile[]) {
  if (files.length < 1) return "Kamida bitta fayl biriktiring.";
  if (files.length > 30) return "Bir yuborishda 30 tadan oshiq fayl biriktirilmaydi.";
  if (files.some((file) => file.label.trim().length < 2)) return "Har bir faylga nom yozing.";
  return "";
}

export async function listRounds(documentId: string) {
  await initDb();
  const rounds = database()
    .prepare(`SELECT id, document_id, version, note, created_at FROM submission_rounds WHERE document_id = ? ORDER BY version ASC`)
    .all(documentId) as unknown as Omit<SubmissionRound, "files">[];
  const files = database()
    .prepare(
      `SELECT f.id, f.round_id, f.label, f.original_name, f.mime, f.size, f.created_at
       FROM submission_files f
       JOIN submission_rounds r ON r.id = f.round_id
       WHERE r.document_id = ?
       ORDER BY f.created_at ASC`,
    )
    .all(documentId) as unknown as SubmissionFile[];
  return rounds.map((round) => ({
    ...round,
    files: files.filter((file) => file.round_id === round.id),
  }));
}

export async function getStoredFile(id: string) {
  await initDb();
  return (
    (database()
      .prepare(
        `SELECT f.id, f.round_id, f.label, f.stored_name, f.original_name, f.mime, f.size, f.created_at, d.owner_id
         FROM submission_files f
         JOIN submission_rounds r ON r.id = f.round_id
         JOIN documents d ON d.id = r.document_id
         WHERE f.id = ?`,
      )
      .get(id) as StoredFile | undefined) ?? null
  );
}

function insertRound(db: DatabaseSync, documentId: string, version: number, note: string, createdAt: string, files: NewFile[]) {
  const roundId = crypto.randomUUID();
  db.prepare(`INSERT INTO submission_rounds (id, document_id, version, note, created_at) VALUES (?, ?, ?, ?, ?)`).run(
    roundId,
    documentId,
    version,
    note,
    createdAt,
  );
  const insertFile = db.prepare(
    `INSERT INTO submission_files (id, round_id, label, stored_name, original_name, mime, size, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  for (const file of files) {
    insertFile.run(crypto.randomUUID(), roundId, file.label.trim(), file.storedName, file.originalName, file.mime, file.size, createdAt);
  }
}

export async function createAriza(input: { ownerId: string; type: string; title: string; note: string; files: NewFile[] }) {
  await initDb();
  const title = input.title.trim();
  const note = input.note.trim();
  if (title.length < 3) return { error: "Ariza nomi kamida 3 ta belgidan iborat bo‘lsin." as const };
  const fileError = rejectFiles(input.files);
  if (fileError) return { error: fileError as "Kamida bitta fayl biriktiring." };
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const db = database();
  db.exec("BEGIN");
  try {
    db.prepare(`INSERT INTO documents (id, owner_id, type, title, body, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 'SUBMITTED', ?, ?)`).run(
      id,
      input.ownerId,
      input.type,
      title,
      note,
      now,
      now,
    );
    insertRound(db, id, 1, note, now, input.files);
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
  return { id };
}

export async function resubmitAriza(input: { id: string; ownerId: string; type: string; title: string; note: string; files: NewFile[] }) {
  await initDb();
  const title = input.title.trim();
  const note = input.note.trim();
  if (title.length < 3) return { error: "Ariza nomi kamida 3 ta belgidan iborat bo‘lsin." as const };
  const fileError = rejectFiles(input.files);
  if (fileError) return { error: fileError };
  const existing = await getDocument(input.id);
  if (!existing || existing.owner_id !== input.ownerId) return { error: "Ariza topilmadi." as const };
  if (existing.status !== "DRAFT" && existing.status !== "REVISION") {
    return { error: "Bu arizani hozir qayta yuborib bo‘lmaydi." as const };
  }
  const db = database();
  const current = db.prepare(`SELECT COALESCE(MAX(version), 0) AS version FROM submission_rounds WHERE document_id = ?`).get(input.id) as {
    version: number;
  };
  const now = new Date().toISOString();
  db.exec("BEGIN");
  try {
    let version = current.version;
    if (version === 0 && existing.body.trim()) {
      version = 1;
      insertRound(db, input.id, version, existing.body.trim(), existing.created_at, []);
    }
    version += 1;
    insertRound(db, input.id, version, note, now, input.files);
    db.prepare(`UPDATE documents SET type = ?, title = ?, body = ?, status = 'SUBMITTED', updated_at = ? WHERE id = ? AND owner_id = ?`).run(
      input.type,
      title,
      note,
      now,
      input.id,
      input.ownerId,
    );
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
  return { id: input.id };
}
