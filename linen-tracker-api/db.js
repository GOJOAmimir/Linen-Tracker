import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false },
  allowPublicKeyRetrieval: true,
  timezone: "+07:00",
  dateStrings: ["DATE", "DATETIME", "TIMESTAMP"],
  waitForConnections: true,
  connectionLimit: 10,
});
