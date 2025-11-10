CREATE TABLE BankAccounts (
    Id NVARCHAR(50) PRIMARY KEY,
    BankName NVARCHAR(100) NOT NULL,
    AccountName NVARCHAR(100) NOT NULL,
    AccountNumber NVARCHAR(50) NOT NULL,
    Branch NVARCHAR(100) NULL,
    Notes NVARCHAR(500) NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME NULL
);

-- Indexes for better performance
CREATE INDEX IX_BankAccounts_AccountNumber ON BankAccounts(AccountNumber);
CREATE INDEX IX_BankAccounts_BankName ON BankAccounts(BankName);


-- drop proc UpdateBankAccount
GO

CREATE or alter PROCEDURE [dbo].[sp_CreateBankAccount]
    @BankName NVARCHAR(100),
    @AccountName NVARCHAR(100),
    @AccountNumber NVARCHAR(50),
    @Branch NVARCHAR(100) = NULL,
    @Notes NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Check for duplicate account number
        IF EXISTS (SELECT 1 FROM BankAccounts WHERE AccountNumber = @AccountNumber)
        BEGIN
            THROW 51001, 'Bank account number already exists', 1;
        END
        
        -- Generate Bank Account ID in BNK0000001 format
        DECLARE @NewBankAccountNumber INT;
        DECLARE @GeneratedBankAccountId NVARCHAR(50);
        
        SELECT @NewBankAccountNumber = ISNULL(MAX(CAST(REPLACE(Id, 'BNK', '') AS INT)), 0) + 1
        FROM BankAccounts
        WHERE Id LIKE 'BNK%' AND ISNUMERIC(REPLACE(Id, 'BNK', '')) = 1;
        
        SET @GeneratedBankAccountId = 'BNK' + RIGHT('0000000' + CAST(@NewBankAccountNumber AS NVARCHAR(10)), 7);
        
        -- Insert the bank account
        INSERT INTO BankAccounts (
            Id, BankName, AccountName, AccountNumber, Branch, Notes, CreatedAt
        )
        VALUES (
            @GeneratedBankAccountId, @BankName, @AccountName, @AccountNumber,
            @Branch, @Notes, GETUTCDATE()
        );
        
        -- Return the generated bank account ID
        SELECT @GeneratedBankAccountId AS GeneratedBankAccountId;
        
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

CREATE OR ALTER PROCEDURE [dbo].[sp_GetAllBankAccounts]
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        Id,
        BankName,
        AccountName,
        AccountNumber,
        Branch,
        Notes,
        CreatedAt,
        UpdatedAt
    FROM BankAccounts
    ORDER BY CreatedAt DESC;
END
GO

CREATE OR ALTER PROCEDURE [dbo].[sp_UpdateBankAccount]
    @Id NVARCHAR(50),
    @BankName NVARCHAR(100),
    @AccountName NVARCHAR(100),
    @AccountNumber NVARCHAR(50),
    @Branch NVARCHAR(100) = NULL,
    @Notes NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        -- Check for duplicate account number (excluding current record)
        IF EXISTS (SELECT 1 FROM BankAccounts WHERE AccountNumber = @AccountNumber AND Id != @Id)
        BEGIN
            THROW 51001, 'Bank account number already exists', 1;
        END
        
        UPDATE BankAccounts 
        SET 
            BankName = @BankName,
            AccountName = @AccountName,
            AccountNumber = @AccountNumber,
            Branch = @Branch,
            Notes = @Notes,
            UpdatedAt = GETUTCDATE()
        WHERE Id = @Id;
        
        IF @@ROWCOUNT = 0
        BEGIN
            DECLARE @ErrorMessage NVARCHAR(4000) = 'Bank account with ID ' + @Id + ' not found';
            THROW 51002, @ErrorMessage, 1;
        END
            
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO




CREATE OR ALTER PROCEDURE [dbo].[sp_DeleteBankAccount]
    @Id NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY

        if EXISTS (
            SELECT 1 FROM Invoices where BankAccId = @Id
        )
         THROW 51001, 'Bank account number is already assigned', 1;

        DELETE FROM BankAccounts WHERE Id = @Id;

        IF @@ROWCOUNT = 0
        BEGIN
            DECLARE @ErrorMessage NVARCHAR(4000) = 'Bank account with ID ' + @Id + ' not found';
            THROW 51003, @ErrorMessage, 1;
        END
            
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO





CREATE OR ALTER PROCEDURE [dbo].[sp_SearchBankAccounts]
    @SearchTerm NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        Id,
        BankName,
        AccountName,
        AccountNumber,
        Branch,
        Notes,
        CreatedAt,
        UpdatedAt
    FROM BankAccounts
    WHERE BankName LIKE '%' + @SearchTerm + '%'
       OR AccountName LIKE '%' + @SearchTerm + '%'
       OR AccountNumber LIKE '%' + @SearchTerm + '%'
       OR Branch LIKE '%' + @SearchTerm + '%'
       OR Notes LIKE '%' + @SearchTerm + '%'
    ORDER BY CreatedAt DESC;
END
GO

