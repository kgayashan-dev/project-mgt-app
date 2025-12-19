-- 1. CREATE PROJECT Procedure (already exists, so create OR ALTER)
CREATE OR ALTER PROCEDURE [dbo].[sp_CreateProject]
    @Id NVARCHAR(50) = NULL,
    @ProjectName NVARCHAR(100),
    @ClientId NVARCHAR(50),
    @Description NVARCHAR(MAX) = NULL,
    @StartDate DATETIME2,
    @EndDate DATETIME2,
    @FlatRate DECIMAL(18,2) = 0,
    @TotalHours INT = 0,
    @Status NVARCHAR(20) = 'Active',
    @Services dbo.ProjectServiceDetailsType READONLY,
    @TeamMembers dbo.ProjectTeamMemberType READONLY
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @NewId NVARCHAR(50);
    DECLARE @ErrorMessage NVARCHAR(4000);

    BEGIN TRY
        BEGIN TRANSACTION;

        -- Validate Client exists
        IF NOT EXISTS (SELECT 1 FROM Clients WHERE Id = @ClientId)
        BEGIN
            ;THROW 50001, 'Client does not exist.', 1;
        END

        -- Generate Project ID in PRO0000001 format
        IF @Id IS NULL OR @Id = ''
        BEGIN
            SELECT TOP 1 @NewId = 'PRO' + RIGHT('0000000' + CAST(ISNULL(MAX(CAST(SUBSTRING(Id, 4, LEN(Id)) AS INT)), 0) + 1 AS NVARCHAR(7)), 7)
            FROM Projects;
        END
        ELSE
        BEGIN
            SET @NewId = @Id;
        END

        -- Validate team members exist (only if team members provided)
        DECLARE @TeamMemberCount INT;
        SELECT @TeamMemberCount = COUNT(*) FROM @TeamMembers;
        
        IF @TeamMemberCount > 0
        BEGIN
            IF EXISTS (SELECT 1 FROM @TeamMembers tm 
                       WHERE NOT EXISTS (SELECT 1 FROM TeamMembers WHERE MemId = tm.MemId AND IsActive = 1))
            BEGIN
                ;THROW 50002, 'One or more team members do not exist or are inactive.', 1;
            END
        END

        -- Insert into Projects table
        INSERT INTO Projects (Id, ProjectName, ClientId, Description, StartDate, EndDate, FlatRate, TotalHours, Status)
        VALUES (@NewId, @ProjectName, @ClientId, @Description, @StartDate, @EndDate, @FlatRate, @TotalHours, @Status);

        -- Insert Project Services (if any)
        DECLARE @ServiceCount INT;
        SELECT @ServiceCount = COUNT(*) FROM @Services;
        
        IF @ServiceCount > 0
        BEGIN
            INSERT INTO ProjectServices (ProjectId, Description, Hours, Rate)
            SELECT @NewId, Description, Hours, Rate
            FROM @Services;
        END

        -- Insert Project Team Members (if any)
        IF @TeamMemberCount > 0
        BEGIN
            INSERT INTO ProjectTeamMembers (ProjectId, MemId, Role, AssignmentDate)
            SELECT @NewId, MemId, Role, GETDATE()
            FROM @TeamMembers;
        END

        COMMIT TRANSACTION;
        
        -- Return the generated Project ID
        SELECT @NewId AS GeneratedProjectId;
        
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        SELECT @ErrorMessage = ERROR_MESSAGE();
        ;THROW 50000, @ErrorMessage, 1;
    END CATCH
END
GO

