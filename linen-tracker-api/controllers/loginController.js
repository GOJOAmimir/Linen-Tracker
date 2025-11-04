import { pool } from "../db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

export const LoginHandler = async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await pool.query(
      "SELECT * FROM users_shinka WHERE username = ?",
      [username]
    );

    if (rows.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: "User tidak ditemukan" });
    }

    const user = rows[0];

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res
        .status(401)
        .json({ success: false, message: "Password salah" });
    }

    const token = jwt.sign(
      { username: user.username, role: user.role || "user" },
      process.env.JWT_SECRET || "SECRET_KEY",
      { expiresIn: "1h" }
    );

    res.json({ success: true, token });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Terjadi kesalahan server" });
  }
};
