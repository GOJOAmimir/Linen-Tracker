import { pool } from "../db.js";

export const storage_keep_by_type = async (req, res) => {
  const { tipe } = req.params;

  const sql = `
    SELECT 
      s.linen_id,
      s.storage_pic,
      s.storage_type,
      s.storage_time_in
    FROM storage_keep s
    JOIN linens l ON s.linen_id = l.linen_id
    WHERE l.linen_type = ?
    ORDER BY s.storage_time_in DESC
  `;

  try {
    const [rows] = await pool.query(sql, [tipe]);
    res.json({
      success: true,
      data: rows.map(r => ({
        epc: r.linen_id,
        pic: r.storage_pic,
        storage_type: r.storage_type,
        waktu: r.storage_time_in,
      })),
    });
  } catch (err) {
    console.error("Gagal mengambil data storage_keep:", err);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server saat mengambil data storage_keep",
    });
  }
};

export const storage_out = async (req, res) => {
  const sql = `
    SELECT 
      storage_pic,
      linen_id,
      storage_time_out
    FROM storage_out
    ORDER BY storage_time_out DESC
  `;

  try {
    const [rows] = await pool.query(sql);
    res.json({
      success: true,
      storage_out: rows,
    });
  } catch (err) {
    console.error("Gagal mengambil data storage_out:", err);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server saat mengambil data storage_out",
    });
  }
};

export const storage_keep_log = async (req, res) => {
  const sql = `
    SELECT 
      storage_pic,
      linen_id,
      storage_type,
      storage_time_in
    FROM storage_keep_log
    ORDER BY storage_time_in DESC
  `;

  try {
    const [rows] = await pool.query(sql);
    res.json({ success: true, storage_keep_log: rows });
  } catch (err) {
    console.error("Gagal mengambil data storage_keep_log:", err);
    res.status(500).json({ success: false, message: "Gagal mengambil data storage_keep_log" });
  }
};

export const storage_out_log = async (req, res) => {
  const sql = `
    SELECT 
      storage_pic,
      linen_id,
      storage_time_out
    FROM storage_out_log
    ORDER BY storage_time_out DESC
  `;

  try {
    const [rows] = await pool.query(sql);
    res.json({ success: true, storage_out_log: rows });
  } catch (err) {
    console.error("Gagal mengambil data storage_out_log:", err);
    res.status(500).json({ success: false, message: "Gagal mengambil data storage_out_log" });
  }
};

export const getInventorySummary = async (req, res) => {
  try {
    const [keepResult, outResult] = await Promise.all([
      pool.query("SELECT COUNT(*) AS total_keep FROM storage_keep"),
      pool.query("SELECT COUNT(*) AS total_out FROM storage_out"),
    ]);

    const totalKeep = keepResult[0][0].total_keep || 0;
    const totalOut = outResult[0][0].total_out || 0;

    res.json({
      success: true,
      data: {
        storage: totalKeep,
        on_the_way: totalOut,
      },
    });
  } catch (error) {
    console.error("Error in getInventorySummary:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getRowType = async (req, res) => {
  try {
    const [perTipe] = await pool.query(`
      SELECT
          l.LINEN_TYPE,
          s.storage_type,
          COUNT(*) AS jumlah
      FROM storage_keep s
      JOIN linens l ON s.linen_id = l.linen_id
      GROUP BY l.linen_type, s.storage_type
      ORDER BY l.linen_type;
    `);

    const [todayTotal] = await pool.query(`
      SELECT COUNT(*) AS today_total
      FROM storage_keep
      WHERE DATE(storage_time_in) = CURDATE();
    `);

    const [totalStorage] = await pool.query(`
      SELECT COUNT(*) AS total_storage
      FROM storage_keep;
    `);

    const [totalTipe] = await pool.query(`
      SELECT COUNT(DISTINCT l.LINEN_TYPE) AS total_tipe
      FROM linens l
      JOIN storage_keep s ON l.linen_id = s.linen_id;
    `);

    res.json({
      success: true,
      data: perTipe,
      today_total: todayTotal[0].today_total,
      total_storage: totalStorage[0].total_storage,
      total_tipe: totalTipe[0].total_tipe
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Gagal mengambil data storage" });
  }
};