-- Create Projects table , WE DONT USE SEPETRATE SERVICES TABLE IN THIS SYSTEM, PROJECT SERVICES IS THE ALTERNATIVE TABLE HERE
CREATE TABLE Projects (
    Id NVARCHAR(50) PRIMARY KEY NOT NULL,
    ProjectName NVARCHAR(100) NOT NULL,
    ClientId NVARCHAR(50) NOT NULL,
    Description NVARCHAR(MAX),
    StartDate DATETIME2 NOT NULL,
    EndDate DATETIME2 NOT NULL,
    FlatRate DECIMAL(18,2) DEFAULT 0,
    TotalHours INT DEFAULT 0,
    Status NVARCHAR(20) DEFAULT 'Active',
    CreatedDate DATETIME2 DEFAULT GETUTCDATE(),
    ModifiedDate DATETIME2 DEFAULT GETUTCDATE(),
    IsActive BIT DEFAULT 1
);



-- Create ProjectServices table (child table)
CREATE TABLE ProjectServices (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ProjectId NVARCHAR(50) NOT NULL,
    Description NVARCHAR(MAX) NOT NULL,
    Hours INT NOT NULL,
    Rate DECIMAL(18,2) NOT NULL,
    CreatedDate DATETIME2 DEFAULT GETUTCDATE(),
    ModifiedDate DATETIME2 DEFAULT GETUTCDATE(),
    IsActive BIT DEFAULT 1,
    CONSTRAINT FK_ProjectServices_Projects FOREIGN KEY (ProjectId) REFERENCES Projects(Id) ON DELETE CASCADE
);

-- Create User-Defined Table Type for Project Services
CREATE TYPE [dbo].[ProjectServiceDetailsType] AS TABLE(
    Id INT NULL,
    Description NVARCHAR(MAX) NOT NULL,
    Hours INT NOT NULL,
    Rate DECIMAL(18,2) NOT NULL
);


GO

-- Stored Procedure: Create Project
CREATE or ALTER  PROCEDURE [dbo].[sp_CreateProject]
    @Id NVARCHAR(50) = NULL,
    @ProjectName NVARCHAR(100),
    @ClientId NVARCHAR(50),
    @Description NVARCHAR(MAX) = NULL,
    @StartDate DATETIME2,
    @EndDate DATETIME2,
    @FlatRate DECIMAL(18,2) = 0,
    @TotalHours INT = 0,
    @Status NVARCHAR(20) = 'Active',
    @Services dbo.ProjectServiceDetailsType READONLY
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @NewId NVARCHAR(50);

    BEGIN TRY
        BEGIN TRANSACTION;
           IF NOT EXISTS (
            SELECT 1 FROM Clients WHERE Id = @ClientId
           
        ) THROW 50001, 'Client does not exist.', 1;
        -- Generate Project ID in PRO0000001 format when empty string or NULL is provided
        IF @Id IS NULL OR @Id = ''
        BEGIN
            SELECT @NewId = 'PRO' + RIGHT('0000000' + CAST(ISNULL(MAX(CAST(SUBSTRING(Id, 4, LEN(Id)) AS INT)), 0) + 1 AS NVARCHAR(7)), 7)
            FROM Projects;
        END
        ELSE
        BEGIN
            SET @NewId = @Id;
        END

        -- Insert into Projects table
        INSERT INTO Projects (Id, ProjectName, ClientId, Description, StartDate, EndDate, FlatRate, TotalHours, Status)
        VALUES (@NewId, @ProjectName, @ClientId, @Description, @StartDate, @EndDate, @FlatRate, @TotalHours, @Status);

        -- Insert Project Services
        INSERT INTO ProjectServices (ProjectId, Description, Hours, Rate)
        SELECT @NewId, Description, Hours, Rate
        FROM @Services;

        COMMIT TRANSACTION;
        
        SELECT @NewId AS GeneratedProjectId;
        
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

-- Stored Procedure: Get All Projects (with services)
CREATE OR ALTER PROCEDURE [dbo].[sp_GetAllProjects]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        p.Id, p.ProjectName, p.ClientId, p.Description, p.StartDate, p.EndDate,
        p.FlatRate, p.TotalHours, p.Status, p.CreatedDate, p.ModifiedDate,
        ps.Id AS ServiceId, ps.Description AS ServiceDescription, ps.Hours, ps.Rate
    FROM Projects p
    LEFT JOIN ProjectServices ps ON p.Id = ps.ProjectId AND ps.IsActive = 1
    WHERE p.IsActive = 1
    ORDER BY p.StartDate DESC, p.ProjectName;
