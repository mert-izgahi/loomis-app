import { prisma } from "./lib/prisma";

export const clearLdapUsers = async () => {
  try {
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        email: {
          endsWith: "@cashmgmt.net",
        },
      },
    });

    console.log(
      `Successfully deleted ${deletedUsers.count} LDAP users from the database.`
    );
  } catch (error) {
    console.error("Error deleting LDAP users:", error);
  }
};

clearLdapUsers();
