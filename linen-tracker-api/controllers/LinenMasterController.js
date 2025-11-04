import { pool } from "../db.js";

export const MasterLinen = async (req, res) => {
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
        l.LINEN_LENGTH, 
        l.LINEN_WEIGHT,
        l.LINEN_MATERIAL,
        l.LINEN_SUPPLIER,
        l.LINEN_BUDGET_SOURCE,
        l.OPERATOR_USERNAME,
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
};
