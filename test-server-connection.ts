import ldap from 'ldapjs';

const config = {
    url: "ldap://global.cashmgmt.net:389",
    baseDN: "DC=global,DC=cashmgmt,DC=net",
    bindDN: "KokpitUser@global.cashmgmt.net",
    bindPassword: "34bdwkbFOQdfdVcQ"
};

async function mimicApplicationSearch() {
    console.log("🔍 Exact Application Search Simulation\n");
    console.log("=" .repeat(70));
    
    const client = ldap.createClient({
        url: config.url,
        timeout: 10000,
        connectTimeout: 15000,
        reconnect: false  // Same as application
    });

    return new Promise((resolve) => {
        // Bind with service account
        client.bind(config.bindDN, config.bindPassword, (bindErr) => {
            if (bindErr) {
                console.log("❌ Bind failed:", bindErr.message);
                client.destroy();
                resolve(false);
                return;
            }

            console.log("✅ Service account authenticated\n");

            // Test Strategy 1: Exact match
            testStrategy(client, "(sAMAccountName=kokpituser2)", "Strategy 1: sAMAccountName")
                .then((found1) => {
                    if (found1) {
                        console.log("\n✅ SUCCESS! Strategy 1 found the user");
                        client.destroy();
                        resolve(true);
                        return;
                    }
                    
                    // Test Strategy 2: UPN with loomis.com
                    return testStrategy(client, "(userPrincipalName=kokpituser2@loomis.com)", "Strategy 2: UPN @loomis.com");
                })
                .then((found2) => {
                    if (found2) {
                        console.log("\n✅ SUCCESS! Strategy 2 found the user");
                        client.destroy();
                        resolve(true);
                        return;
                    }

                    // Test Strategy 3: Combined OR
                    return testStrategy(
                        client, 
                        "(|(sAMAccountName=kokpituser2)(userPrincipalName=kokpituser2@loomis.com)(userPrincipalName=kokpituser2@global.cashmgmt.net))",
                        "Strategy 3: Combined OR filter"
                    );
                })
                .then((found3) => {
                    if (found3) {
                        console.log("\n✅ SUCCESS! Strategy 3 found the user");
                    } else {
                        console.log("\n❌ ALL STRATEGIES FAILED - This matches the application behavior!");
                    }
                    client.destroy();
                    resolve(found3);
                })
                .catch((err) => {
                    console.error("❌ Error during search:", err);
                    client.destroy();
                    resolve(false);
                });
        });

        client.on("error", (err) => {
            console.error("❌ Client error:", err.message);
            resolve(false);
        });
    });
}

function testStrategy(client: any, filter: string, strategyName: string): Promise<boolean> {
    return new Promise((resolve) => {
        console.log(`\n${strategyName}`);
        console.log(`Filter: ${filter}`);
        console.log(`Base DN: ${config.baseDN}`);
        console.log(`Scope: sub`);

        const searchOptions: ldap.SearchOptions = {
            filter: filter,
            scope: "sub",
            attributes: [],  // Get all attributes - same as application
            timeLimit: 5,
            sizeLimit: 10
        };

        client.search(config.baseDN, searchOptions, (err: any, res: any) => {
            if (err) {
                console.log(`❌ Search error: ${err.message}`);
                resolve(false);
                return;
            }

            let foundUser = false;
            let entryCount = 0;

            res.on("searchEntry", (entry: any) => {
                foundUser = true;
                entryCount++;
                
                console.log(`\n✅ FOUND USER #${entryCount}`);
                console.log(`DN: ${entry.objectName || entry.dn}`);
                
                // Parse attributes like the application does
                const obj = entry.pojo;
                if (obj.attributes && Array.isArray(obj.attributes)) {
                    const attrs: any = {};
                    obj.attributes.forEach((attr: any) => {
                        const attrType = attr.type || attr.name || 'unknown';
                        const attrValues = attr.values || attr.vals || [];
                        attrs[attrType] = Array.isArray(attrValues) && attrValues.length === 1
                            ? attrValues[0]
                            : attrValues;
                    });
                    
                    console.log(`sAMAccountName: ${attrs.sAMAccountName || 'N/A'}`);
                    console.log(`userPrincipalName: ${attrs.userPrincipalName || 'N/A'}`);
                    console.log(`mail: ${attrs.mail || 'N/A'}`);
                    console.log(`displayName: ${attrs.displayName || 'N/A'}`);
                    console.log(`Total attributes: ${Object.keys(attrs).length}`);
                }
            });

            // CRITICAL: Handle referrals
            res.on("searchReference", (referral: any) => {
                console.log(`🔗 Referral received: ${referral.uris?.[0] || 'unknown'}`);
            });

            res.on("error", (searchErr: any) => {
                console.log(`⚠️ Search stream error: ${searchErr.message}`);
            });

            res.on("end", (result: any) => {
                console.log(`\n📊 Search completed`);
                console.log(`Status: ${result?.status}`);
                console.log(`Entries found: ${entryCount}`);
                
                if (!foundUser) {
                    console.log(`❌ No entries found`);
                }
                
                resolve(foundUser);
            });
        });
    });
}

// Run the test
mimicApplicationSearch().then((success) => {
    console.log("\n" + "=".repeat(70));
    if (success) {
        console.log("✅ CONCLUSION: Search works! The application should work with the fixed service.");
    } else {
        console.log("❌ CONCLUSION: Search still fails. Need deeper investigation.");
    }
    process.exit(success ? 0 : 1);
});