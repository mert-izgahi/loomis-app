// test-connection.js
import sql from "mssql";

console.log("TESTING CONNECTION ...")

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

sql.connect(config).then(() => {
    console.log('Connected successfully!');
}).catch(err => {
    console.error('Connection error:', err);
});