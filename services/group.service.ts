import { prisma } from "@/lib/prisma";
import { remove as removeDiacritics } from "diacritics";
import { Group, Prisma } from "@/generated/prisma/client";

export type CreateGroupInput = {
  name: string;
  description: string;
  memberIds?: string[];
};

export type UpdateGroupInput = Partial<CreateGroupInput>;

export class GroupService {
  private static normalizeText(text: string): string {
    return removeDiacritics(text.toLowerCase());
  }

  static async createGroup(data: CreateGroupInput): Promise<Group> {
    return prisma.group.create({
      data: {
        name: data.name,
        description: data.description,
        normalizedName: this.normalizeText(data.name),
        normalizedDescription: this.normalizeText(data.description),
        members: data.memberIds
          ? {
              connect: data.memberIds.map((id) => ({ id })),
            }
          : undefined,
      },
      include: {
        members: true,
        reports: true,
      },
    });
  }

  static async findById(id: string) {
    return prisma.group.findUnique({
      where: { id },
      include: {
        members: true,
        reports: true,
      },
    });
  }

  static async findAll() {
    return prisma.group.findMany({
      include: {
        members: true,
        reports: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  static async updateGroup(id: string, data: UpdateGroupInput): Promise<Group> {
    const updateData: Prisma.GroupUpdateInput = {};

    if (data.name) {
      updateData.name = data.name;
      updateData.normalizedName = this.normalizeText(data.name);
    }

    if (data.description) {
      updateData.description = data.description;
      updateData.normalizedDescription = this.normalizeText(data.description);
    }

    if (data.memberIds) {
      updateData.members = {
        set: data.memberIds.map((id) => ({ id })),
      };
    }

    return prisma.group.update({
      where: { id },
      data: updateData,
      include: {
        members: true,
        reports: true,
      },
    });
  }

  static async deleteGroup(id: string): Promise<Group> {
    return prisma.group.delete({
      where: { id },
    });
  }

  static async addMembers(groupId: string, userIds: string[]): Promise<Group> {
    return prisma.group.update({
      where: { id: groupId },
      data: {
        members: {
          connect: userIds.map((id) => ({ id })),
        },
      },
      include: {
        members: true,
      },
    });
  }

  static async removeMembers(
    groupId: string,
    userIds: string[]
  ): Promise<Group> {
    return prisma.group.update({
      where: { id: groupId },
      data: {
        members: {
          disconnect: userIds.map((id) => ({ id })),
        },
      },
      include: {
        members: true,
      },
    });
  }

  static async searchByName(searchTerm: string) {
    const normalized = this.normalizeText(searchTerm);

    return prisma.group.findMany({
      where: {
        OR: [
          { normalizedName: { contains: normalized } },
          { normalizedDescription: { contains: normalized } },
        ],
      },
      include: {
        members: true,
        reports: true,
      },
    });
  }

  static async getGroupMembers(groupId: string) {
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: true,
      },
    });
    return group?.members || [];
  }
}
