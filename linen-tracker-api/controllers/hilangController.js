import { pool } from "../db.js";

export const getMissingLinens = async (req, res) => {
  try {
    const sql = `
    SELECT 
      l.LINEN_ID,
      l.LINEN_TYPE,
      l.LINEN_HEIGHT,
      l.LINEN_WIDTH,
      l.LINEN_MAX_CYCLE,
      w.LINEN_TOTAL_WASH,
      l.LINEN_DESCRIPTION,
      v.storage_time_out,
      v.hourdiff
    FROM linens l
    JOIN view_item_lost v ON v.linen_id = l.LINEN_ID
    JOIN view_item_total_wash w ON w.linen_id = l.LINEN_ID
    ORDER BY v.hourdiff DESC;
  `;
    const [rows] = await pool.query(sql);

    res.status(200).json({
      success: true,
      total: rows.length,
      data: rows,
    });
  } catch (err) {
    console.error("❌ Error fetching missing linen:", err);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data linen hilang.",
      error: err.message,
    });
  }
};
