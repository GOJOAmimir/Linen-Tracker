const express = require('express');
const cors    = require('cors');
const mysql   = require('mysql2/promise');
require('dotenv').config();

const app = express();

/*───────────────────────────────────────────────────────────────*/
/* 1. Konfigurasi koneksi MySQL                                 */
/*───────────────────────────────────────────────────────────────*/
const pool = mysql.createPool({
  host    : process.env.DB_HOST,
  port    : process.env.DB_PORT,
  user    : process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  ssl     : { rejectUnauthorized: false },
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
    const result = { kotor: 0, dicuci: 0, bersih: 0, keluar: 0, hilang: 0 };
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

/* GET /linen/top-cycles */
app.get('/linen/top-cycles', async (_req, res) => {
  try {
    const sql = `
      SELECT EPC, Tipe, cycle, Status, MaxCuci
      FROM linen
      ORDER BY cycle DESC
      LIMIT 5
    `;
    const [rows] = await pool.query(sql);
    res.json(rows);
  } catch (err) {
    console.error('/linen/top-cycles error:', err.message);
    res.status(500).json({ error: 'Gagal mengambil data siklus tertinggi' });
  }
});


/* GET /batches/latest */
app.get('/batches/latest', async (_req, res) => {
  const sql = `
    SELECT 
      CONCAT(DATE_FORMAT(Tanggal, '%Y-%m-%d'), ' ', TIME_FORMAT(Waktu, '%H:%i')) AS waktu,
      COUNT(*) AS totalLinen,
      MAX(NewStatus) AS status,
      'Dicuci' AS batchType,
      CONCAT(DATE_FORMAT(Tanggal, '%Y%m%d'), LPAD(HOUR(Waktu), 2, '0'), LPAD(MINUTE(Waktu), 2, '0')) AS id
    FROM linenbatchdetails_in
    GROUP BY Tanggal, Waktu

    UNION ALL

    SELECT 
      CONCAT(DATE_FORMAT(Tanggal, '%Y-%m-%d'), ' ', TIME_FORMAT(Waktu, '%H:%i')) AS waktu,
      COUNT(*) AS totalLinen,
      MAX(NewStatus) AS status,
      'Keluar' AS batchType,
      CONCAT(DATE_FORMAT(Tanggal, '%Y%m%d'), LPAD(HOUR(Waktu), 2, '0'), LPAD(MINUTE(Waktu), 2, '0')) AS id
    FROM linenbatchdetails_out
    GROUP BY Tanggal, Waktu

    ORDER BY waktu DESC
    LIMIT 9
  `;
  try {
    const [rows] = await pool.query(sql);
    res.json(rows);
  } catch (err) {
    console.error('/batches/latest error:', err.message);
    res.status(500).json({ error: 'Gagal mengambil data batch terbaru' });
  }
});


/* GET /batch-summary/:tanggal/:waktu */
app.get('/batch-summary/:tanggal/:waktu', async (req, res) => {
  const { tanggal, waktu } = req.params;

  const sql = `
    SELECT TipeLinen, COUNT(*) AS Jumlah, 'Dicuci' AS batchType
    FROM linenbatchdetails_in
    WHERE DATE_FORMAT(Tanggal,'%Y-%m-%d') = ? AND TIME_FORMAT(Waktu,'%H:%i:%s') = ?
    GROUP BY TipeLinen

    UNION ALL

    SELECT TipeLinen, COUNT(*) AS Jumlah, 'Keluar' AS batchType
    FROM linenbatchdetails_out
    WHERE DATE_FORMAT(Tanggal,'%Y-%m-%d') = ? AND TIME_FORMAT(Waktu,'%H:%i:%s') = ?
    GROUP BY TipeLinen
  `;
  try {
    const [rows] = await pool.query(sql, [tanggal, waktu, tanggal, waktu]);
    res.json(rows);
  } catch (err) {
    console.error('/batch-summary error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/* GET /batch-list */
app.get('/batch-list', async (_req, res) => {
  const sql = `
    SELECT DATE_FORMAT(Tanggal,'%Y-%m-%d') AS Tanggal,
           TIME_FORMAT(Waktu,'%H:%i:%s') AS Waktu,
           COUNT(*) AS jumlahLinen,
           'Dicuci' AS batchType
    FROM linenbatchdetails_in
    GROUP BY Tanggal, Waktu

    UNION ALL

    SELECT DATE_FORMAT(Tanggal,'%Y-%m-%d') AS Tanggal,
           TIME_FORMAT(Waktu,'%H:%i:%s') AS Waktu,
           COUNT(*) AS jumlahLinen,
           'Keluar' AS batchType
    FROM linenbatchdetails_out
    GROUP BY Tanggal, Waktu

    ORDER BY Tanggal DESC, Waktu DESC
  `;
  try {
    const [rows] = await pool.query(sql);
    res.json(rows);
  } catch (err) {
    console.error('/batch-list error:', err.message);
    res.status(500).json({ error: err.message });
  }
});


/* GET /batch-report/:tanggal/:waktu/:batchType */
app.get('/batch-report/:tanggal/:waktu/:batchType', async (req, res) => {
  const { tanggal, waktu, batchType } = req.params;

  const isIn = batchType === 'Dicuci';
  const table = isIn ? 'linenbatchdetails_in' : 'linenbatchdetails_out';

  const sql = `
    SELECT 
      EPC AS uid,
      TipeLinen AS linen,
      NewStatus,
      OldStatus,
      Antenna,
      Type,
      TIME_FORMAT(Waktu, '%H:%i:%s') AS waktu
    FROM ${table}
    WHERE DATE_FORMAT(Tanggal, '%Y-%m-%d') = ? 
      AND TIME_FORMAT(Waktu, '%H:%i:%s') = ?
    ORDER BY EPC
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
