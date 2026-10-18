import mysql from 'mysql2/promise';
import { configDotenv } from 'dotenv';

configDotenv();

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test the connection on startup
try {
    const connection = await db.getConnection();
    console.log('MySQL connected');
    connection.release();
} catch (err) {
    console.error('MySQL connection failed:', err.message);
}

export default db;