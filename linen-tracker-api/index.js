require('dotenv').config();         
const express = require('express');
const cors    = require('cors');
const mysql   = require('mysql2/promise');  

const app  = express();
const PORT = 4000;

// ‑‑‑‑‑ KONFIGURASI KONEKSI ‑‑‑‑‑
const pool = mysql.createPool({
  host              : process.env.DB_HOST,
  user              : process.env.DB_USER,
  password          : process.env.DB_PASSWORD,
  database          : process.env.DB_NAME,
  timezone          : '+07:00',                     // ← zona lokal RS/Laundry
  dateStrings       : ['DATE', 'DATETIME', 'TIMESTAMP'], // ← kolom tanggal = string
  waitForConnections: true,
  connectionLimit   : 10
});

module.exports = pool;

// middleware
app.use(cors());


/* GET /master-linen                                             */
/* ============================================================= */
app.get('/master-linen', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Linen');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/* GET /status-summary                                           */
/* ============================================================= */
// GET /status-summary
app.get('/status-summary', async (req, res) => {
  const sql = `
    SELECT Status, COUNT(*) AS count
    FROM   Linen
    GROUP  BY Status
  `;
  try {
    const [rows] = await pool.query(sql);

    // >>> tambahkan field "hilang"
    const result = { kotor: 0, dicuci: 0, keluar: 0, hilang: 0 };

    rows.forEach(r => {
      const key = (r.Status || '').toLowerCase();
      if (result[key] !== undefined) {
        result[key] = r.count;
      }
    });

    res.json(result);               // { kotor:…, dicuci:…, keluar:…, hilang:… }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



/* GET /batch-list                                               */
/* ============================================================= */
app.get('/batch-list', async (req, res) => {
  /*  Ambil DATE & TIME dalam format string, lalu hitung linen  */
  const sql = `
    SELECT DATE_FORMAT(Tanggal,'%Y-%m-%d') AS Tanggal,
           TIME_FORMAT(Waktu  ,'%H:%i:%s') AS Waktu,
           COUNT(*)                        AS jumlahLinen
    FROM   LinenBatchDetails
    GROUP  BY Tanggal, Waktu
    ORDER  BY Tanggal DESC, Waktu DESC
  `;

  try {
    const [rows] = await pool.query(sql);   // rows = array objek siap pakai
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



/* GET /batch-report/:tanggal/:waktu                             */
/* ============================================================= */
app.get('/batch-report/:tanggal/:waktu', async (req, res) => {
  /* :waktu akan datang via URL‑encode (“12%3A00%3A00”) */
  const tanggal = req.params.tanggal;            // "2025-07-05"
  const waktu   = req.params.waktu;              // "12:00:00"

  const sql = `
    SELECT DATE_FORMAT(Tanggal,'%Y-%m-%d') AS Tanggal,
           TIME_FORMAT(Waktu  ,'%H:%i:%s') AS Waktu,
           EPC,
           TipeLinen,
           OldStatus,
           NewStatus,
           Type,
           Antenna
    FROM   LinenBatchDetails
    WHERE  DATE_FORMAT(Tanggal,'%Y-%m-%d') = ? 
      AND  TIME_FORMAT(Waktu  ,'%H:%i:%s') = ?
    ORDER  BY EPC
  `;

  try {
    const [rows] = await pool.query(sql, [tanggal, waktu]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});







/* START SERVER                                                  */
/* ============================================================= */
app.listen(PORT, () => {
  console.log(`🚀  API server running at http://localhost:${PORT}`);
});
