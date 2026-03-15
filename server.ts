import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database('chanda.db');

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER,
    name TEXT NOT NULL,
    monthly_amount REAL NOT NULL,
    avatar TEXT,
    address TEXT,
    whatsapp TEXT,
    start_date TEXT, -- YYYY-MM
    code TEXT UNIQUE NOT NULL,
    FOREIGN KEY (group_id) REFERENCES groups (id)
  );

  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER,
    month INTEGER, -- 1-12
    year INTEGER,
    amount REAL,
    method TEXT, -- Cash, Online
    date TEXT, -- YYYY-MM-DD
    notes TEXT,
    FOREIGN KEY (member_id) REFERENCES members (id)
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  INSERT OR IGNORE INTO settings (key, value) VALUES ('due_date', '15');
  INSERT OR IGNORE INTO settings (key, value) VALUES ('startup_enabled', 'true');
  INSERT OR IGNORE INTO settings (key, value) VALUES ('startup_title', 'Masjid-e-Hussainya');
  INSERT OR IGNORE INTO settings (key, value) VALUES ('startup_credit', 'Gariq Nawaz Group');
  INSERT OR IGNORE INTO settings (key, value) VALUES ('startup_image', 'https://picsum.photos/seed/masjid/400/400');
  INSERT OR IGNORE INTO settings (key, value) VALUES ('startup_duration', '3000');
  INSERT OR IGNORE INTO settings (key, value) VALUES ('startup_bg_color', '#ffffff');
  INSERT OR IGNORE INTO settings (key, value) VALUES ('language', 'en');
  INSERT OR IGNORE INTO settings (key, value) VALUES ('admin_username', 'admin');
  INSERT OR IGNORE INTO settings (key, value) VALUES ('admin_password', 'admin123');
  INSERT OR IGNORE INTO settings (key, value) VALUES ('app_name', 'Masjid-e-Hussainya');
  INSERT OR IGNORE INTO settings (key, value) VALUES ('app_logo', '');
  INSERT OR IGNORE INTO settings (key, value) VALUES ('currency', 'PKR');
