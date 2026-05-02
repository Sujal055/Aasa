import express from 'express';
import cors from 'cors';
import { query, run, get } from './db.js';
import admin from 'firebase-admin';
import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  const serviceAccountPath = path.resolve(__dirname, '../serviceAccountKey.json');
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id
    });
    console.log(`Firebase Admin SDK initialized successfully for project: ${serviceAccount.project_id}`);
  } else {
    console.warn('serviceAccountKey.json not found, falling back to mock auth.');
  }
} catch (e) {
  console.warn('Firebase Admin initialization failed:', e.message);
}

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    if (!admin.apps.length) return next(); 
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }
  const token = authHeader.split('Bearer ')[1];
  try {
    if (!admin.apps.length) return next();
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('[Backend Auth Error]:', error.message);
    return res.status(401).json({ error: `Unauthorized: ${error.message}` });
  }
};

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json({ limit: '10mb' })); // allow base64 photos

// ─────────────────────────────────────────────────────────
// AUTH API
// ─────────────────────────────────────────────────────────
app.post('/api/auth/login', verifyToken, async (req, res) => {
  const { email, name, role } = req.body;
  console.log(`[Backend] Login request received for: ${email} (Role: ${role})`);
  // If verifyToken succeeded, req.user has the Firebase info.
  // If admin SDK is not initialized (fallback), we generate a mock ID.
  const uid = req.user ? req.user.uid : 'mock_' + Date.now();
  const userEmail = req.user ? req.user.email : email;

  try {
    let user = await get('SELECT * FROM users WHERE email = ?', [userEmail]);
    if (!user) {
      // Create user in SQLite
      await run('INSERT INTO users (id, name, email, role) VALUES (?, ?, ?, ?)', [
        uid, name || 'New User', userEmail, role || 'CITIZEN'
      ]);
      user = await get('SELECT * FROM users WHERE email = ?', [userEmail]);
    } else {
      // Ensure role is correct if they signed up with Google but exist as staff
      if (user.role !== role && (role === 'CITIZEN' || role === 'VOLUNTEER')) {
        // Only update role if they are claiming a public role, we don't let them claim ADMIN here
        await run('UPDATE users SET name = ? WHERE email = ?', [name || user.name, userEmail]);
      }
    }
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/auth/me', verifyToken, async (req, res) => {
  const email = req.user ? req.user.email : req.query.email;
  try {
    const user = await get('SELECT * FROM users WHERE email = ?', [email]);
    if (user) res.json({ user });
    else res.status(404).json({ error: 'User not found in local database' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/invite', verifyToken, async (req, res) => {
  const { email, name, role, tempPassword } = req.body;
  // Only Admin can invite
  try {
    if (req.user) {
      const adminUser = await get('SELECT * FROM users WHERE email = ?', [req.user.email]);
      if (!adminUser || adminUser.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Forbidden: Admins only' });
      }
    }

    if (admin.apps.length) {
      // Create user in Firebase
      const newFirebaseUser = await admin.auth().createUser({
        email,
        password: tempPassword,
        displayName: name,
      });
      // Insert into local DB
      await run('INSERT INTO users (id, name, email, role) VALUES (?, ?, ?, ?)', [
        newFirebaseUser.uid, name, email, role
      ]);
    } else {
      // Mock mode
      await run('INSERT INTO users (id, name, email, role) VALUES (?, ?, ?, ?)', [
        'staff_' + Date.now(), name, email, role
      ]);
    }
    
    res.json({ success: true, message: 'User created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────
// USERS API (for Admin directory)
// ─────────────────────────────────────────────────────────
app.get('/api/users', async (req, res) => {
  try {
    const users = await query('SELECT id, name, email, role FROM users ORDER BY role');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────
// RESCUES API
// ─────────────────────────────────────────────────────────
app.get('/api/rescues', async (req, res) => {
  try {
    const { role, userId } = req.query;
    let sql = 'SELECT * FROM rescues ORDER BY date DESC';
    let params = [];

    if (role === 'CITIZEN' && userId) {
      sql = 'SELECT * FROM rescues WHERE citizenId = ? ORDER BY date DESC';
      params = [userId];
    } else if (role === 'VOLUNTEER') {
      // Volunteers see all open / in-progress cases
      sql = "SELECT * FROM rescues WHERE status != 'Resolved' ORDER BY date DESC";
    }

    const rescues = await query(sql, params);
    res.json(rescues);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/rescues/:id', async (req, res) => {
  try {
    const rescue = await get('SELECT * FROM rescues WHERE id = ?', [req.params.id]);
    if (rescue) res.json(rescue);
    else res.status(404).json({ error: 'Rescue not found' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/rescues', async (req, res) => {
  const {
    species, location, urgency, image, photo, citizenId,
    lat, lng, address, condition, notes, aiData, aasaId
  } = req.body;

  const id = 'r_' + Date.now();
  const date = new Date().toISOString();
  const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  const generatedAasaId = aasaId || `AASA-${dateStr}-${suffix}`;
  const resolvedAddress = address || location || 'Unknown Location';

  try {
    await run(
      `INSERT INTO rescues
        (id, species, location, urgency, status, image, photo, date, citizenId, volunteerId,
         lat, lng, address, condition, notes, aiData, aasaId, cur)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, species, resolvedAddress, urgency || 'High', 'Pending',
        photo || image || '', photo || image || '',
        date, citizenId || null, null,
        lat || 0, lng || 0, resolvedAddress,
        condition || 'Unknown', notes || '', aiData || '', generatedAasaId, 0
      ]
    );
    const newRescue = await get('SELECT * FROM rescues WHERE id = ?', [id]);
    res.status(201).json(newRescue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/rescues/:id', async (req, res) => {
  const { status, volunteerId, cur } = req.body;
  try {
    const fields = [];
    const values = [];

    if (status !== undefined) { fields.push('status = ?'); values.push(status); }
    if (volunteerId !== undefined) { fields.push('volunteerId = ?'); values.push(volunteerId); }
    if (cur !== undefined) { fields.push('cur = ?'); values.push(cur); }

    if (fields.length === 0) return res.json({ success: true });

    values.push(req.params.id);
    await run(`UPDATE rescues SET ${fields.join(', ')} WHERE id = ?`, values);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/rescues/:id', async (req, res) => {
  try {
    await run('DELETE FROM rescues WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────
// ANIMALS API (citizen-registered animals)
// ─────────────────────────────────────────────────────────
app.get('/api/animals', async (req, res) => {
  try {
    const { citizenId } = req.query;
    let sql = 'SELECT * FROM animals ORDER BY date DESC';
    let params = [];
    if (citizenId) {
      sql = 'SELECT * FROM animals WHERE citizenId = ? ORDER BY date DESC';
      params = [citizenId];
    }
    const animals = await query(sql, params);
    res.json(animals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/animals', async (req, res) => {
  const { name, species, breed, condition, area, marks, citizenId, vacc } = req.body;
  const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  const aasaId = `AASA-${dateStr}-${suffix}`;
  const id = 'a_' + Date.now();
  const date = new Date().toISOString().split('T')[0];

  try {
    await run(
      `INSERT INTO animals (id, aasaId, name, species, breed, condition, area, marks, citizenId, status, vacc, date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, aasaId, name || '', species || 'Dog', breed || '', condition || 'Fair',
       area || '', marks || '', citizenId, 'stable', vacc ? 1 : 0, date]
    );
    const newAnimal = await get('SELECT * FROM animals WHERE id = ?', [id]);
    res.status(201).json(newAnimal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/animals/:id', async (req, res) => {
  const { name, species, breed, condition, area, marks, vacc, status } = req.body;
  try {
    const fields = [];
    const values = [];
    if (name !== undefined) { fields.push('name = ?'); values.push(name); }
    if (species !== undefined) { fields.push('species = ?'); values.push(species); }
    if (breed !== undefined) { fields.push('breed = ?'); values.push(breed); }
    if (condition !== undefined) { fields.push('condition = ?'); values.push(condition); }
    if (area !== undefined) { fields.push('area = ?'); values.push(area); }
    if (marks !== undefined) { fields.push('marks = ?'); values.push(marks); }
    if (vacc !== undefined) { fields.push('vacc = ?'); values.push(vacc ? 1 : 0); }
    if (status !== undefined) { fields.push('status = ?'); values.push(status); }

    if (fields.length === 0) return res.json({ success: true });
    values.push(req.params.id);
    await run(`UPDATE animals SET ${fields.join(', ')} WHERE id = ?`, values);
    const updated = await get('SELECT * FROM animals WHERE id = ?', [req.params.id]);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/animals/:id', async (req, res) => {
  try {
    await run('DELETE FROM animals WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────
// CAMPAIGNS API
// ─────────────────────────────────────────────────────────
app.get('/api/campaigns', async (req, res) => {
  try {
    const campaigns = await query('SELECT * FROM campaigns ORDER BY id DESC');
    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/campaigns', async (req, res) => {
  const { title, type, target } = req.body;
  const id = 'c_' + Date.now();
  try {
    await run(
      'INSERT INTO campaigns (id, title, type, progress, target, current, deadline) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, title, type, 0, target || 100, 0, 'Ongoing']
    );
    const newCampaign = await get('SELECT * FROM campaigns WHERE id = ?', [id]);
    res.status(201).json(newCampaign);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/campaigns/:id', async (req, res) => {
  const { title, type, target } = req.body;
  try {
    await run(
      'UPDATE campaigns SET title = ?, type = ?, target = ? WHERE id = ?',
      [title, type, target, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────
// TEAM API
// ─────────────────────────────────────────────────────────
app.get('/api/team', async (req, res) => {
  try {
    const team = await query('SELECT * FROM team');
    res.json(team);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/team', async (req, res) => {
  const { name, role, color } = req.body;
  const id = 't_' + Date.now();
  try {
    await run(
      'INSERT INTO team (id, name, role, status, color) VALUES (?, ?, ?, ?, ?)',
      [id, name, role, 'Available', color || 'var(--sky)']
    );
    const newMember = await get('SELECT * FROM team WHERE id = ?', [id]);
    res.status(201).json(newMember);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/team/:id', async (req, res) => {
  const { name, role, status } = req.body;
  try {
    const fields = [];
    const values = [];
    if (name !== undefined) { fields.push('name = ?'); values.push(name); }
    if (role !== undefined) { fields.push('role = ?'); values.push(role); }
    if (status !== undefined) { fields.push('status = ?'); values.push(status); }
    if (fields.length === 0) return res.json({ success: true });
    values.push(req.params.id);
    await run(`UPDATE team SET ${fields.join(', ')} WHERE id = ?`, values);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/team/:id', async (req, res) => {
  try {
    await run('DELETE FROM team WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────
// ANALYTICS API (Admin)
// ─────────────────────────────────────────────────────────
app.get('/api/analytics', async (req, res) => {
  try {
    const totalRescuesObj   = await get("SELECT COUNT(*) as c FROM rescues");
    const resolvedObj       = await get("SELECT COUNT(*) as c FROM rescues WHERE status = 'Resolved'");
    const pendingObj        = await get("SELECT COUNT(*) as c FROM rescues WHERE status = 'Pending'");
    const inProgressObj     = await get("SELECT COUNT(*) as c FROM rescues WHERE status = 'In Progress'");
    const criticalObj       = await get("SELECT COUNT(*) as c FROM rescues WHERE urgency = 'High' AND status != 'Resolved'");
    const totalCampaignsObj = await get("SELECT COUNT(*) as c FROM campaigns");
    const totalTeamObj      = await get("SELECT COUNT(*) as c FROM team");
    const totalAnimalsObj   = await get("SELECT COUNT(*) as c FROM animals");
    const totalUsersObj     = await get("SELECT COUNT(*) as c FROM users");
    const citizensObj       = await get("SELECT COUNT(*) as c FROM users WHERE role = 'CITIZEN'");
    const volunteersObj     = await get("SELECT COUNT(*) as c FROM users WHERE role = 'VOLUNTEER'");

    res.json({
      totalRescues:     totalRescuesObj.c,
      resolvedRescues:  resolvedObj.c,
      pendingRescues:   pendingObj.c,
      inProgressRescues: inProgressObj.c,
      criticalCases:    criticalObj.c,
      totalCampaigns:   totalCampaignsObj.c,
      activeVolunteers: totalTeamObj.c,
      totalAnimals:     totalAnimalsObj.c,
      totalUsers:       totalUsersObj.c,
      totalCitizens:    citizensObj.c,
      totalVolunteers:  volunteersObj.c,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
