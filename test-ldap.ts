// LDAP Diagnostic Script - Enhanced User Search
// This will help identify why the user search is failing

import ldap from "ldapjs";

const config = {
    url: "ldap://global.cashmgmt.net:389",
    baseDN: "DC=global,DC=cashmgmt,DC=net",
    bindDN: "KokpitUser@global.cashmgmt.net",
    bindPassword: "34bdwkbFOQdfdVcQ",
};

async function diagnosticSearch() {
    console.log("\n🔍 ENHANCED LDAP DIAGNOSTIC");
    console.log("=" .repeat(70));
    
    return new Promise((resolve) => {
        const client = ldap.createClient({
            url: config.url,
            timeout: 15000,
            connectTimeout: 15000,
        });

        client.bind(config.bindDN, config.bindPassword, (bindErr) => {
            if (bindErr) {
                console.log("❌ Service account bind failed:", bindErr.message);
                client.destroy();
                resolve(false);
                return;
            }

            console.log("✅ Service account authenticated");
            console.log("\n📋 Testing multiple search strategies...\n");

            // Strategy 1: Search by sAMAccountName (current approach)
            testSearch(client, "Strategy 1: sAMAccountName", 
                "(sAMAccountName=kokpituser2)")
                .then(() => {
                    // Strategy 2: Case-insensitive sAMAccountName
                    return testSearch(client, "Strategy 2: sAMAccountName (uppercase)", 
                        "(sAMAccountName=KOKPITUSER2)");
                })
                .then(() => {
                    // Strategy 3: Search by userPrincipalName
                    return testSearch(client, "Strategy 3: userPrincipalName", 
                        "(userPrincipalName=kokpituser2@global.cashmgmt.net)");
                })
                .then(() => {
                    // Strategy 4: Search by CN (Common Name)
                    return testSearch(client, "Strategy 4: CN (Common Name)", 
                        "(cn=kokpituser2)");
                })
                .then(() => {
                    // Strategy 5: Wildcard search
                    return testSearch(client, "Strategy 5: Wildcard sAMAccountName", 
                        "(sAMAccountName=*kokpit*)");
                })
                .then(() => {
                    // Strategy 6: Search by email
                    return testSearch(client, "Strategy 6: Email/mail attribute", 
                        "(mail=kokpituser2@global.cashmgmt.net)");
                })
                .then(() => {
                    // Strategy 7: Combined OR filter
                    return testSearch(client, "Strategy 7: Combined OR filter", 
                        "(|(sAMAccountName=kokpituser2)(userPrincipalName=kokpituser2@global.cashmgmt.net)(cn=kokpituser2))");
                })
                .then(() => {
                    // Strategy 8: List all users in Service Account OU
                    console.log("\n📂 Strategy 8: Listing users in Service Account OU");
                    return listServiceAccountUsers(client);
                })
                .then(() => {
                    console.log("\n" + "=".repeat(70));
                    console.log("✅ Diagnostic complete");
                    client.destroy();
                    resolve(true);
                })
                .catch((err) => {
                    console.error("❌ Diagnostic error:", err);
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

function testSearch(client: any, strategyName: string, filter: string): Promise<void> {
    return new Promise((resolve) => {
        console.log(`\n${strategyName}`);
        console.log(`   Filter: ${filter}`);

        const searchOptions: ldap.SearchOptions = {
            filter: filter,
            scope: "sub",
            attributes: [
                "sAMAccountName",
                "userPrincipalName", 
                "cn",
                "distinguishedName",
                "mail",
                "displayName",
                "givenName",
                "sn"
            ],
            timeLimit: 10,
            sizeLimit: 5
        };

        client.search(config.baseDN, searchOptions, (err: any, res: any) => {
            if (err) {
                console.log(`   ❌ Search error: ${err.message}`);
                resolve();
                return;
            }

            let foundCount = 0;

            res.on("searchEntry", (entry: any) => {
                foundCount++;
                console.log(`\n   ✅ FOUND USER #${foundCount}:`);
                console.log(`   DN: ${entry.objectName || entry.dn}`);
                
                const obj = entry.pojo;
                if (obj.attributes) {
                    obj.attributes.forEach((attr: any) => {
                        const values = attr.values || attr.vals || [];
                        console.log(`   ${attr.type}: ${values.join(", ")}`);
                    });
                }
            });

            res.on("error", (searchErr: any) => {
                console.log(`   ⚠️  Search stream error: ${searchErr.message}`);
            });

            res.on("end", () => {
                if (foundCount === 0) {
                    console.log("   ❌ No users found");
                } else {
                    console.log(`   ✅ Total found: ${foundCount}`);
                }
                resolve();
            });
        });
    });
}

function listServiceAccountUsers(client: any): Promise<void> {
    return new Promise((resolve) => {
        // Try to search specifically in the Service Account OU
        const serviceAccountBase = "OU=Service Account,OU=USERS,OU=LOOMIS,OU=TR,OU=TR,OU=PROD,DC=global,DC=cashmgmt,DC=net";
        
        console.log(`   Searching in: ${serviceAccountBase}`);
        console.log("   Filter: (objectClass=user)");

        const searchOptions: ldap.SearchOptions = {
            filter: "(objectClass=user)",
            scope: "sub",
            attributes: [
                "sAMAccountName",
                "userPrincipalName",
                "cn",
                "distinguishedName"
            ],
            sizeLimit: 10
        };

        client.search(serviceAccountBase, searchOptions, (err: any, res: any) => {
            if (err) {
                console.log(`   ❌ Search error: ${err.message}`);
                console.log("   Note: Service Account OU path may not exist or be accessible");
                resolve();
                return;
            }

            let foundCount = 0;

            res.on("searchEntry", (entry: any) => {
                foundCount++;
                const obj = entry.pojo;
                const attrs: any = {};
                
                if (obj.attributes) {
                    obj.attributes.forEach((attr: any) => {
                        attrs[attr.type] = (attr.values || attr.vals || [])[0];
                    });
                }

                console.log(`\n   User ${foundCount}:`);
                console.log(`      sAMAccountName: ${attrs.sAMAccountName || 'N/A'}`);
                console.log(`      userPrincipalName: ${attrs.userPrincipalName || 'N/A'}`);
                console.log(`      CN: ${attrs.cn || 'N/A'}`);
            });

            res.on("error", (searchErr: any) => {
                console.log(`   ⚠️  Search stream error: ${searchErr.message}`);
            });

            res.on("end", () => {
                if (foundCount === 0) {
                    console.log("   ❌ No users found in Service Account OU");
                    console.log("   This may mean:");
                    console.log("      - The OU path is incorrect");
                    console.log("      - Users are in a different location");
                    console.log("      - Service account lacks permissions");
                } else {
                    console.log(`\n   ✅ Total users in Service Account OU: ${foundCount}`);
                }
                resolve();
            });
        });
    });
}

// Run diagnostic
diagnosticSearch()
    .then(() => {
        console.log("\n💡 RECOMMENDATIONS:");
        console.log("   1. Check which strategy found the user");
        console.log("   2. Use that filter in your LDAP service");
        console.log("   3. If no strategy worked, the user may not exist in AD");
        console.log("   4. Check if 'kokpituser2' can authenticate but isn't searchable");
        process.exit(0);
    })
    .catch((err) => {
        console.error("Fatal error:", err);
        process.exit(1);
    });