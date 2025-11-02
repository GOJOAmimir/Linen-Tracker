import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

import missingRoutes from "./routes/rHilang.js";
import loginHandler from "./routes/rlogin.js";
import MasterLinen from "./routes/rMasterLinen.js";
import LatestBatch from "./routes/rLatestBatch.js";
import Inventory from "./routes/rInventory.js";

dotenv.config();

const app = express();

/*───────────────────────────────────────────────────────────────*/
/* 1. Konfigurasi koneksi MySQL                                 */
/*───────────────────────────────────────────────────────────────*/
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false },
  timezone: "+07:00",
  dateStrings: ["DATE", "DATETIME", "TIMESTAMP"],
  waitForConnections: true,
  connectionLimit: 10,
});

/* Tes koneksi di awal */
(async () => {
  try {
    await pool.query("SELECT 1");
    console.log("✅  MySQL connected");
  } catch (err) {
    console.error("❌  DB connect failed:", err.message);
    process.exit(1);
  }
})();

/*───────────────────────────────────────────────────────────────*/
/* 2. Middleware global                                         */
/*───────────────────────────────────────────────────────────────*/
app.use(
  cors({
    origin: ["http://100.108.196.112:5173", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options(
  /.*/,
  cors({
    origin: ["http://100.108.196.112:5173", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
/*───────────────────────────────────────────────────────────────*/
/* 3. Routes                                                    */
/*───────────────────────────────────────────────────────────────*/
app.get("/", (_req, res) => res.send("Linen Tracker API is running!"));

app.use("/api/missing", missingRoutes);
app.use("/login", loginHandler);
app.use("/master-linen", MasterLinen);
app.use("/batches/latest", LatestBatch);
app.use("/inventory/", Inventory);

// GET /status-summary
app.get("/status-summary", async (req, res) => {
  const sql = `
    SELECT 
      SUM(CASE WHEN so.linen_id IS NOT NULL THEN 1 ELSE 0 END) AS intransit,
      SUM(CASE WHEN sk.linen_id IS NOT NULL AND so.linen_id IS NULL THEN 1 ELSE 0 END) AS bersih,
      SUM(CASE WHEN pi.linen_id IS NOT NULL 
                AND sk.linen_id IS NULL 
                AND so.linen_id IS NULL THEN 1 ELSE 0 END) AS dicuci,
      SUM(CASE WHEN pi.linen_id IS NULL 
                AND sk.linen_id IS NULL 
                AND so.linen_id IS NULL THEN 1 ELSE 0 END) AS intransit
    FROM linens l
    LEFT JOIN processed_items pi ON l.LINEN_ID = pi.linen_id
    LEFT JOIN storage_keep sk ON l.LINEN_ID = sk.linen_id
    LEFT JOIN storage_out so ON l.LINEN_ID = so.linen_id;
  `;

  try {
    const [rows] = await pool.query(sql);

    const result = {
      intransit: rows[0].intransit || 0,
      dicuci: rows[0].dicuci || 0,
      bersih: rows[0].bersih || 0,
      hilang: rows[0].hilang || 0,
    };

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    console.error("GET /status-summary error:", err.message);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil ringkasan status linen.",
      error: err.message,
    });
  }
});

// GET /linen/top-cycles
app.get("/linen/top-cycles", async (req, res) => {
  const sql = `
    SELECT 
      v.LINEN_ID AS EPC, 
      v.LINEN_TYPE AS Tipe, 
      v.LINEN_TOTAL_WASH AS cycle, 
      v.LINEN_MAX_CYCLE AS MaxCuci
    FROM linens l
    LEFT JOIN view_item_total_wash v ON v.LINEN_ID = l.LINEN_ID
    ORDER BY LINEN_TOTAL_WASH DESC
    LIMIT 5
  `;

  try {
    const [rows] = await pool.query(sql);

    res.status(200).json({
      success: true,
      total: rows.length,
      data: rows,
    });
  } catch (err) {
    console.error("GET /linen/top-cycles error:", err.message);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data linen dengan siklus tertinggi.",
      error: err.message,
    });
  }
});

// GET /linen/daily-in
app.get("/linen/daily-in", async (_req, res) => {
  const sql = `
    SELECT 
      DATE(bi.BATCH_IN_DATETIME) AS tanggal,
      COUNT(bid.LINEN_ID) AS jumlah
    FROM batch_in bi
    JOIN batch_in_details bid ON bi.BATCH_IN_ID = bid.BATCH_IN_ID
    GROUP BY DATE(bi.BATCH_IN_DATETIME)
    ORDER BY tanggal DESC
    LIMIT 7
  `;

  try {
    const [rows] = await pool.query(sql);
    res.status(200).json({
      success: true,
      data: rows.reverse(), // agar urutan tanggal lama ke baru
    });
  } catch (err) {
    console.error("GET /linen/daily-in error:", err.message);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data jumlah linen per hari.",
      error: err.message,
    });
  }
});

// GET /batch-list/registered
app.get("/batch-list/registered", async (_req, res) => {
  const sql = `
    SELECT 
      bo.BATCH_IN_ID,
      DATE_FORMAT(bo.BATCH_IN_DATETIME, '%Y-%m-%d') AS Tanggal,
      TIME_FORMAT(bo.BATCH_IN_DATETIME, '%H:%i:%s') AS Waktu,
      COUNT(bod.LINEN_ID) AS jumlahLinen
    FROM batch_in bo
    LEFT JOIN batch_in_details bod ON bo.BATCH_IN_ID = bod.BATCH_IN_ID
    GROUP BY bo.BATCH_IN_ID, bo.BATCH_IN_DATETIME
    ORDER BY bo.BATCH_IN_DATETIME DESC
  `;

  try {
    const [rows] = await pool.query(sql);
    res.json(rows);
  } catch (err) {
    console.error("/batch-list/registered error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /batch-list/finished
app.get("/batch-list/finished", async (_req, res) => {
  const sql = `
    SELECT 
      bo.BATCH_OUT_ID,
      DATE_FORMAT(bo.BATCH_OUT_DATETIME, '%Y-%m-%d') AS Tanggal,
      TIME_FORMAT(bo.BATCH_OUT_DATETIME, '%H:%i:%s') AS Waktu,
      COUNT(bod.LINEN_ID) AS jumlahLinen
    FROM batch_out bo
    LEFT JOIN batch_out_details bod ON bo.BATCH_OUT_ID = bod.BATCH_OUT_ID
    GROUP BY bo.BATCH_OUT_ID, bo.BATCH_OUT_DATETIME
    ORDER BY bo.BATCH_OUT_DATETIME DESC
  `;

  try {
    const [rows] = await pool.query(sql);
    res.json(rows);
  } catch (err) {
    console.error("/batch-list/finished error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get("/batch-status", async (req, res) => {
  try {
    const sql = `
      SELECT 
          bi.BATCH_IN_ID AS batch_id,
          bi.BATCH_IN_DATETIME AS waktu_mulai,
          bo.BATCH_OUT_DATETIME AS waktu_selesai,
          CASE 
              WHEN bo.BATCH_OUT_ID IS NOT NULL THEN 'FINISHED'
              ELSE 'IN PROGRESS'
          END AS status
      FROM BATCH_IN bi
      LEFT JOIN BATCH_OUT bo 
          ON bi.BATCH_IN_ID = bo.BATCH_OUT_ID
      ORDER BY bi.BATCH_IN_DATETIME DESC
    `;

    const [rows] = await pool.query(sql);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengambil data batch" });
  }
});

// GET /batch-report/:batchOutId
app.get("/batch-report/finished/:batchOutId", async (req, res) => {
  const { batchOutId } = req.params;

  const sql = `
    SELECT 
      bod.BATCH_OUT_ID,
      DATE_FORMAT(bo.BATCH_OUT_DATETIME, '%Y-%m-%d') AS Tanggal,
      TIME_FORMAT(bo.BATCH_OUT_DATETIME, '%H:%i:%s') AS Waktu,
      bod.LINEN_ID,
      l.LINEN_TYPE,
      v.LINEN_MAX_CYCLE,
      v.LINEN_TOTAL_WASH
    FROM batch_out_details bod
    JOIN batch_out bo ON bod.BATCH_OUT_ID = bo.BATCH_OUT_ID
    LEFT JOIN linens l ON bod.LINEN_ID = l.LINEN_ID
    LEFT JOIN view_item_total_wash v ON bod.LINEN_ID = v.LINEN_ID
    WHERE bod.BATCH_OUT_ID = ?
    ORDER BY bod.LINEN_ID ASC
  `;

  try {
    const [rows] = await pool.query(sql, [batchOutId]);
    res.json(rows);
  } catch (err) {
    console.error("/batch-report/finished error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /batch-report/:batchInId
app.get("/batch-report/registered/:batchInId", async (req, res) => {
  const { batchInId } = req.params;

  const sql = `
    SELECT 
      bod.BATCH_IN_ID,
      DATE_FORMAT(bo.BATCH_IN_DATETIME, '%Y-%m-%d') AS Tanggal,
      TIME_FORMAT(bo.BATCH_IN_DATETIME, '%H:%i:%s') AS Waktu,
      bod.LINEN_ID,
      l.LINEN_TYPE,
      l.LINEN_MAX_CYCLE,
      v.LINEN_TOTAL_WASH
    FROM batch_in_details bod
    JOIN batch_in bo ON bod.BATCH_IN_ID = bo.BATCH_IN_ID
    LEFT JOIN linens l ON bod.LINEN_ID = l.LINEN_ID
    LEFT JOIN view_item_total_wash v ON bod.LINEN_ID = v.LINEN_ID
    WHERE bod.BATCH_IN_ID = ?
    ORDER BY bod.LINEN_ID ASC
  `;

  try {
    const [rows] = await pool.query(sql, [batchInId]);
    res.json(rows);
  } catch (err) {
    console.error("/batch-report/registered error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/*───────────────────────────────────────────────────────────────*/
/* 4. Start server                                              */
/*───────────────────────────────────────────────────────────────*/
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀  API server listening on port ${PORT}`);
});
