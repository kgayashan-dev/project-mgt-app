-- Create CompanyData table
CREATE TABLE CompanyData (
    Id NVARCHAR(50) PRIMARY KEY,
    CompanyName NVARCHAR(255) NOT NULL,
    Email NVARCHAR(255) NOT NULL,
    PhoneNumber NVARCHAR(50) NOT NULL,
    Address NVARCHAR(500) NOT NULL,
    City NVARCHAR(100) NOT NULL,
    State NVARCHAR(100) NOT NULL,
    ZipCode NVARCHAR(20) NOT NULL,
    Country NVARCHAR(100) NOT NULL,
    Logo NVARCHAR(500) NULL,
    Website NVARCHAR(255) NULL,
    TaxId NVARCHAR(100) NULL,
    RegistrationNumber NVARCHAR(100) NULL,
    CreatedDate DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedDate DATETIME NULL
);
GO

-- Function to generate next Company ID
CREATE FUNCTION [dbo].[fn_GenerateCompanyId]()
RETURNS NVARCHAR(50)
AS
BEGIN
    DECLARE @NewId NVARCHAR(50);
    DECLARE @MaxNumber INT;
    
    -- Get the maximum numeric part safely
    SELECT @MaxNumber = ISNULL(MAX(
        CASE 
            WHEN Id LIKE 'COM%' AND TRY_CAST(SUBSTRING(Id, 4, LEN(Id)) AS INT) IS NOT NULL
            THEN CAST(SUBSTRING(Id, 4, LEN(Id)) AS INT)
            ELSE 0
        END
    ), 0)
    FROM CompanyData;
    
    SET @NewId = 'COM' + RIGHT('000000' + CAST(@MaxNumber + 1 AS NVARCHAR(6)), 6);
    RETURN @NewId;
END
GO

-- Get company data (only one record expected)
CREATE PROCEDURE [dbo].[sp_GetCompanyData]
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT TOP 1 * FROM CompanyData 
    ORDER BY CreatedDate DESC;
END
GO

-- Get company data by ID
CREATE PROCEDURE [dbo].[sp_GetCompanyDataById]
    @Id NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT * FROM CompanyData 
    WHERE Id = @Id;
END
GO

-- Create company data
CREATE OR ALTER PROCEDURE [dbo].[sp_CreateCompanyData]
    @CompanyName NVARCHAR(255),
    @Email NVARCHAR(255),
    @PhoneNumber NVARCHAR(50),
    @Address NVARCHAR(500),
    @City NVARCHAR(100),
    @State NVARCHAR(100),
    @ZipCode NVARCHAR(20),
    @Country NVARCHAR(100),
 
    @Website NVARCHAR(255) = NULL,

    @RegistrationNumber NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

        -- Generate new Company ID
        DECLARE @NewId NVARCHAR(50);
        SET @NewId = [dbo].[fn_GenerateCompanyId]();

        -- Insert new company data
        INSERT INTO CompanyData (
            Id, CompanyName, Email, PhoneNumber, Address, City, State, 
            ZipCode, Country, Logo, Website, TaxId, RegistrationNumber, 
            CreatedDate
        )
        VALUES (
            @NewId, @CompanyName, @Email, @PhoneNumber, @Address, @City, @State,
            @ZipCode, @Country, @Logo, @Website, @TaxId, @RegistrationNumber,
            GETDATE()
        );

        -- Return the generated ID
        SELECT @NewId AS GeneratedCompanyId;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();
        
        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END
GO

-- Update company data
CREATE OR ALTER PROCEDURE [dbo].[sp_UpdateCompanyData]
    @Id NVARCHAR(50),
    @CompanyName NVARCHAR(255),
    @Email NVARCHAR(255),
    @PhoneNumber NVARCHAR(50),
    @Address NVARCHAR(500),
    @City NVARCHAR(100),
    @State NVARCHAR(100),
    @ZipCode NVARCHAR(20),
    @Country NVARCHAR(100),

    @Website NVARCHAR(255) = NULL,

    @RegistrationNumber NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

        -- Check if company exists
        IF NOT EXISTS (SELECT 1 FROM CompanyData WHERE Id = @Id)
        BEGIN
            RAISERROR('Company not found', 16, 1);
            RETURN;
        END

        -- Update company data
        UPDATE CompanyData SET
            CompanyName = @CompanyName,
            Email = @Email,
            PhoneNumber = @PhoneNumber,
            Address = @Address,
            City = @City,
            State = @State,
            ZipCode = @ZipCode,
            Country = @Country,
           
            Website = @Website,
           
            RegistrationNumber = @RegistrationNumber,
            UpdatedDate = GETDATE()
        WHERE Id = @Id;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();
        
        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END
GO

-- Delete company data
CREATE PROCEDURE [dbo].[sp_DeleteCompanyData]
    @Id NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;

        -- Check if company exists
        IF NOT EXISTS (SELECT 1 FROM CompanyData WHERE Id = @Id)
        BEGIN
            RAISERROR('Company not found', 16, 1);
            RETURN;
        END

        DELETE FROM CompanyData 
        WHERE Id = @Id;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();
        
        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END
GO

-- Get all companies (for admin purposes)
CREATE PROCEDURE [dbo].[sp_GetAllCompanies]
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT * FROM CompanyData 
    ORDER BY CreatedDate DESC;
END
GO

select * from CompanyData