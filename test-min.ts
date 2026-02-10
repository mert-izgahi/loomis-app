// Minimal test to debug why search works in diagnostic but not in app
import ldap from "ldapjs";

const config = {
    url: "ldap://global.cashmgmt.net:389",
    baseDN: "DC=global,DC=cashmgmt,DC=net",
    bindDN: "KokpitUser@global.cashmgmt.net",
    bindPassword: "34bdwkbFOQdfdVcQ",
};

console.log("🔍 Testing LDAP Search - Minimal Reproduction");
console.log("=".repeat(70));

const client = ldap.createClient({
    url: config.url,
    timeout: 10000,
    connectTimeout: 15000,
    reconnect: false
});

client.bind(config.bindDN, config.bindPassword, (bindErr) => {
    if (bindErr) {
        console.log("❌ Bind failed:", bindErr.message);
        process.exit(1);
    }

    console.log("✅ Service account authenticated");
    console.log("\n📋 Test 1: Search with exact filter that worked in diagnostic");
    
    const filter = "(sAMAccountName=kokpituser2)";
    console.log(`Filter: ${filter}`);
    console.log(`Base DN: ${config.baseDN}`);
    
    const searchOptions: ldap.SearchOptions = {
        filter: filter,
        scope: "sub",
        attributes: ["sAMAccountName", "userPrincipalName", "cn", "distinguishedName"],
        timeLimit: 5,
        sizeLimit: 1
    };

    console.log("\nSearch options:", JSON.stringify(searchOptions, null, 2));
    console.log("\nExecuting search...\n");

    client.search(config.baseDN, searchOptions, (err, res) => {
        if (err) {
            console.log("❌ Search error:", err);
            client.destroy();
            process.exit(1);
        }

        let found = false;
        let entryCount = 0;

        res.on("searchRequest", (searchRequest) => {
            console.log("📤 Search request sent:", searchRequest.messageID);
        });

        res.on("searchEntry", (entry) => {
            found = true;
            entryCount++;
            console.log(`\n✅ FOUND USER #${entryCount}:`);
            console.log("DN:", entry.objectName || entry.dn);
            
            const obj = entry.pojo;
            if (obj.attributes) {
                obj.attributes.forEach((attr: any) => {
                    console.log(`  ${attr.type}:`, attr.values || attr.vals);
                });
            }
        });

        res.on("searchReference", (referral) => {
            console.log("🔗 Search referral:", referral.uris);
        });

        res.on("error", (searchErr) => {
            console.log("❌ Search stream error:", searchErr);
        });

        res.on("end", (result) => {
            console.log("\n📊 Search completed");
            console.log(`Status: ${result?.status}`);
            console.log(`Entries found: ${entryCount}`);
            
            if (!found) {
                console.log("\n❌ NO USERS FOUND");
                console.log("\nPossible causes:");
                console.log("1. LDAP client configuration differs between scripts");
                console.log("2. Network/connection issue");
                console.log("3. Permissions issue (unlikely since bind succeeded)");
                console.log("4. Case sensitivity or special characters in filter");
            } else {
                console.log("\n✅ SUCCESS - User was found!");
            }
            
            client.destroy();
            process.exit(found ? 0 : 1);
        });
    });
});

client.on("error", (err) => {
    console.error("❌ Client error:", err);
    process.exit(1);
});

// Add timeout
setTimeout(() => {
    console.log("\n⏱️ Test timeout - no results after 15 seconds");
    client.destroy();
    process.exit(1);
}, 15000);