import { Context, Hono } from "hono";
import { Role } from "@/lib/enums";
import { authMiddleware, roleMiddleware } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { remove as removeDiacritics } from "diacritics";

export const viewsApi = new Hono();

export const getViewsQuery = async (c: Context) => {
  const page = parseInt(c.req.query("page")!) || 1;
  const limit = parseInt(c.req.query("limit")!) || 10;
  const skip = (page - 1) * limit;
  const sortKey = c.req.query("sortKey") || "createdAt";
  const sortOrder = c.req.query("sortOrder") || "desc";

  // Validate sortKey - only allow fields that exist on View model
  const validSortKeys = ["id", "ipAddress", "userAgent", "createdAt", "updatedAt", "reportId", "userId"];
  const validatedSortKey = validSortKeys.includes(sortKey) ? sortKey : "createdAt";

  const whereClause: any = {};

  const search = c.req.query("search");
  if (search) {
    const normalizedSearch = removeDiacritics(search.toLowerCase());

    // 1. Search in users by name or email
    const matchedUsers = await prisma.user.findMany({
      where: {
        OR: [
          {
            normalizedFirstName: {
              contains: normalizedSearch,
            },
          },
          {
            normalizedLastName: {
              contains: normalizedSearch,
            },
          },
          { email: { contains: search, } },
        ],
      },
      select: { id: true },
    });
    const userIds = matchedUsers.map((user) => user.id);

    // 2. Search in reports by name
    const matchedReports = await prisma.report.findMany({
      where: {
        normalizedName: { contains: normalizedSearch, },
      },
      select: { id: true },
    });
    const reportIds = matchedReports.map((report) => report.id);

    // 3. Build OR condition
    whereClause.OR = [
      { userId: { in: userIds } },
      { reportId: { in: reportIds } },
    ];
  }

  const reportId = c.req.query("reportId");
  if (reportId) {
    whereClause.reportId = reportId;
  }

  const userId = c.req.query("userId");
  if (userId) {
    whereClause.userId = userId;
  }

  return {
    page,
    limit,
    skip,
    sortKey: validatedSortKey,
    sortOrder,
    whereClause,
  };
};

viewsApi
  // @description Get all views with pagination
  // @route GET /api/views
  // @access Private Admin
  .get("/", authMiddleware, roleMiddleware([Role.Admin]), async (c) => {
    try {
      const { page, limit, skip, sortKey, sortOrder, whereClause } =
        await getViewsQuery(c);
      const views = await prisma.view.findMany({
        where: whereClause,
        orderBy: {
          [sortKey]: sortOrder === "asc" ? "asc" : "desc",
        },
        skip: skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          report: {
            select: {
              id: true,
              name: true,
              slug: true,
              status: true,
            },
          },
        },
      });

      const total = await prisma.view.count({ where: whereClause });
      const pageCount = Math.ceil(total / limit);

      const pagination = {
        pageIndex: page,
        pageSize: limit,
        total,
        pageCount,
        hasNextPage: page < pageCount,
        hasPrevPage: page > 1,
      };

      return c.json(
        {
          success: true,
          message: "Görüntülemeler listelendi",
          result: { records: views, pagination },
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Get views error:", error);
      return c.json(
        { success: false, message: "Get views error", result: null },
        { status: 500 }
      );
    }
  })

  // @description Get all views (no pagination)
  // @route GET /api/views/all
  // @access Private Admin
  .get("/all", authMiddleware, roleMiddleware([Role.Admin]), async (c) => {
    try {
      const views = await prisma.view.findMany({
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          report: {
            select: {
              id: true,
              name: true,
              slug: true,
              status: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return c.json(
        { success: true, message: "Görüntülemeler listelendi", result: views },
        { status: 200 }
      );
    } catch (error) {
      console.error("Get views error:", error);
      return c.json(
        { success: false, message: "Get views error", result: null },
        { status: 500 }
      );
    }
  })

  // @description Create a new view (track report view)
  // @route POST /api/views
  // @access Private
  .post("/", authMiddleware, async (c) => {
    try {
      const user = c.get("user");
      const body = await c.req.json();
      const ip = c.req.header("x-forwarded-for") || "unknown";
      const userAgent = c.req.header("user-agent") || "unknown";

      // Check if view exists in last 3 minutes
      const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000);

      const existingView = await prisma.view.findFirst({
        where: {
          userId: user.id,
          reportId: body.reportId,
          createdAt: {
            gte: threeMinutesAgo,
          },
        },
      });

      // Only create a new view if one doesn't exist in the last 3 minutes
      if (!existingView) {
        await prisma.view.create({
          data: {
            userId: user.id,
            reportId: body.reportId,
            ipAddress: ip,
            userAgent: userAgent,
          },
        });
      }

      return c.json(
        { success: true, message: "Görüntüleme kaydedildi", result: true },
        { status: 200 }
      );
    } catch (error) {
      console.error("Create view error:", error);
      return c.json(
        { success: false, message: "Create view error", result: null },
        { status: 500 }
      );
    }
  })

  // @description Get views by report ID
  // @route GET /api/views/report/:reportId
  // @access Private Admin
  .get(
    "/report/:reportId",
    authMiddleware,
    roleMiddleware([Role.Admin]),
    async (c) => {
      try {
        const { reportId } = c.req.param();

        const views = await prisma.view.findMany({
          where: { reportId },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        const viewCount = await prisma.view.count({
          where: { reportId },
        });

        return c.json(
          {
            success: true,
            message: "Rapor görüntülemeleri listelendi",
            result: {
              views,
              count: viewCount,
            },
          },
          { status: 200 }
        );
      } catch (error) {
        console.error("Get report views error:", error);
        return c.json(
          {
            success: false,
            message: "Get report views error",
            result: null,
          },
          { status: 500 }
        );
      }
    }
  )

  // @description Get views by user ID
  // @route GET /api/views/user/:userId
  // @access Private Admin
  .get(
    "/user/:userId",
    authMiddleware,
    roleMiddleware([Role.Admin]),
    async (c) => {
      try {
        const { userId } = c.req.param();

        const views = await prisma.view.findMany({
          where: { userId },
          include: {
            report: {
              select: {
                id: true,
                name: true,
                slug: true,
                status: true,
                description: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        const viewCount = await prisma.view.count({
          where: { userId },
        });

        return c.json(
          {
            success: true,
            message: "Kullanıcı görüntülemeleri listelendi",
            result: {
              views,
              count: viewCount,
            },
          },
          { status: 200 }
        );
      } catch (error) {
        console.error("Get user views error:", error);
        return c.json(
          {
            success: false,
            message: "Get user views error",
            result: null,
          },
          { status: 500 }
        );
      }
    }
  )

  // @description Delete a view
  // @route DELETE /api/views/:id
  // @access Private Admin
  .delete("/:id", authMiddleware, roleMiddleware([Role.Admin]), async (c) => {
    try {
      const { id } = c.req.param();

      const view = await prisma.view.findUnique({
        where: { id },
      });

      if (!view) {
        return c.json(
          { success: false, message: "Görüntüleme bulunamadı", result: null },
          { status: 404 }
        );
      }

      await prisma.view.delete({
        where: { id },
      });

      return c.json(
        { success: true, message: "Görüntüleme silindi", result: null },
        { status: 200 }
      );
    } catch (error) {
      console.error("Delete view error:", error);
      return c.json(
        { success: false, message: "Delete view error", result: null },
        { status: 500 }
      );
    }
  });
