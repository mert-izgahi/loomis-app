import { Context, Hono } from "hono";
import { UserService } from "@/services/user.service";
import { GroupService } from "@/services/group.service";
import { authMiddleware, roleMiddleware } from "@/lib/auth";
import { Role } from "@/lib/enums";
import { remove as removeDiacritics } from "diacritics";
import { prisma } from "@/lib/prisma";

export const usersApi = new Hono();

const getUsersQuery = async (c: Context) => {
  const page = parseInt(c.req.query("page")!) || 1;
  const limit = parseInt(c.req.query("limit")!) || 10;
  const skip = (page - 1) * limit;
  const sortKey = c.req.query("sortKey") || "createdAt";
  const sortOrder = c.req.query("sortOrder") || "desc";
  const all = c.req.query("all");
  const search = c.req.query("search");
  const role = c.req.query("role");
  const isActive = c.req.query("isActive");

  // Build Prisma where clause
  const whereClause: any = {};

  // Search filter
  if (search) {
    const normalizedSearch = removeDiacritics(search.toLowerCase());
    whereClause.OR = [
      {
        normalizedFirstName: {
          contains: normalizedSearch,
        },
      },
      {
        normalizedLastName: { contains: normalizedSearch },
      },
      { email: { contains: normalizedSearch } },
      { firstName: { contains: search } },
      { lastName: { contains: search } },
    ];
  }

  // Role filter
  if (role) {
    whereClause.role = role as Role;
  }

  // Active status filter
  if (isActive !== undefined) {
    whereClause.isActive = isActive === "true";
  }

  return {
    page,
    limit,
    skip,
    sortKey,
    sortOrder,
    isAll: all,
    whereClause,
  };
};

