// services/ldap.service.ts
import ldap from "ldapjs";
import { configs } from "@/configs";

export interface LDAPConfig {
    url: string;
    baseDN: string;
    bindDN?: string;
    bindPassword?: string;
}

export interface LDAPUser {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    groups?: string[];
    department?: string;
    office?: string;
    title?: string;
    distinguishedName?: string;
}

class LDAPService {
    private config: LDAPConfig;

    constructor() {
        this.config = {
            url: configs.LDAP_URL || "ldap://global.cashmgmt.net:389",
            baseDN: configs.LDAP_BASE_DN || "DC=global,DC=cashmgmt,DC=net",
            bindDN: configs.LDAP_BIND_DN,
            bindPassword: configs.LDAP_BIND_PASSWORD,
        };

        console.log("🔧 LDAP Service initialized");
        console.log("   URL:", this.config.url);
        console.log("   Base DN:", this.config.baseDN);
    }

    /**
     * Authenticate user against LDAP
     */
    async authenticate(username: string, password: string): Promise<LDAPUser | null> {
        return new Promise((resolve) => {
            console.log(`\n🔐 Attempting LDAP authentication for user: ${username}`);

            const client = ldap.createClient({
                url: this.config.url,
                timeout: 5000,
                connectTimeout: 10000,
                reconnect: false,
            });

            const domainMatch = this.config.baseDN.match(/DC=([^,]+)/g);
            const domain = domainMatch
                ? domainMatch.map(dc => dc.substring(3)).join('.')
                : 'global.cashmgmt.net';

            const userUPN = `${username}@${domain}`;
            console.log(`   Trying UPN: ${userUPN}`);

            let isResolved = false;

            const cleanup = () => {
                if (!isResolved) {
                    isResolved = true;
                    try {
                        client.destroy();
                    } catch (e) {
                        // Ignore cleanup errors
                    }
                }
            };

            // Set overall timeout
            const timeoutId = setTimeout(() => {
                if (!isResolved) {
                    console.error("⏱️ Authentication timeout");
                    cleanup();
                    resolve(null);
                }
            }, 15000); // Increased timeout

            // Try to authenticate
            client.bind(userUPN, password, (bindErr) => {
                if (bindErr) {
                    console.error("❌ Authentication failed:", bindErr.message);
                    clearTimeout(timeoutId);
                    cleanup();
                    resolve(null);
                    return;
                }

                console.log("✅ Authentication successful");

                // Search for user details
                this.searchUserDetailed(client, username)
                    .then((user) => {
                        console.log("✅ User details found");
                        console.log("USER:", JSON.stringify(user, null, 2));
                        clearTimeout(timeoutId);
                        cleanup();
                        resolve(user);
                    })
                    .catch((searchErr) => {
                        console.log("⚠️ Search failed:", searchErr.message);

                        // Create basic user object from authentication
                        const basicUser: LDAPUser = {
                            username: username.toLowerCase(),
                            email: `${username.toLowerCase()}@cashmgmt.net`,
                            firstName: this.capitalizeFirst(username),
                            lastName: "",
                            phone: undefined,
                            groups: ["Domain Users"],
                        };

                        console.log("✅ Created basic user object");
                        clearTimeout(timeoutId);
                        cleanup();
                        resolve(basicUser);
                    });
            });

            client.on("error", (err) => {
                console.error("❌ Client error:", err.message);
                if (!isResolved) {
                    clearTimeout(timeoutId);
                    cleanup();
                    resolve(null);
                }
            });
        });
    }