-- 2. UPDATE PROJECT Procedure
CREATE OR ALTER PROCEDURE [dbo].[sp_UpdateProject]
    @Id NVARCHAR(50),
    @ProjectName NVARCHAR(100),
    @ClientId NVARCHAR(50),
    @Description NVARCHAR(MAX) = NULL,
    @StartDate DATETIME2,
    @EndDate DATETIME2,
    @FlatRate DECIMAL(18,2),
    @TotalHours INT,
    @Status NVARCHAR(20),
    @Services dbo.ProjectServiceDetailsType READONLY,
    @TeamMembers dbo.ProjectTeamMemberType READONLY
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @ErrorMessage NVARCHAR(4000);

    BEGIN TRY
        BEGIN TRANSACTION;

        -- Validate Project exists
        IF NOT EXISTS (SELECT 1 FROM Projects WHERE Id = @Id AND IsActive = 1)
        BEGIN
            ;THROW 50001, 'Project does not exist or is inactive.', 1;
        END

        -- Validate Client exists
        IF NOT EXISTS (SELECT 1 FROM Clients WHERE Id = @ClientId)
        BEGIN
            ;THROW 50002, 'Client does not exist.', 1;
        END

        -- Validate team members exist (only if team members provided)
        DECLARE @TeamMemberCount INT;
        SELECT @TeamMemberCount = COUNT(*) FROM @TeamMembers;
        
        IF @TeamMemberCount > 0
        BEGIN
            IF EXISTS (SELECT 1 FROM @TeamMembers tm 
                       WHERE NOT EXISTS (SELECT 1 FROM TeamMembers WHERE MemId = tm.MemId AND IsActive = 1))
            BEGIN
                ;THROW 50003, 'One or more team members do not exist or are inactive.', 1;
            END
        END

        -- Update project
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
            UpdatedAt = GETDATE()
        WHERE Id = @Id;

        -- Update Project Services (Replace existing services)
        DELETE FROM ProjectServices WHERE ProjectId = @Id;
        
        DECLARE @ServiceCount INT;
        SELECT @ServiceCount = COUNT(*) FROM @Services;
        
        IF @ServiceCount > 0
        BEGIN
            INSERT INTO ProjectServices (ProjectId, Description, Hours, Rate)
            SELECT @Id, Description, Hours, Rate
            FROM @Services;
        END

        -- Update Project Team Members (Replace existing team members)
        DELETE FROM ProjectTeamMembers WHERE ProjectId = @Id;
        
        IF @TeamMemberCount > 0
        BEGIN
            INSERT INTO ProjectTeamMembers (ProjectId, MemId, Role, AssignmentDate)
            SELECT @Id, MemId, Role, GETDATE()
            FROM @TeamMembers;
        END

        COMMIT TRANSACTION;
        
        SELECT 'Project updated successfully.' AS Message;
        
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        SELECT @ErrorMessage = ERROR_MESSAGE();
        ;THROW 50000, @ErrorMessage, 1;
    END CATCH
END
GO

-- 3. GET ALL PROJECTS Procedure
CREATE OR ALTER PROCEDURE [dbo].[sp_GetAllProjects]
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        p.Id,
        p.ProjectName,
        p.ClientId,
        c.Name AS ClientName,
        p.Description,
        p.StartDate,
        p.EndDate,
        p.FlatRate,
        p.TotalHours,
        p.Status,
        ps.Id AS ServiceId,
        ps.Description AS ServiceDescription,
        ps.Hours,
        ps.Rate,
        ptm.MemId,
        tm.Name AS MemberName,
        ptm.Role AS MemberRole,
        ptm.AssignmentDate
    FROM Projects p
    LEFT JOIN Clients c ON p.ClientId = c.Id
    LEFT JOIN ProjectServices ps ON p.Id = ps.ProjectId
    LEFT JOIN ProjectTeamMembers ptm ON p.Id = ptm.ProjectId
    LEFT JOIN TeamMembers tm ON ptm.MemId = tm.MemId
    WHERE p.IsActive = 1
    ORDER BY p.StartDate DESC, p.Id;
END
GO

