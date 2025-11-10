-- Create Bill table
CREATE TABLE Bills
(
    Id NVARCHAR(50) PRIMARY KEY NOT NULL,
    BillNumber NVARCHAR(50) NOT NULL UNIQUE,
    CompanyName NVARCHAR(100) NOT NULL,
    VendorId NVARCHAR(50) NOT NULL,
    
    IssueDate DATETIME2 NOT NULL,
    DueDate DATETIME2 NOT NULL,
    TotalOutstanding DECIMAL(18,2) DEFAULT 0,
    SubTotal DECIMAL(18,2) DEFAULT 0,
    Tax DECIMAL(18,2) DEFAULT 0,
    GrandTotal DECIMAL(18,2) DEFAULT 0,
    AmountDue DECIMAL(18,2) DEFAULT 0,
    TotalTax DECIMAL(18,2) DEFAULT 0,
    CreatedDate DATETIME2 DEFAULT GETUTCDATE(),
    ModifiedDate DATETIME2 DEFAULT GETUTCDATE(),
    IsActive BIT DEFAULT 1
);

-- ALTER TABLE Bills
-- DROP COLUMN ClientId;


alter table Bills  add  EmailAddress NVARCHAR(100),
    PhoneNumber NVARCHAR(20)

GO
-- Create BillItems table
CREATE TABLE BillItems
(
    Id INT IDENTITY(1,1) PRIMARY KEY,
    BillId NVARCHAR(50) NOT NULL,
    Description NVARCHAR(MAX) NOT NULL,
    Category NVARCHAR(100),
    Rate DECIMAL(18,2) NOT NULL,
    Qty INT NOT NULL,
    Total DECIMAL(18,2) NOT NULL,
    CreatedDate DATETIME2 DEFAULT GETUTCDATE(),
    ModifiedDate DATETIME2 DEFAULT GETUTCDATE(),
    IsActive BIT DEFAULT 1,
    CONSTRAINT FK_BillItems_Bills FOREIGN KEY (BillId) REFERENCES Bills(Id) ON DELETE CASCADE
);

-- Create User-Defined Table Type for Bill Items
CREATE TYPE [dbo].[BillItemDetailsType] AS TABLE(
    Id INT NULL,
    BillId NVARCHAR(50) NULL,
    Description NVARCHAR(MAX) NOT NULL,
    Category NVARCHAR(100) NULL,
    Rate DECIMAL(18,2) NOT NULL,
    Qty INT NOT NULL,
    Total DECIMAL(18,2) NOT NULL
);
GO


-- procs
-- Stored Procedure: Create Bill (FIXED - Proper ID generation)
CREATE OR ALTER PROCEDURE [dbo].[sp_CreateBill]
    @Id NVARCHAR(50) = NULL,
    @BillNumber NVARCHAR(50),
    @CompanyName NVARCHAR(100),
    @VendorId NVARCHAR(50),
    -- @ClientId NVARCHAR(50),
    @IssueDate DATETIME2,
    @DueDate DATETIME2,
    @EmailAddress NVARCHAR(100) = NULL,
    @PhoneNumber NVARCHAR(20) = NULL,
    @TotalOutstanding DECIMAL(18,2) = 0,
    @SubTotal DECIMAL(18,2) = 0,
    @Tax DECIMAL(18,2) = 0,
    @GrandTotal DECIMAL(18,2) = 0,
    @AmountDue DECIMAL(18,2) = 0,
    @TotalTax DECIMAL(18,2) = 0,
    @Items dbo.BillItemDetailsType READONLY
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @NewId NVARCHAR(50);
    DECLARE @MaxId INT;

    BEGIN TRY
        BEGIN TRANSACTION;

          if not EXISTS(select 1 from Vendors where id=@VendorId)
              THROW 50001, 'Vendor does not exists.',1;
        
        -- Generate Bill ID in BIL000001 format when empty string or NULL is provided
        IF @Id IS NULL OR @Id = ''
        BEGIN
            -- Get the maximum numeric part from existing Bill IDs safely
            SELECT @MaxId = ISNULL(MAX(
                CASE 
                    WHEN Id LIKE 'BIL[0-9]%' 
                    THEN TRY_CAST(SUBSTRING(Id, 4, LEN(Id)) AS INT)
                    ELSE 0 
                END
            ), 0)
            FROM Bills;

            SET @NewId = 'BIL' + RIGHT('0000000' + CAST(@MaxId + 1 AS NVARCHAR(7)), 7);
        END
        ELSE
        BEGIN
            SET @NewId = @Id;
        END

        -- Insert into Bills table
        INSERT INTO Bills
        (
            Id, BillNumber, CompanyName, VendorId, IssueDate, DueDate,
            EmailAddress, PhoneNumber, TotalOutstanding, SubTotal, Tax,
            GrandTotal, AmountDue, TotalTax
        )
        VALUES
        (
            @NewId, @BillNumber, @CompanyName, @VendorId, @IssueDate, @DueDate,
            @EmailAddress, @PhoneNumber, @TotalOutstanding, @SubTotal, @Tax,
            @GrandTotal, @AmountDue, @TotalTax
        );

        -- Insert Bill Items
        INSERT INTO BillItems
        (BillId, Description, Category, Rate, Qty, Total)
        SELECT @NewId, Description, Category, Rate, Qty, Total
        FROM @Items;

        COMMIT TRANSACTION;
        
         -- Return the generated ID
        SELECT @NewId AS GeneratedBillId;
        
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