`);

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '100mb' }));
  app.use(express.urlencoded({ limit: '100mb', extended: true }));

  // Logging middleware for debugging large requests
  app.use((req, res, next) => {
    if (req.method === 'POST' && req.path === '/api/settings') {
      const size = req.get('content-length');
      console.log(`Incoming settings update. Size: ${size} bytes`);
    }
    next();
  });

  // API Routes
  app.get('/api/settings', (req, res, next) => {
    try {
      const settings = db.prepare('SELECT * FROM settings').all();
      const settingsMap = settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
      res.json(settingsMap);
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/settings', (req, res, next) => {
    try {
      const { key, value, settings } = req.body;
      
      if (settings && typeof settings === 'object') {
        const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
        const transaction = db.transaction((updates) => {
          for (const [k, v] of Object.entries(updates)) {
            stmt.run(k, (v as any)?.toString() || '');
          }
        });
        transaction(settings);
        return res.json({ success: true });
      }

      if (key) {
        db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, value?.toString() || '');
        return res.json({ success: true });
      }

      res.status(400).json({ error: 'Invalid request' });
    } catch (err) {
      next(err);
    }
  });

  app.get('/api/dashboard', (req, res, next) => {
    try {
      const totalCollected = db.prepare('SELECT SUM(amount) as total FROM payments').get().total || 0;
      const totalMembers = db.prepare('SELECT COUNT(*) as count FROM members').get().count || 0;
      const activeGroups = db.prepare('SELECT COUNT(*) as count FROM groups').get().count || 0;
      
      // Fetch settings
      const dueDateSetting = db.prepare("SELECT value FROM settings WHERE key = 'due_date'").get()?.value || '15';
      const dueDate = parseInt(dueDateSetting);
      const now = new Date();
      const currentDay = now.getDate();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      // Fetch all members and their payments for detailed stats
      const members = db.prepare('SELECT * FROM members').all();
      const payments = db.prepare('SELECT * FROM payments').all();
      const groups = db.prepare('SELECT * FROM groups').all();

      let totalOverdue = 0;
      let totalAccrued = 0;

      const groupStats = groups.map(g => {
        const groupMembers = members.filter(m => m.group_id === g.id);
        let paidCount = 0;
        let unpaidCount = 0;

        groupMembers.forEach(m => {
          if (!m.start_date) return;
          
          const parts = m.start_date.split('-');
          if (parts.length < 2) return;
          
          const sYear = parseInt(parts[0]);
          const sMonth = parseInt(parts[1]);
          
          if (isNaN(sYear) || isNaN(sMonth)) return;

          let tempYear = sYear;
          let tempMonth = sMonth;
          
          let memberAccrued = 0;
          let memberPaid = payments.filter(p => p.member_id === m.id).reduce((sum, p) => sum + p.amount, 0);

          while (tempYear < currentYear || (tempYear === currentYear && tempMonth <= currentMonth)) {
            // Check if current month is past due date
            if (tempYear === currentYear && tempMonth === currentMonth && currentDay <= dueDate) {
              // Not accrued yet for current month
            } else {
              memberAccrued += m.monthly_amount;
            }

            tempMonth++;
            if (tempMonth > 12) {
              tempMonth = 1;
              tempYear++;
            }
            
            // Safety break to prevent infinite loop
            if (tempYear > currentYear + 1) break;
          }

          totalAccrued += memberAccrued;
          const overdue = Math.max(0, memberAccrued - memberPaid);
          totalOverdue += overdue;

          // Check current month payment status for group stats
          const currentMonthPaid = payments.filter(p => p.member_id === m.id && p.month === currentMonth && p.year === currentYear).reduce((sum, p) => sum + p.amount, 0);
          if (currentMonthPaid >= m.monthly_amount) {
            paidCount++;
          } else {
            unpaidCount++;
          }
        });

        return {
          name: g.name,
          paidCount,
          unpaidCount
        };
      });

      // Simple trend data for charts
      const monthlyTrend = db.prepare(`
        SELECT year, month, SUM(amount) as amount 
        FROM payments 
        GROUP BY year, month 
        ORDER BY year DESC, month DESC 
        LIMIT 6
      `).all().reverse();

      res.json({
        totalCollected,
        totalMembers,
        activeGroups,
        totalOverdue,
        totalAccrued,
        groupStats,
        monthlyTrend
      });
    } catch (err) {
      next(err);
    }
  });

  app.get('/api/groups', (req, res, next) => {
    try {
      const groups = db.prepare(`
        SELECT g.*, 
        (SELECT COUNT(*) FROM members WHERE group_id = g.id) as memberCount,
        (SELECT SUM(amount) FROM payments p JOIN members m ON p.member_id = m.id WHERE m.group_id = g.id) as totalCollected
        FROM groups g
      `).all();
      res.json(groups);
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/groups', (req, res, next) => {
    try {
      const { name } = req.body;
      const result = db.prepare('INSERT INTO groups (name) VALUES (?)').run(name);
      res.json({ id: result.lastInsertRowid });
    } catch (err) {
      next(err);
    }
  });

  app.put('/api/groups/:id', (req, res, next) => {
    try {
      const { name } = req.body;
      db.prepare('UPDATE groups SET name = ? WHERE id = ?').run(name, req.params.id);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  });

  app.delete('/api/groups/:id', (req, res, next) => {
    try {
      const memberCount = db.prepare('SELECT COUNT(*) as count FROM members WHERE group_id = ?').get(req.params.id).count;
      if (memberCount > 0) {
        return res.status(400).json({ error: 'Cannot delete group with active members' });
      }
      db.prepare('DELETE FROM groups WHERE id = ?').run(req.params.id);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  });

  app.get('/api/members', (req, res, next) => {
    try {
      const { q, groupId } = req.query;
      let query = 'SELECT * FROM members';
      const params = [];
      if (q || groupId) {
        query += ' WHERE';
        if (q) {
          query += ' (name LIKE ? OR code LIKE ? OR whatsapp LIKE ?)';
          params.push(`%${q}%`, `%${q}%`, `%${q}%`);
        }
        if (groupId) {
          if (q) query += ' AND';
          query += ' group_id = ?';
          params.push(groupId);
        }
      }
      const members = db.prepare(query).all(...params);
      res.json(members);
    } catch (err) {
      next(err);
    }
  });

  app.get('/api/reports/payments', (req, res, next) => {
    try {
      const { from, to, groupId } = req.query;
      if (!from || !to) return res.status(400).json({ error: 'From and to dates are required' });
      
      const fromStr = String(from);
      const toStr = String(to);
      const [fromYear, fromMonth] = fromStr.split('-').map(Number);
      const [toYear, toMonth] = toStr.split('-').map(Number);
      
      let query = `
        SELECT p.*, m.name as member_name, m.code as member_code
        FROM payments p
        JOIN members m ON p.member_id = m.id
        WHERE (p.year > ? OR (p.year = ? AND p.month >= ?))
        AND (p.year < ? OR (p.year = ? AND p.month <= ?))
      `;
      const params: (string | number)[] = [fromYear, fromYear, fromMonth, toYear, toYear, toMonth];

      if (groupId) {
        query += ' AND m.group_id = ?';
        params.push(String(groupId));
      }

      query += ' ORDER BY p.year DESC, p.month DESC, p.date DESC';
      
      const payments = db.prepare(query).all(...params);
      res.json(payments);
    } catch (err) {
      next(err);
    }
  });

  app.get('/api/members/:id', (req, res, next) => {
    try {
      const member = db.prepare('SELECT * FROM members WHERE id = ?').get(req.params.id);
      if (!member) return res.status(404).json({ error: 'Member not found' });
      
      const payments = db.prepare('SELECT * FROM payments WHERE member_id = ? ORDER BY year DESC, month DESC').all(req.params.id);
      const group = db.prepare('SELECT name FROM groups WHERE id = ?').get(member.group_id);
      
      res.json({ ...member, payments, groupName: group?.name });
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/members', (req, res, next) => {
    try {
      const { name, group_id, monthly_amount, avatar, address, whatsapp, start_date } = req.body;
      const code = Math.floor(10000 + Math.random() * 90000).toString();
      const result = db.prepare(`
        INSERT INTO members (name, group_id, monthly_amount, avatar, address, whatsapp, start_date, code)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(name, group_id, monthly_amount, avatar, address, whatsapp, start_date, code);
      res.json({ id: result.lastInsertRowid, code });
    } catch (err) {
      next(err);
    }
  });

  app.put('/api/members/:id', (req, res, next) => {
    try {
      const { name, group_id, monthly_amount, avatar, address, whatsapp, start_date } = req.body;
      db.prepare(`
        UPDATE members 
        SET name = ?, group_id = ?, monthly_amount = ?, avatar = ?, address = ?, whatsapp = ?, start_date = ?
        WHERE id = ?
      `).run(name, group_id, monthly_amount, avatar, address, whatsapp, start_date, req.params.id);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  });

  app.delete('/api/members/:id', (req, res, next) => {
    try {
      // Delete payments first
      db.prepare('DELETE FROM payments WHERE member_id = ?').run(req.params.id);
      // Delete member
      db.prepare('DELETE FROM members WHERE id = ?').run(req.params.id);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/payments', (req, res, next) => {
    try {
      const { member_id, month, year, amount, method, date, notes } = req.body;
      const result = db.prepare(`
        INSERT INTO payments (member_id, month, year, amount, method, date, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(member_id, month, year, amount, method, date, notes);
      res.json({ id: result.lastInsertRowid });
    } catch (err) {
      next(err);
    }
  });

  app.delete('/api/payments/:id', (req, res, next) => {
    try {
      db.prepare('DELETE FROM payments WHERE id = ?').run(req.params.id);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  });

  app.put('/api/payments/:id', (req, res, next) => {
    try {
      const { amount, method, date, notes, month, year } = req.body;
      db.prepare(`
        UPDATE payments 
        SET amount = ?, method = ?, date = ?, notes = ?, month = ?, year = ?
        WHERE id = ?
      `).run(amount, method, date, notes, month, year, req.params.id);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/auth/login', (req, res, next) => {
    try {
      const { username, password } = req.body;
      const adminUser = db.prepare("SELECT value FROM settings WHERE key = 'admin_username'").get()?.value || 'admin';
      const adminPass = db.prepare("SELECT value FROM settings WHERE key = 'admin_password'").get()?.value || 'admin123';
      
      if (username === adminUser && password === adminPass) {
        res.json({ success: true, token: 'fake-jwt-token' });
      } else {
        res.status(401).json({ success: false });
      }
    } catch (err) {
      next(err);
    }
  });

  // Error handling middleware
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Server Error:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  });

  // Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