-- 4. GET PROJECT BY ID Procedure
CREATE OR ALTER PROCEDURE [dbo].[sp_GetProjectById]
    @Id NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        p.Id,
        p.ProjectName,
        p.ClientId,
        c.Name AS ClientName,
        p.Description,
        p.StartDate,
        p.EndDate,
        p.FlatRate,
        p.TotalHours,
        p.Status,
        ps.Id AS ServiceId,
        ps.Description AS ServiceDescription,
        ps.Hours,
        ps.Rate,
        ptm.MemId,
        tm.Name AS MemberName,
        ptm.Role AS MemberRole,
        ptm.AssignmentDate
    FROM Projects p
    LEFT JOIN Clients c ON p.ClientId = c.Id
    LEFT JOIN ProjectServices ps ON p.Id = ps.ProjectId
    LEFT JOIN ProjectTeamMembers ptm ON p.Id = ptm.ProjectId
    LEFT JOIN TeamMembers tm ON ptm.MemId = tm.MemId
    WHERE p.Id = @Id AND p.IsActive = 1
    ORDER BY ps.Id, ptm.AssignmentDate;
END
GO

-- 5. DELETE PROJECT Procedure (Soft Delete)
CREATE OR ALTER PROCEDURE [dbo].[sp_DeleteProject]
    @Id NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        -- Check if project exists
        IF NOT EXISTS (SELECT 1 FROM Projects WHERE Id = @Id AND IsActive = 1)
        BEGIN
            ;THROW 50001, 'Project does not exist or is already deleted.', 1;
        END

        -- Soft delete project
        UPDATE Projects
        SET IsActive = 0,
            UpdatedAt = GETDATE()
        WHERE Id = @Id;
        
        SELECT 'Project deleted successfully.' AS Message;
        
    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000);
        SELECT @ErrorMessage = ERROR_MESSAGE();
        ;THROW 50000, @ErrorMessage, 1;
    END CATCH
END
GO

-- 6. ADD PROJECT TEAM MEMBER Procedure
CREATE OR ALTER PROCEDURE [dbo].[sp_AddProjectTeamMember]
    @ProjectId NVARCHAR(50),
    @MemId NVARCHAR(20),
    @Role NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        -- Validate Project exists and is active
        IF NOT EXISTS (SELECT 1 FROM Projects WHERE Id = @ProjectId AND IsActive = 1)
        BEGIN
            ;THROW 50001, 'Project does not exist or is inactive.', 1;
        END

        -- Validate Team Member exists and is active
        IF NOT EXISTS (SELECT 1 FROM TeamMembers WHERE MemId = @MemId AND IsActive = 1)
        BEGIN
            ;THROW 50002, 'Team member does not exist or is inactive.', 1;
        END

        -- Check if member is already assigned to this project
        IF EXISTS (SELECT 1 FROM ProjectTeamMembers WHERE ProjectId = @ProjectId AND MemId = @MemId)
        BEGIN
            ;THROW 50003, 'Team member is already assigned to this project.', 1;
        END

        -- Add team member to project
        INSERT INTO ProjectTeamMembers (ProjectId, MemId, Role, AssignmentDate)
        VALUES (@ProjectId, @MemId, @Role, GETDATE());
        
        SELECT 'Team member added successfully.' AS Message;
        
    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000);
        SELECT @ErrorMessage = ERROR_MESSAGE();
        ;THROW 50000, @ErrorMessage, 1;
    END CATCH
END
GO

-- 7. REMOVE PROJECT TEAM MEMBER Procedure
CREATE OR ALTER PROCEDURE [dbo].[sp_RemoveProjectTeamMember]
    @ProjectId NVARCHAR(50),
    @MemId NVARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        -- Check if the assignment exists
        IF NOT EXISTS (SELECT 1 FROM ProjectTeamMembers WHERE ProjectId = @ProjectId AND MemId = @MemId)
        BEGIN
            ;THROW 50001, 'Team member is not assigned to this project.', 1;
        END

        -- Remove team member from project
        DELETE FROM ProjectTeamMembers
        WHERE ProjectId = @ProjectId AND MemId = @MemId;
        
        SELECT 'Team member removed successfully.' AS Message;
        
    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000);
        SELECT @ErrorMessage = ERROR_MESSAGE();
        ;THROW 50000, @ErrorMessage, 1;
    END CATCH
END
GO

