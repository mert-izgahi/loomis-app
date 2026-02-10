import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { remove as removeDiacritics } from "diacritics";
import { type CreateUserSchemaInput } from "@/lib/zod";
import { Prisma, type User } from "@/generated/prisma/client";
import { Role } from "@/lib/enums";

export class UserService {
  /**
   * Hash password
   */
  private static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
  }

  /**
   * Compare password
   */
  static async comparePassword(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Normalize names for search
   */
  private static normalizeText(text: string): string {
    return removeDiacritics(text.toLowerCase());
  }

  /**
   * Create a new user
   */
  static async createUser(data: CreateUserSchemaInput): Promise<User> {
    const hashedPassword = data.password
      ? await this.hashPassword(data.password)
      : undefined;

    return prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email.toLowerCase(),
        password: hashedPassword,
        phone: data.phone,
        role: data.role || Role.User,
        isActive: data.isActive ?? true,
        normalizedFirstName: this.normalizeText(data.firstName),
        normalizedLastName: this.normalizeText(data.lastName),
      },
    });
  }

  /**
   * Find user by email
   */
  static async findByEmail(email: string): Promise<User | null> {
    
    
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  /**
   * Find user by credentials (email and password)
   * This replaces your Mongoose findByCredentials static method
   */
  static async findByCredentials(
    email: string,
    password: string
  ): Promise<User | null> {
    const user = await this.findByEmail(email);

    if (!user || !user.password) {
      return null;
    }

    const isPasswordValid = await this.comparePassword(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  /**
   * Find user by ID
   */
  static async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
      include: {
        groups: true,
        favouriteReports: true,
      },
    });
  }

  /**
   * Update user
   */
  static async updateUser(
    id: string,
    data: Partial<CreateUserSchemaInput>
  ): Promise<User> {
    const updateData: Prisma.UserUpdateInput = {
      ...data,
    };

    if (data.firstName) {
      updateData.normalizedFirstName = this.normalizeText(data.firstName);
    }

    if (data.lastName) {
      updateData.normalizedLastName = this.normalizeText(data.lastName);
    }

    if (data.password) {
      updateData.password = await this.hashPassword(data.password);
    }

    if (data.email) {
      updateData.email = data.email.toLowerCase();
    }
    
    
    return prisma.user.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Soft delete user by ID
   * This replaces your Mongoose softDeleteById static method
   */
  static async softDeleteById(id: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Hard delete user by ID
   */
  static async deleteById(id: string): Promise<User> {
    return prisma.user.delete({
      where: { id },
    });
  }

  /**
   * Get all users
   */
  static async findAll(includeInactive = false): Promise<User[]> {
    return prisma.user.findMany({
      where: includeInactive ? undefined : { isActive: true },
      include: {
        groups: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /**
   * Search users by name
   */
  static async searchByName(searchTerm: string): Promise<User[]> {
    const normalized = this.normalizeText(searchTerm);

    return prisma.user.findMany({
      where: {
        AND: [
          { isActive: true },
          {
            OR: [
              { normalizedFirstName: { contains: normalized } },
              { normalizedLastName: { contains: normalized } },
            ],
          },
        ],
      },
      include: {
        groups: true,
      },
    });
  }

  /**
   * Add user to groups
   */
  static async addToGroups(userId: string, groupIds: string[]): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: {
        groups: {
          connect: groupIds.map((id) => ({ id })),
        },
      },
      include: {
        groups: true,
      },
    });
  }

  /**
   * Remove user from groups
   */
  static async removeFromGroups(
    userId: string,
    groupIds: string[]
  ): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: {
        groups: {
          disconnect: groupIds.map((id) => ({ id })),
        },
      },
      include: {
        groups: true,
      },
    });
  }

  /**
   * Add favourite report
   */
  static async addFavouriteReport(
    userId: string,
    reportId: string
  ): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: {
        favouriteReports: {
          connect: { id: reportId },
        },
      },
      include: {
        favouriteReports: true,
      },
    });
  }

  /**
   * Remove favourite report
   */
  static async removeFavouriteReport(
    userId: string,
    reportId: string
  ): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: {
        favouriteReports: {
          disconnect: { id: reportId },
        },
      },
      include: {
        favouriteReports: true,
      },
    });
  }

  /**
   * Get user's full name (replaces the virtual property)
   */
  static getFullName(user: User): string {
    return `${user.firstName} ${user.lastName}`;
  }

  /**
   * Get user with password excluded (for safe responses)
   */
  static async findByIdSafe(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        groups: true,
        favouriteReports: true,
        // password is excluded
      },
    });
  }
}

export default UserService;
