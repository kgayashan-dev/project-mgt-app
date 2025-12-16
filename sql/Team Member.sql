-- ============ DROP EXISTING OBJECTS ============
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'TeamMembers')
BEGIN
    DROP TABLE TeamMembers;
    PRINT 'Table TeamMembers dropped.';
END
GO

-- ============ CREATE TABLE ============
CREATE TABLE TeamMembers (
    MemId VARCHAR(20) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Email NVARCHAR(100) UNIQUE NOT NULL,
    Phone NVARCHAR(20),
    Department NVARCHAR(100),
    Role NVARCHAR(100),
    JoinDate DATE NOT NULL,
    IsActive BIT DEFAULT 1,
    CreatedDate DATETIME DEFAULT GETDATE()
);
PRINT 'Table TeamMembers created.';
GO

-- ============ CREATE INDEXES ============
CREATE INDEX IX_TeamMembers_MemId ON TeamMembers(MemId);
CREATE INDEX IX_TeamMembers_Email ON TeamMembers(Email);
CREATE INDEX IX_TeamMembers_Department ON TeamMembers(Department);
CREATE INDEX IX_TeamMembers_IsActive ON TeamMembers(IsActive);
PRINT 'Indexes created.';
GO

-- ============ STORED PROCEDURES ============

-- 1. Get All Team Members
CREATE OR ALTER PROCEDURE sp_GetAllTeamMembers
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        MemId,
        Name,
        Email,
        Phone,
        Department,
        Role,
        JoinDate,
        IsActive,
        CreatedDate
    FROM TeamMembers
    ORDER BY CreatedDate DESC;
END
GO
PRINT 'Stored procedure sp_GetAllTeamMembers created.';
GO

-- 2. Get Team Member By ID
CREATE OR ALTER PROCEDURE sp_GetTeamMemberById
    @MemId VARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        MemId,
        Name,
        Email,
        Phone,
        Department,
        Role,
        JoinDate,
        IsActive,
        CreatedDate
    FROM TeamMembers
    WHERE MemId = @MemId;
END
GO
PRINT 'Stored procedure sp_GetTeamMemberById created.';
GO

-- 3. Get Latest Team Member By Email (Helper for Create)
CREATE OR ALTER PROCEDURE sp_GetLatestTeamMemberByEmail
    @Email NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT TOP 1 
        MemId,
        Name,
        Email,
        Phone,
        Department,
        Role,
        JoinDate,
        IsActive,
        CreatedDate
    FROM TeamMembers
    WHERE Email = @Email
    ORDER BY CreatedDate DESC;
END
GO
PRINT 'Stored procedure sp_GetLatestTeamMemberByEmail created.';
GO

-- 4. Create Team Member
CREATE OR ALTER PROCEDURE sp_CreateTeamMember
    @Name NVARCHAR(100),
    @Email NVARCHAR(100),
    @Phone NVARCHAR(20) = NULL,
    @Department NVARCHAR(100) = NULL,
    @Role NVARCHAR(100) = NULL,
    @JoinDate DATE,
    @IsActive BIT = 1
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    
    BEGIN TRY
        -- Validate email doesn't exist
        IF EXISTS (SELECT 1 FROM TeamMembers WHERE Email = @Email)
        BEGIN
            THROW 50001, 'Email already exists. Please use a different email address.', 1;
        END
        
        -- Generate MemId
        DECLARE @NewMemId VARCHAR(20);
        DECLARE @LastNumber INT;
        
        -- Get the last MemId number
        SELECT TOP 1 @LastNumber = CAST(SUBSTRING(MemId, 4, LEN(MemId)) AS INT)
        FROM TeamMembers 
        WHERE MemId LIKE 'MEM%'
        ORDER BY MemId DESC;
        
        -- If no records exist, start from 1
        IF @LastNumber IS NULL
            SET @LastNumber = 0;
        
        -- Generate new ID
        SET @NewMemId = 'MEM' + RIGHT('0000000' + CAST(@LastNumber + 1 AS VARCHAR(10)), 7);
        
        -- Insert record
        INSERT INTO TeamMembers (
            MemId,
            Name,
            Email,
            Phone,
            Department,
            Role,
            JoinDate,
            IsActive,
            CreatedDate
        ) VALUES (
            @NewMemId,
            @Name,
            @Email,
            @Phone,
            @Department,
            @Role,
            @JoinDate,
            @IsActive,
            GETDATE()
        );
        
        PRINT 'Team member created with ID: ' + @NewMemId;
        
    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();
        
        THROW 50000, @ErrorMessage, 1;
    END CATCH
END
GO
PRINT 'Stored procedure sp_CreateTeamMember created.';
GO

