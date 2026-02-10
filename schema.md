## Connection Roles

IP: 10.225.9.50
Server Name: TRLOOSQLTEST\TRLOOSQLTESTDB
DB: KokpitTestDB
DB User: kokpituser
User-1: Mert.izgahi
User-2: Veli.Kara

```bash
 # .env file
DATABASE_URL="sqlserver://10.225.9.50:1433;database=KokpitTestDB;user=kokpituser;password=YOUR_PASSWORD;encrypt=true;trustServerCertificate=true"
```

docker rm -f mssql-server
docker run -e 'ACCEPT_EULA=Y' -e 'SA_PASSWORD=Aa123456' \
 -p 1433:1433 --name mssql-server -d mcr.microsoft.com/azure-sql-edge

## POSTGRES SCHEMA

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?
// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  Admin
  User
}

enum ReportStatus {
  Pending
  Draft
  Published
}

enum ReportType {
  Internal
  External
}

model User {
  id                  String   @id @default(cuid())
  firstName           String   @db.VarChar(100)
  lastName            String   @db.VarChar(100)
  email               String   @unique
  normalizedFirstName String?
  normalizedLastName  String?
  password            String?
  phone               String?
  role                Role     @default(User)
  isActive            Boolean  @default(true)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  // Relations
  groups           Group[]  @relation("GroupMembers")
  favouriteReports Report[] @relation("UserFavourites")
  views            View[]

  @@index([email])
  @@index([normalizedFirstName, normalizedLastName])
  @@map("users")
}

model Group {
  id                    String   @id @default(cuid())
  name                  String
  description           String
  normalizedName        String?
  normalizedDescription String?
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  // Relations
  members User[]   @relation("GroupMembers")
  reports Report[] @relation("ReportGroups")

  @@index([normalizedName])
  @@map("groups")
}

model Category {
  id                    String   @id @default(cuid())
  name                  String   @unique
  description           String
  normalizedName        String?
  normalizedDescription String?
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  // Relations
  reports Report[]

  @@index([normalizedName])
  @@map("categories")
}

model Report {
  id                    String       @id @default(cuid())
  name                  String       @unique
  slug                  String       @unique
  reportPath            String?
  description           String
  normalizedName        String?
  normalizedDescription String?
  isActive              Boolean      @default(true)
  status                ReportStatus @default(Pending)
  type                  ReportType   @default(Internal)
  link                  String?
  createdAt             DateTime     @default(now())
  updatedAt             DateTime     @updatedAt
  updatedById String?   // foreign key
  updatedBy   User?     @relation("ReportUpdatedBy", fields: [updatedById], references: [id])

  // Foreign Keys
  categoryId String
  category   Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)

  // Relations

  groups       Group[] @relation("ReportGroups")
  favouritedBy User[]  @relation("UserFavourites")
  views        View[]

  @@index([categoryId])
  @@index([slug])
  @@index([normalizedName])
  @@index([status, isActive])
  @@map("reports")
}

model View {
  id        String   @id @default(cuid())
  ipAddress String
  userAgent String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Foreign Keys
  reportId String
  report   Report @relation(fields: [reportId], references: [id], onDelete: Cascade)

  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([reportId])
  @@index([userId])
  @@index([createdAt])
  @@map("views")
}

```