-- Stored Procedure: Get All Bills
CREATE OR ALTER PROCEDURE [dbo].[sp_GetAllBills]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        b.Id, b.BillNumber, b.CompanyName, b.VendorId, 
        b.IssueDate, b.DueDate, b.EmailAddress, b.PhoneNumber,
        b.TotalOutstanding, b.SubTotal, b.Tax, b.GrandTotal, b.AmountDue, b.TotalTax,
        b.CreatedDate, b.ModifiedDate,
        bi.Id AS ItemId, bi.Description, bi.Category, bi.Rate, bi.Qty, bi.Total
    FROM Bills b
        LEFT JOIN BillItems bi ON b.Id = bi.BillId AND bi.IsActive = 1
    WHERE b.IsActive = 1
    ORDER BY b.IssueDate DESC, b.BillNumber;
END
GO

-- Stored Procedure: Get Bill By ID
CREATE OR ALTER PROCEDURE [dbo].[sp_GetBillById]
    @Id NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        b.Id, b.BillNumber, b.CompanyName, b.VendorId, 
        b.IssueDate, b.DueDate, b.EmailAddress, b.PhoneNumber,
        b.TotalOutstanding, b.SubTotal, b.Tax, b.GrandTotal, b.AmountDue, b.TotalTax,
        b.CreatedDate, b.ModifiedDate,
        bi.Id AS ItemId, bi.Description, bi.Category, bi.Rate, bi.Qty, bi.Total
    FROM Bills b
        LEFT JOIN BillItems bi ON b.Id = bi.BillId AND bi.IsActive = 1
    WHERE b.Id = @Id AND b.IsActive = 1
    ORDER BY bi.Id;
END
GO

-- Stored Procedure: Get Bill By Number
CREATE OR ALTER PROCEDURE [dbo].[sp_GetBillByNumber]
    @BillNumber NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        b.Id, b.BillNumber, b.CompanyName, b.VendorId, 
        b.IssueDate, b.DueDate, b.EmailAddress, b.PhoneNumber,
        b.TotalOutstanding, b.SubTotal, b.Tax, b.GrandTotal, b.AmountDue, b.TotalTax,
        b.CreatedDate, b.ModifiedDate,
        bi.Id AS ItemId, bi.Description, bi.Category, bi.Rate, bi.Qty, bi.Total
    FROM Bills b
        LEFT JOIN BillItems bi ON b.Id = bi.BillId AND bi.IsActive = 1
    WHERE b.BillNumber = @BillNumber AND b.IsActive = 1
    ORDER BY bi.Id;
END
GO

-- Stored Procedure: Get Bills By Vendor
CREATE OR ALTER PROCEDURE [dbo].[sp_GetBillsByVendor]
    @VendorId NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        b.Id, b.BillNumber, b.CompanyName, b.VendorId, 
        b.IssueDate, b.DueDate, b.EmailAddress, b.PhoneNumber,
        b.TotalOutstanding, b.SubTotal, b.Tax, b.GrandTotal, b.AmountDue, b.TotalTax,
        b.CreatedDate, b.ModifiedDate,
        bi.Id AS ItemId, bi.Description, bi.Category, bi.Rate, bi.Qty, bi.Total
    FROM Bills b
        LEFT JOIN BillItems bi ON b.Id = bi.BillId AND bi.IsActive = 1
    WHERE b.VendorId = @VendorId AND b.IsActive = 1
    ORDER BY b.IssueDate DESC, b.BillNumber;
END
GO

