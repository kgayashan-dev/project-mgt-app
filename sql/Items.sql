-- Item table 
USE project_pulse
DROP TABLE IF EXISTS items;

-- Create Items Table
CREATE TABLE Items
(
    Id NVARCHAR(50) PRIMARY KEY,
    Name NVARCHAR(255) NOT NULL,
    Description NVARCHAR(MAX),
    Category NVARCHAR(100),
    Price DECIMAL(18,2) NOT NULL DEFAULT 0,
    Qty INT NOT NULL DEFAULT 0,
    Rate DECIMAL(18,2) NOT NULL DEFAULT 0,
    [Total] AS ([Qty] * [Price]) PERSISTED, -- Fixed: Qty * Price (not Rate)
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE()
);

-- Create index for better search performance
CREATE INDEX IX_Items_Name ON Items (Name);
CREATE INDEX IX_Items_Category ON Items (Category);
GO

-- Fixed CreateItem procedure
CREATE OR ALTER PROCEDURE [dbo].[sp_CreateItem]
    @Name NVARCHAR(255),
    @Description NVARCHAR(MAX) = NULL,
    @Category NVARCHAR(100) = NULL,
    @Price DECIMAL(18,2) = 0,
    @Qty INT = 0,
    @Rate DECIMAL(18,2) = 0
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        DECLARE @NextId NVARCHAR(50);
        DECLARE @LastId INT;
        
        -- Get the last numeric part and increment
        SELECT @LastId = ISNULL(MAX(CAST(SUBSTRING(Id, 4, LEN(Id)) AS INT)), 0) 
        FROM Items 
        WHERE Id LIKE 'ITM%';
        
        SET @NextId = 'ITM' + RIGHT('000000' + CAST(@LastId + 1 AS NVARCHAR(6)), 6);
        
        -- Insert without Total (it's computed automatically)
        INSERT INTO Items (Id, Name, Description, Category, Price, Qty, Rate)
        VALUES (@NextId, @Name, @Description, @Category, @Price, @Qty, @Rate);
        
        -- Return the generated ID
        SELECT @NextId AS GeneratedItemId; -- Fixed variable name
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

-- Fixed GetNextItemId procedure (consistent with CreateItem)
CREATE  PROCEDURE [dbo].[sp_GetNextItemId]
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @NextId NVARCHAR(50);
    DECLARE @LastId INT;

    SELECT @LastId = ISNULL(MAX(CAST(SUBSTRING(Id, 4, LEN(Id)) AS INT)), 0)
    FROM Items
    WHERE Id LIKE 'ITM%';

    SET @NextId = 'ITM' + RIGHT('000000' + CAST(@LastId + 1 AS NVARCHAR(6)), 6);

    SELECT @NextId AS NextItemId;
END
GO

CREATE OR ALTER PROCEDURE [dbo].[sp_GetItemById]
    @Id NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT Id, Name, Description, Category, Price, Qty, Rate, Total, CreatedAt, UpdatedAt
    FROM Items
    WHERE Id = @Id;
END
GO

-- Fixed UpdateItem procedure (remove Total parameter since it's computed)
CREATE PROCEDURE [dbo].[sp_UpdateItem]
    @Id NVARCHAR(50),
    @Name NVARCHAR(255),
    @Description NVARCHAR(MAX) = NULL,
    @Category NVARCHAR(100) = NULL,
    @Price DECIMAL(18,2) = 0,
    @Qty INT = 0,
    @Rate DECIMAL(18,2) = 0
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        UPDATE Items 
        SET 
            Name = @Name,
            Description = @Description,
            Category = @Category,
            Price = @Price,
            Qty = @Qty,
            Rate = @Rate,
            UpdatedAt = GETDATE()
        WHERE Id = @Id;
        
        SELECT Id, Name, Description, Category, Price, Qty, Rate, Total, CreatedAt, UpdatedAt
        FROM Items
        WHERE Id = @Id;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

CREATE PROCEDURE [dbo].[sp_DeleteItem]
    @Id NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        DELETE FROM Items WHERE Id = @Id;
        
        SELECT 'Item deleted successfully' AS Message;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

CREATE OR ALTER PROCEDURE [dbo].[sp_SearchItems]
    @SearchTerm NVARCHAR(255) = NULL,
    @Category NVARCHAR(100) = NULL,
    @MinPrice DECIMAL(18,2) = NULL,
    @MaxPrice DECIMAL(18,2) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT Id, Name, Description, Category, Price, Qty, Rate, Total, CreatedAt, UpdatedAt
    FROM Items
    WHERE 
        (@SearchTerm IS NULL OR
         Name LIKE '%' + @SearchTerm + '%' OR
         Description LIKE '%' + @SearchTerm + '%' OR
         Category LIKE '%' + @SearchTerm + '%')
        AND (@Category IS NULL OR Category = @Category)
        AND (@MinPrice IS NULL OR Price >= @MinPrice)
        AND (@MaxPrice IS NULL OR Price <= @MaxPrice)
    ORDER BY Name;
END
GO


select * from Items


delete * from Items