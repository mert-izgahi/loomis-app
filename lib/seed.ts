// prisma/seed.ts

import { Faker, tr, en } from "@faker-js/faker";
import { prisma } from "@/lib/prisma";
import { User } from "@/generated/prisma/client";
import { Role } from "@/lib/enums";
import { remove } from "diacritics";
import bcryptjs from "bcryptjs";

const faker = new Faker({
  locale: [tr, en],
});

const categoriesData = [
  {
    name: "Müşteriler Ürün Raporları",
    description: "Müşteriler Ürün Raporları",
  },
  {
    name: "Müşteriler Alışveriş Raporları",
    description: "Müşteriler Alışveriş Raporları",
  },
  {
    name: "Müşteriler Satış Raporları",
    description: "Müşteriler Satış Raporları",
  },
  {
    name: "Müşteriler Stok Raporları",
    description: "Müşteriler Stok Raporları",
  },
  {
    name: "Satış Raporları",
    description: "Genel satış raporları ve analizleri",
  },
  {
    name: "Günlük Satış Raporları",
    description: "Günlük satış performans raporları",
  },
  {
    name: "Aylık Satış Raporları",
    description: "Aylık satış trend raporları",
  },
  {
    name: "Yıllık Satış Raporları",
    description: "Yıllık satış özet raporları",
  },
  {
    name: "Finansal Raporlar",
    description: "Mali durum ve finansal analizler",
  },
  {
    name: "Gelir Gider Raporları",
    description: "Gelir ve gider analiz raporları",
  },
  {
    name: "Kâr Zarar Raporları",
    description: "Kâr zarar durum raporları",
  },
  {
    name: "Nakit Akış Raporları",
    description: "Nakit akış analiz raporları",
  },
];

const groupsData = [
  {
    name: "Yönetim Ekibi",
    description: "Yönetim kadrosu",
  },
  {
    name: "Satış Ekibi",
    description: "Satış departmanı",
  },
  {
    name: "Destek Ekibi",
    description: "Müşteri destek ekibi",
  },
  {
    name: "Müşteri Ekibi",
    description: "Müşteri destek ekibi",
  },
  {
    name: "Müşteri Destek Ekibi",
    description: "Müşteri destek ekibi",
  },
];

class Seeder {
  private createdCategories: any[] = [];

  async clearDatabase() {
    try {
      console.log("🧹 Clearing existing data...");

      // Delete in correct order due to foreign key constraints
      await prisma.view.deleteMany({});
      await prisma.report.deleteMany({});
      await prisma.category.deleteMany({});
      await prisma.group.deleteMany({});
      await prisma.user.deleteMany({});

      console.log("✅ Database cleared successfully");
    } catch (error) {
      console.error("❌ Error clearing database:", error);
      throw error;
    }
  }

  async seedCategories() {
    try {
      console.log("📁 Seeding categories...");

      for (const categoryData of categoriesData) {
        const category = await prisma.category.create({
          data: {
            name: categoryData.name,
            description: categoryData.description,
            normalizedName: this.normalizeText(categoryData.name),
            normalizedDescription: this.normalizeText(categoryData.description),
          },
        });
        this.createdCategories.push(category);
      }

      console.log(`✅ Created ${this.createdCategories.length} categories`);
    } catch (error) {
      console.error("❌ Error seeding categories:", error);
      throw error;
    }
  }