usersApi
  // @description Get users with pagination
  // @route GET /api/users
  // @access Private (Admin only)
  .get("/", authMiddleware, roleMiddleware([Role.Admin]), async (c) => {
    try {
      const { page, limit, skip, sortKey, sortOrder, whereClause, isAll } =
        await getUsersQuery(c);

      // If all users requested without pagination
      if (isAll) {
        const users = await prisma.user.findMany({
          orderBy: {
            [sortKey === "name" ? "firstName" : "createdAt"]:
              sortOrder === "asc" ? "asc" : "desc",
          },
          include: {
            groups: true,
          },
        });
        return c.json(
          {
            success: true,
            message: "Kullanıcı listelendi",
            result: users,
          },
          { status: 200 }
        );
      }

      // Get users with pagination
      const users = await prisma.user.findMany({
        where: whereClause,
        orderBy: {
          [sortKey === "name" ? "firstName" : "createdAt"]:
            sortOrder === "asc" ? "asc" : "desc",
        },
        skip: skip,
        take: limit,
        include: {
          groups: true,
        },
      });

      // Get total count for pagination
      const total = await prisma.user.count({
        where: whereClause,
      });

      const pageCount = Math.ceil(total / limit);
      const hasNextPage = page < pageCount;
      const hasPrevPage = page > 1;

      const pagination = {
        pageIndex: page,
        pageSize: limit,
        total,
        pageCount,
        hasNextPage,
        hasPrevPage,
      };

      return c.json(
        {
          success: true,
          message: "Kullanıcı listelendi",
          result: { records: users, pagination },
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Get users error:", error);
      return c.json(
        {
          success: false,
          message: "Get users error",
          result: null,
        },
        { status: 500 }
      );
    }
  })

  // @desc Get All users (no pagination)
  // @route GET /api/users/all
  // @access Private (Admin only)
  .get("/all", authMiddleware, roleMiddleware([Role.Admin]), async (c) => {
    try {
      const users = await UserService.findAll(true);
      return c.json(
        {
          success: true,
          message: "Kullanıcı listelendi",
          result: users,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Get users error:", error);
      return c.json(
        {
          success: false,
          message: "Get users error",
          result: null,
        },
        { status: 500 }
      );
    }
  })

  // @description Get user by id
  // @route GET /api/users/:id
  // @access Private (Admin only)
  .get("/:id", authMiddleware, roleMiddleware([Role.Admin]), async (c) => {
    try {
      const id = c.req.param("id");
      const user = await UserService.findById(id);
      console.log(user);

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
        {
          success: false,
          message: "Get user error",
          result: null,
        },
        { status: 500 }
      );
    }
  })

  // @description Delete user by id
  // @route DELETE /api/users/:id
  // @access Private (Admin only)
  .delete("/:id", authMiddleware, roleMiddleware([Role.Admin]), async (c) => {
    try {
      const id = c.req.param("id");

      // Check if user exists
      const existingUser = await UserService.findById(id);
      if (!existingUser) {
        return c.json(
          {
            success: false,
            message: "Kullanıcı bulunamadı",
            result: null,
          },
          { status: 404 }
        );
      }

      // Delete user
      const user = await UserService.deleteById(id);

      return c.json(
        {
          success: true,
          message: "Kullanıcı silindi",
          result: user,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Delete user error:", error);
      return c.json(
        {
          success: false,
          message: "Delete user error",
          result: null,
        },
        { status: 500 }
      );
    }
  })

  // @description Create new user
  // @route POST /api/users
  // @access Private (Admin only)
  .post("/", authMiddleware, roleMiddleware([Role.Admin]), async (c) => {
    try {
      const {
        firstName,
        lastName,
        email,
        phone,
        role,
        groupIds,
        isActive,
        password,
      } = await c.req.json();

      // Check if email already exists
      const existingUser = await UserService.findByEmail(email);
      if (existingUser) {
        return c.json(
          {
            success: false,
            message: "Email already exists",
            result: null,
          },
          { status: 400 }
        );
      }

      // Create user (password will be automatically hashed by UserService)
      const user = await UserService.createUser({
        firstName,
        lastName,
        email,
        phone,
        role: role || Role.User,
        isActive: isActive ?? true,
        password,
        confirmPassword: password,
      });

      // Add user to groups if groupIds provided
      if (groupIds && groupIds.length > 0) {
        await UserService.addToGroups(user.id, groupIds);

        // Add user to each group's members
        for (const groupId of groupIds) {
          await GroupService.addMembers(groupId, [user.id]);
        }
      }

      // Fetch updated user with groups
      const updatedUser = await UserService.findById(user.id);

      return c.json(
        {
          success: true,
          message: "Kullanıcı oluşturuldu",
          result: updatedUser,
        },
        { status: 201 }
      );
    } catch (error: any) {
      console.error("Create user error:", error);
      return c.json(
        {
          success: false,
          message: error.message || "Create user error",
          result: null,
        },
        { status: 500 }
      );
    }
  })

  // @description Update user by id
  // @route PUT /api/users/:id
  // @access Private (Admin only)
  .put("/:id", authMiddleware, roleMiddleware([Role.Admin]), async (c) => {
    try {
      const id = c.req.param("id");
      const {
        firstName,
        lastName,
        email,
        phone,
        role,
        groupIds,
        isActive,
        password,
        department,
        office,
        title,
      } = await c.req.json();

      // Check if user exists
      const existingUser = await UserService.findById(id);
      if (!existingUser) {
        return c.json(
          {
            success: false,
            message: "Kullanıcı bulunamadı",
            result: null,
          },
          { status: 404 }
        );
      }

      // Check if email is being changed and if new email already exists
      if (existingUser.email !== email) {
        const emailExists = await UserService.findByEmail(email);
        if (emailExists) {
          return c.json(
            {
              success: false,
              message: "Email already exists",
              result: null,
            },
            { status: 400 }
          );
        }
      }

      // Update user basic info
      const updateData: any = {
        //firstName,
        //lastName,
        email,
        phone,
        role,
        isActive,
        //department,
        //office,
        //title,
      };

      // Include password if provided (will be hashed automatically)
      if (password) {
        updateData.password = password;
      }

      await UserService.updateUser(id, updateData);

      // Handle group memberships if groupIds provided
      if (groupIds !== undefined) {
        // Get current groups
        //const currentUser = await UserService.findById(id);
        const currentUser = await prisma.user.findUnique({
          where: { id },
          include: { groups: true },
        });
        const currentGroupIds = currentUser?.groups?.map((g) => g.id) || [];

        // Find groups to add and remove
        const groupsToAdd = groupIds.filter(
          (gId: string) => !currentGroupIds.includes(gId)
        );
        const groupsToRemove = currentGroupIds.filter(
          (gId) => !groupIds.includes(gId)
        );

        // Update user's groups
        if (groupsToAdd.length > 0) {
          await UserService.addToGroups(id, groupsToAdd);
          // Add user to groups
          for (const groupId of groupsToAdd) {
            await GroupService.addMembers(groupId, [id]);
          }
        }

        if (groupsToRemove.length > 0) {
          await UserService.removeFromGroups(id, groupsToRemove);
          // Remove user from groups
          for (const groupId of groupsToRemove) {
            await GroupService.removeMembers(groupId, [id]);
          }
        }
      }

      // Fetch updated user with all relations
      const updatedUser = await UserService.findById(id);
      console.log(updatedUser);

      return c.json(
        {
          success: true,
          message: "Kullanıcı güncellendi",
          result: updatedUser,
        },
        { status: 200 }
      );
    } catch (error: any) {
      console.error("Update user error:", error);
      return c.json(
        {
          success: false,
          message: error.message || "Update user error",
          result: null,
        },
        { status: 500 }
      );
    }
  });
