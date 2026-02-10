import { Context, Hono } from "hono";
import { Role, ReportStatus, ReportType } from "@/lib/enums";
import { authMiddleware, roleMiddleware } from "@/lib/auth";
import fs from "fs";
import { remove as removeDiacritics } from "diacritics";
import { prisma } from "@/lib/prisma";
import ReportService from "@/services/report.service";

export const reportsApi = new Hono();

export const getReportsQuery = async (c: Context) => {
  const page = parseInt(c.req.query("page")!) || 1;
  const limit = parseInt(c.req.query("limit")!) || 10;
  const skip = (page - 1) * limit;
  const sortKey = c.req.query("sortKey") || "createdAt";
  const sortOrder = c.req.query("sortOrder") || "desc";

  const whereClause: any = {};
  const search = c.req.query("search");

  if (search) {
    const normalizedSearch = removeDiacritics(search.toLowerCase());

    // Search in categories by name
    const matchedCategories = await prisma.category.findMany({
      where: {
        normalizedName: {
          contains: normalizedSearch,
        },
      },
      select: { id: true },
    });
    const categoryIds = matchedCategories.map((cat) => cat.id);

    // Build OR condition
    whereClause.OR = [
      { normalizedName: { contains: normalizedSearch } },
      {
        normalizedDescription: {
          contains: normalizedSearch,
        },
      },
      { categoryId: { in: categoryIds } },
    ];
  }

  const categoryId = c.req.query("categoryId");
  if (categoryId) {
    whereClause.categoryId = categoryId;
  }

  const groupId = c.req.query("groupId");
  if (groupId) {
    whereClause.groups = {
      some: { id: groupId },
    };
  }

  const status = c.req.query("status");
  if (status) {
    whereClause.status = status as ReportStatus;
  }

  const type = c.req.query("type");
  if (type) {
    whereClause.type = type as ReportType;
  }

  return {
    page,
    limit,
    skip,
    sortKey,
    sortOrder,
    whereClause,
  };
};