-- 8. GET PROJECTS BY TEAM MEMBER Procedure
CREATE OR ALTER PROCEDURE [dbo].[sp_GetProjectsByTeamMember]
    @MemId NVARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        p.Id,
        p.ProjectName,
        p.ClientId,
        c.Name AS ClientName,
        p.Description,
        p.StartDate,
        p.EndDate,
        p.Status,
        ptm.Role,
        ptm.AssignmentDate
    FROM Projects p
    INNER JOIN ProjectTeamMembers ptm ON p.Id = ptm.ProjectId
    LEFT JOIN Clients c ON p.ClientId = c.Id
    WHERE ptm.MemId = @MemId 
        AND p.IsActive = 1
    ORDER BY p.StartDate DESC;
END
GO

-- 9. GET PROJECT TEAM MEMBERS Procedure
CREATE OR ALTER PROCEDURE [dbo].[sp_GetProjectTeamMembers]
    @ProjectId NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        tm.MemId,
        tm.Name,
        tm.Email,
        tm.Phone,
        ptm.Role,
        ptm.AssignmentDate
    FROM ProjectTeamMembers ptm
    INNER JOIN TeamMembers tm ON ptm.MemId = tm.MemId
    WHERE ptm.ProjectId = @ProjectId
        AND tm.IsActive = 1
    ORDER BY ptm.AssignmentDate;
END
GO

-- 10. ADD PROJECT SERVICE Procedure
CREATE OR ALTER PROCEDURE [dbo].[sp_AddProjectService]
    @ProjectId NVARCHAR(50),
    @Description NVARCHAR(MAX),
    @Hours INT,
    @Rate DECIMAL(18,2)
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        -- Validate Project exists
        IF NOT EXISTS (SELECT 1 FROM Projects WHERE Id = @ProjectId AND IsActive = 1)
        BEGIN
            ;THROW 50001, 'Project does not exist or is inactive.', 1;
        END

        -- Add service to project
        INSERT INTO ProjectServices (ProjectId, Description, Hours, Rate)
        VALUES (@ProjectId, @Description, @Hours, @Rate);
        
        SELECT 'Service added successfully.' AS Message,
               SCOPE_IDENTITY() AS ServiceId;
        
    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000);
        SELECT @ErrorMessage = ERROR_MESSAGE();
        ;THROW 50000, @ErrorMessage, 1;
    END CATCH
END
GO

-- 11. REMOVE PROJECT SERVICE Procedure
CREATE OR ALTER PROCEDURE [dbo].[sp_RemoveProjectService]
    @ServiceId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        -- Check if service exists
        IF NOT EXISTS (SELECT 1 FROM ProjectServices WHERE Id = @ServiceId)
        BEGIN
            ;THROW 50001, 'Service does not exist.', 1;
        END

        -- Remove service
        DELETE FROM ProjectServices
        WHERE Id = @ServiceId;
        
        SELECT 'Service removed successfully.' AS Message;
        
    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000);
        SELECT @ErrorMessage = ERROR_MESSAGE();
        ;THROW 50000, @ErrorMessage, 1;
    END CATCH
END
GO

-- 12. GET SERVICES BY PROJECT Procedure
CREATE OR ALTER PROCEDURE [dbo].[sp_GetServicesByProject]
    @ProjectId NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        Id,
        Description,
        Hours,
        Rate,
        CreatedAt
    FROM ProjectServices
    WHERE ProjectId = @ProjectId
    ORDER BY CreatedAt;
END
GO

-- 13. UPDATE PROJECT STATUS Procedure
CREATE OR ALTER PROCEDURE [dbo].[sp_UpdateProjectStatus]
    @ProjectId NVARCHAR(50),
    @Status NVARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        -- Validate Project exists
        IF NOT EXISTS (SELECT 1 FROM Projects WHERE Id = @ProjectId AND IsActive = 1)
        BEGIN
            ;THROW 50001, 'Project does not exist or is inactive.', 1;
        END

        -- Validate status
        IF @Status NOT IN ('Active', 'On Hold', 'Completed', 'Cancelled')
        BEGIN
            ;THROW 50002, 'Invalid status. Valid values: Active, On Hold, Completed, Cancelled', 1;
        END

        -- Update project status
        UPDATE Projects
        SET Status = @Status,
            UpdatedAt = GETDATE()
        WHERE Id = @ProjectId;
        
        SELECT 'Project status updated successfully.' AS Message;
        
    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000);
        SELECT @ErrorMessage = ERROR_MESSAGE();
        ;THROW 50000, @ErrorMessage, 1;
    END CATCH