  async seedUsers() {
  try {
    console.log("👤 Seeding users...");
    
    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        firstName: "Admin",
        lastName: "User",
        email: "admin@example.com",
        password: await this.hashPassword("admin123"),
        role: Role.Admin,
        normalizedFirstName: this.normalizeText("Admin"),
        normalizedLastName: this.normalizeText("User"),
      },
    });
    
    console.log("✅ Created admin user");
    
    // Create regular users
    const usersToCreate: Array<{
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      role: Role;
      normalizedFirstName: string;
      normalizedLastName: string;
    }> = [];
    const hashedPassword = await this.hashPassword("password123"); // Hash once, reuse
    
    for (let i = 0; i < 100; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const newUser = {
        firstName,
        lastName,
        email: faker.internet.email(),
        password: hashedPassword, // Use pre-hashed password
        role: Role.User,
        normalizedFirstName: this.normalizeText(firstName),
        normalizedLastName: this.normalizeText(lastName),
      }
      usersToCreate.push(newUser);
    }
    
    // Batch create users for better performance
    await prisma.user.createMany({
      data: usersToCreate,
    });
    
    console.log("✅ Created 101 users (1 admin, 100 regular users)");
  } catch (error) {
    console.error("❌ Error seeding users:", error);
    throw error;
  }
}

  async seedGroups() {
    try {
      console.log("👥 Seeding groups...");

      // Get all users
      const users = await prisma.user.findMany({
        where: { role: Role.User },
      });

      for (const groupData of groupsData) {
        // Select random users for this group
        const selectedUsers = faker.helpers.arrayElements(users, {
          min: 1,
          max: Math.min(5, users.length),
        });

        const group = await prisma.group.create({
          data: {
            name: groupData.name,
            description: groupData.description,
            normalizedName: this.normalizeText(groupData.name),
            normalizedDescription: this.normalizeText(groupData.description),
            members: {
              connect: selectedUsers.map((user: User) => ({ id: user.id })),
            },
          },
          include: {
            members: true,
          },
        });

        console.log(
          `✅ Created group "${group.name}" with ${selectedUsers.length} members`
        );
      }

      console.log(`✅ Created ${groupsData.length} groups`);
    } catch (error) {
      console.error("❌ Error seeding groups:", error);
      throw error;
    }
  }

  async seedReports() {
    try {
      console.log("📄 Seeding reports...");

      const categories = await prisma.category.findMany();
      const groups = await prisma.group.findMany();

      const reportNames = [
        "Günlük Satış Özeti",
        "Haftalık Performans Raporu",
        "Aylık Gelir Analizi",
        "Müşteri Memnuniyet Raporu",
        "Stok Durumu Raporu",
        "Sipariş Takip Raporu",
        "Ürün Satış Analizi",
        "Bölgesel Satış Raporu",
        "Personel Performans Raporu",
        "Finansal Özet Raporu",
        "Kâr Marjı Analizi",
        "Müşteri Segmentasyon Raporu",
        "Tedarik Zinciri Raporu",
        "Envanter Analizi",
        "Satış Tahmin Raporu",
        "Yıllık Büyüme Raporu",
        "Maliyet Analizi",
        "Nakit Akış Raporu",
        "Borç Alacak Raporu",
        "KPI Dashboard Raporu",
      ];

      const statuses = ["Published", "Draft", "Pending"];
      const types = ["Internal", "External"];

      for (let i = 0; i < reportNames.length; i++) {
        const name = reportNames[i];
        const slug = this.normalizeText(name).replace(/\s+/g, "-");
        const category = faker.helpers.arrayElement(categories);
        const selectedGroups = faker.helpers.arrayElements(groups, { min: 1, max: 3 });

        await prisma.report.create({
          data: {
            name,
            slug,
            description: `${name} - Bu rapor ${category.name} kategorisinde yer almaktadır.`,
            normalizedName: this.normalizeText(name),
            normalizedDescription: this.normalizeText(`${name} - Bu rapor ${category.name} kategorisinde yer almaktadır.`),
            isActive: faker.datatype.boolean({ probability: 0.8 }),
            status: faker.helpers.arrayElement(statuses),
            type: faker.helpers.arrayElement(types),
            reportPath: `/reports/${slug}`,
            categoryId: category.id,
            groups: {
              connect: selectedGroups.map((g) => ({ id: g.id })),
            },
          },
        });
      }

      console.log(`✅ Created ${reportNames.length} reports`);
    } catch (error) {
      console.error("❌ Error seeding reports:", error);
      throw error;
    }
  }

  async seedViews() {
    try {
      console.log("👁️ Seeding views...");

      const reports = await prisma.report.findMany();
      const users = await prisma.user.findMany();

      const userAgents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15",
        "Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36",
        "Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15",
      ];

      let viewCount = 0;

      for (const report of reports) {
        // Her rapor için 5-20 arası görüntülenme
        const viewsForReport = faker.number.int({ min: 5, max: 20 });

        for (let i = 0; i < viewsForReport; i++) {
          const user = faker.helpers.arrayElement(users);
          const daysAgo = faker.number.int({ min: 0, max: 90 });
          const createdAt = new Date();
          createdAt.setDate(createdAt.getDate() - daysAgo);

          await prisma.view.create({
            data: {
              ipAddress: faker.internet.ip(),
              userAgent: faker.helpers.arrayElement(userAgents),
              reportId: report.id,
              userId: user.id,
              createdAt,
            },
          });
          viewCount++;
        }
      }

      console.log(`✅ Created ${viewCount} views`);
    } catch (error) {
      console.error("❌ Error seeding views:", error);
      throw error;
    }
  }

  async showStatistics() {
    try {
      console.log("\n📊 Database Statistics:");

      const userCount = await prisma.user.count();
      const categoryCount = await prisma.category.count();
      const groupCount = await prisma.group.count();
      const reportCount = await prisma.report.count();
      const viewCount = await prisma.view.count();

      console.log(`👤 Users: ${userCount}`);
      console.log(`📁 Categories: ${categoryCount}`);
      console.log(`👥 Groups: ${groupCount}`);
      console.log(`📄 Reports: ${reportCount}`);
      console.log(`👁️ Views: ${viewCount}`);

      // Show sample data
      console.log("\n📋 Sample Data:");

      const sampleUser = await prisma.user.findFirst({
        where: { role: Role.Admin },
      });

      if (sampleUser) {
        console.log(
          `Sample User: ${sampleUser.firstName} ${sampleUser.lastName} (${sampleUser.email}) - Role: ${sampleUser.role}`
        );
      }

      const sampleCategory = await prisma.category.findFirst({
        include: {
          _count: {
            select: { reports: true },
          },
        },
      });

      if (sampleCategory) {
        console.log(
          `Sample Category: ${sampleCategory.name} (${sampleCategory._count.reports} reports)`
        );
      }

      const sampleGroup = await prisma.group.findFirst({
        include: {
          _count: {
            select: { members: true },
          },
        },
      });

      if (sampleGroup) {
        console.log(
          `Sample Group: ${sampleGroup.name} (${sampleGroup._count.members} members)`
        );
      }
    } catch (error) {
      console.error("❌ Error showing statistics:", error);
    }
  }

  // Helper function to hash passwords
  private async hashPassword(password: string): Promise<string> {
    const salt = await bcryptjs.genSalt(12);
    return bcryptjs.hash(password, salt);
  }

  // Helper function to normalize text
  private normalizeText(text: string): string {
    return remove(text.toLowerCase());
  }

  async run() {
    try {
      console.log("🚀 Starting database seeding...\n");

      await this.clearDatabase();
      await this.seedCategories();
      await this.seedUsers();
      await this.seedGroups();
      await this.seedReports();
      await this.seedViews();
      await this.showStatistics();

      console.log("\n🎉 Database seeding completed successfully!");
      console.log("\n📝 Login Credentials:");
      console.log("Admin: admin@example.com / admin123");
      console.log("Regular Users: password123 for all other users");
    } catch (error) {
      console.error("💥 Seeding failed:", error);
      throw error;
    } finally {
      await prisma.$disconnect();
    }
  }
}

// Run the seeder
async function main() {
  const seeder = new Seeder();
  await seeder.run();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});