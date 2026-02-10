-- =============================================
-- Database Schema Creation Script for KokpitTestDB
-- Complete script with correct Prisma conventions
-- =============================================

USE KokpitTestDB;
GO

-- =============================================
-- STEP 1: Drop all tables if they exist (in correct order)
-- =============================================
PRINT 'Dropping existing tables...';
GO

IF OBJECT_ID('dbo.views', 'U') IS NOT NULL DROP TABLE dbo.views;
IF OBJECT_ID('dbo._UserFavourites', 'U') IS NOT NULL DROP TABLE dbo._UserFavourites;
IF OBJECT_ID('dbo._ReportGroups', 'U') IS NOT NULL DROP TABLE dbo._ReportGroups;
IF OBJECT_ID('dbo._GroupMembers', 'U') IS NOT NULL DROP TABLE dbo._GroupMembers;
IF OBJECT_ID('dbo.reports', 'U') IS NOT NULL DROP TABLE dbo.reports;
IF OBJECT_ID('dbo.categories', 'U') IS NOT NULL DROP TABLE dbo.categories;
IF OBJECT_ID('dbo.groups', 'U') IS NOT NULL DROP TABLE dbo.groups;
IF OBJECT_ID('dbo.users', 'U') IS NOT NULL DROP TABLE dbo.users;
GO

PRINT 'All existing tables dropped.';
PRINT '';
GO

-- =============================================
-- STEP 2: Create base tables
-- =============================================

-- Create users table
PRINT 'Creating users table...';
GO

CREATE TABLE dbo.users (
    id NVARCHAR(30) NOT NULL,
    firstName NVARCHAR(100) NOT NULL,
    lastName NVARCHAR(100) NOT NULL,
    email NVARCHAR(255) NOT NULL,
    normalizedFirstName NVARCHAR(255) NULL,
    normalizedLastName NVARCHAR(255) NULL,
    password NVARCHAR(255) NULL,
    phone NVARCHAR(50) NULL,
    role NVARCHAR(50) NOT NULL DEFAULT 'User',
    isActive BIT NOT NULL DEFAULT 1,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT PK_users PRIMARY KEY (id),
    CONSTRAINT UQ_users_email UNIQUE (email)
);
GO

CREATE NONCLUSTERED INDEX IX_users_email ON dbo.users(email);
CREATE NONCLUSTERED INDEX IX_users_normalized_names ON dbo.users(normalizedFirstName, normalizedLastName);
GO

PRINT '✅ users table created';
GO

-- Create groups table
PRINT 'Creating groups table...';
GO

CREATE TABLE dbo.groups (
    id NVARCHAR(30) NOT NULL,
    name NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX) NOT NULL,
    normalizedName NVARCHAR(255) NULL,
    normalizedDescription NVARCHAR(MAX) NULL,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT PK_groups PRIMARY KEY (id)
);
GO

CREATE NONCLUSTERED INDEX IX_groups_normalizedName ON dbo.groups(normalizedName);
GO

PRINT '✅ groups table created';
GO

-- Create categories table
PRINT 'Creating categories table...';
GO

CREATE TABLE dbo.categories (
    id NVARCHAR(30) NOT NULL,
    name NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX) NOT NULL,
    normalizedName NVARCHAR(255) NULL,
    normalizedDescription NVARCHAR(MAX) NULL,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT PK_categories PRIMARY KEY (id),
    CONSTRAINT UQ_categories_name UNIQUE (name)
);
GO

CREATE NONCLUSTERED INDEX IX_categories_normalizedName ON dbo.categories(normalizedName);
GO

PRINT '✅ categories table created';
GO

-- Create reports table
PRINT 'Creating reports table...';
GO

CREATE TABLE dbo.reports (
    id NVARCHAR(30) NOT NULL,
    name NVARCHAR(255) NOT NULL,
    slug NVARCHAR(255) NOT NULL,
    reportPath NVARCHAR(500) NULL,
    description NVARCHAR(MAX) NOT NULL,
    normalizedName NVARCHAR(255) NULL,
    normalizedDescription NVARCHAR(MAX) NULL,
    isActive BIT NOT NULL DEFAULT 1,
    status NVARCHAR(50) NOT NULL DEFAULT 'Pending',
    type NVARCHAR(50) NOT NULL DEFAULT 'Internal',
    link NVARCHAR(500) NULL,
    categoryId NVARCHAR(30) NOT NULL,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT PK_reports PRIMARY KEY (id),
    CONSTRAINT UQ_reports_name UNIQUE (name),
    CONSTRAINT UQ_reports_slug UNIQUE (slug),
    CONSTRAINT FK_reports_categoryId FOREIGN KEY (categoryId) 
        REFERENCES dbo.categories(id) ON DELETE CASCADE
);
GO