END
GO

-- 14. GET ACTIVE PROJECTS DASHBOARD Procedure
CREATE OR ALTER PROCEDURE [dbo].[sp_GetActiveProjectsDashboard]
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Get active projects summary
    SELECT 
        p.Id,
        p.ProjectName,
        c.Name AS ClientName,
        p.StartDate,
        p.EndDate,
        p.Status,
        p.FlatRate,
        p.TotalHours,
        ISNULL(SUM(ps.Hours), 0) AS UsedHours,
        ISNULL(SUM(ps.Hours * ps.Rate), 0) AS TotalCost,
        COUNT(DISTINCT ptm.MemId) AS TeamSize
    FROM Projects p
    LEFT JOIN Clients c ON p.ClientId = c.Id
    LEFT JOIN ProjectServices ps ON p.Id = ps.ProjectId
    LEFT JOIN ProjectTeamMembers ptm ON p.Id = ptm.ProjectId
    WHERE p.IsActive = 1 AND p.Status = 'Active'
    GROUP BY p.Id, p.ProjectName, c.Name, p.StartDate, p.EndDate, p.Status, p.FlatRate, p.TotalHours
    ORDER BY p.StartDate;
    
    -- Get overall statistics
    SELECT 
        COUNT(*) AS TotalActiveProjects,
        SUM(TotalHours) AS TotalPlannedHours,
        SUM(FlatRate) AS TotalFlatRate,
        AVG(DATEDIFF(DAY, StartDate, EndDate)) AS AvgProjectDuration
    FROM Projects
    WHERE IsActive = 1 AND Status = 'Active';
END
GO

-- 15. GET PROJECT SUMMARY Procedure
CREATE OR ALTER PROCEDURE [dbo].[sp_GetProjectSummary]
    @ProjectId NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Project basic info
    SELECT 
        p.Id,
        p.ProjectName,
        c.Name AS ClientName,
        p.Description,
        p.StartDate,
        p.EndDate,
        p.FlatRate,
        p.TotalHours,
        p.Status,
        DATEDIFF(DAY, p.StartDate, p.EndDate) AS DurationDays,
        DATEDIFF(DAY, GETDATE(), p.EndDate) AS DaysRemaining
    FROM Projects p
    LEFT JOIN Clients c ON p.ClientId = c.Id
    WHERE p.Id = @ProjectId AND p.IsActive = 1;
    
    -- Services summary
    SELECT 
        COUNT(*) AS TotalServices,
        SUM(Hours) AS TotalServiceHours,
        SUM(Hours * Rate) AS TotalServiceCost,
        AVG(Rate) AS AvgHourlyRate
    FROM ProjectServices
    WHERE ProjectId = @ProjectId;
    
    -- Team summary
    SELECT 
        COUNT(*) AS TeamSize,
        STRING_AGG(tm.Name, ', ') AS TeamMembers
    FROM ProjectTeamMembers ptm
    INNER JOIN TeamMembers tm ON ptm.MemId = tm.MemId
    WHERE ptm.ProjectId = @ProjectId;
END
GO

-- 16. GET PROJECT TIMELINE Procedure
CREATE OR ALTER PROCEDURE [dbo].[sp_GetProjectTimeline]
    @ProjectId NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Project milestones
    SELECT 
        'Project Start' AS Event,
        StartDate AS Date,
        'Start' AS Type
    FROM Projects
    WHERE Id = @ProjectId
    
    UNION ALL
    
    SELECT 
        'Project End' AS Event,
        EndDate AS Date,
        'End' AS Type
    FROM Projects
    WHERE Id = @ProjectId
    
    UNION ALL
    
    -- Service milestones
    SELECT 
        'Service: ' + Description AS Event,
        CreatedAt AS Date,
        'Service' AS Type
    FROM ProjectServices
    WHERE ProjectId = @ProjectId
    
    UNION ALL
    
    -- Team member assignments
    SELECT 
        'Team Member Added: ' + tm.Name AS Event,
        AssignmentDate AS Date,
        'Team' AS Type
    FROM ProjectTeamMembers ptm
    INNER JOIN TeamMembers tm ON ptm.MemId = tm.MemId
    WHERE ptm.ProjectId = @ProjectId
    
    ORDER BY Date;
