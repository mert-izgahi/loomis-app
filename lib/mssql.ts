
import { configs } from "@/configs";
import sql from "mssql";

const config: sql.config = {
    user:configs.MSSQL_USER as string,
    password: configs.MSSQL_PASSWORD as string,
    server: process.env.MSSQL_SERVER as string,
    database: process.env.MSSQL_DATABASE as string,
    port: parseInt(process.env.MSSQL_PORT as string),
    options: {
        encrypt: true,
        trustServerCertificate: true
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
}

let pool: sql.ConnectionPool | null = null;

export async function getSqlConnection() {
    try {
        if (!pool) {
            pool = await sql.connect(config);
            console.log('✅ Database connected successfully');
        }
        return pool;
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        throw error;
    }

}