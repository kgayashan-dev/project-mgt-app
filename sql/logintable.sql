-- =============================================
-- COMPLETE SQL SCRIPT - START FRESH
-- =============================================

-- =============================================
-- 1. FIRST, SHOW CURRENT TABLE STRUCTURE
-- =============================================
PRINT 'Checking current table structure...';
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Users' 
AND TABLE_SCHEMA = 'dbo'
ORDER BY ORDINAL_POSITION;
GO

-- =============================================
-- 2. DROP EXISTING TABLE AND PROCEDURES
-- =============================================
PRINT 'Dropping existing objects...';

-- -- Drop procedures first
-- IF OBJECT_ID('[dbo].[UserAuthentication]', 'P') IS NOT NULL
--     DROP PROCEDURE [dbo].[UserAuthentication];
-- GO

-- IF OBJECT_ID('[dbo].[sp_RegisterUser]', 'P') IS NOT NULL
--     DROP PROCEDURE [dbo].[sp_RegisterUser];
-- GO

-- IF OBJECT_ID('[dbo].[sp_GetUserById]', 'P') IS NOT NULL
--     DROP PROCEDURE [dbo].[sp_GetUserById];
-- GO

-- IF OBJECT_ID('[dbo].[sp_UpdateUserLastLogin]', 'P') IS NOT NULL
--     DROP PROCEDURE [dbo].[sp_UpdateUserLastLogin];
-- GO

-- -- Drop table if exists
-- IF OBJECT_ID('[dbo].[Users]', 'U') IS NOT NULL
-- BEGIN
--     DROP TABLE [dbo].[Users];
--     PRINT 'Dropped existing Users table';
-- END
GO

-- =============================================
-- 3. CREATE USERS TABLE FROM SCRATCH
-- =============================================
PRINT 'Creating Users table...';

CREATE TABLE [dbo].[Users] (
    [UserId] INT IDENTITY(1,1) PRIMARY KEY,
    [UserName] NVARCHAR(100) NOT NULL,
    [Email] NVARCHAR(100) NULL,
    [Password] NVARCHAR(100) NOT NULL,
    [FirstName] NVARCHAR(50) NULL,
    [LastName] NVARCHAR(50) NULL,
    [FullName] NVARCHAR(200) NULL,
    [Role] NVARCHAR(50) NOT NULL DEFAULT 'User',
    [IsActive] BIT NOT NULL DEFAULT 1,
    [CreatedAt] DATETIME NOT NULL DEFAULT GETDATE(),
    [LastLoginAt] DATETIME NULL,
    [UpdatedAt] DATETIME NULL,
    [EmailVerified] BIT NOT NULL DEFAULT 0,
    [VerificationToken] NVARCHAR(100) NULL,
    [ResetPasswordToken] NVARCHAR(100) NULL,
    [ResetPasswordExpires] DATETIME NULL
);
GO

-- Create indexes
CREATE INDEX IX_Users_UserName ON [dbo].[Users]([UserName]);
CREATE INDEX IX_Users_Email ON [dbo].[Users]([Email]);
CREATE INDEX IX_Users_Role ON [dbo].[Users]([Role]);
GO

PRINT 'Users table created successfully';
GO