    /**
     * Detailed search for user with all possible attributes
     */
    private searchUserDetailed(client: ldap.Client, username: string): Promise<LDAPUser> {
        return new Promise((resolve, reject) => {
            console.log(`🔍 Detailed search for: ${username}`);

            const searchOptions: ldap.SearchOptions = {
                filter: `(|(sAMAccountName=${username})(cn=${username})(userPrincipalName=${username}@*))`,
                scope: "sub",
                // Use empty array to get ALL attributes (wildcard behavior)
                // This avoids issues with special characters in Turkish attribute names
                attributes: [],
                timeLimit: 5,
                sizeLimit: 1,
            };

            let searchCompleted = false;
            let searchTimeout: NodeJS.Timeout;

            const finishSearch = (error?: Error) => {
                if (!searchCompleted) {
                    searchCompleted = true;
                    clearTimeout(searchTimeout);
                    if (error) {
                        reject(error);
                    }
                }
            };

            // Set a 5 second timeout for search
            searchTimeout = setTimeout(() => {
                finishSearch(new Error("Search timeout"));
            }, 5000);

            client.search(this.config.baseDN, searchOptions, (err, res) => {
                if (err) {
                    finishSearch(err);
                    return;
                }

                res.on("searchEntry", (entry) => {
                    if (searchCompleted) return;

                    try {
                        const obj = entry.pojo;

                        console.log("📦 Raw entry object:", JSON.stringify(obj, null, 2));

                        // Convert attributes array to object
                        const attributes = obj.attributes.reduce((acc: any, attr: any) => {
                            // Handle attributes more carefully
                            const attrType = attr.type || attr.name || 'unknown';
                            const attrValues = attr.values || attr.vals || [];

                            acc[attrType] = Array.isArray(attrValues) && attrValues.length === 1
                                ? attrValues[0]
                                : attrValues;
                            return acc;
                        }, {});

                        // Log all attributes for debugging
                        console.log("📋 All LDAP attributes found:", Object.keys(attributes).sort());
                        console.log("📋 Attribute details:");
                        Object.keys(attributes).sort().forEach(key => {
                            const value = attributes[key];
                            if (Array.isArray(value) && value.length > 0) {
                                console.log(`   ${key}: [${value.length} items]`, value[0]);
                            } else if (!Array.isArray(value)) {
                                console.log(`   ${key}:`, value);
                            }
                        });

                        // Extract email with fallback to Turkish field name
                        const email =
                            attributes.mail ||
                            attributes["E-post bilgisi"] ||
                            attributes.userPrincipalName ||
                            `${username}@cashmgmt.net`;

                        // Extract department with fallback to Turkish field name
                        const department =
                            attributes.department ||
                            attributes.Department ||
                            attributes.Departman ||
                            undefined;

                        // Extract office with fallback to Turkish field name
                        const office =
                            attributes.office ||
                            attributes.Office ||
                            attributes.Ofis ||
                            attributes["Ofis Bilgisi"] ||
                            attributes.physicalDeliveryOfficeName ||
                            undefined;

                        // Extract title with fallback to Turkish field name
                        const title =
                            attributes.title ||
                            attributes.Title ||
                            attributes.Unvan ||
                            attributes["Ünvan"] ||
                            undefined;

                        // Extract name components
                        const firstName =
                            attributes.givenName ||
                            attributes.cn?.split(" ")[0] ||
                            attributes.displayName?.split(" ")[0] ||
                            this.capitalizeFirst(username);

                        const lastName =
                            attributes.sn ||
                            attributes.cn?.split(" ").slice(1).join(" ") ||
                            attributes.displayName?.split(" ").slice(1).join(" ") ||
                            "";

                        // Extract phone number
                        const phone =
                            attributes.telephoneNumber ||
                            attributes.mobile ||
                            undefined;

                        // Extract groups
                        let groups: string[] = ["Domain Users"];
                        if (attributes.memberOf) {
                            if (Array.isArray(attributes.memberOf)) {
                                groups = attributes.memberOf.map((dn: string) => this.extractGroupName(dn));
                            } else {
                                groups = [this.extractGroupName(attributes.memberOf)];
                            }
                        }

                        const ldapUser: LDAPUser = {
                            username: attributes.sAMAccountName || username,
                            email: email,
                            firstName: firstName,
                            lastName: lastName,
                            phone: phone,
                            groups: groups,
                            department: department,
                            office: office,
                            title: title,
                            distinguishedName: attributes.distinguishedName,
                        };

                        console.log("✅ Final user object:", JSON.stringify(ldapUser, null, 2));

                        finishSearch();
                        resolve(ldapUser);
                    } catch (parseErr) {
                        console.error("❌ Parse error:", parseErr);
                        console.error("Stack:", (parseErr as Error).stack);
                        finishSearch(parseErr as Error);
                    }
                });

                res.on("error", (searchErr) => {
                    console.error("❌ Search error:", searchErr);
                    finishSearch(searchErr);
                });

                res.on("end", (result) => {
                    if (!searchCompleted) {
                        console.log("⚠️⚠️⚠️ Search ended with no results");
                        finishSearch(new Error("No results found"));
                    }
                });
            });
        });
    }

    /**
     * Capitalize first letter of string
     */
    private capitalizeFirst(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    /**
     * Extract group name from LDAP DN
     */
    private extractGroupName(dn: string): string {
        const match = dn.match(/^CN=([^,]+)/);
        return match ? match[1] : dn;
    }

    /**
     * Test LDAP connection
     */
    async testConnection(): Promise<boolean> {
        return new Promise((resolve) => {
            console.log("🧪 Testing LDAP connection...");

            const client = ldap.createClient({
                url: this.config.url,
                timeout: 3000,
                connectTimeout: 5000,
            });

            let resolved = false;
            const timeoutId = setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    console.error("⏱️ Connection test timeout");
                    try {
                        client.destroy();
                    } catch (e) {
                        // Ignore
                    }
                    resolve(false);
                }
            }, 6000);

            client.on("connect", () => {
                if (!resolved) {
                    resolved = true;
                    console.log("✅ Connection test successful");
                    clearTimeout(timeoutId);
                    try {
                        client.destroy();
                    } catch (e) {
                        // Ignore
                    }
                    resolve(true);
                }
            });

            client.on("error", (err) => {
                if (!resolved) {
                    resolved = true;
                    console.error("❌ Connection test failed:", err.message);
                    clearTimeout(timeoutId);
                    resolve(false);
                }
            });
        });
    }

    /**
     * Search for user by username (useful for testing)
     */
    async searchUser(username: string): Promise<LDAPUser | null> {
        return new Promise((resolve) => {
            console.log(`\n🔍 Searching for user: ${username}`);

            const client = ldap.createClient({
                url: this.config.url,
                timeout: 5000,
                connectTimeout: 10000,
            });

            // If bind credentials are provided, use them
            if (this.config.bindDN && this.config.bindPassword) {
                client.bind(this.config.bindDN, this.config.bindPassword, (bindErr) => {
                    if (bindErr) {
                        console.error("❌ Bind failed:", bindErr.message);
                        client.destroy();
                        resolve(null);
                        return;
                    }

                    this.searchUserDetailed(client, username)
                        .then((user) => {
                            client.destroy();
                            resolve(user);
                        })
                        .catch((err) => {
                            console.error("❌ Search failed:", err.message);
                            client.destroy();
                            resolve(null);
                        });
                });
            } else {
                console.error("❌ No bind credentials configured");
                client.destroy();
                resolve(null);
            }
        });
    }

    /**
     * Normalize Turkish characters for database storage
     */
    normalizeString(str: string): string {
        return str
            .toLowerCase()
            .replace(/ğ/g, "g")
            .replace(/ü/g, "u")
            .replace(/ş/g, "s")
            .replace(/ı/g, "i")
            .replace(/ö/g, "o")
            .replace(/ç/g, "c")
            .trim();
    }
}

export default new LDAPService();