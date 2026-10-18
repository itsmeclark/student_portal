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
    console.error('MySQL connection failed!');
    console.error('  code   :', err.code || (err.errors && err.errors[0] && err.errors[0].code));
    console.error('  message:', err.message || (err.errors && err.errors[0] && err.errors[0].message));
    console.error('  host   :', process.env.DB_HOST);
    console.error('  port   :', process.env.DB_PORT);
    console.error('  user   :', process.env.DB_USER);
    console.error('  db name:', process.env.DB_NAME);
}

export default db;