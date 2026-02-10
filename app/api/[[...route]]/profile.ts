import { Context, Hono } from "hono";
import { ReportStatus, ReportType } from "@/models/report.model";
import { authMiddleware } from "@/lib/auth";
import fs from "fs";
import { getReportsQuery } from "./reports";
import UserService from "@/services/user.service";
import { prisma } from "@/lib/prisma";
import { Role } from "@/lib/enums";

export const profileApi = new Hono()

  // @description Get current user profile
  // @route GET /api/profile
  // @access Private
  .get("/", authMiddleware, async (c: Context) => {
    try {
      const currentUser = c.get("user");

      if (!currentUser) {
        return c.json(
          {
            success: false,
            message: "Kullanıcı bulunamadı",
            result: null,
          },
          { status: 401 }
        );
      }

      // Get full user with relations
      const user = await prisma.user.findUnique({
        where: { id: currentUser.id },
        include: {
          groups: true,
          favouriteReports: {
            include: {
              category: true,
              groups: true,
            },
          },
        },
      });

      if (!user) {
        return c.json(
          {
            success: false,
            message: "Kullanıcı bulunamadı",
            result: null,
          },
          { status: 404 }
        );
      }

      return c.json(
        {
          success: true,
          message: "Kullanıcı bilgileri",
          result: user,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Get user error:", error);
      return c.json(
        { success: false, message: "Get user error", result: null },
        { status: 500 }
      );
    }
  })

  // @description Get accessible reports for current user
  // @route GET /api/profile/reports
  // @access Private
  // .get("/reports", authMiddleware, async (c: Context) => {
  //   try {
  //     const user = c.get("user");

  //     if (!user) {
  //       return c.json(
  //         {
  //           success: false,
  //           message: "Kullanıcı bulunamadı",
  //           result: null,
  //         },
  //         { status: 401 }
  //       );
  //     }

  //     const currentUser = await prisma.user.findUnique({
  //       where: { id: user.id },
  //       include: { groups: true },
  //     });

  //     if (!currentUser) {
  //       return c.json(
  //         {
  //           success: false,
  //           message: "Kullanıcı bulunamadı",
  //           result: null,
  //         },
  //         { status: 404 }
  //       );
  //     }

  //     const { page, limit, skip, sortKey, sortOrder, whereClause } =
  //       await getReportsQuery(c);

  //     const currentUserGroupIds = currentUser.groups.map((g) => g.id);

  //     // Default filters
  //     whereClause.isActive = true;
  //     whereClause.status = ReportStatus.Published;

  //     // Admins can see everything
  //     if (currentUser.role === Role.Admin) {
  //       delete whereClause.status; // Optional: allow Admins to see Draft/Pending
  //     } else {
  //       // User can see reports in their groups OR reports with no groups
  //       const groupFilter = whereClause.groups;

  //       if (groupFilter?.some) {
  //         // If there's already a group filter, check if user has access
  //         const requestedGroupId = groupFilter.some.id;
  //         if (currentUserGroupIds.includes(requestedGroupId)) {
  //           // User has access to this specific group
  //           whereClause.groups = groupFilter;
  //         } else {
  //           // User doesn't have access, return empty
  //           return c.json(
  //             {
  //               success: true,
  //               message: "Raporlar listelendi",
  //               result: {
  //                 records: [],
  //                 pagination: {
  //                   pageIndex: page,
  //                   pageSize: limit,
  //                   total: 0,
  //                   pageCount: 0,
  //                   hasNextPage: false,
  //                   hasPrevPage: false,
  //                 },
  //               },
  //             },
  //             { status: 200 }
  //           );
  //         }
  //       } else {
  //         // General access: user's groups OR no groups
  //         whereClause.OR = [
  //           { groups: { some: { id: { in: currentUserGroupIds } } } },
  //           { groups: { none: {} } },
  //         ];
  //       }
  //     }

  //     const reports = await prisma.report.findMany({
  //       where: whereClause,
  //       orderBy: {
  //         [sortKey]: sortOrder === "asc" ? "asc" : "desc",
  //       },
  //       skip: skip,
  //       take: limit,
  //       include: {
  //         category: true,
  //         groups: true,
  //       },
  //     });

  //     const records = reports.map((report) => ({
  //       ...report,
  //       isExists:
  //         report.type === ReportType.Internal
  //           ? report.reportPath
  //             ? fs.existsSync(report.reportPath)
  //             : false
  //           : true,
  //     }));

  //     const total = await prisma.report.count({ where: whereClause });
  //     const pageCount = Math.ceil(total / limit);

  //     return c.json(
  //       {
  //         success: true,
  //         message: "Raporlar listelendi",
  //         result: {
  //           records,
  //           pagination: {
  //             pageIndex: page,
  //             pageSize: limit,
  //             total,
  //             pageCount,
  //             hasNextPage: page < pageCount,
  //             hasPrevPage: page > 1,
  //           },
  //         },
  //       },
  //       { status: 200 }
  //     );
  //   } catch (error) {
  //     console.error("Get reports error:", error);
  //     return c.json(
  //       { success: false, message: "Get reports error", result: null },
  //       { status: 500 }
  //     );
  //   }
  // })
  // @description Get accessible reports for current user
  // @route GET /api/profile/reports
  // @access Private
  .get("/reports", authMiddleware, async (c: Context) => {
    try {
      const user = c.get("user");

      if (!user) {
        return c.json(
          {
            success: false,
            message: "Kullanıcı bulunamadı",
            result: null,
          },
          { status: 401 }
        );
      }

      const currentUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: { groups: true },
      });

      if (!currentUser) {
        return c.json(
          {
            success: false,
            message: "Kullanıcı bulunamadı",
            result: null,
          },
          { status: 404 }
        );
      }

      const { page, limit, skip, sortKey, sortOrder, whereClause } =
        await getReportsQuery(c);

      const currentUserGroupIds = currentUser.groups.map((g) => g.id);

      // Build access conditions based on user role
      const accessConditions = [] as any;

      // Admins can see everything
      if (currentUser.role === Role.Admin) {
        // Admin sees all active reports, regardless of status
        whereClause.isActive = true;
        // Optionally remove status filter if admin should see all statuses
        // delete whereClause.status;
      } else {
        // Non-admin users: only published reports
        whereClause.isActive = true;
        whereClause.status = ReportStatus.Published;

        // Regular users can see:
        // 1. Reports with no groups (public to all authenticated users)
        // 2. Reports where they belong to at least one group
        accessConditions.push(
          { groups: { none: {} } }, // No groups = public
          { groups: { some: { id: { in: currentUserGroupIds } } } } // In user's groups
        );

        // If there are group filters in the query, ensure user has access
        if (whereClause.groups) {
          const groupFilter = whereClause.groups;

          if (groupFilter.some && groupFilter.some.id) {
            // Check if user has access to the requested group
            const requestedGroupId = groupFilter.some.id;
            if (!currentUserGroupIds.includes(requestedGroupId)) {
              // User doesn't have access to this group
              return c.json(
                {
                  success: true,
                  message: "Raporlar listelendi",
                  result: {
                    records: [],
                    pagination: {
                      pageIndex: page,
                      pageSize: limit,
                      total: 0,
                      pageCount: 0,
                      hasNextPage: false,
                      hasPrevPage: false,
                    },
                  },
                },
                { status: 200 }
              );
            }
          }

          // Remove the original group filter as we'll handle access separately
          delete whereClause.groups;
        }
      }

      // Apply access conditions for non-admin users
      if (accessConditions.length > 0) {
        whereClause.AND = [
          ...(whereClause.AND || []),
          { OR: accessConditions }
        ];
      }

      const reports = await prisma.report.findMany({
        where: whereClause,
        orderBy: {
          [sortKey]: sortOrder === "asc" ? "asc" : "desc",
        },
        skip: skip,
        take: limit,
        include: {
          category: true,
          groups: true,
          views: {
            select: {
              id: true,
              createdAt: true,
            },
            orderBy: {
              createdAt: 'desc'
            },
            take: 1
          }
        },
      });

      const records = reports.map((report) => ({
        ...report,
        isExists:
          report.type === ReportType.Internal
            ? report.reportPath
              ? fs.existsSync(report.reportPath)
              : false
            : true,
        viewCount: report.views?.length || 0,
        lastViewedAt: report.views?.[0]?.createdAt || null,
      }));

      const total = await prisma.report.count({ where: whereClause });
      const pageCount = Math.ceil(total / limit);

      return c.json(
        {
          success: true,
          message: "Raporlar listelendi",
          result: {
            records,
            pagination: {
              pageIndex: page,
              pageSize: limit,
              total,
              pageCount,
              hasNextPage: page < pageCount,
              hasPrevPage: page > 1,
            },
          },
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Get reports error:", error);
      return c.json(
        { success: false, message: "Get reports error", result: null },
        { status: 500 }
      );
    }
  })
  // @description Get trending reports
  // @route GET /api/profile/reports/trending
  // @access Private
  // @description Get trending reports
  // @route GET /api/profile/reports/trending
  // @access Private
  .get("/reports/trending", authMiddleware, async (c: Context) => {
    try {
      const user = c.get("user");

      if (!user) {
        return c.json(
          {
            success: false,
            message: "Kullanıcı bulunamadı",
            result: null,
          },
          { status: 401 }
        );
      }

      const currentUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: { groups: true },
      });

      if (!currentUser) {
        return c.json(
          {
            success: false,
            message: "Kullanıcı bulunamadı",
            result: null,
          },
          { status: 404 }
        );
      }

      const userGroupIds = currentUser.groups.map((g) => g.id);

      // Build access control condition
      const accessCondition =
        currentUser.role === Role.Admin
          ? {} // Admins can see all
          : {
            OR: [
              { groups: { none: {} } },
              { groups: { some: { id: { in: userGroupIds } } } },
            ],
          };

      // Get view counts for accessible reports
      const viewCounts = await prisma.view.groupBy({
        by: ["reportId"],
        where: {
          report: {
            isActive: true,
            status: ReportStatus.Published,
            ...accessCondition,
          },
        },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 10,
      });

      // Get full report details
      const trendingReports = await Promise.all(
        viewCounts.map(async (vc) => {
          const report = await prisma.report.findUnique({
            where: { id: vc.reportId },
            select: {
              id: true,
              name: true,
              status: true,
              description: true,
              type: true,
              reportPath: true,
              createdAt: true,
              category: true,
              groups: true,
            },
          });

          if (!report) return null;

          return {
            reportId: vc.reportId,
            viewCount: vc._count.id,
            report: {
              ...report,
              isExists:
                report.type === ReportType.Internal
                  ? report.reportPath
                    ? fs.existsSync(report.reportPath)
                    : false
                  : true,
            },
          };
        })
      );

      // Filter out null values
      const filteredReports = trendingReports.filter((r) => r !== null);

      return c.json(
        {
          success: true,
          message: "Trending reports retrieved successfully",
          result: filteredReports,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Get trending reports error:", error);
      return c.json(
        {
          success: false,
          message: "Failed to get trending reports",
          result: null,
        },
        { status: 500 }
      );
    }
  })

  // @description Update user profile
  // @route PUT /api/profile
  // @access Private
  .put("/", authMiddleware, async (c: Context) => {
    try {
      const currentUser = c.get("user");

      if (!currentUser) {
        return c.json(
          {
            success: false,
            message: "Kullanıcı bulunamadı",
            result: null,
          },
          { status: 401 }
        );
      }

      const { firstName, lastName, email, phone } = await c.req.json();

      const user = await UserService.updateUser(currentUser.id, {
        firstName,
        lastName,
        email,
        phone,
      });

      return c.json(
        {
          success: true,
          message: "Kullanıcı bilgileri güncellendi",
          result: user,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Update user error:", error);
      return c.json(
        { success: false, message: "Update user error", result: null },
        { status: 500 }
      );
    }
  })

  // @description Get user metrics/dashboard stats
  // @route GET /api/profile/metrics
  // @access Private
  .get("/metrics", authMiddleware, async (c: Context) => {
    try {
      const currentUser = c.get("user");

      if (!currentUser) {
        return c.json(
          {
            success: false,
            message: "Kullanıcı bulunamadı",
            result: null,
          },
          { status: 401 }
        );
      }

      const user = await prisma.user.findUnique({
        where: { id: currentUser.id },
        include: {
          groups: true,
          favouriteReports: true,
        },
      });

      if (!user) {
        return c.json(
          {
            success: false,
            message: "Kullanıcı bulunamadı",
            result: null,
          },
          { status: 404 }
        );
      }

      const favoriteReportsCount = user.favouriteReports.length;
      const userGroupIds = user.groups.map((g) => g.id);

      // Build query based on user role
      const reportsWhere: any = {
        isActive: true,
      };

      if (user.role === Role.Admin) {
        // Admin can see all active reports
      } else {
        // Regular users see only published reports in their groups or with no groups
        reportsWhere.status = ReportStatus.Published;
        reportsWhere.OR = [
          { groups: { some: { id: { in: userGroupIds } } } },
          { groups: { none: {} } },
        ];
      }

      const reportsCount = await prisma.report.count({ where: reportsWhere });
      const categoriesCount = await prisma.category.count();
      const groupsCount = await prisma.group.count();
      const usersCount = await prisma.user.count();

      // Get new reports
      const newReports = await prisma.report.findMany({
        where: reportsWhere,
        orderBy: { createdAt: "desc" },
        take: 3,
        include: {
          category: true,
          groups: true,
        },
      });

      const newReportsRecords = newReports.map((report) => ({
        ...report,
        isExists:
          report.type === ReportType.Internal
            ? report.reportPath
              ? fs.existsSync(report.reportPath)
              : false
            : true,
      }));

      return c.json(
        {
          success: true,
          message: "Kullanıcı metrikleri",
          result: {
            favoriteReportsCount,
            reportsCount,
            categoriesCount,
            groupsCount,
            usersCount,
            newReports: newReportsRecords,
            newReportsCount: newReportsRecords.length,
          },
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Get user metrics error:", error);
      return c.json(
        { success: false, message: "Get user metrics error", result: null },
        { status: 500 }
      );
    }
  })

  // @description Toggle favorite report
  // @route PATCH /api/profile/toggle-favorite-report
  // @access Private
  .patch("/toggle-favorite-report", authMiddleware, async (c: Context) => {
    try {
      const currentUser = c.get("user");

      if (!currentUser) {
        return c.json(
          {
            success: false,
            message: "Kullanıcı bulunamadı",
            result: null,
          },
          { status: 401 }
        );
      }

      const { id: reportId } = await c.req.json();

      if (!reportId) {
        return c.json(
          {
            success: false,
            message: "Rapor ID gerekli",
            result: null,
          },
          { status: 400 }
        );
      }

      const user = await prisma.user.findUnique({
        where: { id: currentUser.id },
        include: { favouriteReports: true },
      });

      if (!user) {
        return c.json(
          {
            success: false,
            message: "Kullanıcı bulunamadı",
            result: null,
          },
          { status: 404 }
        );
      }

      const isFavorite = user.favouriteReports.some((r) => r.id === reportId);

      let updatedUser;
      if (isFavorite) {
        // Remove from favorites
        updatedUser = await UserService.removeFavouriteReport(
          currentUser.id,
          reportId
        );
      } else {
        // Add to favorites
        updatedUser = await UserService.addFavouriteReport(
          currentUser.id,
          reportId
        );
      }

      return c.json(
        {
          success: true,
          message: isFavorite
            ? "Rapor favorilerden çıkarıldı"
            : "Rapor favorilere eklendi",
          result: updatedUser,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Toggle favorite error:", error);
      return c.json(
        { success: false, message: "Toggle favorite error", result: null },
        { status: 500 }
      );
    }
  })

  // @description Get favorite reports
  // @route GET /api/profile/favorite-reports
  // @access Private
  .get("/favorite-reports", authMiddleware, async (c: Context) => {
    try {
      const currentUser = c.get("user");

      if (!currentUser) {
        return c.json(
          {
            success: false,
            message: "Kullanıcı bulunamadı",
            result: null,
          },
          { status: 401 }
        );
      }

      const user = await prisma.user.findUnique({
        where: { id: currentUser.id },
        include: {
          favouriteReports: {
            where: {
              isActive: true,
            },
            include: {
              category: true,
              groups: true,
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });

      if (!user) {
        return c.json(
          {
            success: false,
            message: "Kullanıcı bulunamadı",
            result: null,
          },
          { status: 404 }
        );
      }

      const records = user.favouriteReports.map((report) => ({
        ...report,
        isExists:
          report.type === ReportType.Internal
            ? report.reportPath
              ? fs.existsSync(report.reportPath)
              : false
            : true,
      }));

      return c.json(
        {
          success: true,
          message: "Kullanıcı favorileri",
          result: records,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Get favorite reports error:", error);
      return c.json(
        { success: false, message: "Get favorite reports error", result: null },
        { status: 500 }
      );
    }
  })

