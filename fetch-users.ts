// export-users.js
const sql = require('mssql');
const fs = require('fs');
const path = require('path');
require('dotenv').config(); // For loading credentials from .env

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
        trustServerCertificate: true, // Use this if your SQL Server uses self-signed certs
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
    },
};

// ========================================
// CONNECT TO SQL SERVER
// ========================================
async function getSqlConnection() {
    try {
        const pool = await sql.connect(config);
        console.log("✅ Connected to SQL Server");
        return pool;
    } catch (error: any) {
        console.error("❌ Database connection failed:", error.message);
        throw error;
    }
}

// ========================================
// FETCH USERS
// ========================================
async function fetchUsers() {
    const pool = await getSqlConnection();
    try {
        const query = `SELECT * FROM DWH.SubeEslestirme`; // Adjust your schema/table name
        const result = await pool.request().query(query);
        console.log(`✅ Retrieved ${result.recordset.length} records`);
        return result.recordset;
    } catch (error: any) {
        console.error("❌ Query failed:", error.message);
        throw error;
    } finally {
        await pool.close();
    }
}

// ========================================
// EXPORT TO JSON
// ========================================
async function exportUsersAsJson() {
    console.log("🚀 Starting export process...");

    const users = await fetchUsers();

    if (!users || users.length === 0) {
        console.log("⚠️ No users found in database.");
        return;
    }

    // Create export directory
    const exportDir = path.join(__dirname, 'exports');
    if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir, { recursive: true });
    }

    // File name with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filePath = path.join(exportDir, `users-export-${timestamp}.json`);

    // Write formatted JSON
    fs.writeFileSync(filePath, JSON.stringify(users, null, 2), 'utf8');

    console.log(`✅ Exported successfully to: ${filePath}`);
    console.log(`📦 Total Records: ${users.length}`);
}

// ========================================
// RUN SCRIPT
// ========================================
if (require.main === module) {
    exportUsersAsJson()
        .then(() => console.log("✨ Export completed successfully!"))
        .catch(err => console.error("💥 Export failed:", err.message));
}

module.exports = { exportUsersAsJson, fetchUsers };
