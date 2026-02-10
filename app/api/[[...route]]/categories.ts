// app/api/categories.ts
import { Context, Hono } from "hono";
import { CategoryService } from "@/services/category.service";
import { Role } from "@/lib/enums";
import { authMiddleware, roleMiddleware } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { remove as removeDiacritics } from "diacritics";

export const categoriesApi = new Hono();

const getCategoriesQuery = async (c: Context) => {
  const page = parseInt(c.req.query("page")!) || 1;
  const limit = parseInt(c.req.query("limit")!) || 10;
  const skip = (page - 1) * limit;
  const sortKey = c.req.query("sortKey") || "createdAt";
  const sortOrder = c.req.query("sortOrder") || "desc";

  const whereClause: any = {};
  const search = c.req.query("search");

  if (search) {
    const normalizedSearch = removeDiacritics(search.toLowerCase());
    whereClause.normalizedName = {
      contains: normalizedSearch,
    };
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

categoriesApi
  // @description Get categories with pagination
  // @route GET /api/categories
  // @access Private (Admin)
  .get("/", authMiddleware, roleMiddleware([Role.Admin]), async (c) => {
    try {
      const { page, limit, skip, sortKey, sortOrder, whereClause } =
        await getCategoriesQuery(c);

      const categories = await prisma.category.findMany({
        where: whereClause,
        orderBy: {
          [sortKey]: sortOrder === "asc" ? "asc" : "desc",
        },
        skip: skip,
        take: limit,
        include: {
          reports: true,
        },
      });

      const total = await prisma.category.count({ where: whereClause });
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
          message: "Kategoriler listelendi",
          result: { records: categories, pagination },
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Get categories error:", error);
      return c.json(
        {
          success: false,
          message: "Get categories error",
          result: null,
        },
        { status: 500 }
      );
    }
  })

  // @description Get all categories
  // @route GET /api/categories/all
  // @access Public
  .get("/all", async (c) => {
    try {
      const categories = await CategoryService.findAll();
      return c.json(
        {
          success: true,
          message: "Kategoriler listelendi",
          result: categories,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Get categories error:", error);
      return c.json(
        {
          success: false,
          message: "Get categories error",
          result: null,
        },
        { status: 500 }
      );
    }
  })

  // @description Get category by id
  // @route GET /api/categories/:id
  // @access Private (Admin)
  .get("/:id", authMiddleware, roleMiddleware([Role.Admin]), async (c) => {
    try {
      const id = c.req.param("id");
      const category = await CategoryService.findById(id);

      if (!category) {
        return c.json(
          {
            success: false,
            message: "Kategori bulunamadı",
            result: null,
          },
          { status: 404 }
        );
      }

      return c.json(
        {
          success: true,
          message: "Kategori bilgileri",
          result: category,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Get category error:", error);
      return c.json(
        {
          success: false,
          message: "Get category error",
          result: null,
        },
        { status: 500 }
      );
    }
  })

  // @description Create category
  // @route POST /api/categories
  // @access Private (Admin)
  .post("/", authMiddleware, roleMiddleware([Role.Admin]), async (c) => {
    try {
      const { name, description } = await c.req.json();

      // Check if category already exists
      const existingCategory = await CategoryService.findByName(name);
      if (existingCategory) {
        return c.json(
          {
            success: false,
            message: "Kategori zaten mevcut",
            result: null,
          },
          { status: 400 }
        );
      }

      await CategoryService.createCategory({ name, description });

      return c.json(
        {
          success: true,
          message: "Kategori oluşturuldu",
          result: true,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Create category error:", error);
      return c.json(
        {
          success: false,
          message: "Create category error",
          result: null,
        },
        { status: 500 }
      );
    }
  })

  // @description Update category
  // @route PUT /api/categories/:id
  // @access Private (Admin)
  .put("/:id", authMiddleware, roleMiddleware([Role.Admin]), async (c) => {
    try {
      const id = c.req.param("id");
      const { name, description } = await c.req.json();

      await CategoryService.updateCategory(id, { name, description });

      return c.json(
        {
          success: true,
          message: "Kategori güncellendi",
          result: true,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Update category error:", error);
      return c.json(
        {
          success: false,
          message: "Update category error",
          result: null,
        },
        { status: 500 }
      );
    }
  })

  // @description Delete category
  // @route DELETE /api/categories/:id
  // @access Private (Admin)
  .delete("/:id", authMiddleware, roleMiddleware([Role.Admin]), async (c) => {
    try {
      const id = c.req.param("id");

      // Check if category has reports
      const hasReports = await prisma.report.count({
        where: { categoryId: id },
      });

      if (hasReports > 0) {
        return c.json(
          {
            success: false,
            message: "Kategori silinemez (raporlar mevcut)",
            result: null,
          },
          { status: 400 }
        );
      }

      await CategoryService.deleteCategory(id);

      return c.json(
        {
          success: true,
          message: "Kategori silindi",
          result: true,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Delete category error:", error);
      return c.json(
        {
          success: false,
          message: "Delete category error",
          result: null,
        },
        { status: 500 }
      );
    }
  });