-- 5. Update Team Member
CREATE OR ALTER PROCEDURE sp_UpdateTeamMember
    @MemId VARCHAR(20),
    @Name NVARCHAR(100),
    @Email NVARCHAR(100),
    @Phone NVARCHAR(20) = NULL,
    @Department NVARCHAR(100) = NULL,
    @Role NVARCHAR(100) = NULL,
    @JoinDate DATE,
    @IsActive BIT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    
    BEGIN TRY
        -- Check if team member exists
        IF NOT EXISTS (SELECT 1 FROM TeamMembers WHERE MemId = @MemId)
        BEGIN
            THROW 50002, 'Team member not found.', 1;
        END
        
        -- Check if email is being used by another team member
        IF EXISTS (SELECT 1 FROM TeamMembers WHERE Email = @Email AND MemId != @MemId)
        BEGIN
            THROW 50003, 'Email is already used by another team member.', 1;
        END
        
        -- Update record
        UPDATE TeamMembers
        SET 
            Name = @Name,
            Email = @Email,
            Phone = @Phone,
            Department = @Department,
            Role = @Role,
            JoinDate = @JoinDate,
            IsActive = @IsActive
        WHERE MemId = @MemId;
        
        PRINT 'Team member updated: ' + @MemId;
        
    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();
        
        THROW 50000, @ErrorMessage, 1;
    END CATCH
END
GO
PRINT 'Stored procedure sp_UpdateTeamMember created.';
GO

-- 6. Delete Team Member
CREATE OR ALTER PROCEDURE sp_DeleteTeamMember
    @MemId VARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    
    BEGIN TRY
        -- Check if team member exists
        IF NOT EXISTS (SELECT 1 FROM TeamMembers WHERE MemId = @MemId)
        BEGIN
            THROW 50002, 'Team member not found.', 1;
        END
        
        -- Delete record
        DELETE FROM TeamMembers 
        WHERE MemId = @MemId;
        
        PRINT 'Team member deleted: ' + @MemId;
        
    END TRY
    BEGIN CATCH
        -- Check for foreign key constraint
        IF ERROR_NUMBER() = 547
        BEGIN
            THROW 50004, 'Cannot delete team member. There are related records in the system.', 1;
        END
        
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();
        
        THROW 50000, @ErrorMessage, 1;
    END CATCH
END
GO
PRINT 'Stored procedure sp_DeleteTeamMember created.';
GO

-- 7. Search Team Members
CREATE OR ALTER PROCEDURE sp_SearchTeamMembers
    @Name NVARCHAR(100) = NULL,
    @Department NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        MemId,
        Name,
        Email,
        Phone,
        Department,
        Role,
        JoinDate,
        IsActive,
        CreatedDate
    FROM TeamMembers
    WHERE 
        (@Name IS NULL OR Name LIKE '%' + @Name + '%')
        AND (@Department IS NULL OR Department = @Department)
    ORDER BY Name;
END
GO
PRINT 'Stored procedure sp_SearchTeamMembers created.';
GO

-- 8. Get Active Team Members
CREATE OR ALTER PROCEDURE sp_GetActiveTeamMembers
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        MemId,
        Name,
        Email,
        Phone,
        Department,
        Role,
        JoinDate,
        IsActive,
        CreatedDate
    FROM TeamMembers
    WHERE IsActive = 1
    ORDER BY Name;
END
GO
PRINT 'Stored procedure sp_GetActiveTeamMembers created.';
GO

-- 9. Get Team Members By Department
CREATE OR ALTER PROCEDURE sp_GetTeamMembersByDepartment
    @Department NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        MemId,
        Name,
        Email,
        Phone,
        Department,
        Role,
        JoinDate,
        IsActive,
        CreatedDate
    FROM TeamMembers
    WHERE Department = @Department
    ORDER BY Name;
END
GO
PRINT 'Stored procedure sp_GetTeamMembersByDepartment created.';
GO

-- 10. Get Team Members Summary
CREATE OR ALTER PROCEDURE sp_GetTeamMembersSummary
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        COUNT(*) AS TotalTeamMembers,
        SUM(CASE WHEN IsActive = 1 THEN 1 ELSE 0 END) AS ActiveTeamMembers,
        SUM(CASE WHEN IsActive = 0 THEN 1 ELSE 0 END) AS InactiveTeamMembers,
        COUNT(DISTINCT Department) AS TotalDepartments,
        MAX(JoinDate) AS LatestJoinDate
    FROM TeamMembers;
END
GO
PRINT 'Stored procedure sp_GetTeamMembersSummary created.';
GO

-- ============ INSERT TEST DATA ============
INSERT INTO TeamMembers (MemId, Name, Email, Phone, Department, Role, JoinDate, IsActive, CreatedDate)
VALUES 
('MEM0000001', 'John Doe', 'john.doe@example.com', '1234567890', 'IT', 'Developer', '2024-01-15', 1, GETDATE()),
('MEM0000002', 'Jane Smith', 'jane.smith@example.com', '0987654321', 'HR', 'Manager', '2024-01-16', 1, GETDATE()),
('MEM0000003', 'Bob Wilson', 'bob.wilson@example.com', '5551234567', 'Finance', 'Analyst', '2024-01-17', 1, GETDATE());
PRINT 'Test data inserted.';
GO

-- ============ VERIFICATION ============
SELECT 'TeamMembers Table:' AS Object, COUNT(*) AS Count FROM TeamMembers
UNION ALL
SELECT 'Stored Procedures:', COUNT(*) FROM sys.objects WHERE type = 'P' AND name LIKE 'sp_%TeamMember%';
GO

PRINT '=========================================';
PRINT 'TEAM MEMBERS SYSTEM SETUP COMPLETED';
PRINT '=========================================';