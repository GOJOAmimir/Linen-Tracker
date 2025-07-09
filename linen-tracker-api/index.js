/******************************************************************
 * Linen‑Tracker API (Node.js + Express + mysql2/promise)
 * ---------------------------------------------------------------
 *  ‑ Koneksi langsung ke Railway MySQL (public host)
 *  ‑ Nama tabel huruf kecil:  linen, linenbatchdetails
 *  ‑ Zona waktu Jakarta (+07:00)
 ******************************************************************/

const express = require('express');
const cors    = require('cors');
const mysql   = require('mysql2/promise');

const app = express();

/*───────────────────────────────────────────────────────────────*/
/* 1. Konfigurasi koneksi MySQL                                 */
/*───────────────────────────────────────────────────────────────*/
const pool = mysql.createPool({
  host    : 'ballast.proxy.rlwy.net',
  port    : 44159,
  user    : 'root',
  password: 'cYbZVJxpmRmYPyXkVCHJLULXXrreKuvm',
  database: 'railway',              // ganti jika tabel pindah DB
  ssl     : { rejectUnauthorized: false }, // Railway public → SSL
  timezone: '+07:00',
  dateStrings: ['DATE', 'DATETIME', 'TIMESTAMP'],
  waitForConnections: true,
  connectionLimit: 10,
});

/* Tes koneksi di awal */
(async () => {
  try {
    await pool.query('SELECT 1');
    console.log('✅  MySQL connected');
  } catch (err) {
    console.error('❌  DB connect failed:', err.message);
    process.exit(1);
  }
})();

/*───────────────────────────────────────────────────────────────*/
/* 2. Middleware global                                         */
/*───────────────────────────────────────────────────────────────*/
app.use(cors());
app.use(express.json());

/*───────────────────────────────────────────────────────────────*/
/* 3. Routes                                                    */
/*───────────────────────────────────────────────────────────────*/
app.get('/', (_req, res) => res.send('Linen Tracker API is running!'));

/* GET /master-linen */
app.get('/master-linen', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM linen');
    res.json(rows);
  } catch (err) {
    console.error('/master-linen error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST new linen
app.post('/master-linen', async (req, res) => {
  const { epc, tipe, maxCycle } = req.body;

  if (!epc || !tipe || !maxCycle) {
    return res.status(400).json({ error: 'EPC, tipe, dan maxCycle wajib diisi' });
  }

  try {
    const sql = `INSERT INTO linen (EPC, Tipe, MaxCuci, cycle, Status) VALUES (?, ?, ?, 0, 'kotor')`;
    await pool.query(sql, [epc, tipe, maxCycle]);

    res.json({ message: 'Linen berhasil ditambahkan' });
  } catch (err) {
    console.error('POST /master-linen error:', err.message);
    res.status(500).json({ error: 'Gagal menambahkan linen' });
  }
});

// DELETE linen by EPC
app.delete('/master-linen/:epc', async (req, res) => {
  const { epc } = req.params;

  try {
    const [result] = await pool.query('DELETE FROM linen WHERE EPC = ?', [epc]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Linen tidak ditemukan' });
    }

    res.json({ message: 'Linen berhasil dihapus' });
  } catch (err) {
    console.error('DELETE /master-linen error:', err.message);
    res.status(500).json({ error: 'Gagal menghapus linen' });
  }
});

/* GET /status-summary */
app.get('/status-summary', async (_req, res) => {
  const sql = `
    SELECT Status, COUNT(*) AS count
    FROM   linen
    GROUP  BY Status
  `;
  try {
    const [rows] = await pool.query(sql);

    /* Susun format tetap */
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
    FROM   linenbatchdetails
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
           EPC,
           TipeLinen,
           OldStatus,
           NewStatus,
           Type,
           Antenna
    FROM   linenbatchdetails
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

/*───────────────────────────────────────────────────────────────*/
/* 4. Start server                                              */
/*───────────────────────────────────────────────────────────────*/
const PORT = process.env.PORT || 8080;   // Railway inject PORT sendiri
app.listen(PORT, () => {
  console.log(`🚀  API server listening on port ${PORT}`);
});
