export const configs = {
  MONGODB_URI: 'mongodb://localhost:27017/loomisDb',
  JWT_SECRET: "fd31698f282527e441ff821d1be0d74d4c3375019a06ab10235ade12dbe02a42",
  
  // API Configuration
  NEXT_PUBLIC_API_URL: "http://localhost:3000", // Local development
  //NEXT_PUBLIC_API_URL: "http://10.225.9.10",
  //NEXT_PUBLIC_API_URL: 'https://reporting-web-app.arneca.app',
  
  // MSSQL Configuration
  MSSQL_USER: "veli.kara",
  MSSQL_PASSWORD: "gK1kiEK0",
  MSSQL_PORT: 433,
  
  // Environment
  NODE_ENV: "development",
  
  // CORS
  ALLOWED_ORIGINS: [
    "https://reporting-web-app.arneca.app",
    "http://localhost:3000",
    "http://10.225.9.10"
  ],

  // ============================================================================
  // LDAP CONFIGURATION - WORKING SETTINGS
  // ============================================================================
  // These settings were verified by the diagnostic tool on 2026-02-09
  // ============================================================================
  
  // LDAP Server URL
  LDAP_URL:  "ldap://global.cashmgmt.net:389",
  
  // Base DN for searches
  // Users are located in: OU=Service Account,OU=USERS,OU=LOOMIS,OU=TR,OU=TR,OU=PROD
  // But we search from the root with subtree scope to find them
  LDAP_BASE_DN:  "DC=global,DC=cashmgmt,DC=net",
  LDAP_SEARCH_BASE:  "DC=global,DC=cashmgmt,DC=net",

  // Connection timeouts
  LDAP_TIMEOUT: parseInt(process.env.LDAP_TIMEOUT || "10000"),
  LDAP_CONNECT_TIMEOUT: parseInt(process.env.LDAP_CONNECT_TIMEOUT || "15000"),

  // ============================================================================
  // SERVICE ACCOUNT - VERIFIED WORKING ✅
  // ============================================================================
  // Diagnostic tool confirmed these credentials work and can find users
  // Format: UPN (User Principal Name)
  // Can successfully search and retrieve user details
  // ============================================================================
  
  LDAP_BIND_DN: "KokpitUser@global.cashmgmt.net",
  LDAP_BIND_PASSWORD:  "34bdwkbFOQdfdVcQ",
};