reportsApi
  // @description Get reports
  // @route GET /api/reports
  // @access Private Admin
  .get("/", authMiddleware, roleMiddleware([Role.Admin]), async (c) => {
    try {
      const { page, limit, skip, sortKey, sortOrder, whereClause } =
        await getReportsQuery(c);

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
          updatedBy: true
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

  // @description Get all reports (no pagination)
  // @route GET /api/reports/all
  // @access Private Admin
  .get("/all", authMiddleware, roleMiddleware([Role.Admin]), async (c) => {
    try {
      const reports = await ReportService.findAll();
      console.log(reports.length,"%%%%%");
      
      const records = reports.map((report) => ({
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
          message: "Raporlar listelendi",
          result: records,
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

  // @desc Get Trending reports by views
  // @route GET /api/reports/trending
  // @access Private Admin
  .get(
    "/trending",
    authMiddleware,
    roleMiddleware([Role.Admin]),
    async (c: Context) => {
      try {
        // Get view counts grouped by report
        const viewCounts = await prisma.view.groupBy({
          by: ["reportId"],
          _count: {
            id: true,
          },
          orderBy: {
            _count: {
              id: "desc",
            },
          },
          take: 10,
        });

        // Get full report details for the top viewed reports
        const reportIds = viewCounts.map((v) => v.reportId);
        const reports = await prisma.report.findMany({
          where: {
            id: { in: reportIds },
          },
          select: {
            id: true,
            name: true,
            status: true,
            description: true,
            createdAt: true,
          },
        });

        // Combine view counts with report details
        const trendingReports = viewCounts.map((viewCount) => {
          const report = reports.find((r) => r.id === viewCount.reportId);
          return {
            reportId: viewCount.reportId,
            viewCount: viewCount._count.id,
            report: report || null,
          };
        });

        return c.json(
          {
            success: true,
            message: "Raporlar listelendi",
            result: trendingReports,
          },
          { status: 200 }
        );
      } catch (error) {
        console.error("Get trending reports error:", error);
        return c.json(
          { success: false, message: "Get reports error", result: null },
          { status: 500 }
        );
      }
    }
  )

  // @description Get report by ID
  // @route GET /api/reports/:id
  // @access Private
  .get("/:id", authMiddleware, async (c) => {
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

      const { id } = c.req.param();
      const report = await prisma.report.findUnique({
        where: { id },
        include: {
          category: true,
          groups: true,
          updatedBy: true
        },
      });

      if (!report) {
        return c.json(
          { success: false, message: "Rapor bulunamadı", result: null },
          { status: 404 }
        );
      }

      if (currentUser.role !== Role.Admin) {
        const currentUserWithGroups = await prisma.user.findUnique({
          where: { id: currentUser.id },
          include: { groups: true },
        });

        if (!currentUserWithGroups) {
          return c.json(
            {
              success: false,
              message: "Kullanıcı bulunamadı",
              result: null,
            },
            { status: 401 }
          );
        }

        const userGroupIds = currentUserWithGroups.groups.map((group) => group.id);
        const reportGroupIds = report.groups.map((group) => group.id);
        const hasGroupAccess =
          reportGroupIds.length === 0 ||
          reportGroupIds.some((groupId) => userGroupIds.includes(groupId));

        const isDispatcherReport = report.slug === "dispatcher-rapor";

        if (
          !hasGroupAccess ||
          !isDispatcherReport ||
          !report.isActive ||
          report.status !== ReportStatus.Published
        ) {
          return c.json(
            { success: false, message: "Yetkiniz yok", result: null },
            { status: 403 }
          );
        }
      }

      return c.json(
        { success: true, message: "Rapor bilgileri", result: report },
        { status: 200 }
      );
    } catch (error) {
      console.error("Get report error:", error);
      return c.json(
        { success: false, message: "Get report error", result: null },
        { status: 500 }
      );
    }
  })

  // @description Update report
  // @route PUT /api/reports/:id
  // @access Private Admin
  .put("/:id", authMiddleware, roleMiddleware([Role.Admin]), async (c) => {
    try {
      const { id } = c.req.param();
      const body = await c.req.json();
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
      console.log(body);

      const updatedReport = await ReportService.updateReport(id, body, currentUser);

      if (!updatedReport) {
        return c.json(
          { success: false, message: "Rapor bulunamadı", result: null },
          { status: 404 }
        );
      }

      return c.json(
        { success: true, message: "Rapor güncellendi", result: updatedReport },
        { status: 200 }
      );
    } catch (error) {
      console.error("Update report error:", error);
      return c.json(
        { success: false, message: "Update report error", result: null },
        { status: 500 }
      );
    }
  })
  
  // @description Update report status
  // @route PATCH /api/reports/:id/status
  // @access Private Admin
  .patch(
    "/:id/status",
    authMiddleware,
    roleMiddleware([Role.Admin]),
    async (c) => {
      try {
        const { id } = c.req.param();
        const { status } = await c.req.json();

        const report = await prisma.report.update({
          where: { id },
          data: { status },
          include: {
            category: true,
            groups: true,
            updatedBy: true
          },
        });

        if (!report) {
          return c.json(
            { success: false, message: "Rapor bulunamadı", result: null },
            { status: 404 }
          );
        }

        return c.json(
          {
            success: true,
            message: "Rapor durumu güncellendi",
            result: report,
          },
          { status: 200 }
        );
      } catch (error) {
        console.error("Update report status error:", error);
        return c.json(
          {
            success: false,
            message: "Update report status error",
            result: null,
          },
          { status: 500 }
        );
      }
    }
  )

  // @description Create report
  // @route POST /api/reports
  // @access Private Admin
  .post("/", authMiddleware, roleMiddleware([Role.Admin]), async (c) => {
    try {
      const body = await c.req.json();

      // Use the service for report creation
      const report = await ReportService.createReport(body);

      return c.json(
        { success: true, message: "Rapor oluşturuldu", result: report },
        { status: 201 }
      );
    } catch (error) {
      console.error("Create report error:", error);

      // Handle unique constraint errors
      if (error instanceof Error && error.message.includes("zaten mevcut")) {
        return c.json(
          { success: false, message: error.message, result: null },
          { status: 400 }
        );
      }

      return c.json(
        { success: false, message: "Create report error", result: null },
        { status: 500 }
      );
    }
  })

  // @description Delete report
  // @route DELETE /api/reports/:id
  // @access Private Admin
  .delete("/:id", authMiddleware, roleMiddleware([Role.Admin]), async (c) => {
    try {
      const { id } = c.req.param();

      // Get report to check if it has a reportPath to clean up
      const report = await prisma.report.findUnique({
        where: { id },
      });

      if (!report) {
        return c.json(
          { success: false, message: "Rapor bulunamadı", result: null },
          { status: 404 }
        );
      }

      // Delete report folder if it exists
      if (report.reportPath && fs.existsSync(report.reportPath)) {
        fs.rmSync(report.reportPath, { recursive: true, force: true });
      }

      // Delete from database
      await ReportService.deleteReport(id);

      return c.json(
        { success: true, message: "Rapor silindi", result: null },
        { status: 200 }
      );
    } catch (error) {
      console.error("Delete report error:", error);
      return c.json(
        { success: false, message: "Delete report error", result: null },
        { status: 500 }
      );
    }
  });
