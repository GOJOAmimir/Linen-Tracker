import { pool } from "../db.js";

export const getStatusSummary = async (req, res) => {
  const sql = `
    SELECT 
      COUNT(so.linen_id) AS intransit,
      SUM(CASE WHEN sk.linen_id IS NOT NULL AND so.linen_id IS NULL THEN 1 ELSE 0 END) AS bersih,
      SUM(CASE WHEN pi.linen_id IS NOT NULL 
                AND sk.linen_id IS NULL 
                AND so.linen_id IS NULL THEN 1 ELSE 0 END) AS dicuci,
                COUNT(il.linen_id) AS hilang,
                COUNT(ui.linen_id) AS dipakai
    FROM linens l
    LEFT JOIN processed_items pi ON l.LINEN_ID = pi.linen_id
    LEFT JOIN storage_keep sk ON l.LINEN_ID = sk.linen_id
    LEFT JOIN storage_out so ON l.LINEN_ID = so.linen_id
    LEFT JOIN view_item_lost il ON l.LINEN_ID = il.linen_id
    LEFT JOIN usage_in ui ON l.LINEN_ID = ui.linen_id;
  `;

  try {
    const [rows] = await pool.query(sql);

    const result = {
      intransit: rows[0].intransit || 0,
      dicuci: rows[0].dicuci || 0,
      bersih: rows[0].bersih || 0,
      hilang: rows[0].hilang || 0,
      dipakai: rows[0].dipakai || 0,
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
};
