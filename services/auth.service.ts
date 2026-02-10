// services/auth.service.ts
import { prisma } from "@/lib/prisma";
import ldapService, { LDAPUser } from "./ldap.service";
import { normalizeTurkish } from "@/lib/utils";
import { User } from "@/generated/prisma/client";
import { configs } from "@/configs";


export interface AuthResult {
    success: boolean;
    user?: (Partial<User> & { groups?: any[] }) | null;
    message?: string;
}

class AuthService {
    /**
     * Authenticate user via LDAP and sync with database
     */
    async authenticateWithLDAP(username: string, password: string): Promise<AuthResult> {
        try {
            console.log(`🔐 Starting authentication for: ${username}`);

            // Step 1: Authenticate against LDAP
            const ldapUser = await ldapService.authenticate(username, password);

            if (!ldapUser) {
                console.error("❌ LDAP authentication failed");
                return {
                    success: false,
                    message: "Invalid username or password",
                };
            }

            console.log("✅ LDAP authentication successful");

            // Step 2: Sync user with database
            const dbUser = await this.syncUserWithDatabase(ldapUser);

            console.log("✅ User synced with database:", dbUser.id);

            // Fetch fresh user data with groups
            const userWithGroups = await prisma.user.findUnique({
                where: { id: dbUser.id },
                include: { groups: true },
            });

            return {
                success: true,
                user: userWithGroups ? {
                    id: userWithGroups.id,
                    firstName: userWithGroups.firstName,
                    lastName: userWithGroups.lastName,
                    email: userWithGroups.email,
                    role: userWithGroups.role,
                    phone: userWithGroups.phone,
                    department: userWithGroups.department,
                    title: userWithGroups.title,
                    office: userWithGroups.office,
                    groups: userWithGroups.groups,
                    isActive: userWithGroups.isActive
                } : undefined,
            };
        } catch (error) {
            console.error("❌ Authentication error:", error);
            return {
                success: false,
                message: "An error occurred during authentication",
            };
        }
    }

    private determineUserRole(groups: string[]): "Admin" | "Manager" | "User" {
        const normalize = (s: string) =>
            normalizeTurkish(s).toLowerCase();

        const normalizedGroups = groups.map(normalize);

        // Check for admin groups first (including TR-RG-Manager from example)
        const adminGroups = ["domain admins", "administrators", "tr-rg-manager", "admin", "yöneticiler", "it admins"];
        if (normalizedGroups.some(g => adminGroups.some(a => g.includes(a)))) {
            return "Admin";
        }

        // Check for manager groups (including TR-RG-TeamLeader from example)
        const managerGroups = ["manager", "team lead", "team leader", "yonetim", "tr-rg-teamleader"];
        if (normalizedGroups.some(g => managerGroups.some(m => g.includes(m)))) {
            return "Manager";
        }

        return "User";
    }


    /**
     * Sync LDAP user data with database
     * Creates new user or updates existing user
     */
    private async syncUserWithDatabase(ldapUser: LDAPUser) {
        console.log("🔄 Syncing user with database...");
        let user;
        const domainMatch = configs.LDAP_BASE_DN.match(/DC=([^,]+)/g);
        const domain = domainMatch
            ? domainMatch.map(dc => dc.substring(3)).join('.')
            : 'global.cashmgmt.net';
        // Check if user exists by username
        user = await prisma.user.findUnique({
            where: { email: `${ldapUser?.username}@${domain}` },
            include: { groups: true },
        });


        const userData = {
            firstName: ldapUser.firstName,
            lastName: ldapUser.lastName,
            email: `${ldapUser?.username}@${domain}`,
            normalizedFirstName: normalizeTurkish(ldapUser.firstName),
            normalizedLastName: normalizeTurkish(ldapUser.lastName),
            phone: ldapUser.phone || null,
            department: ldapUser.department || null,
            title: ldapUser.title || null,
            office: ldapUser.office || null,
            distinguishedName: ldapUser.distinguishedName || null,
            role: this.determineUserRole(ldapUser.groups || []),
        };

        console.log({ userData });
        console.log({ user });

        if (user) {
            // Update existing user
            console.log("📝 Updating existing user:", user.id);
            user = await prisma.user.update({
                where: { id: user.id },
                data: {
                    department: ldapUser.department || null,
                    title: ldapUser.title || null,
                    office: ldapUser.office || null,
                    distinguishedName: ldapUser.distinguishedName || null,
                },
                include: { groups: true },
            });
        } else {
            // Create new user
            console.log("➕ Creating new user");
            user = await prisma.user.create({
                data: {
                    ...userData,
                    isActive: true,
                },
                include: { groups: true },
            });

            console.log("✅ New user created:", user.id);
        }

        // Sync groups if available
        if (ldapUser.groups && ldapUser.groups.length > 0) {
            await this.syncUserGroups(user.id, ldapUser.groups);
        }

        return user;
    }