-- =============================================
-- 4. CREATE STORED PROCEDURES
-- =============================================
GO
-- UserAuthentication Procedure
CREATE OR ALTER PROCEDURE [dbo].[UserAuthentication]
    @userName NVARCHAR(100),
    @password NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @User_ID INT,
            @User_Name NVARCHAR(100),
            @User_FullName NVARCHAR(200),
            @User_Role NVARCHAR(50),
            @Is_Active BIT,
            @User_Email NVARCHAR(100)
    
    -- Check if user exists with given credentials
    SELECT TOP 1
        @User_ID = u.[UserId],
        @User_Name = u.[UserName],
        @User_FullName = COALESCE(u.[FullName], u.[UserName]),
        @Is_Active = u.[IsActive],
        @User_Role = u.[Role],
        @User_Email = COALESCE(u.[Email], u.[UserName])
    FROM [dbo].[Users] u
    WHERE (u.[UserName] = @userName OR u.[Email] = @userName)
        AND u.[Password] = @password
    
    -- Check if user was found
    IF @User_ID IS NULL
    BEGIN
        -- User not found
        SELECT 
            0 AS [loginID],
            '' AS [UserName],
            '' AS [FullName],
            '' AS [Role],
            '' AS [Email],
            'Authentication failed - Invalid credentials' AS [Message]
    END
    ELSE IF @Is_Active = 0
    BEGIN
        -- User found but inactive
        SELECT 
            0 AS [loginID],
            '' AS [UserName],
            '' AS [FullName],
            '' AS [Role],
            '' AS [Email],
            'Authentication failed - Account is inactive' AS [Message]
    END
    ELSE
    BEGIN
        -- User authenticated successfully
        -- Update last login time
        UPDATE [dbo].[Users] 
        SET [LastLoginAt] = GETDATE(),
            [UpdatedAt] = GETDATE()
        WHERE [UserId] = @User_ID;
        
        SELECT 
            @User_ID AS [loginID],
            @User_Name AS [UserName],
            @User_FullName AS [FullName],
            @User_Role AS [Role],
            @User_Email AS [Email],
            'Login successful' AS [Message]
    END
END
GO

PRINT 'UserAuthentication procedure created';
GO
-- =============================================
-- UPDATE STORED PROCEDURES WITHOUT PASSWORD SALT
-- =============================================
-- Update sp_RegisterUser to remove PasswordSalt parameter
CREATE OR ALTER PROCEDURE [dbo].[sp_RegisterUser]
    @Username NVARCHAR(100),
    @Email NVARCHAR(100),
    @PasswordHash NVARCHAR(255),
    @FirstName NVARCHAR(50),
    @LastName NVARCHAR(50),
    @VerificationToken NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        -- Check if username already exists
        IF EXISTS (SELECT 1 FROM [dbo].[Users] WHERE [UserName] = @Username)
        BEGIN
            SELECT 'Username already exists' AS [Error];
            RETURN;
        END
        
        -- Check if email already exists
        IF EXISTS (SELECT 1 FROM [dbo].[Users] WHERE [Email] = @Email)
        BEGIN
            SELECT 'Email already exists' AS [Error];
            RETURN;
        END
        
        -- Insert new user
        DECLARE @NewID INT;
        DECLARE @FullName NVARCHAR(200) = @FirstName + ' ' + @LastName;
        
        INSERT INTO [dbo].[Users] (
            [UserName],
            [Email],
            [Password],
            [FirstName],
            [LastName],
            [FullName],
            [Role],
            [VerificationToken],
            [CreatedAt]
        )
        VALUES (
            @Username,
            @Email,
            @PasswordHash,
            @FirstName,
            @LastName,
            @FullName,
            'User',
            @VerificationToken,
            GETDATE()
        );
        
        SET @NewID = SCOPE_IDENTITY();
        
        -- Return success with all user data
        SELECT 
            @NewID AS [UserId],
            'User registered successfully' AS [Message],
            @Username AS [Username],
            @Email AS [Email],
            @FirstName AS [FirstName],
            @LastName AS [LastName],
            @FullName AS [FullName]
    END TRY
    BEGIN CATCH
        -- Return error message
        SELECT ERROR_MESSAGE() AS [Error];
    END CATCH
END
GO

-- Update sp_ChangePassword to remove PasswordSalt parameter
ALTER PROCEDURE [dbo].[sp_ChangePassword]
    @UserId INT,
    @NewPasswordHash NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        UPDATE [dbo].[Users] 
        SET [Password] = @NewPasswordHash,
            [UpdatedAt] = GETDATE()
        WHERE [UserId] = @UserId;
        
        SELECT 'Password changed successfully' AS [Message];
    END TRY
    BEGIN CATCH
        SELECT ERROR_MESSAGE() AS [Error];
    END CATCH
END
GO


