// ──────────────────────────────────────────────────────────
// 1. Dependensi
// ──────────────────────────────────────────────────────────
const express = require('express');
const cors    = require('cors');
const mysql   = require('mysql2/promise');

const app = express();

// ──────────────────────────────────────────────────────────
// 2. Konfigurasi koneksi MySQL  (GANTI di sini jika berubah)
// ──────────────────────────────────────────────────────────
const DB_CONFIG = {
  host    : 'ballast.proxy.rlwy.net',
  port    : 44159,
  user    : 'root',
  password: 'cYbZVJxpmRmYPyXkVCHJLULXXrreKuvm',
  database: 'railway',                // ← ganti ke 'master_linen' jika tabel ada di sana
  ssl     : { rejectUnauthorized: false }, // Railway public MySQL butuh SSL
  timezone: '+07:00',
  dateStrings: ['DATE','DATETIME','TIMESTAMP'],
  waitForConnections: true,
  connectionLimit: 10,
};

// Buat pool koneksi
const pool = mysql.createPool(DB_CONFIG);

// Tes koneksi sekali di awal
(async () => {
  try {
    await pool.query('SELECT 1');
    console.log('✅  MySQL connected');
  } catch (e) {
    console.error('❌  DB connect failed:', e.message);
    process.exit(1);  // Force exit supaya Railway menandai gagal
  }
})();

// ──────────────────────────────────────────────────────────
// 3. Middleware global
// ──────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ──────────────────────────────────────────────────────────
// 4. Routes
// ──────────────────────────────────────────────────────────
app.get('/', (_req, res) => res.send('Linen Tracker API is running!'));

/* GET /master-linen */
app.get('/master-linen', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Linen');
    res.json(rows);
  } catch (err) {
    console.error('/master-linen error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/* GET /status-summary */
app.get('/status-summary', async (_req, res) => {
  const sql = `
    SELECT Status, COUNT(*) AS count
    FROM   Linen
    GROUP  BY Status
  `;
  try {
    const [rows] = await pool.query(sql);
    const result = { kotor: 0, dicuci: 0, keluar: 0, hilang: 0 };
    rows.forEach(r => {
      const key = (r.Status || '').toLowerCase();
      if (result[key] !== undefined) result[key] = r.count;
    });
    res.json(result);
  } catch (err) {
    console.error('/status-summary error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/* GET /batch-list */
app.get('/batch-list', async (_req, res) => {
  const sql = `
    SELECT DATE_FORMAT(Tanggal,'%Y-%m-%d') AS Tanggal,
           TIME_FORMAT(Waktu  ,'%H:%i:%s') AS Waktu,
           COUNT(*)                        AS jumlahLinen
    FROM   LinenBatchDetails
    GROUP  BY Tanggal, Waktu
    ORDER  BY Tanggal DESC, Waktu DESC
  `;
  try {
    const [rows] = await pool.query(sql);
    res.json(rows);
  } catch (err) {
    console.error('/batch-list error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/* GET /batch-report/:tanggal/:waktu */
app.get('/batch-report/:tanggal/:waktu', async (req, res) => {
  const { tanggal, waktu } = req.params;
  const sql = `
    SELECT DATE_FORMAT(Tanggal,'%Y-%m-%d') AS Tanggal,
           TIME_FORMAT(Waktu  ,'%H:%i:%s') AS Waktu,
           EPC, TipeLinen, OldStatus, NewStatus, Type, Antenna
    FROM   LinenBatchDetails
    WHERE  DATE_FORMAT(Tanggal,'%Y-%m-%d') = ? 
      AND  TIME_FORMAT(Waktu  ,'%H:%i:%s') = ?
    ORDER  BY EPC
  `;
  try {
    const [rows] = await pool.query(sql, [tanggal, waktu]);
    res.json(rows);
  } catch (err) {
    console.error('/batch-report error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────────────────────
// 5. Start server
// ──────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000; // Railway akan memberi PORT sendiri
app.listen(PORT, () => console.log(`🚀  API server listening on port ${PORT}`));