END
GO

-- Stored Procedure: Get Project By ID (with services)
CREATE OR ALTER PROCEDURE [dbo].[sp_GetProjectById]
    @Id NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        p.Id, p.ProjectName, p.ClientId, p.Description, p.StartDate, p.EndDate,
        p.FlatRate, p.TotalHours, p.Status, p.CreatedDate, p.ModifiedDate,
        ps.Id AS ServiceId, ps.Description AS ServiceDescription, ps.Hours, ps.Rate
    FROM Projects p
    LEFT JOIN ProjectServices ps ON p.Id = ps.ProjectId AND ps.IsActive = 1
    WHERE p.Id = @Id AND p.IsActive = 1
    ORDER BY ps.Id;
END
GO

-- Stored Procedure: Update Project (with services)
CREATE OR ALTER PROCEDURE [dbo].[sp_UpdateProject]
    @Id NVARCHAR(50),
    @ProjectName NVARCHAR(100),
    @ClientId NVARCHAR(50),
    @Description NVARCHAR(MAX) = NULL,
    @StartDate DATETIME2,
    @EndDate DATETIME2,
    @FlatRate DECIMAL(18,2) = 0,
    @TotalHours INT = 0,
    @Status NVARCHAR(20) = 'Active',
    @Services dbo.ProjectServiceDetailsType READONLY
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Update Project
        UPDATE Projects 
        SET 
            ProjectName = @ProjectName,
            ClientId = @ClientId,
            Description = @Description,
            StartDate = @StartDate,
            EndDate = @EndDate,
            FlatRate = @FlatRate,
            TotalHours = @TotalHours,
            Status = @Status,
            ModifiedDate = GETUTCDATE()
        WHERE Id = @Id AND IsActive = 1;

        -- Soft delete existing services
        UPDATE ProjectServices 
        SET IsActive = 0, ModifiedDate = GETUTCDATE()
        WHERE ProjectId = @Id AND IsActive = 1;

        -- Insert new/updated services
        INSERT INTO ProjectServices (ProjectId, Description, Hours, Rate)
        SELECT @Id, Description, Hours, Rate
        FROM @Services;

        COMMIT TRANSACTION;
        
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO


-- Stored Procedure: Delete Project (Soft Delete)
CREATE or ALTER PROCEDURE [dbo].[sp_DeleteProject]
    @Id NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Soft delete the project
        UPDATE Projects 
        SET IsActive = 0, ModifiedDate = GETUTCDATE()
        WHERE Id = @Id AND IsActive = 1;

        -- Soft delete all related project services
        UPDATE ProjectServices 
        SET IsActive = 0, ModifiedDate = GETUTCDATE()
        WHERE ProjectId = @Id AND IsActive = 1;

        COMMIT TRANSACTION;
        
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO


-- Stored Procedure: Get Projects By Status
CREATE or ALTER PROCEDURE [dbo].[sp_GetProjectsByStatus]
    @Status NVARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        p.Id, p.ProjectName, p.ClientId, p.Description, p.StartDate, p.EndDate,
        p.FlatRate, p.TotalHours, p.Status, p.CreatedDate, p.ModifiedDate,
        ps.Id AS ServiceId, ps.Description AS ServiceDescription, ps.Hours, ps.Rate
    FROM Projects p
    LEFT JOIN ProjectServices ps ON p.Id = ps.ProjectId AND ps.IsActive = 1
    WHERE p.Status = @Status AND p.IsActive = 1
    ORDER BY p.StartDate DESC, p.ProjectName;
END
GO
-- Other stored procedures (GetProjectsByClient, GetProjectsByStatus, DeleteProject, SearchProjects) remain the same as previous



-- Stored Procedure: Search Projects
CREATE PROCEDURE [dbo].[sp_SearchProjects]
    @SearchTerm NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        p.Id, p.ProjectName, p.ClientId, p.Description, p.StartDate, p.EndDate,
        p.FlatRate, p.TotalHours, p.Status, p.CreatedDate, p.ModifiedDate
    FROM Projects p
    WHERE p.IsActive = 1
        AND (p.ProjectName LIKE '%' + @SearchTerm + '%'
        OR p.Description LIKE '%' + @SearchTerm + '%'
        OR p.ClientId LIKE '%' + @SearchTerm + '%')
    ORDER BY p.StartDate DESC, p.ProjectName;
END
GO


