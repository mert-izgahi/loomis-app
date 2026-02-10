import { View } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type CreateViewInput = {
  reportId: string;
  userId: string;
  ipAddress: string;
  userAgent: string;
};

export class ViewService {
  static async createView(data: CreateViewInput): Promise<View> {
    return prisma.view.create({
      data: {
        reportId: data.reportId,
        userId: data.userId,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
      include: {
        report: true,
        user: true,
      },
    });
  }

  static async findById(id: string) {
    return prisma.view.findUnique({
      where: { id },
      include: {
        report: true,
        user: true,
      },
    });
  }

  static async findAll() {
    return prisma.view.findMany({
      include: {
        report: true,
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  static async getViewsByReport(reportId: string) {
    return prisma.view.findMany({
      where: { reportId },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  static async getViewsByUser(userId: string) {
    return prisma.view.findMany({
      where: { userId },
      include: {
        report: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  static async getViewCount(reportId: string): Promise<number> {
    return prisma.view.count({
      where: { reportId },
    });
  }

  static async getUniqueViewCount(reportId: string): Promise<number> {
    const uniqueUsers = await prisma.view.findMany({
      where: { reportId },
      select: { userId: true },
      distinct: ["userId"],
    });
    return uniqueUsers.length;
  }

  static async getRecentViews(reportId: string, limit = 10) {
    return prisma.view.findMany({
      where: { reportId },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });
  }

  static async getUserViewHistory(userId: string, limit = 20) {
    return prisma.view.findMany({
      where: { userId },
      include: {
        report: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });
  }

  static async getViewStats(reportId: string) {
    const totalViews = await this.getViewCount(reportId);
    const uniqueViews = await this.getUniqueViewCount(reportId);

    return {
      totalViews,
      uniqueViews,
      averageViewsPerUser: uniqueViews > 0 ? totalViews / uniqueViews : 0,
    };
  }

  static async deleteView(id: string): Promise<View> {
    return prisma.view.delete({
      where: { id },
    });
  }
}