CREATE NONCLUSTERED INDEX IX_reports_categoryId ON dbo.reports(categoryId);
CREATE NONCLUSTERED INDEX IX_reports_slug ON dbo.reports(slug);
CREATE NONCLUSTERED INDEX IX_reports_normalizedName ON dbo.reports(normalizedName);
CREATE NONCLUSTERED INDEX IX_reports_status_isActive ON dbo.reports(status, isActive);
GO

PRINT '✅ reports table created';
GO

-- Create views table (analytics/tracking)
PRINT 'Creating views table...';
GO

CREATE TABLE dbo.views (
    id NVARCHAR(30) NOT NULL,
    ipAddress NVARCHAR(50) NOT NULL,
    userAgent NVARCHAR(MAX) NOT NULL,
    reportId NVARCHAR(30) NOT NULL,
    userId NVARCHAR(30) NOT NULL,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT PK_views PRIMARY KEY (id),
    CONSTRAINT FK_views_reportId FOREIGN KEY (reportId) 
        REFERENCES dbo.reports(id) ON DELETE CASCADE,
    CONSTRAINT FK_views_userId FOREIGN KEY (userId) 
        REFERENCES dbo.users(id) ON DELETE CASCADE
);
GO

CREATE NONCLUSTERED INDEX IX_views_reportId ON dbo.views(reportId);
CREATE NONCLUSTERED INDEX IX_views_userId ON dbo.views(userId);
CREATE NONCLUSTERED INDEX IX_views_createdAt ON dbo.views(createdAt);
GO

PRINT '✅ views table created';
GO

-- =============================================
-- STEP 3: Create many-to-many relationship tables
-- Using Prisma's alphabetical naming convention
-- =============================================

-- _GroupMembers: groups <-> users relation
-- Alphabetical: Group < User, so A=groupId, B=userId
PRINT 'Creating _GroupMembers table...';
GO

CREATE TABLE dbo._GroupMembers (
    A NVARCHAR(30) NOT NULL, -- groupId
    B NVARCHAR(30) NOT NULL, -- userId
    
    CONSTRAINT PK_GroupMembers PRIMARY KEY (A, B)
);
GO

ALTER TABLE dbo._GroupMembers
ADD CONSTRAINT FK_GroupMembers_A FOREIGN KEY (A) 
    REFERENCES dbo.groups(id) ON DELETE CASCADE;

ALTER TABLE dbo._GroupMembers
ADD CONSTRAINT FK_GroupMembers_B FOREIGN KEY (B) 
    REFERENCES dbo.users(id) ON DELETE CASCADE;
GO

CREATE NONCLUSTERED INDEX IX_GroupMembers_B ON dbo._GroupMembers(B);
GO

PRINT '✅ _GroupMembers table created (A=groupId, B=userId)';
GO

-- _ReportGroups: groups <-> reports relation
-- Alphabetical: Group < Report, so A=groupId, B=reportId
PRINT 'Creating _ReportGroups table...';
GO

CREATE TABLE dbo._ReportGroups (
    A NVARCHAR(30) NOT NULL, -- groupId
    B NVARCHAR(30) NOT NULL, -- reportId
    
    CONSTRAINT PK_ReportGroups PRIMARY KEY (A, B)
);
GO

ALTER TABLE dbo._ReportGroups
ADD CONSTRAINT FK_ReportGroups_A FOREIGN KEY (A) 
    REFERENCES dbo.groups(id) ON DELETE CASCADE;

ALTER TABLE dbo._ReportGroups
ADD CONSTRAINT FK_ReportGroups_B FOREIGN KEY (B) 
    REFERENCES dbo.reports(id) ON DELETE CASCADE;
GO

CREATE NONCLUSTERED INDEX IX_ReportGroups_B ON dbo._ReportGroups(B);
GO

PRINT '✅ _ReportGroups table created (A=groupId, B=reportId)';
GO

-- _UserFavourites: reports <-> users relation
-- Alphabetical: Report < User, so A=reportId, B=userId
PRINT 'Creating _UserFavourites table...';
GO

CREATE TABLE dbo._UserFavourites (
    A NVARCHAR(30) NOT NULL, -- reportId
    B NVARCHAR(30) NOT NULL, -- userId
    
    CONSTRAINT PK_UserFavourites PRIMARY KEY (A, B)
);
GO

ALTER TABLE dbo._UserFavourites
ADD CONSTRAINT FK_UserFavourites_A FOREIGN KEY (A) 
    REFERENCES dbo.reports(id) ON DELETE CASCADE;

