import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '..', 'aasa.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    initDb();
  }
});

function initDb() {
  db.serialize(() => {
    // 1. Users Table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      role TEXT NOT NULL
    )`);

    // 2. Rescues Table — full schema with GPS, photo, condition, notes, aiData, aasaId
    db.run(`CREATE TABLE IF NOT EXISTS rescues (
      id TEXT PRIMARY KEY,
      species TEXT NOT NULL,
      location TEXT NOT NULL,
      urgency TEXT NOT NULL,
      status TEXT NOT NULL,
      image TEXT,
      photo TEXT,
      date TEXT NOT NULL,
      citizenId TEXT,
      volunteerId TEXT,
      lat REAL DEFAULT 0,
      lng REAL DEFAULT 0,
      address TEXT DEFAULT '',
      condition TEXT DEFAULT 'Unknown',
      notes TEXT DEFAULT '',
      aiData TEXT DEFAULT '',
      aasaId TEXT DEFAULT '',
      cur INTEGER DEFAULT 0
    )`);

    // Migration: add columns if upgrading from old schema (silently ignore duplicate errors)
    const migrateRescues = [
      'ALTER TABLE rescues ADD COLUMN lat REAL DEFAULT 0',
      'ALTER TABLE rescues ADD COLUMN lng REAL DEFAULT 0',
      'ALTER TABLE rescues ADD COLUMN address TEXT DEFAULT ""',
      'ALTER TABLE rescues ADD COLUMN condition TEXT DEFAULT "Unknown"',
      'ALTER TABLE rescues ADD COLUMN notes TEXT DEFAULT ""',
      'ALTER TABLE rescues ADD COLUMN aiData TEXT DEFAULT ""',
      'ALTER TABLE rescues ADD COLUMN aasaId TEXT DEFAULT ""',
      'ALTER TABLE rescues ADD COLUMN photo TEXT DEFAULT ""',
      'ALTER TABLE rescues ADD COLUMN cur INTEGER DEFAULT 0',
    ];
    migrateRescues.forEach(sql => db.run(sql, () => {}));

    // 3. Animals Table (citizen-registered animals)
    db.run(`CREATE TABLE IF NOT EXISTS animals (
      id TEXT PRIMARY KEY,
      aasaId TEXT NOT NULL,
      name TEXT DEFAULT '',
      species TEXT NOT NULL,
      breed TEXT DEFAULT '',
      condition TEXT DEFAULT 'Fair',
      area TEXT DEFAULT '',
      marks TEXT DEFAULT '',
      citizenId TEXT NOT NULL,
      status TEXT DEFAULT 'stable',
      vacc INTEGER DEFAULT 0,
      date TEXT NOT NULL
    )`);

    // 4. Campaigns Table
    db.run(`CREATE TABLE IF NOT EXISTS campaigns (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      progress INTEGER NOT NULL DEFAULT 0,
      target INTEGER NOT NULL,
      current INTEGER NOT NULL DEFAULT 0,
      deadline TEXT NOT NULL
    )`);

    // 5. Team Table
    db.run(`CREATE TABLE IF NOT EXISTS team (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      status TEXT NOT NULL,
      color TEXT NOT NULL
    )`);

    // Seed Data if users table is empty
    db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
      if (err || !row) return;
      if (row.count === 0) {
        console.log('Seeding database with initial data...');

        const stmtUsers = db.prepare('INSERT INTO users VALUES (?, ?, ?, ?)');
        stmtUsers.run('1', 'Sujal Patil', 'sujalpatil@sangli.in', 'CITIZEN');
        stmtUsers.run('2', 'Aditya Volunteer', 'volunteer@aasa.org', 'VOLUNTEER');
        stmtUsers.run('3', 'Animal Rahat', 'ngo@animalrahat.org', 'NGO');
        stmtUsers.run('4', 'SMC Admin', 'admin@sangli.gov', 'ADMIN');
        stmtUsers.finalize();

        const stmtCampaigns = db.prepare('INSERT INTO campaigns VALUES (?, ?, ?, ?, ?, ?, ?)');
        stmtCampaigns.run('1', 'Community Dog ABC', 'STERILIZATION', 65, 200, 130, 'Ongoing');
        stmtCampaigns.run('2', 'Mechanical Bull Initiative', 'AWARENESS', 34, 50, 17, 'Q4 2026');
        stmtCampaigns.run('3', 'Halter Replacement Drive', 'WELFARE', 85, 500, 425, 'Nov 2026');
        stmtCampaigns.finalize();

        const stmtTeam = db.prepare('INSERT INTO team VALUES (?, ?, ?, ?, ?)');
        stmtTeam.run('v1', 'Dr. Arjun Mane', 'Vet Officer', 'In Surgery', 'var(--lavender)');
        stmtTeam.run('v2', 'Priya Kadam', 'Humane Educator', 'Field Visit', 'var(--sky)');
        stmtTeam.run('v3', 'Sandeep Patil', 'Sanctuary Caretaker', 'Available', 'var(--forest)');
        stmtTeam.finalize();

        // Seed rescues with real GPS coords for Sangli/Miraj area
        const now = new Date().toISOString();
        const stmtRescues = db.prepare(
          'INSERT INTO rescues (id, species, location, urgency, status, image, photo, date, citizenId, volunteerId, lat, lng, address, condition, notes, aasaId, cur) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        stmtRescues.run('r1', 'Dog', 'Vishrambag Chowk, Sangli', 'High', 'Pending', '', '', now, '1', null,
          16.8617, 74.5798, 'Vishrambag Chowk, Sangli, Maharashtra', 'Injured',
          'Limping badly, possible fracture on rear leg. Needs immediate vet.', 'AASA-20260429-R001', 0);
        stmtRescues.run('r2', 'Cow', 'Market Yard, Sangli', 'Medium', 'In Progress', '', '', new Date(Date.now() - 3600000).toISOString(), '1', '2',
          16.8489, 74.5757, 'Market Yard, Sangli, Maharashtra', 'Moderate',
          'Cow stuck in drainage ditch near Market Yard. Volunteer dispatched.', 'AASA-20260429-R002', 1);
        stmtRescues.run('r3', 'Cat', 'Kupwad MIDC, Sangli', 'Low', 'Resolved', '', '', new Date(Date.now() - 86400000).toISOString(), '1', '2',
          16.9012, 74.6234, 'Kupwad MIDC, Sangli, Maharashtra', 'Healthy',
          'Kitten found, healthy. Rehomed with local family.', 'AASA-20260428-R003', 4);
        stmtRescues.finalize();
      }
    });
  });
}

// Helper to run queries with Promises
export const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

export const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export default db;
