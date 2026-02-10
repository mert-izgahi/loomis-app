import { Category, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { remove as removeDiacritics } from "diacritics";
import { CategorySchemaInput } from "@/lib/zod";

export type UpdateCategoryInput = Partial<CategorySchemaInput>;

export class CategoryService {
  private static normalizeText(text: string): string {
    return removeDiacritics(text.toLowerCase());
  }

  static async createCategory(data: CategorySchemaInput): Promise<Category> {
    return prisma.category.create({
      data: {
        name: data.name,
        description: data.description,
        normalizedName: this.normalizeText(data.name),
        normalizedDescription: this.normalizeText(data.description),
      },
    });
  }

  static async findById(id: string) {
    return prisma.category.findUnique({
      where: { id },
      include: {
        reports: true,
      },
    });
  }

  static async findByName(name: string) {
    return prisma.category.findUnique({
      where: { name },
      include: {
        reports: true,
      },
    });
  }

  static async findAll() {
    return prisma.category.findMany({
      include: {
        reports: true,
      },
      orderBy: {
        name: "asc",
      },
    });
  }

  static async updateCategory(
    id: string,
    data: UpdateCategoryInput
  ): Promise<Category> {
    const updateData: Prisma.CategoryUpdateInput = {};

    if (data.name) {
      updateData.name = data.name;
      updateData.normalizedName = this.normalizeText(data.name);
    }

    if (data.description) {
      updateData.description = data.description;
      updateData.normalizedDescription = this.normalizeText(data.description);
    }

    return prisma.category.update({
      where: { id },
      data: updateData,
    });
  }

  static async deleteCategory(id: string): Promise<Category> {
    return prisma.category.delete({
      where: { id },
    });
  }

  static async searchByName(searchTerm: string) {
    const normalized = this.normalizeText(searchTerm);

    return prisma.category.findMany({
      where: {
        OR: [
          { normalizedName: { contains: normalized } },
          { normalizedDescription: { contains: normalized } },
        ],
      },
      include: {
        reports: true,
      },
    });
  }

  static async getCategoryWithReports(id: string) {
    return prisma.category.findUnique({
      where: { id },
      include: {
        reports: {
          where: {
            isActive: true,
          },
          include: {
            groups: true,
          },
        },
      },
    });
  }
}