END
GO

-- 17. VALIDATE PROJECT DATA Procedure
CREATE OR ALTER PROCEDURE [dbo].[sp_ValidateProjectData]
    @ProjectName NVARCHAR(100),
    @ClientId NVARCHAR(50),
    @StartDate DATETIME2,
    @EndDate DATETIME2,
    @Status NVARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @ErrorMessage NVARCHAR(4000) = '';
    
    -- Validate required fields
    IF @ProjectName IS NULL OR @ProjectName = ''
        SET @ErrorMessage = @ErrorMessage + 'Project name is required. ';
    
    IF @ClientId IS NULL OR @ClientId = ''
        SET @ErrorMessage = @ErrorMessage + 'Client ID is required. ';
    
    -- Validate dates
    IF @StartDate IS NULL
        SET @ErrorMessage = @ErrorMessage + 'Start date is required. ';
    
    IF @EndDate IS NULL
        SET @ErrorMessage = @ErrorMessage + 'End date is required. ';
    
    IF @StartDate > @EndDate
        SET @ErrorMessage = @ErrorMessage + 'Start date cannot be after end date. ';
    
    -- Validate status
    IF @Status NOT IN ('Active', 'On Hold', 'Completed', 'Cancelled')
        SET @ErrorMessage = @ErrorMessage + 'Invalid status. Valid values: Active, On Hold, Completed, Cancelled. ';
    
    -- Return validation result
    IF @ErrorMessage != ''
    BEGIN
        SELECT 0 AS IsValid, @ErrorMessage AS Message;
    END
    ELSE
    BEGIN
        SELECT 1 AS IsValid, 'Data is valid.' AS Message;
    END
END
GO

-- Verify all procedures were created
PRINT '=====================================';
PRINT 'PROJECT STORED PROCEDURES SUMMARY';
PRINT '=====================================';
SELECT 
    ROW_NUMBER() OVER (ORDER BY name) AS #,
    name AS ProcedureName,
    'Created Successfully' AS Status
FROM sys.procedures 
WHERE name LIKE 'sp_%' 
   AND name LIKE '%Project%'
ORDER BY name;
PRINT '=====================================';




SELECT name FROM sys.table_types 
WHERE schema_id = SCHEMA_ID('dbo')
AND (name LIKE '%ProjectService%' OR name LIKE '%ProjectTeam%');


SELECT * from Payments



-- Create PaymentType table
CREATE TABLE [dbo].[PaymentType] (
    [PtID] INT NOT NULL PRIMARY KEY,
    [Description] NVARCHAR(50) NOT NULL,
    [Id] NVARCHAR(20) NOT NULL UNIQUE  -- Format: PMT0000001
);
GO

-- Insert default payment types
INSERT INTO [dbo].[PaymentType] ([PtID], [Description], [Id])
VALUES 
    (0, 'bill_payment', 'PMT0000001'),
    (1, 'invoice_payment', 'PMT0000002');
GO

-- Optional: Create a stored procedure to generate ID automatically
CREATE OR ALTER PROCEDURE [dbo].[sp_GeneratePaymentTypeId]
AS
BEGIN
    DECLARE @NewId NVARCHAR(20);
    
    SELECT TOP 1 @NewId = 'PMT' + RIGHT('0000000' + 
               CAST(ISNULL(MAX(CAST(SUBSTRING(Id, 4, LEN(Id)) AS INT)), 0) + 1 AS NVARCHAR(7)), 7)
    FROM PaymentType;
    
    SELECT @NewId AS GeneratedPaymentTypeId;
END
GO


SELECT * from PaymentType