-- Create Vendor table (if not exists)
CREATE TABLE Vendors (
    Id NVARCHAR(50) PRIMARY KEY NOT NULL,
    CompanyName NVARCHAR(100) NOT NULL,
    FirstName NVARCHAR(50),
    LastName NVARCHAR(50),
    AccountNumber NVARCHAR(50),
    EmailAddress NVARCHAR(100),
    Website NVARCHAR(200),
    PhoneNumber NVARCHAR(20),
    TotalOutstanding DECIMAL(18,2) DEFAULT 0,
    CreatedDate DATETIME2 DEFAULT GETUTCDATE(),
    ModifiedDate DATETIME2 DEFAULT GETUTCDATE(),
    IsActive BIT DEFAULT 1
);
GO

-- Stored Procedure: Create Vendor (FIXED)
CREATE PROCEDURE [dbo].[sp_CreateVendor]
    @Id NVARCHAR(50) = NULL,  -- Make ID optional
    @CompanyName NVARCHAR(100),
    @FirstName NVARCHAR(50) = NULL,
    @LastName NVARCHAR(50) = NULL,
    @AccountNumber NVARCHAR(50) = NULL,
    @EmailAddress NVARCHAR(100) = NULL,
    @Website NVARCHAR(200) = NULL,
    @PhoneNumber NVARCHAR(20) = NULL,
    @TotalOutstanding DECIMAL(18,2) = 0
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @NewId NVARCHAR(50);
    
    BEGIN TRY
        IF @Id IS NULL OR @Id = ''
        BEGIN
            -- Generate new Vendor ID in VEN000001 format
            SELECT @NewId = 'VEN' + RIGHT('000000' + CAST(ISNULL(MAX(CAST(SUBSTRING(Id, 4, LEN(Id)) AS INT)), 0) + 1 AS NVARCHAR(6)), 6)
            FROM Vendors;  -- FIXED: Changed from Quotations to Vendors
        END
        ELSE
        BEGIN
            SET @NewId = @Id;
        END

        INSERT INTO Vendors (
            Id, CompanyName, FirstName, LastName, AccountNumber,  -- FIXED: Added Id column
            EmailAddress, Website, PhoneNumber, TotalOutstanding
        )
        VALUES (
            @NewId, @CompanyName, @FirstName, @LastName, @AccountNumber,  -- FIXED: Added @NewId
            @EmailAddress, @Website, @PhoneNumber, @TotalOutstanding
        );
        
        -- FIXED: SCOPE_IDENTITY() doesn't work with NVARCHAR, return the generated ID directly
        SELECT @NewId AS Id;
        
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

-- Stored Procedure: Get Vendor by ID
CREATE PROCEDURE [dbo].[sp_GetVendor]
    @Id NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        Id, CompanyName, FirstName, LastName, AccountNumber,
        EmailAddress, Website, PhoneNumber, TotalOutstanding,
        CreatedDate, ModifiedDate
    FROM Vendors 
    WHERE Id = @Id AND IsActive = 1;
END
GO

-- Stored Procedure: Get All Vendors
CREATE PROCEDURE [dbo].[sp_GetAllVendors]
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        Id, CompanyName, FirstName, LastName, AccountNumber,
        EmailAddress, Website, PhoneNumber, TotalOutstanding,
        CreatedDate, ModifiedDate
    FROM Vendors 
    WHERE IsActive = 1
    ORDER BY CompanyName;
END
GO

-- Stored Procedure: Update Vendor
CREATE PROCEDURE [dbo].[sp_UpdateVendor]
    @Id NVARCHAR(50),
    @CompanyName NVARCHAR(100),
    @FirstName NVARCHAR(50) = NULL,
    @LastName NVARCHAR(50) = NULL,
    @AccountNumber NVARCHAR(50) = NULL,
    @EmailAddress NVARCHAR(100) = NULL,
    @Website NVARCHAR(200) = NULL,
    @PhoneNumber NVARCHAR(20) = NULL,
    @TotalOutstanding DECIMAL(18,2) = 0
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE Vendors 
    SET 
        CompanyName = @CompanyName,
        FirstName = @FirstName,
        LastName = @LastName,
        AccountNumber = @AccountNumber,
        EmailAddress = @EmailAddress,
        Website = @Website,
        PhoneNumber = @PhoneNumber,
        TotalOutstanding = @TotalOutstanding,
        ModifiedDate = GETUTCDATE()
    WHERE Id = @Id AND IsActive = 1;
END
GO

-- Stored Procedure: Delete Vendor (Soft Delete)
CREATE PROCEDURE [dbo].[sp_DeleteVendor]
    @Id NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE Vendors 
    SET 
        IsActive = 0,
        ModifiedDate = GETUTCDATE()
    WHERE Id = @Id AND IsActive = 1;
END
GO

-- Stored Procedure: Search Vendors
CREATE PROCEDURE [dbo].[sp_SearchVendors]
    @SearchTerm NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        Id, CompanyName, FirstName, LastName, AccountNumber,
        EmailAddress, Website, PhoneNumber, TotalOutstanding,
        CreatedDate, ModifiedDate
    FROM Vendors 
    WHERE IsActive = 1 
        AND (CompanyName LIKE '%' + @SearchTerm + '%'
            OR FirstName LIKE '%' + @SearchTerm + '%'
            OR LastName LIKE '%' + @SearchTerm + '%'
            OR EmailAddress LIKE '%' + @SearchTerm + '%')
    ORDER BY CompanyName;
END
GO