-- Stored Procedure: Get Bills By Client
-- CREATE OR ALTER PROCEDURE [dbo].[sp_GetBillsByClient]
--     @ClientId NVARCHAR(50)
-- AS
-- BEGIN
--     SET NOCOUNT ON;

--     SELECT
--         b.Id, b.BillNumber, b.CompanyName, b.VendorId, b.ClientId,
--         b.IssueDate, b.DueDate, b.EmailAddress, b.PhoneNumber,
--         b.TotalOutstanding, b.SubTotal, b.Tax, b.GrandTotal, b.AmountDue, b.TotalTax,
--         b.CreatedDate, b.ModifiedDate,
--         bi.Id AS ItemId, bi.Description, bi.Category, bi.Rate, bi.Qty, bi.Total
--     FROM Bills b
--         LEFT JOIN BillItems bi ON b.Id = bi.BillId AND bi.IsActive = 1
--     WHERE b.ClientId = @ClientId AND b.IsActive = 1
--     ORDER BY b.IssueDate DESC, b.BillNumber;
-- END
-- GO

-- Stored Procedure: Update Bill
CREATE OR ALTER PROCEDURE [dbo].[sp_UpdateBill]
    @Id NVARCHAR(50),
    @BillNumber NVARCHAR(50),
    @CompanyName NVARCHAR(100),
    @VendorId NVARCHAR(50),
  
    @IssueDate DATETIME2,
    @DueDate DATETIME2,

    @EmailAddress NVARCHAR(100) = NULL,
    @PhoneNumber NVARCHAR(20) = NULL,
    @TotalOutstanding DECIMAL(18,2) = 0,
    @SubTotal DECIMAL(18,2) = 0,
    @Tax DECIMAL(18,2) = 0,
    @GrandTotal DECIMAL(18,2) = 0,
    @AmountDue DECIMAL(18,2) = 0,
    @TotalTax DECIMAL(18,2) = 0,
    @Items dbo.BillItemDetailsType READONLY
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Update Bill
        UPDATE Bills 
        SET 
            BillNumber = @BillNumber,
            CompanyName = @CompanyName,
            VendorId = @VendorId,
        
            IssueDate = @IssueDate,
            DueDate = @DueDate,
          
            EmailAddress = @EmailAddress,
            PhoneNumber = @PhoneNumber,
            TotalOutstanding = @TotalOutstanding,
            SubTotal = @SubTotal,
            Tax = @Tax,
            GrandTotal = @GrandTotal,
            AmountDue = @AmountDue,
            TotalTax = @TotalTax,
            ModifiedDate = GETUTCDATE()
        WHERE Id = @Id AND IsActive = 1;

        -- Soft delete existing items
        UPDATE BillItems 
        SET IsActive = 0, ModifiedDate = GETUTCDATE()
        WHERE BillId = @Id AND IsActive = 1;

        -- Insert new/updated items
        INSERT INTO BillItems
        (BillId, Description, Category, Rate, Qty, Total)
    SELECT @Id, Description, Category, Rate, Qty, Total
    FROM @Items;

        COMMIT TRANSACTION;
        
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

-- Stored Procedure: Delete Bill (Soft Delete)
CREATE OR ALTER PROCEDURE [dbo].[sp_DeleteBill]
    @Id NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Soft delete the bill
        UPDATE Bills 
        SET IsActive = 0, ModifiedDate = GETUTCDATE()
        WHERE Id = @Id AND IsActive = 1;

        -- Soft delete all related bill items
        UPDATE BillItems 
        SET IsActive = 0, ModifiedDate = GETUTCDATE()
        WHERE BillId = @Id AND IsActive = 1;

        COMMIT TRANSACTION;
        
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

-- Stored Procedure: Search Bills
CREATE OR ALTER PROCEDURE [dbo].[sp_SearchBills]
    @SearchTerm NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        b.Id, b.BillNumber, b.CompanyName, b.VendorId,
        b.IssueDate, b.DueDate, b.EmailAddress, b.PhoneNumber,
        b.TotalOutstanding, b.SubTotal, b.Tax, b.GrandTotal, b.AmountDue, b.TotalTax,
        b.CreatedDate, b.ModifiedDate
    FROM Bills b
    WHERE b.IsActive = 1
        AND (b.BillNumber LIKE '%' + @SearchTerm + '%'
        OR b.CompanyName LIKE '%' + @SearchTerm + '%'

        OR b.VendorId LIKE '%' + @SearchTerm + '%')
    ORDER BY b.IssueDate DESC, b.BillNumber;
END
GO


select * from BillItems where BillId = 'BIL0000004'