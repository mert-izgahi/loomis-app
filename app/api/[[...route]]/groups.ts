import { Context, Hono } from "hono";
import { Role } from "@/lib/enums";
import { authMiddleware, roleMiddleware } from "@/lib/auth";
import { remove as removeDiacritics } from "diacritics";
import { prisma } from "@/lib/prisma";
import { GroupService } from "@/services/group.service";

export const groupsApi = new Hono();

const getGroupsQuery = async (c: Context) => {
  const page = parseInt(c.req.query("page")!) || 1;
  const limit = parseInt(c.req.query("limit")!) || 10;
  const skip = (page - 1) * limit;
  const sortKey = c.req.query("sortKey") || "createdAt";
  const sortOrder = c.req.query("sortOrder") || "desc";

  const whereClause: any = {};

  const search = c.req.query("search");
  if (search) {
    const normalizedSearch = removeDiacritics(search.toLowerCase());
    whereClause.OR = [
      { normalizedName: { contains: normalizedSearch } },
      {
        normalizedDescription: {
          contains: normalizedSearch,
        },
      },
    ];
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

groupsApi
  // @description Get all groups with pagination
  // @route GET /api/groups
  // @access Private Admin
  .get("/", authMiddleware, roleMiddleware([Role.Admin]), async (c) => {
    try {
      const { page, limit, skip, sortKey, sortOrder, whereClause } =
        await getGroupsQuery(c);

      const groups = await prisma.group.findMany({
        where: whereClause,
        orderBy: {
          [sortKey]: sortOrder === "asc" ? "asc" : "desc",
        },
        skip: skip,
        take: limit,
        include: {
          members: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
          reports: {
            select: {
              id: true,
              name: true,
              slug: true,
              status: true,
            },
          },
          _count: {
            select: {
              members: true,
              reports: true,
            },
          },
        },
      });

      const total = await prisma.group.count({ where: whereClause });
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
          message: "Gruplar listelendi",
          result: { records: groups, pagination },
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Get groups error:", error);
      return c.json(
        { success: false, message: "Get groups error", result: null },
        { status: 500 }
      );
    }
  })

  // @description Get all groups (no pagination)
  // @route GET /api/groups/all
  // @access Public
  .get("/all", async (c) => {
    try {
      const groups = await GroupService.findAll();
      return c.json(
        { success: true, message: "Gruplar listelendi", result: groups },
        { status: 200 }
      );
    } catch (error) {
      console.error("Get groups error:", error);
      return c.json(
        { success: false, message: "Get groups error", result: null },
        { status: 500 }
      );
    }
  })

  // @description Create group
  // @route POST /api/groups
  // @access Private Admin
  .post("/", authMiddleware, roleMiddleware([Role.Admin]), async (c) => {
    try {
      const { name, description, memberIds } = await c.req.json();

      // Check if group already exists
      const existingGroup = await prisma.group.findFirst({
        where: { name },
      });

      if (existingGroup) {
        return c.json(
          { success: false, message: "Grup zaten mevcut", result: null },
          { status: 400 }
        );
      }

      const group = await GroupService.createGroup({
        name,
        description,
        memberIds,
      });

      return c.json(
        { success: true, message: "Grup oluşturuldu", result: group },
        { status: 201 }
      );
    } catch (error) {
      console.error("Create group error:", error);
      return c.json(
        { success: false, message: "Create group error", result: null },
        { status: 500 }
      );
    }
  })

  // @description Get group by id
  // @route GET /api/groups/:id
  // @access Private Admin
  .get("/:id", authMiddleware, roleMiddleware([Role.Admin]), async (c) => {
    try {
      const id = c.req.param("id");
      const group = await GroupService.findById(id);

      if (!group) {
        return c.json(
          { success: false, message: "Grup bulunamadı", result: null },
          { status: 404 }
        );
      }

      return c.json(
        { success: true, message: "Grup bilgileri", result: group },
        { status: 200 }
      );
    } catch (error) {
      console.error("Get group error:", error);
      return c.json(
        { success: false, message: "Get group error", result: null },
        { status: 500 }
      );
    }
  })

  // @description Update group by id
  // @route PUT /api/groups/:id
  // @access Private Admin
  .put("/:id", authMiddleware, roleMiddleware([Role.Admin]), async (c) => {
    try {
      const id = c.req.param("id");
      const { name, description, memberIds } = await c.req.json();

      const group = await GroupService.updateGroup(id, {
        name,
        description,
        memberIds,
      });

      if (!group) {
        return c.json(
          { success: false, message: "Grup bulunamadı", result: null },
          { status: 404 }
        );
      }

      return c.json(
        { success: true, message: "Grup güncellendi", result: group },
        { status: 200 }
      );
    } catch (error) {
      console.error("Update group error:", error);
      return c.json(
        { success: false, message: "Update group error", result: null },
        { status: 500 }
      );
    }
  })

  // @description Delete group by id
  // @route DELETE /api/groups/:id
  // @access Private Admin
  .delete("/:id", authMiddleware, roleMiddleware([Role.Admin]), async (c) => {
    try {
      const id = c.req.param("id");

      const group = await prisma.group.findUnique({
        where: { id },
        include: {
          members: true,
          reports: true,
        },
      });

      if (!group) {
        return c.json(
          { success: false, message: "Grup bulunamadı", result: null },
          { status: 404 }
        );
      }

      // Check if group has members
      if (group.members.length > 0) {
        return c.json(
          {
            success: false,
            message: "Grup üyeleri var, önce üyeleri kaldırın",
            result: null,
          },
          { status: 400 }
        );
      }

      // Check if group has reports
      if (group.reports.length > 0) {
        return c.json(
          {
            success: false,
            message: "Gruba atanmış raporlar var, önce raporları kaldırın",
            result: null,
          },
          { status: 400 }
        );
      }

      await GroupService.deleteGroup(id);

      return c.json(
        { success: true, message: "Grup silindi", result: null },
        { status: 200 }
      );
    } catch (error) {
      console.error("Delete group error:", error);
      return c.json(
        { success: false, message: "Delete group error", result: null },
        { status: 500 }
      );
    }
  })

  // @description Add members to group
  // @route POST /api/groups/:id/members
  // @access Private Admin
  .post(
    "/:id/members",
    authMiddleware,
    roleMiddleware([Role.Admin]),
    async (c) => {
      try {
        const id = c.req.param("id");
        const { userIds } = await c.req.json();

        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
          return c.json(
            {
              success: false,
              message: "Kullanıcı ID'leri gerekli",
              result: null,
            },
            { status: 400 }
          );
        }

        const group = await GroupService.addMembers(id, userIds);

        return c.json(
          { success: true, message: "Üyeler eklendi", result: group },
          { status: 200 }
        );
      } catch (error) {
        console.error("Add members error:", error);
        return c.json(
          { success: false, message: "Add members error", result: null },
          { status: 500 }
        );
      }
    }
  )

  // @description Remove members from group
  // @route DELETE /api/groups/:id/members
  // @access Private Admin
  .delete(
    "/:id/members",
    authMiddleware,
    roleMiddleware([Role.Admin]),
    async (c) => {
      try {
        const id = c.req.param("id");
        const { userIds } = await c.req.json();

        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
          return c.json(
            {
              success: false,
              message: "Kullanıcı ID'leri gerekli",
              result: null,
            },
            { status: 400 }
          );
        }

        const group = await GroupService.removeMembers(id, userIds);

        return c.json(
          { success: true, message: "Üyeler kaldırıldı", result: group },
          { status: 200 }
        );
      } catch (error) {
        console.error("Remove members error:", error);
        return c.json(
          { success: false, message: "Remove members error", result: null },
          { status: 500 }
        );
      }
    }
  )

  // @description Get group members
  // @route GET /api/groups/:id/members
  // @access Private Admin
  .get(
    "/:id/members",
    authMiddleware,
    roleMiddleware([Role.Admin]),
    async (c) => {
      try {
        const id = c.req.param("id");
        const members = await GroupService.getGroupMembers(id);

        return c.json(
          {
            success: true,
            message: "Grup üyeleri listelendi",
            result: members,
          },
          { status: 200 }
        );
      } catch (error) {
        console.error("Get group members error:", error);
        return c.json(
          {
            success: false,
            message: "Get group members error",
            result: null,
          },
          { status: 500 }
        );
      }
    }
  )

  // @description Search groups
  // @route GET /api/groups/search
  // @access Private Admin
  .get("/search", authMiddleware, roleMiddleware([Role.Admin]), async (c) => {
    try {
      const searchTerm = c.req.query("q");

      if (!searchTerm) {
        return c.json(
          { success: false, message: "Arama terimi gerekli", result: null },
          { status: 400 }
        );
      }

      const groups = await GroupService.searchByName(searchTerm);

      return c.json(
        { success: true, message: "Gruplar arandı", result: groups },
        { status: 200 }
      );
    } catch (error) {
      console.error("Search groups error:", error);
      return c.json(
        { success: false, message: "Search groups error", result: null },
        { status: 500 }
      );
    }
  });