ALTER TABLE dbo._UserFavourites
ADD CONSTRAINT FK_UserFavourites_B FOREIGN KEY (B) 
    REFERENCES dbo.users(id) ON DELETE NO ACTION; -- Prevent multiple cascade paths
GO

CREATE NONCLUSTERED INDEX IX_UserFavourites_B ON dbo._UserFavourites(B);
GO

PRINT '✅ _UserFavourites table created (A=reportId, B=userId)';
GO

-- =============================================
-- STEP 4: Create triggers for auto-updating updatedAt
-- =============================================
PRINT 'Creating triggers for updatedAt columns...';
GO

-- Trigger for users table
CREATE OR ALTER TRIGGER TR_users_UpdatedAt
ON dbo.users
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.users
    SET updatedAt = GETDATE()
    FROM dbo.users u
    INNER JOIN inserted i ON u.id = i.id;
END;
GO

-- Trigger for groups table
CREATE OR ALTER TRIGGER TR_groups_UpdatedAt
ON dbo.groups
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.groups
    SET updatedAt = GETDATE()
    FROM dbo.groups g
    INNER JOIN inserted i ON g.id = i.id;
END;
GO

-- Trigger for categories table
CREATE OR ALTER TRIGGER TR_categories_UpdatedAt
ON dbo.categories
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.categories
    SET updatedAt = GETDATE()
    FROM dbo.categories c
    INNER JOIN inserted i ON c.id = i.id;
END;
GO

-- Trigger for reports table
CREATE OR ALTER TRIGGER TR_reports_UpdatedAt
ON dbo.reports
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.reports
    SET updatedAt = GETDATE()
    FROM dbo.reports r
    INNER JOIN inserted i ON r.id = i.id;
END;
GO

-- Trigger for views table
CREATE OR ALTER TRIGGER TR_views_UpdatedAt
ON dbo.views
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.views
    SET updatedAt = GETDATE()
    FROM dbo.views v
    INNER JOIN inserted i ON v.id = i.id;
END;
GO

PRINT '✅ All triggers created';
GO

-- =============================================
-- STEP 5: Verification and Summary
-- =============================================
PRINT '';
PRINT '========================================';
PRINT 'DATABASE SCHEMA CREATED SUCCESSFULLY!';
PRINT '========================================';
PRINT '';

-- Show all tables
PRINT '📋 Tables Created:';
SELECT 
    TABLE_NAME as TableName,
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_NAME = t.TABLE_NAME AND TABLE_SCHEMA = 'dbo') as ColumnCount
FROM INFORMATION_SCHEMA.TABLES t
WHERE TABLE_SCHEMA = 'dbo' 
    AND TABLE_TYPE = 'BASE TABLE'
    AND TABLE_NAME IN ('users', 'groups', 'categories', 'reports', 'views', 
                       '_GroupMembers', '_ReportGroups', '_UserFavourites')
ORDER BY 
    CASE TABLE_NAME
        WHEN 'users' THEN 1
        WHEN 'groups' THEN 2
        WHEN 'categories' THEN 3
        WHEN 'reports' THEN 4
        WHEN 'views' THEN 5
        WHEN '_GroupMembers' THEN 6
        WHEN '_ReportGroups' THEN 7
        WHEN '_UserFavourites' THEN 8
    END;
GO

PRINT '';
PRINT '🔗 Foreign Key Constraints:';
SELECT 
    OBJECT_NAME(f.parent_object_id) AS TableName,
    f.name AS ConstraintName,
    COL_NAME(fc.parent_object_id, fc.parent_column_id) AS ColumnName,
    OBJECT_NAME(f.referenced_object_id) AS ReferencedTable,
    COL_NAME(fc.referenced_object_id, fc.referenced_column_id) AS ReferencedColumn
FROM sys.foreign_keys AS f
INNER JOIN sys.foreign_key_columns AS fc 
    ON f.object_id = fc.constraint_object_id
WHERE OBJECT_NAME(f.parent_object_id) IN ('users', 'groups', 'categories', 'reports', 'views',
                                           '_GroupMembers', '_ReportGroups', '_UserFavourites')
ORDER BY TableName, ConstraintName;
GO

PRINT '';
PRINT '📌 Many-to-Many Relationship Tables:';
PRINT '  _GroupMembers:    A (groupId) → groups,  B (userId) → users';
PRINT '  _ReportGroups:    A (groupId) → groups,  B (reportId) → reports';
PRINT '  _UserFavourites:  A (reportId) → reports, B (userId) → users';
PRINT '';
PRINT '✅ Database is ready for Prisma seeding!';
PRINT '   Run: bun run seed';
GO