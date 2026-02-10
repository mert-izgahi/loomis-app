// find-port.js
import sql from "mssql";

console.log("Finding SQL Server port...\n");

const config = {
    server: '10.225.9.50\\TRLOOSQLTESTDB',
    database: 'KokpitTestDB',
    user: 'kokpitdbuser',
    password: '34bdwkbFOQdfdVcQ',
    options: {
        trustServerCertificate: true,
        encrypt: false
    }
};

sql.connect(config).then((pool) => {
    console.log('✅ Connected successfully!\n');
    
    // Get connection info
    const request = pool.request();
    return request.query(`
        SELECT 
            CONNECTIONPROPERTY('local_tcp_port') as Port,
            @@SERVERNAME as ServerName,
            DB_NAME() as DatabaseName
    `);
}).then((result) => {
    console.log('Connection Details:');
    console.log('-------------------');
    console.log('Server Name:', result.recordset[0].ServerName);
    console.log('Database:', result.recordset[0].DatabaseName);
    console.log('Port:', result.recordset[0].Port);
    console.log('\n✅ Use this port in your Prisma connection string!\n');
    
    const port = result.recordset[0].Port;
    console.log('Updated DATABASE_URL:');
    console.log(`DATABASE_URL="sqlserver://10.225.9.50,${port};database=KokpitTestDB;user=kokpitdbuser;password=34bdwkbFOQdfdVcQ;trustServerCertificate=true;encrypt=false"`);
    
    process.exit(0);
}).catch(err => {
    console.error('❌ Connection error:', err);
    process.exit(1);
});