// services/report.service.ts

import { prisma } from "@/lib/prisma";
import { remove as removeDiacritics } from "diacritics";
import { Prisma, Report, User } from "@/generated/prisma/client";
import { ReportStatus, ReportType } from "@/lib/enums";
import { ReportSchemaInput } from "@/lib/zod";
import { slugifyText } from "@/lib/utils";
import path from "path";
import fs from "fs";
export type UpdateReportInput = Partial<ReportSchemaInput>;

export class ReportService {
  /**
   * Normalize text for search
   */
  private static normalizeText(text: string): string {
    return removeDiacritics(text.toLowerCase());
  }

  /**
   * Create a new report
   */
  static async createReport(data: ReportSchemaInput): Promise<Report | null> {
    const slugName = slugifyText(data.name);

    // Check if report name is unique
    const existingReport = await prisma.report.findUnique({
      where: { slug: slugName },
    });
    let report;
    if (existingReport) {
      throw new Error("Aynı isimde bir rapor zaten mevcut.");
    }
    // If type is internal then create report folder
    if (data.type === ReportType.Internal) {
      const reportPath = path.join(process.cwd(), "reports-list", slugName);
      if (!fs.existsSync(reportPath)) {
        // Create report folder
        fs.mkdirSync(reportPath, { recursive: true });

        // Create client.tsx
        const clientPath = path.join(reportPath, "client.tsx");

        fs.writeFileSync(
          clientPath,
          `
                import { AnimatedCardsContainer } from "@/components/shared/animated";
                import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
                import React from "react";
                
                export default function Page() {
                    return (
                        <AnimatedCardsContainer className="bg-muted p-4 flex items-center justify-center h-64 rounded-md">
                            <div className="max-w-xl flex flex-col gap-3 p-4">
                                <h1 className="font-bold text-xl">
                                ${data.name}
                                </h1>
                                <p className="text-xs">
                                    ${data.description}
                                </p>
                
                                <Alert className="bg-red-100 shadow-none">
                                    <AlertTitle>
                                        Rapor Beklemede
                                    </AlertTitle>
                                    <AlertDescription>
                                        Raport Üzerinde çalışmalar yapılyor tamamlandıkten sonra tekrar burdan görebilirsiniz
                                    </AlertDescription>
                                </Alert>
                            </div>
                        </AnimatedCardsContainer>
                    );
                }
                        `
        );

        // Create query.ts
        const queryPath = path.join(reportPath, "api.ts");
        fs.writeFileSync(queryPath, `export const query = \`\`;`);
      }

      report = prisma.report.create({
        data: {
          name: data.name,
          slug: slugName,
          description: data.description,
          reportPath: reportPath,
          status: data.status || ReportStatus.Pending,
          type: data.type || ReportType.Internal,
          isActive: true,
          normalizedName: this.normalizeText(data.name),
          normalizedDescription: this.normalizeText(data.description),
          category: {
            connect: { id: data.categoryId },
          },
          groups: data.groupIds
            ? {
              connect: data.groupIds.map((id) => ({ id })),
            }
            : undefined,
        },
        include: {
          category: true,
          groups: true,
        },
      });

      return report;
    } else {
      report = prisma.report.create({
        data: {
          name: data.name,
          slug: slugName,
          description: data.description,
          status: data.status || ReportStatus.Draft,
          type: data.type || ReportType.External,
          isActive: true,
          link: data.link,
          normalizedName: this.normalizeText(data.name),
          normalizedDescription: this.normalizeText(data.description),
          category: {
            connect: { id: data.categoryId },
          },
          groups: data.groupIds
            ? {
              connect: data.groupIds.map((id) => ({ id })),
            }
            : undefined,
        },
        include: {
          category: true,
          groups: true,
        },
      });

      return report;
    }
  }

  /**
   * Find report by ID
   */
  static async findById(id: string): Promise<Report | null> {
    return prisma.report.findUnique({
      where: { id },
      include: {
        category: true,
        groups: true,
        favouritedBy: true,
      },
    });
  }

  /**
   * Find report by slug
   */
  static async findBySlug(slug: string): Promise<Report | null> {
    return prisma.report.findUnique({
      where: { slug },
      include: {
        category: true,
        groups: true,
      },
    });
  }

