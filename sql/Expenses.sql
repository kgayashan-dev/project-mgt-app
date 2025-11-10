use project_pulse

CREATE TABLE Expenses (
    Id NVARCHAR(50) PRIMARY KEY NOT NULL,
    CategoryId NVARCHAR(50) NOT NULL, 
    Merchant NVARCHAR(100) NOT NULL, 
    Date DATETIME2 NOT NULL,
    SubTotal DECIMAL(18,2) NOT NULL,
    GrandTotal DECIMAL(18,2) NOT NULL,
    CreatedDate DATETIME2 DEFAULT GETUTCDATE(),
    ModifiedDate DATETIME2 DEFAULT GETUTCDATE(),
    IsActive BIT DEFAULT 1
);


CREATE TABLE ExpenseTaxes (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ExpenseId NVARCHAR(50) NOT NULL,
    TaxName NVARCHAR(100) NOT NULL,
    TaxAmount DECIMAL(18,2) NOT NULL,
    CreatedDate DATETIME2 DEFAULT GETUTCDATE(),
    ModifiedDate DATETIME2 DEFAULT GETUTCDATE(),
    IsActive BIT DEFAULT 1,
    CONSTRAINT FK_ExpenseTaxes_Expenses FOREIGN KEY (ExpenseId) REFERENCES Expenses(Id) ON DELETE CASCADE
);


CREATE TYPE [dbo].[ExpenseTaxDetailsType] AS TABLE(
    Id INT NULL,
    ExpenseId NVARCHAR(50) NULL,
    TaxName NVARCHAR(100) NOT NULL,
    TaxAmount DECIMAL(18,2) NOT NULL
);
GO

GO 


CREATE OR ALTER PROCEDURE [dbo].[sp_CreateExpense]
    @Id NVARCHAR(50) = NULL,
    @CategoryId NVARCHAR(50),
    @Merchant NVARCHAR(100),
    @Date DATETIME2,
    @SubTotal DECIMAL(18,2),
    @GrandTotal DECIMAL(18,2),
    @Taxes dbo.ExpenseTaxDetailsType READONLY
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @NewId NVARCHAR(50);

    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Generate Expense ID in EXP0000001 format when empty string or NULL is provided
        IF @Id IS NULL OR @Id = ''
        BEGIN
            SELECT @NewId = 'EXP' + RIGHT('0000000' + CAST(ISNULL(MAX(CAST(SUBSTRING(Id, 4, LEN(Id)) AS INT)), 0) + 1 AS NVARCHAR(7)), 7)
            FROM Expenses;
        END
        ELSE
        BEGIN
            SET @NewId = @Id;
        END

        -- Insert into Expenses table
        INSERT INTO Expenses (Id, CategoryId, Merchant, Date, SubTotal, GrandTotal)
        VALUES (@NewId, @CategoryId, @Merchant, @Date, @SubTotal, @GrandTotal);

        -- Insert Expense Taxes
        INSERT INTO ExpenseTaxes (ExpenseId, TaxName, TaxAmount)
        SELECT @NewId, TaxName, TaxAmount
        FROM @Taxes;

        COMMIT TRANSACTION;
        
        SELECT @NewId AS GeneratedExpenseId;
        
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

CREATE OR ALTER PROCEDURE [dbo].[sp_GetAllExpenses]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        e.Id, e.CategoryId, e.Merchant, e.Date, e.SubTotal, e.GrandTotal, 
        e.CreatedDate, e.ModifiedDate,
        et.Id AS TaxId, et.TaxName, et.TaxAmount,
        c.CatDescription
    FROM Expenses e
    LEFT JOIN ExpenseTaxes et ON e.Id = et.ExpenseId AND et.IsActive = 1
    LEFT JOIN Categories c ON e.CategoryId = c.CategoryId
    WHERE e.IsActive = 1
    ORDER BY e.Date DESC, e.CategoryId;
END
GO

CREATE OR ALTER PROCEDURE [dbo].[sp_GetExpenseById]
    @Id NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        e.Id, e.CategoryId, e.Merchant, e.Date, e.SubTotal, e.GrandTotal, 
        e.CreatedDate, e.ModifiedDate,
        et.Id AS TaxId, et.TaxName, et.TaxAmount,
        c.CatDescription
    FROM Expenses e
    LEFT JOIN ExpenseTaxes et ON e.Id = et.ExpenseId AND et.IsActive = 1
    LEFT JOIN Categories c ON e.CategoryId = c.CategoryId
    WHERE e.Id = @Id AND e.IsActive = 1
    ORDER BY et.Id;
END
GO

CREATE OR ALTER PROCEDURE [dbo].[sp_GetExpensesByCategory]
    @CategoryId NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        e.Id, e.CategoryId, e.Merchant, e.Date, e.SubTotal, e.GrandTotal, 
        e.CreatedDate, e.ModifiedDate,
        et.Id AS TaxId, et.TaxName, et.TaxAmount,
        c.CatDescription
    FROM Expenses e
    LEFT JOIN ExpenseTaxes et ON e.Id = et.ExpenseId AND et.IsActive = 1
    LEFT JOIN Categories c ON e.CategoryId = c.CategoryId
    WHERE e.CategoryId = @CategoryId AND e.IsActive = 1
    ORDER BY e.Date DESC;
