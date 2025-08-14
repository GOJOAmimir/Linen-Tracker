const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const app = express();
/*
// -- debug verbose: log setiap pendaftaran route/middleware (TEMPORARY)
const util = require("util");
const methods = [
  "get",
  "post",
  "put",
  "delete",
  "patch",
  "options",
  "use",
  "all",
];
methods.forEach((m) => {
  const orig = app[m] && app[m].bind(app);
  if (!orig) return;
  app[m] = (...args) => {
    // inspect first arg (path or middleware)
    let first = args[0];
    function pretty(x) {
      try {
        if (typeof x === "string") return `string:${x}`;
        if (typeof x === "function") return `function:${x.name || "<anon>"}`;
        if (x instanceof RegExp) return `RegExp:${x.source}`;
        if (Array.isArray(x)) return `array:[${x.map(pretty).join(",")}]`;
        return `other:${util.inspect(x, { depth: 0 })}`;
      } catch (e) {
        return "<unprintable>";
      }
    }
    console.log(`REGISTER: app.${m} -> ${pretty(first)}`);
    try {
      return orig(...args);
    } catch (err) {
      // Print helpful debug info and rethrow
      console.error("--- ERROR registering route ---");
      console.error(`method: app.${m}`);
      console.error("first arg (raw):", first);
      console.error("first arg (pretty):", pretty(first));
      console.error("all args:", util.inspect(args, { depth: 2 }));
      console.error("error stack:");
      console.error(err.stack || err);
      throw err;
    }
  };
}); 
*/

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

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === "jomama" && password === "jomama123") {
    const token = jwt.sign(
      { username },
      process.env.JWT_SECRET || "SECRET_KEY",
      {
        expiresIn: "1h",
      }
    );

    res.json({ success: true, token });
  } else {
    res.status(401).json({ success: false, message: "Login gagal" });
  }
});

// GET /master-linen
app.get("/master-linen", async (req, res) => {
  try {
    const sql = `
      SELECT 
        l.LINEN_CREATED_DATE,
        l.LINEN_ID,
        l.LINEN_TYPE,
        l.LINEN_HEIGHT,
        l.LINEN_WIDTH,
        l.LINEN_MAX_CYCLE,
        l.LINEN_DESCRIPTION,
        l.LINEN_SIZE_CATEGORY,
        v.LINEN_TOTAL_WASH
      FROM linens l
      LEFT JOIN view_item_total_wash v ON l.LINEN_ID = v.LINEN_ID
    `;

    const [rows] = await pool.query(sql);

    res.status(200).json({
      success: true,
      total: rows.length,
      data: rows,
    });
  } catch (err) {
    console.error("GET /master-linen error:", err.message);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil data linen.",
      error: err.message,
    });
  }
});

// POST new linen
app.post("/master-linen", async (req, res) => {
  const { epc, tipe, maxCycle } = req.body;

  if (!epc || !tipe || !maxCycle) {
    return res
      .status(400)
      .json({ error: "EPC, tipe, dan maxCycle wajib diisi" });
  }

  try {
    const sql = `INSERT INTO linen (EPC, Tipe, MaxCuci, cycle, Status) VALUES (?, ?, ?, 0, 'kotor')`;
    await pool.query(sql, [epc, tipe, maxCycle]);

    res.json({ message: "Linen berhasil ditambahkan" });
  } catch (err) {
    console.error("POST /master-linen error:", err.message);
    res.status(500).json({ error: "Gagal menambahkan linen" });
  }
});

// DELETE linen by EPC
app.delete("/master-linen/:epc", async (req, res) => {
  const { epc } = req.params;

  try {
    const [result] = await pool.query("DELETE FROM linen WHERE EPC = ?", [epc]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Linen tidak ditemukan" });
    }

    res.json({ message: "Linen berhasil dihapus" });
  } catch (err) {
    console.error("DELETE /master-linen error:", err.message);
    res.status(500).json({ error: "Gagal menghapus linen" });
  }
});

// GET /status-summary
app.get("/status-summary", async (req, res) => {
  const sql = `
    SELECT status, COUNT(*) AS count FROM (
      -- Bersih = sudah di batch_out_details
      SELECT 'bersih' AS status
      FROM batch_out_details

      UNION ALL

      -- Dicuci = ada di processed_item tapi belum di batch_out_details
      SELECT 'dicuci' AS status
      FROM processed_items pi
      WHERE NOT EXISTS (
        SELECT 1 FROM batch_out_details bod
        WHERE bod.LINEN_ID = pi.LINEN_ID
      )

      UNION ALL

      -- Intransit = ada di batch_in_details tapi belum di processed_items
      SELECT 'intransit' AS status
      FROM batch_in_details bid
      WHERE NOT EXISTS (
        SELECT 1 FROM processed_items pi
        WHERE pi.LINEN_ID = bid.LINEN_ID
      )
    ) AS status_summary
    GROUP BY status
  `;

  try {
    const [rows] = await pool.query(sql);

    // Inisialisasi dengan 0
    const result = {
      intransit: 0,
      dicuci: 0,
      bersih: 0,
      keluar: 0,
      hilang: 0,
    };

    // Isi dari query
    rows.forEach((row) => {
      const status = row.status.toLowerCase();
      if (result.hasOwnProperty(status)) {
        result[status] = row.count;
      }
    });

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
      LINEN_ID AS EPC, 
      LINEN_TYPE AS Tipe, 
      LINEN_TOTAL_WASH AS cycle, 
      LINEN_MAX_CYCLE AS MaxCuci
    FROM view_item_total_wash
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

// GET /batches/latest
app.get("/batches/latest", async (_req, res) => {
  const sql = `
    SELECT * FROM (
      SELECT 
        bi.BATCH_IN_ID AS id,
        bi.BATCH_IN_DATETIME AS waktu,
        COUNT(bid.LINEN_ID) AS totalLinen,
        'Dicuci' AS Status
      FROM batch_in bi
      LEFT JOIN batch_in_details bid ON bi.BATCH_IN_ID = bid.BATCH_IN_ID
      GROUP BY bi.BATCH_IN_ID, bi.BATCH_IN_DATETIME

      UNION ALL

      SELECT 
        bo.BATCH_OUT_ID AS id,
        bo.BATCH_OUT_DATETIME AS waktu,
        COUNT(bod.LINEN_ID) AS totalLinen,
        'Bersih' AS Status
      FROM batch_out bo
      LEFT JOIN batch_out_details bod ON bo.BATCH_OUT_ID = bod.BATCH_OUT_ID
      GROUP BY bo.BATCH_OUT_ID, bo.BATCH_OUT_DATETIME
    ) AS all_batches
    ORDER BY waktu DESC
    LIMIT 8
  `;

  try {
    const [rows] = await pool.query(sql);
    res.json(rows);
  } catch (err) {
    console.error("/batches/latest error:", err.message);
    res.status(500).json({ error: "Gagal mengambil data batch terbaru" });
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
