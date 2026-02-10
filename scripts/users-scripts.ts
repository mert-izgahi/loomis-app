// user-service.ts
const sql = require('mssql');
require('dotenv').config();

// ========================================
// CONFIGURATION
// ========================================
const config = {
    user: process.env.MSSQL_USER || 'your_username',
    password: process.env.MSSQL_PASSWORD || 'your_password',
    server: process.env.MSSQL_SERVER || 'TRLOOSQL-SRV\\TRLOOSQLSRV',
    database: process.env.MSSQL_DATABASE || 'Mdm_Reporting',
    options: {
        encrypt: false,
        trustServerCertificate: true,
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
    },
};

// ========================================
// CONNECTION POOL (Singleton)
// ========================================
let pool: any = null;

async function getPool() {
    if (!pool) {
        pool = await sql.connect(config);
        console.log("✅ Connected to SQL Server");
    }
    return pool;
}

// ========================================
// USER SERVICE
// ========================================

/**
 * Get user information by username
 * @param username - The username to search for (e.g., "aziz.kaya")
 * @returns User object or null if not found
 */
export async function getUserByUsername(username: string): Promise<any> {
    try {
        const pool = await getPool();

        const query = `
            SELECT * 
            FROM DWH.SubeEslestirme 
            WHERE KullaniciAdi = @username
        `;

        const result = await pool.request()
            .input('username', sql.VarChar, username)
            .query(query);

        if (result.recordset.length === 0) {
            console.log(`⚠️ No user found with username: ${username}`);
            return null;
        }

        console.log(`✅ User found: ${username}`);
        return result.recordset[0];

    } catch (error: any) {
        console.error("❌ Query failed:", error.message);
        throw error;
    }
}

/**
 * Get all users
 * @returns Array of all user objects
 */
export async function getAllUsers(): Promise<any[]> {
    try {
        const pool = await getPool();

        const query = `SELECT * FROM DWH.SubeEslestirme`;

        const result = await pool.request().query(query);

        console.log(`✅ Retrieved ${result.recordset.length} users`);
        return result.recordset;

    } catch (error: any) {
        console.error("❌ Query failed:", error.message);
        throw error;
    }
}

/**
 * Close database connection
 */
export async function closeConnection(): Promise<void> {
    if (pool) {
        await pool.close();
        pool = null;
        console.log("🔌 Database connection closed");
    }
}