END
GO




CREATE OR ALTER PROCEDURE [dbo].[sp_GetExpensesByCategory]
    @CategoryId NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        e.Id, e.CategoryId, e.Merchant, e.Date, e.SubTotal, e.GrandTotal, 
        e.CreatedDate, e.ModifiedDate,
        et.Id AS TaxId, et.TaxName, et.TaxAmount,
        c.CatDescription
    FROM Expenses e
    LEFT JOIN ExpenseTaxes et ON e.Id = et.ExpenseId AND et.IsActive = 1
    LEFT JOIN Categories c ON e.CategoryId = c.CategoryId
    WHERE e.CategoryId = @CategoryId AND e.IsActive = 1
    ORDER BY e.Date DESC;
END
GO



CREATE OR ALTER PROCEDURE [dbo].[sp_GetExpensesByDateRange]
    @StartDate DATETIME2,
    @EndDate DATETIME2
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        e.Id, e.CategoryId, e.Merchant, e.Date, e.SubTotal, e.GrandTotal, 
        e.CreatedDate, e.ModifiedDate,
        et.Id AS TaxId, et.TaxName, et.TaxAmount,
        c.CatDescription
    FROM Expenses e
    LEFT JOIN ExpenseTaxes et ON e.Id = et.ExpenseId AND et.IsActive = 1
    LEFT JOIN Categories c ON e.CategoryId = c.CategoryId
    WHERE e.Date BETWEEN @StartDate AND @EndDate AND e.IsActive = 1
    ORDER BY e.Date DESC, e.CategoryId;
END
GO


CREATE OR ALTER PROCEDURE [dbo].[sp_UpdateExpense]
    @Id NVARCHAR(50),
    @CategoryId NVARCHAR(50),
    @Merchant NVARCHAR(100),
    @Date DATETIME2,
    @SubTotal DECIMAL(18,2),
    @GrandTotal DECIMAL(18,2),
    @Taxes dbo.ExpenseTaxDetailsType READONLY
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Update Expense
        UPDATE Expenses 
        SET 
            CategoryId = @CategoryId,
            Merchant = @Merchant,
            Date = @Date,
            SubTotal = @SubTotal,
            GrandTotal = @GrandTotal,
            ModifiedDate = GETUTCDATE()
        WHERE Id = @Id AND IsActive = 1;

        -- Soft delete existing taxes
        UPDATE ExpenseTaxes 
        SET IsActive = 0, ModifiedDate = GETUTCDATE()
        WHERE ExpenseId = @Id AND IsActive = 1;

        -- Insert new/updated taxes
        INSERT INTO ExpenseTaxes (ExpenseId, TaxName, TaxAmount)
        SELECT @Id, TaxName, TaxAmount
        FROM @Taxes;

        COMMIT TRANSACTION;
        
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO


CREATE OR ALTER PROCEDURE [dbo].[sp_DeleteExpense]
    @Id NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Soft delete the expense
        UPDATE Expenses 
        SET IsActive = 0, ModifiedDate = GETUTCDATE()
        WHERE Id = @Id AND IsActive = 1;

        -- Soft delete all related expense taxes
        UPDATE ExpenseTaxes 
        SET IsActive = 0, ModifiedDate = GETUTCDATE()
        WHERE ExpenseId = @Id AND IsActive = 1;

        COMMIT TRANSACTION;
        
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO



CREATE OR ALTER PROCEDURE [dbo].[sp_SearchExpenses]
    @SearchTerm NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        e.Id, e.CategoryId, e.Merchant, e.Date, e.SubTotal, e.GrandTotal, 
        e.CreatedDate, e.ModifiedDate,
        c.CatDescription
    FROM Expenses e
    LEFT JOIN Categories c ON e.CategoryId = c.CategoryId
    WHERE e.IsActive = 1
        AND (e.CategoryId LIKE '%' + @SearchTerm + '%'
        OR e.Merchant LIKE '%' + @SearchTerm + '%'
        OR c.CatDescription LIKE '%' + @SearchTerm + '%')
    ORDER BY e.Date DESC, e.CategoryId;
END
GO



CREATE OR ALTER PROCEDURE [dbo].[sp_GetExpenseSummary]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        COUNT(*) AS TotalExpenses,
        AVG(GrandTotal) AS AverageExpense,
        COUNT(DISTINCT CategoryId) AS CategoryCount,
        SUM(GrandTotal) AS TotalExpensesAmount
    FROM Expenses 
    WHERE IsActive = 1;
END
GO


CREATE OR ALTER PROCEDURE [dbo].[sp_GetExpensesByMerchant]
    @Merchant NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        e.Id, e.CategoryId, e.Merchant, e.Date, e.SubTotal, e.GrandTotal, 
        e.CreatedDate, e.ModifiedDate,
        et.Id AS TaxId, et.TaxName, et.TaxAmount,
        c.CatDescription
    FROM Expenses e
    LEFT JOIN ExpenseTaxes et ON e.Id = et.ExpenseId AND et.IsActive = 1
    LEFT JOIN Categories c ON e.CategoryId = c.CategoryId
    WHERE e.Merchant LIKE '%' + @Merchant + '%' AND e.IsActive = 1
    ORDER BY e.Date DESC;
END
GO






GO