    /**
     * Sync LDAP groups with database groups
     * Creates groups if they don't exist and connects/disconnects user from groups
     */
    private async syncUserGroups(userId: string, ldapGroups: string[]): Promise<void> {
        try {
            // Get all current database groups
            const allDbGroups = await prisma.group.findMany();

            // Find or create groups for each LDAP group
            const targetGroupIds: string[] = [];

            for (const ldapGroup of ldapGroups) {
                const normalizedLdapGroup = normalizeTurkish(ldapGroup).toLowerCase();

                // Try to find existing group by name (case-insensitive)
                let existingGroup = allDbGroups.find(g =>
                    normalizeTurkish(g.name).toLowerCase() === normalizedLdapGroup
                );

                // If group doesn't exist, create it
                if (!existingGroup) {
                    const newGroup = await prisma.group.create({
                        data: {
                            name: ldapGroup,
                            description: `Auto-created from LDAP group: ${ldapGroup}`,
                            normalizedName: normalizedLdapGroup,
                            normalizedDescription: normalizeTurkish(`Auto-created from LDAP group: ${ldapGroup}`).toLowerCase(),
                        },
                    });
                    existingGroup = newGroup;
                }

                if (existingGroup) {
                    targetGroupIds.push(existingGroup.id);
                }
            }

            // Get user's current groups
            const currentUser = await prisma.user.findUnique({
                where: { id: userId },
                include: { groups: true },
            });

            if (!currentUser) {
                throw new Error(`User not found: ${userId}`);
            }

            const currentGroupIds = currentUser.groups.map(g => g.id);

            // Calculate groups to connect and disconnect
            const groupsToConnect = targetGroupIds.filter(id => !currentGroupIds.includes(id));
            const groupsToDisconnect = currentGroupIds.filter(id => !targetGroupIds.includes(id));

            // Update user groups
            if (groupsToConnect.length > 0 || groupsToDisconnect.length > 0) {
                await prisma.user.update({
                    where: { id: userId },
                    data: {
                        groups: {
                            connect: groupsToConnect.map(id => ({ id })),
                            disconnect: groupsToDisconnect.map(id => ({ id })),
                        },
                    },
                });
            }

            console.log(`Synced groups for user ${userId}: connected ${groupsToConnect.length}, disconnected ${groupsToDisconnect.length}`);

        } catch (error) {
            console.error("Error syncing user groups:", error);
            throw error;
        }
    }

    /**
     * Check if user should be admin based on LDAP groups
     * Customize this logic based on your organization's group structure
     */
    private checkIfAdmin(groups: string[]): boolean {
        const adminGroups = [
            "TR-RG-Manager",
            "Domain Admins",
            "Administrators",
            // Add your admin groups here
        ];

        return groups.some(group =>
            adminGroups.some(adminGroup =>
                group.toLowerCase().includes(adminGroup.toLowerCase())
            )
        );
    }

    /**
     * Get user by ID
     */
    async getUserById(userId: string) {
        return prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                role: true,
                department: true,
                title: true,
                office: true,
                isActive: true,
            },
        });
    }

    /**
     * Get user by email
     */
    async getUserByEmail(email: string) {
        return prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                role: true,
                department: true,
                title: true,
                office: true,
                isActive: true,
            },
        });
    }

    /**
     * Update user role (Admin only)
     */
    async updateUserRole(userId: string, role: "Admin" | "User") {
        return prisma.user.update({
            where: { id: userId },
            data: { role },
        });
    }

    /**
     * Deactivate user
     */
    async deactivateUser(userId: string) {
        return prisma.user.update({
            where: { id: userId },
            data: { isActive: false },
        });
    }

    /**
     * Activate user
     */
    async activateUser(userId: string) {
        return prisma.user.update({
            where: { id: userId },
            data: { isActive: true },
        });
    }

    /**
     * Get all users with filters
     */
    async getUsers(filters?: {
        role?: string;
        isActive?: boolean;
        department?: string;
        search?: string;
    }) {
        const where: any = {};

        if (filters?.role) {
            where.role = filters.role;
        }

        if (filters?.isActive !== undefined) {
            where.isActive = filters.isActive;
        }

        if (filters?.department) {
            where.department = filters.department;
        }

        if (filters?.search) {
            where.OR = [
                {
                    normalizedFirstName: {
                        contains: normalizeTurkish(filters.search),
                    },
                },
                {
                    normalizedLastName: {
                        contains: normalizeTurkish(filters.search),
                    },
                },
                {
                    email: {
                        contains: filters.search.toLowerCase(),
                    },
                },
            ];
        }

        return prisma.user.findMany({
            where,
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                role: true,
                department: true,
                title: true,
                office: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: [
                { firstName: "asc" },
                { lastName: "asc" },
            ],
        });
    }
}

export default new AuthService();