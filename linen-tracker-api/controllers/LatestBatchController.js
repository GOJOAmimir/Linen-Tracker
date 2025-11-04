import { pool } from "../db.js";

export const LatestBatchController = async (req, res) => {
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
};