  /**
 * Update report
 */
  static async updateReport(
    id: string,
    data: UpdateReportInput,
    updatedBy?: User
  ): Promise<Report> {
    const { categoryId, groupIds, ...rest } = data;

    const updateData: Prisma.ReportUpdateInput = {
      ...rest,
    };


    // Normalize text if provided
    if (rest.name) {
      updateData.normalizedName = this.normalizeText(rest.name);
    }

    if (rest.description) {
      updateData.normalizedDescription = this.normalizeText(rest.description);
    }

    // ✅ Update groups (many-to-many)
    if (groupIds) {
      if (groupIds.length > 0) {
        updateData.groups = {
          set: groupIds.map((id) => ({ id })),
        };
      } else {
        updateData.groups = {
          set: [],
        };
      }

    }

    // ✅ Update category (one-to-many)
    if (categoryId) {
      updateData.category = {
        connect: { id: categoryId },
      };
    }

    // ✅ Update "updatedBy" user relation
    if (updatedBy && updatedBy.id) {
      updateData.updatedBy = {
        connect: { id: updatedBy.id },
      };
    }

    console.log("📝 Update Data", updateData);
    console.log("👤 Updated By", updatedBy?.id);

    // ✅ Perform update
    return prisma.report.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        groups: true,
        updatedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }


  /**
   * Delete report
   */
  static async deleteReport(id: string): Promise<Report> {
    return prisma.report.delete({
      where: { id },
    });
  }

  /**
   * Soft delete report
   */
  static async softDeleteReport(id: string): Promise<Report> {
    return prisma.report.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Get all reports
   */
  static async findAll(includeInactive = false): Promise<Report[]> {
    return prisma.report.findMany({
      include: {
        category: true,
        groups: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /**
   * Get reports by category
   */
  static async findByCategory(categoryId: string): Promise<Report[]> {
    return prisma.report.findMany({
      where: {
        categoryId,
        isActive: true,
      },
      include: {
        category: true,
        groups: true,
      },
    });
  }

  /**
   * Get reports by status
   */
  static async findByStatus(status: ReportStatus): Promise<Report[]> {
    return prisma.report.findMany({
      where: {
        status,
        isActive: true,
      },
      include: {
        category: true,
        groups: true,
      },
    });
  }

  /**
   * Search reports
   */
  static async searchReports(searchTerm: string): Promise<Report[]> {
    const normalized = this.normalizeText(searchTerm);

    return prisma.report.findMany({
      where: {
        AND: [
          { isActive: true },
          {
            OR: [
              { normalizedName: { contains: normalized } },
              { normalizedDescription: { contains: normalized } },
            ],
          },
        ],
      },
      include: {
        category: true,
        groups: true,
      },
    });
  }

  /**
   * Get reports by group
   */
  static async findByGroup(groupId: string): Promise<Report[]> {
    return prisma.report.findMany({
      where: {
        groups: {
          some: {
            id: groupId,
          },
        },
        isActive: true,
      },
      include: {
        category: true,
        groups: true,
      },
    });
  }

  /**
   * Get user's accessible reports
   */
  static async findAccessibleByUser(userId: string): Promise<Report[]> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { groups: true },
    });

    if (!user) {
      return [];
    }

    const groupIds = user.groups.map((g) => g.id);

    return prisma.report.findMany({
      where: {
        isActive: true,
        status: ReportStatus.Published,
        OR: [
          // Reports with no groups are accessible to all
          { groups: { none: {} } },
          // Reports where user is in at least one group
          {
            groups: {
              some: {
                id: { in: groupIds },
              },
            },
          },
        ],
      },
      include: {
        category: true,
        groups: true,
      },
    });
  }

  /**
   * Add groups to report
   */
  static async addGroups(
    reportId: string,
    groupIds: string[]
  ): Promise<Report> {
    return prisma.report.update({
      where: { id: reportId },
      data: {
        groups: {
          connect: groupIds.map((id) => ({ id })),
        },
      },
      include: {
        category: true,
        groups: true,
      },
    });
  }

  /**
   * Remove groups from report
   */
  static async removeGroups(
    reportId: string,
    groupIds: string[]
  ): Promise<Report> {
    return prisma.report.update({
      where: { id: reportId },
      data: {
        groups: {
          disconnect: groupIds.map((id) => ({ id })),
        },
      },
      include: {
        category: true,
        groups: true,
      },
    });
  }
}

export default ReportService;
