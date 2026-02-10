import { Category, Group, User, Report, View } from "@/generated/prisma/client";

export interface LDAPAuthResponse {
  success: boolean;
  message: string;
  result: User | null;
}

export interface LDAPConnectionTest {
  success: boolean;
  message: string;
  result: {
    connected: boolean;
  } | null;
}

export interface AuthTokenPayload {
  id: string;
  role: string;
  iat?: number;
  exp?: number;
}
export interface LDAPUserAttributes {
  sAMAccountName?: string;
  mail?: string;
  givenName?: string;
  sn?: string;
  telephoneNumber?: string;
  memberOf?: string | string[];
  cn?: string;
  displayName?: string;
}

export type OptionType = {
  value: string;
  label: string;
  searchableField?: string; // Add this
};

export interface ApiResponse<T> {
  status: string;
  message: string;
  result: T;
}

export interface PaginationType {
  pageIndex: number;
  pageSize: number;
  total: number;
  pageCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponseWithPagination<T> {
  status: string;
  message: string;
  result: {
    records: T[];
    pagination: PaginationType;
  };
}

export interface UserWithGroups extends User {
  groups: Group[];
}

export interface UserWithGroupsAndFavorites extends User {
  groups: Group[];
  favouriteReports: Report[];
}

export interface ReportWithIsExistsAndCategoryAndGroup extends Report {
  isExists: boolean;
  category: Category | null;
  groups: Group[] | null;
  updatedBy: User
}

export interface ViewWithUserAndReport extends View {
  user: User;
  report: Report;
}

export interface ProfileWithFavoritesAndGroups extends User {
  favouriteReports: Report[];
  groups: Group[];
}

export interface GroupWithMembers extends Group {
  members:User[]
}