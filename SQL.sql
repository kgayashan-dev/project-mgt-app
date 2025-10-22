-- -- CREATE
-- CREATE PROCEDURE AddClient
--     @Id NVARCHAR(50),
--     @Name NVARCHAR(100),
--     @Initials NVARCHAR(10),
--     @Location NVARCHAR(100),
--     @OutstandingRevenue DECIMAL(18,2),
--     @OverdueAmount DECIMAL(18,2),
--     @DraftAmount DECIMAL(18,2),
--     @UnbilledTime NVARCHAR(50),
--     @UnbilledExpenses DECIMAL(18,2),
--     @ContactEmail NVARCHAR(100),
--     @PhoneNumber NVARCHAR(20),
--     @BusinessType NVARCHAR(100),
--     @BillingCycle NVARCHAR(50),
--     @CreatedAt DATETIME,
--     @LastActive DATETIME,
--     @ClientSince NVARCHAR(10)
-- AS
-- BEGIN
--     INSERT INTO Clients VALUES (
--         @Id, @Name, @Initials, @Location, @OutstandingRevenue, @OverdueAmount,
--         @DraftAmount, @UnbilledTime, @UnbilledExpenses, @ContactEmail, @PhoneNumber,
--         @BusinessType, @BillingCycle, @CreatedAt, @LastActive, @ClientSince
--     );
-- END
-- GO

-- -- READ ALL
-- CREATE PROCEDURE GetAllClients
-- AS
-- BEGIN
--     SELECT * FROM Clients
-- END
-- GO

-- -- READ BY ID
-- CREATE PROCEDURE GetClientById
--     @Id NVARCHAR(50)
-- AS
-- BEGIN
--     SELECT * FROM Clients WHERE Id = @Id
-- END
-- GO

-- -- UPDATE
-- CREATE PROCEDURE UpdateClient
--     @Id NVARCHAR(50),
--     @Name NVARCHAR(100),
--     @Initials NVARCHAR(10),
--     @Location NVARCHAR(100),
--     @OutstandingRevenue DECIMAL(18,2),
--     @OverdueAmount DECIMAL(18,2),
--     @DraftAmount DECIMAL(18,2),
--     @UnbilledTime NVARCHAR(50),
--     @UnbilledExpenses DECIMAL(18,2),
--     @ContactEmail NVARCHAR(100),
--     @PhoneNumber NVARCHAR(20),
--     @BusinessType NVARCHAR(100),
--     @BillingCycle NVARCHAR(50),
--     @CreatedAt DATETIME,
--     @LastActive DATETIME,
--     @ClientSince NVARCHAR(10)
-- AS
-- BEGIN
--     UPDATE Clients SET
--         Name = @Name,
--         Initials = @Initials,
--         Location = @Location,
--         OutstandingRevenue = @OutstandingRevenue,
--         OverdueAmount = @OverdueAmount,
--         DraftAmount = @DraftAmount,
--         UnbilledTime = @UnbilledTime,
--         UnbilledExpenses = @UnbilledExpenses,
--         ContactEmail = @ContactEmail,
--         PhoneNumber = @PhoneNumber,
--         BusinessType = @BusinessType,
--         BillingCycle = @BillingCycle,
--         CreatedAt = @CreatedAt,
--         LastActive = @LastActive,
--         ClientSince = @ClientSince
--     WHERE Id = @Id
-- END
-- GO

-- -- DELETE
-- CREATE PROCEDURE DeleteClient
--     @Id NVARCHAR(50)
-- AS
-- BEGIN
--     DELETE FROM Clients WHERE Id = @Id
-- END
-- GO

-- -- items

-- CREATE ITEM
CREATE PROCEDURE AddItem
    @Id NVARCHAR(50),
    @Name NVARCHAR(100),
    @Description NVARCHAR(200),
    @Category NVARCHAR(50),
    @Price DECIMAL(18, 2),
    @Qty INT,
    @Rate DECIMAL(18, 2),
    @Total DECIMAL(18, 2)
AS
BEGIN
    INSERT INTO Items (Id, Name, Description, Category, Price, Qty, Rate, Total)
    VALUES (@Id, @Name, @Description, @Category, @Price, @Qty, @Rate, @Total);
END
GO

-- GET ALL ITEMS
CREATE PROCEDURE GetAllItems
AS
BEGIN
    SELECT * FROM Items;
END
GO

-- GET ITEM BY ID
CREATE PROCEDURE GetItemById
    @Id NVARCHAR(50)
AS
BEGIN
    SELECT * FROM Items WHERE Id = @Id;
END
GO

-- UPDATE ITEM
CREATE PROCEDURE UpdateItem
    @Id NVARCHAR(50),
    @Name NVARCHAR(100),
    @Description NVARCHAR(200),
    @Category NVARCHAR(50),
    @Price DECIMAL(18, 2),
    @Qty INT,
    @Rate DECIMAL(18, 2),
    @Total DECIMAL(18, 2)
AS
BEGIN
    UPDATE Items SET
        Name = @Name,
        Description = @Description,
        Category = @Category,
        Price = @Price,
        Qty = @Qty,
        Rate = @Rate,
        Total = @Total
    WHERE Id = @Id;
END
GO

-- DELETE ITEM
CREATE PROCEDURE DeleteItem
    @Id NVARCHAR(50)
AS
BEGIN
    DELETE FROM Items WHERE Id = @Id;
END
GO


-- Quotation

CREATE TABLE Quotations (
    Id NVARCHAR(50) PRIMARY KEY,
    QuotationNumber NVARCHAR(50),
    QuotationDate DATE,
    ClientName NVARCHAR(255),
    EmailAddress NVARCHAR(255),
    DiscountPercentage INT,
    DiscountAmount DECIMAL(18, 2),
    Subtotal DECIMAL(18, 2),
    TotalTax DECIMAL(18, 2),
    GrandTotal DECIMAL(18, 2),
    Notes NVARCHAR(MAX)
);

CREATE TABLE QuotationItems (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    QuotationId NVARCHAR(50) FOREIGN KEY REFERENCES Quotations(Id),
    Description NVARCHAR(255),
    Unit NVARCHAR(50),
    Qty INT,
    Rate DECIMAL(18, 2),
    Total DECIMAL(18, 2)
);

-- add q
CREATE PROCEDURE AddQuotation
    @Id NVARCHAR(50),
    @QuotationNumber NVARCHAR(50),
    @QuotationDate DATE,
    @ClientName NVARCHAR(255),
    @EmailAddress NVARCHAR(255),
    @DiscountPercentage INT,
    @DiscountAmount DECIMAL(18,2),
    @Subtotal DECIMAL(18,2),
    @TotalTax DECIMAL(18,2),
    @GrandTotal DECIMAL(18,2),
    @Notes NVARCHAR(MAX)
AS
BEGIN
    INSERT INTO Quotations (
        Id, QuotationNumber, QuotationDate, ClientName, EmailAddress,
        DiscountPercentage, DiscountAmount, Subtotal, TotalTax, GrandTotal, Notes
    )
    VALUES (
        @Id, @QuotationNumber, @QuotationDate, @ClientName, @EmailAddress,
        @DiscountPercentage, @DiscountAmount, @Subtotal, @TotalTax, @GrandTotal, @Notes
    );
END;


-- quot item

CREATE PROCEDURE AddQuotationItem
    @QuotationId NVARCHAR(50),
    @Description NVARCHAR(255),
    @Unit NVARCHAR(50),
    @Qty INT,
    @Rate DECIMAL(18,2),
    @Total DECIMAL(18,2)
AS
BEGIN
    INSERT INTO QuotationItems (
        QuotationId, Description, Unit, Qty, Rate, Total
    )
    VALUES (
        @QuotationId, @Description, @Unit, @Qty, @Rate, @Total
    );
END;


-- get quot

CREATE PROCEDURE GetQuotationById
    @Id NVARCHAR(50)
AS
BEGIN
    SELECT * FROM Quotations WHERE Id = @Id;
    SELECT * FROM QuotationItems WHERE QuotationId = @Id;
END;

-- update

CREATE PROCEDURE UpdateQuotation
    @Id NVARCHAR(50),
    @QuotationNumber NVARCHAR(50),
    @QuotationDate DATE,
    @ClientName NVARCHAR(255),
    @EmailAddress NVARCHAR(255),
    @DiscountPercentage INT,
    @DiscountAmount DECIMAL(18,2),
    @Subtotal DECIMAL(18,2),
    @TotalTax DECIMAL(18,2),
    @GrandTotal DECIMAL(18,2),
    @Notes NVARCHAR(MAX)
AS
BEGIN
    UPDATE Quotations
    SET
        QuotationNumber = @QuotationNumber,
        QuotationDate = @QuotationDate,
        ClientName = @ClientName,
        EmailAddress = @EmailAddress,
        DiscountPercentage = @DiscountPercentage,
        DiscountAmount = @DiscountAmount,
        Subtotal = @Subtotal,
        TotalTax = @TotalTax,
        GrandTotal = @GrandTotal,
        Notes = @Notes
    WHERE Id = @Id;

    DELETE FROM QuotationItems WHERE QuotationId = @Id;
END;


-- delete quot

CREATE PROCEDURE DeleteQuotation
    @Id NVARCHAR(50)
AS
BEGIN
    BEGIN TRY
        BEGIN TRANSACTION;

        DELETE FROM QuotationItems WHERE QuotationId = @Id;
        DELETE FROM Quotations WHERE Id = @Id;

        COMMIT;
    END TRY
    BEGIN CATCH
        ROLLBACK;
        THROW;
    END CATCH
END;


-------22323232323924982u34982439823894


-- Bank accounts

CREATE TABLE BankAccounts (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    ClientId NVARCHAR(50), -- optional: associate with a client
    BankName NVARCHAR(100),
    AccountName NVARCHAR(100),
    AccountNumber NVARCHAR(50),
    Branch NVARCHAR(100),
    SwiftCode NVARCHAR(50),
    Currency NVARCHAR(10),
    Notes NVARCHAR(MAX)
);


--add

CREATE PROCEDURE AddBankAccount
    @Id UNIQUEIDENTIFIER,
    @ClientId NVARCHAR(50),
    @BankName NVARCHAR(100),
    @AccountName NVARCHAR(100),
    @AccountNumber NVARCHAR(50),
    @Branch NVARCHAR(100),
    @SwiftCode NVARCHAR(50),
    @Currency NVARCHAR(10),
    @Notes NVARCHAR(MAX)
AS
BEGIN
    INSERT INTO BankAccounts (
        Id, ClientId, BankName, AccountName, AccountNumber,
        Branch, SwiftCode, Currency, Notes
    )
    VALUES (
        @Id, @ClientId, @BankName, @AccountName, @AccountNumber,
        @Branch, @SwiftCode, @Currency, @Notes
    );
END;


-- get bnk

CREATE PROCEDURE GetBankAccountsByClient
    @ClientId NVARCHAR(50)
AS
BEGIN
    SELECT * FROM BankAccounts WHERE ClientId = @ClientId;
END;


-- update bank

CREATE PROCEDURE UpdateBankAccount
    @Id UNIQUEIDENTIFIER,
    @BankName NVARCHAR(100),
    @AccountName NVARCHAR(100),
    @AccountNumber NVARCHAR(50),
    @Branch NVARCHAR(100),
    @SwiftCode NVARCHAR(50),
    @Currency NVARCHAR(10),
    @Notes NVARCHAR(MAX)
AS
BEGIN
    UPDATE BankAccounts
    SET
        BankName = @BankName,
        AccountName = @AccountName,
        AccountNumber = @AccountNumber,
        Branch = @Branch,
        SwiftCode = @SwiftCode,
        Currency = @Currency,
        Notes = @Notes
    WHERE Id = @Id;
END;


-- delete
CREATE PROCEDURE DeleteBankAccount
    @Id UNIQUEIDENTIFIER
AS
BEGIN
    DELETE FROM BankAccounts WHERE Id = @Id;
END;



-- Invoice 

CREATE TABLE Invoices (
    Id INT IDENTITY PRIMARY KEY,
    InvoiceNo NVARCHAR(50),
    PoNo NVARCHAR(50),
    InvoiceDate DATE,
    QuotationNo NVARCHAR(50),
    Remarks NVARCHAR(MAX),
    ClientName NVARCHAR(100),
    Address NVARCHAR(200),
    Phone NVARCHAR(20),
    Email NVARCHAR(100),
    Subtotal DECIMAL(18, 2),
    Tax DECIMAL(18, 2),
    InvoiceTotal DECIMAL(18, 2)
);

CREATE TABLE InvoiceItems (
    Id INT IDENTITY PRIMARY KEY,
    InvoiceId INT FOREIGN KEY REFERENCES Invoices(Id) ON DELETE CASCADE,
    Description NVARCHAR(200),
    Unit NVARCHAR(20),
    Qty INT,
    Rate DECIMAL(18, 2),
    Total AS Qty * Rate PERSISTED
);
CREATE PROCEDURE InsertInvoice
    @InvoiceNo NVARCHAR(50),
    @PoNo NVARCHAR(50),
    @InvoiceDate DATE,
    @QuotationNo NVARCHAR(50),
    @Remarks NVARCHAR(MAX),
    @ClientName NVARCHAR(100),
    @Address NVARCHAR(200),
    @Phone NVARCHAR(20),
    @Email NVARCHAR(100),
    @Subtotal DECIMAL(18, 2),
    @Tax DECIMAL(18, 2),
    @InvoiceTotal DECIMAL(18, 2),
    @InvoiceId INT OUTPUT
AS

CREATE PROCEDURE sp_AddInvoice
    @InvoiceNo NVARCHAR(50),
    @PONumber NVARCHAR(50),
    @InvoiceDate DATE,
    @QuotationNo NVARCHAR(50),
    @Remarks NVARCHAR(MAX),
    @SubTotal DECIMAL(18,2),
    @Tax DECIMAL(18,2),
    @Total DECIMAL(18,2),
    @Items InvoiceItemType READONLY -- TVP (Table-Valued Parameter)
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO Invoices (InvoiceNo, PONumber, InvoiceDate, QuotationNo, Remarks, SubTotal, Tax, Total)
    VALUES (@InvoiceNo, @PONumber, @InvoiceDate, @QuotationNo, @Remarks, @SubTotal, @Tax, @Total);

    DECLARE @InvoiceId INT = SCOPE_IDENTITY();

    INSERT INTO InvoiceItems (InvoiceId, Description, Unit, Qty, Rate, Total)
    SELECT @InvoiceId, Description, Unit, Qty, Rate, Total FROM @Items;
END






-- invoice payment type sps

CREATE TABLE InvoicePayments (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    InvoiceId INT NOT NULL,
    PaymentDate DATE NOT NULL,
    PaymentMethod NVARCHAR(100),
    Notes NVARCHAR(MAX),
    Amount DECIMAL(18, 2),
    FOREIGN KEY (InvoiceId) REFERENCES Invoices(Id)
);
CREATE PROCEDURE AddInvoicePayment
    @InvoiceId INT,
    @PaymentDate DATE,
    @PaymentMethod NVARCHAR(100),
    @Notes NVARCHAR(MAX),
    @Amount DECIMAL(18, 2)
AS
BEGIN
    INSERT INTO InvoicePayments (InvoiceId, PaymentDate, PaymentMethod, Notes, Amount)
    VALUES (@InvoiceId, @PaymentDate, @PaymentMethod, @Notes, @Amount)
END
CREATE PROCEDURE GetPaymentsByInvoiceId
    @InvoiceId INT
AS

BEGIN
    SELECT * FROM InvoicePayments WHERE InvoiceId = @InvoiceId
END


CREATE PROCEDURE GetPaymentsByInvoiceId
    @InvoiceId INT
AS
BEGIN
    SELECT * FROM InvoicePayments WHERE InvoiceId = @InvoiceId
END


CREATE PROCEDURE UpdateInvoicePayment
    @Id INT,
    @PaymentDate DATE,
    @PaymentMethod NVARCHAR(100),
    @Notes NVARCHAR(MAX),
    @Amount DECIMAL(18, 2)
AS
BEGIN
    UPDATE InvoicePayments
    SET PaymentDate = @PaymentDate,
        PaymentMethod = @PaymentMethod,
        Notes = @Notes,
        Amount = @Amount
    WHERE Id = @Id
END



CREATE PROCEDURE DeleteInvoicePayment
    @Id INT
AS
BEGIN
    DELETE FROM InvoicePayments WHERE Id = @Id
END



CREATE PROCEDURE GetAllInvoices
AS
BEGIN
    SELECT * FROM Invoices
END


-- all payemtns 

CREATE TABLE InvoicePayments (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    InvoiceId INT NOT NULL,
    ClientName NVARCHAR(200) NOT NULL,
    PaymentDate DATE NOT NULL,
    PaymentType NVARCHAR(100), -- e.g. Type of payment (Cash, Transfer, etc.)
    Notes NVARCHAR(MAX),       -- Internal notes
    Amount DECIMAL(18,2) NOT NULL,
    Status NVARCHAR(50),       -- e.g. Pending, Completed, Failed
    FOREIGN KEY (InvoiceId) REFERENCES Invoices(Id)
);

-- Add Payment
CREATE PROCEDURE AddInvoicePayment
    @InvoiceId INT,
    @ClientName NVARCHAR(200),
    @PaymentDate DATE,
    @PaymentType NVARCHAR(100),
    @Notes NVARCHAR(MAX),
    @Amount DECIMAL(18, 2),
    @Status NVARCHAR(50)
AS
BEGIN
    INSERT INTO InvoicePayments (InvoiceId, ClientName, PaymentDate, PaymentType, Notes, Amount, Status)
    VALUES (@InvoiceId, @ClientName, @PaymentDate, @PaymentType, @Notes, @Amount, @Status)
END

-- Get All Payments (optionally by InvoiceId)
CREATE PROCEDURE GetInvoicePayments
    @InvoiceId INT = NULL
AS
BEGIN
    IF @InvoiceId IS NULL
    BEGIN
        SELECT * FROM InvoicePayments
    END
    ELSE
    BEGIN
        SELECT * FROM InvoicePayments WHERE InvoiceId = @InvoiceId
    END
END

-- Update Payment
CREATE PROCEDURE UpdateInvoicePayment
    @Id INT,
    @InvoiceId INT,
    @ClientName NVARCHAR(200),
    @PaymentDate DATE,
    @PaymentType NVARCHAR(100),
    @Notes NVARCHAR(MAX),
    @Amount DECIMAL(18, 2),
    @Status NVARCHAR(50)
AS
BEGIN
    UPDATE InvoicePayments
    SET InvoiceId = @InvoiceId,
        ClientName = @ClientName,
        PaymentDate = @PaymentDate,
        PaymentType = @PaymentType,
        Notes = @Notes,
        Amount = @Amount,
        Status = @Status
    WHERE Id = @Id
END

-- Delete Payment
CREATE PROCEDURE DeleteInvoicePayment
    @Id INT
AS
BEGIN
    DELETE FROM InvoicePayments WHERE Id = @Id
END

-- merchant 

CREATE TABLE Merchants (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(255) NOT NULL,
    Address NVARCHAR(MAX),
    ContactPerson NVARCHAR(100),
    Phone NVARCHAR(50),
    Email NVARCHAR(100),
    Status NVARCHAR(50)
);


CREATE PROCEDURE AddMerchant
    @Name NVARCHAR(255),
    @Address NVARCHAR(MAX),
    @ContactPerson NVARCHAR(100),
    @Phone NVARCHAR(50),
    @Email NVARCHAR(100),
    @Status NVARCHAR(50)
AS
BEGIN
    INSERT INTO Merchants (Name, Address, ContactPerson, Phone, Email, Status)
    VALUES (@Name, @Address, @ContactPerson, @Phone, @Email, @Status)
END

CREATE PROCEDURE GetMerchants
AS
BEGIN
    SELECT * FROM Merchants
END


CREATE PROCEDURE UpdateMerchant
    @Id INT,
    @Name NVARCHAR(255),
    @Address NVARCHAR(MAX),
    @ContactPerson NVARCHAR(100),
    @Phone NVARCHAR(50),
    @Email NVARCHAR(100),
    @Status NVARCHAR(50)
AS
BEGIN
    UPDATE Merchants
    SET Name = @Name,
        Address = @Address,
        ContactPerson = @ContactPerson,
        Phone = @Phone,
        Email = @Email,
        Status = @Status
    WHERE Id = @Id
END


CREATE PROCEDURE DeleteMerchant
    @Id INT
AS
BEGIN
    DELETE FROM Merchants WHERE Id = @Id
END


-- expense 

CREATE TABLE Expenses (
    Id INT PRIMARY KEY IDENTITY,
    Category NVARCHAR(100),
    Date DATE,
    SubTotal DECIMAL(18, 2),
    GrandTotal DECIMAL(18, 2)
);


CREATE TABLE ExpenseTaxes (
    Id INT PRIMARY KEY IDENTITY,
    ExpenseId INT FOREIGN KEY REFERENCES Expenses(Id) ON DELETE CASCADE,
    TaxName NVARCHAR(100),
    TaxAmount DECIMAL(18, 2)
);

CREATE PROCEDURE AddExpenseWithTaxes
    @Category NVARCHAR(100),
    @Date DATE,
    @SubTotal DECIMAL(18, 2),
    @GrandTotal DECIMAL(18, 2),
    @Taxes ExpenseTaxType READONLY -- TVP
AS
BEGIN
    INSERT INTO Expenses (Category, Date, SubTotal, GrandTotal)
    VALUES (@Category, @Date, @SubTotal, @GrandTotal);

    DECLARE @NewId INT = SCOPE_IDENTITY();

    INSERT INTO ExpenseTaxes (ExpenseId, TaxName, TaxAmount)
    SELECT @NewId, TaxName, TaxAmount FROM @Taxes;
END


CREATE TYPE ExpenseTaxType AS TABLE
(
    TaxName NVARCHAR(100),
    TaxAmount DECIMAL(18, 2)
);


CREATE PROCEDURE GetAllExpensesWithTaxes
AS
BEGIN
    SELECT * FROM Expenses;

    SELECT * FROM ExpenseTaxes;
END



CREATE PROCEDURE UpdateExpenseWithTaxes
    @Id INT,
    @Category NVARCHAR(100),
    @Date DATE,
    @SubTotal DECIMAL(18, 2),
    @GrandTotal DECIMAL(18, 2),
    @Taxes ExpenseTaxType READONLY
AS
BEGIN
    -- Update expense main info
    UPDATE Expenses
    SET Category = @Category,
        Date = @Date,
        SubTotal = @SubTotal,
        GrandTotal = @GrandTotal
    WHERE Id = @Id;

    -- Delete old taxes
    DELETE FROM ExpenseTaxes WHERE ExpenseId = @Id;

    -- Insert updated taxes
    INSERT INTO ExpenseTaxes (ExpenseId, TaxName, TaxAmount)
    SELECT @Id, TaxName, TaxAmount FROM @Taxes;
END


CREATE PROCEDURE DeleteExpense
    @Id INT
AS
BEGIN
    DELETE FROM Expenses WHERE Id = @Id;
    -- ExpenseTaxes will be auto-deleted due to ON DELETE CASCADE
END



-- vendor details


CREATE TABLE Vendors (
    Id NVARCHAR(20) PRIMARY KEY,
    CompanyName NVARCHAR(200),
    FirstName NVARCHAR(100),
    LastName NVARCHAR(100),
    AccountNumber NVARCHAR(50),
    EmailAddress NVARCHAR(200),
    Website NVARCHAR(200),
    PhoneNumber NVARCHAR(50),
    TotalOutstanding DECIMAL(18,2)
);

CREATE TABLE VendorTables (
    Id INT PRIMARY KEY IDENTITY(1,1),
    VendorId NVARCHAR(20) NOT NULL,
    Description NVARCHAR(200),
    Amount DECIMAL(18, 2),
    Status NVARCHAR(50),
    IssueDate DATE,
    FOREIGN KEY (VendorId) REFERENCES Vendors(Id) ON DELETE CASCADE
);


-- sub table

CREATE PROCEDURE AddVendor
    @Id NVARCHAR(20),
    @CompanyName NVARCHAR(200),
    @FirstName NVARCHAR(100),
    @LastName NVARCHAR(100),
    @AccountNumber NVARCHAR(50),
    @EmailAddress NVARCHAR(200),
    @Website NVARCHAR(200),
    @PhoneNumber NVARCHAR(50),
    @TotalOutstanding DECIMAL(18, 2),
    @Table VendorTableType READONLY
AS
BEGIN
    INSERT INTO Vendors (Id, CompanyName, FirstName, LastName, AccountNumber, EmailAddress, Website, PhoneNumber, TotalOutstanding)
    VALUES (@Id, @CompanyName, @FirstName, @LastName, @AccountNumber, @EmailAddress, @Website, @PhoneNumber, @TotalOutstanding);

    INSERT INTO VendorTables (VendorId, Description, Amount, Status, IssueDate)
    SELECT @Id, Description, Amount, Status, IssueDate FROM @Table;
END


CREATE PROCEDURE UpdateVendor
    @Id NVARCHAR(20),
    @CompanyName NVARCHAR(200),
    @FirstName NVARCHAR(100),
    @LastName NVARCHAR(100),
    @AccountNumber NVARCHAR(50),
    @EmailAddress NVARCHAR(200),
    @Website NVARCHAR(200),
    @PhoneNumber NVARCHAR(50),
    @TotalOutstanding DECIMAL(18, 2),
    @Table VendorTableType READONLY
AS
BEGIN
    UPDATE Vendors
    SET CompanyName = @CompanyName,
        FirstName = @FirstName,
        LastName = @LastName,
        AccountNumber = @AccountNumber,
        EmailAddress = @EmailAddress,
        Website = @Website,
        PhoneNumber = @PhoneNumber,
        TotalOutstanding = @TotalOutstanding
    WHERE Id = @Id;

    DELETE FROM VendorTables WHERE VendorId = @Id;

    INSERT INTO VendorTables (VendorId, Description, Amount, Status, IssueDate)
    SELECT @Id, Description, Amount, Status, IssueDate FROM @Table;
END


CREATE PROCEDURE DeleteVendor
    @Id NVARCHAR(20)
AS
BEGIN
    DELETE FROM Vendors WHERE Id = @Id;
END


--  bill 

CREATE TABLE Bills (
    Id NVARCHAR(20) PRIMARY KEY,
    CompanyName NVARCHAR(200),
    VendorName NVARCHAR(100),
    BillNumber NVARCHAR(50),
    IssueDate DATE,
    DueDate DATE,
    Vendor NVARCHAR(200),
    EmailAddress NVARCHAR(200),
    PhoneNumber NVARCHAR(50),
    TotalOutstanding DECIMAL(18, 2),
    SubTotal DECIMAL(18, 2),
    Tax DECIMAL(18, 2),
    GrandTotal DECIMAL(18, 2),
    AmountDue DECIMAL(18, 2),
    ClientAddress NVARCHAR(300),
    TotalTax DECIMAL(18, 2)
);

CREATE TABLE BillItems (
    Id INT PRIMARY KEY IDENTITY(1,1),
    BillId NVARCHAR(20) NOT NULL,
    Description NVARCHAR(300),
    Category NVARCHAR(100),
    Rate DECIMAL(18, 2),
    Qty INT,
    Total DECIMAL(18, 2),
    FOREIGN KEY (BillId) REFERENCES Bills(Id) ON DELETE CASCADE
);


CREATE TYPE BillItemType AS TABLE
(
    Description NVARCHAR(300),
    Category NVARCHAR(100),
    Rate DECIMAL(18, 2),
    Qty INT,
    Total DECIMAL(18, 2)
);


CREATE PROCEDURE AddBill
    @Id NVARCHAR(20),
    @CompanyName NVARCHAR(200),
    @VendorName NVARCHAR(100),
    @BillNumber NVARCHAR(50),
    @IssueDate DATE,
    @DueDate DATE,
    @Vendor NVARCHAR(200),
    @EmailAddress NVARCHAR(200),
    @PhoneNumber NVARCHAR(50),
    @TotalOutstanding DECIMAL(18, 2),
    @SubTotal DECIMAL(18, 2),
    @Tax DECIMAL(18, 2),
    @GrandTotal DECIMAL(18, 2),
    @AmountDue DECIMAL(18, 2),
    @ClientAddress NVARCHAR(300),
    @TotalTax DECIMAL(18, 2),
    @Table BillItemType READONLY
AS
BEGIN
    INSERT INTO Bills (Id, CompanyName, VendorName, BillNumber, IssueDate, DueDate, Vendor, EmailAddress, PhoneNumber,
                       TotalOutstanding, SubTotal, Tax, GrandTotal, AmountDue, ClientAddress, TotalTax)
    VALUES (@Id, @CompanyName, @VendorName, @BillNumber, @IssueDate, @DueDate, @Vendor, @EmailAddress, @PhoneNumber,
            @TotalOutstanding, @SubTotal, @Tax, @GrandTotal, @AmountDue, @ClientAddress, @TotalTax);

    INSERT INTO BillItems (BillId, Description, Category, Rate, Qty, Total)
    SELECT @Id, Description, Category, Rate, Qty, Total FROM @Table;
END



CREATE PROCEDURE GetAllBills
AS
BEGIN
    SELECT * FROM Bills;
    SELECT * FROM BillItems;
END


CREATE PROCEDURE UpdateBill
    @Id NVARCHAR(20),
    @CompanyName NVARCHAR(200),
    @VendorName NVARCHAR(100),
    @BillNumber NVARCHAR(50),
    @IssueDate DATE,
    @DueDate DATE,
    @Vendor NVARCHAR(200),
    @EmailAddress NVARCHAR(200),
    @PhoneNumber NVARCHAR(50),
    @TotalOutstanding DECIMAL(18, 2),
    @SubTotal DECIMAL(18, 2),
    @Tax DECIMAL(18, 2),
    @GrandTotal DECIMAL(18, 2),
    @AmountDue DECIMAL(18, 2),
    @ClientAddress NVARCHAR(300),
    @TotalTax DECIMAL(18, 2),
    @Table BillItemType READONLY
AS
BEGIN
    UPDATE Bills
    SET CompanyName = @CompanyName,
        VendorName = @VendorName,
        BillNumber = @BillNumber,
        IssueDate = @IssueDate,
        DueDate = @DueDate,
        Vendor = @Vendor,
        EmailAddress = @EmailAddress,
        PhoneNumber = @PhoneNumber,
        TotalOutstanding = @TotalOutstanding,
        SubTotal = @SubTotal,
        Tax = @Tax,
        GrandTotal = @GrandTotal,
        AmountDue = @AmountDue,
        ClientAddress = @ClientAddress,
        TotalTax = @TotalTax
    WHERE Id = @Id;

    DELETE FROM BillItems WHERE BillId = @Id;

    INSERT INTO BillItems (BillId, Description, Category, Rate, Qty, Total)
    SELECT @Id, Description, Category, Rate, Qty, Total FROM @Table;
END


CREATE PROCEDURE DeleteBill
    @Id NVARCHAR(20)
AS
BEGIN
    DELETE FROM Bills WHERE Id = @Id;
END



CREATE PROCEDURE GetBillById
    @Id NVARCHAR(50)
AS
BEGIN
    SELECT * FROM Bills WHERE Id = @Id;

    SELECT * FROM BillItems WHERE BillId = @Id;
END


-- project


CREATE TABLE Projects (
    Id NVARCHAR(50) PRIMARY KEY,
    ProjectName NVARCHAR(255),
    ClientId NVARCHAR(50),
    ClientName NVARCHAR(255),
    Description NVARCHAR(MAX),
    StartDate DATE,
    EndDate DATE,
    FlatRate DECIMAL(18,2),
    TotalHours INT,
    Status NVARCHAR(50)
);

CREATE TABLE ProjectTeamMembers (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ProjectId NVARCHAR(50),
    TeamMemberId NVARCHAR(50),
    FOREIGN KEY (ProjectId) REFERENCES Projects(Id)
);

CREATE TABLE ProjectServices (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ProjectId NVARCHAR(50),
    Description NVARCHAR(MAX),
    Hours INT,
    Rate DECIMAL(18,2),
    FOREIGN KEY (ProjectId) REFERENCES Projects(Id)
);


-- Add Project
CREATE PROCEDURE AddProject
    @Id NVARCHAR(50),
    @ProjectName NVARCHAR(255),
    @ClientId NVARCHAR(50),
    @ClientName NVARCHAR(255),
    @Description NVARCHAR(MAX),
    @StartDate DATE,
    @EndDate DATE,
    @FlatRate DECIMAL(18,2),
    @TotalHours INT,
    @Status NVARCHAR(50)
AS
BEGIN
    INSERT INTO Projects VALUES (@Id, @ProjectName, @ClientId, @ClientName, @Description, @StartDate, @EndDate, @FlatRate, @TotalHours, @Status)
END

-- Add Team Member
CREATE PROCEDURE AddProjectTeamMember
    @ProjectId NVARCHAR(50),
    @TeamMemberId NVARCHAR(50)
AS
BEGIN
    INSERT INTO ProjectTeamMembers (ProjectId, TeamMemberId) VALUES (@ProjectId, @TeamMemberId)
END

-- Add Service
CREATE PROCEDURE AddProjectService
    @ProjectId NVARCHAR(50),
    @Description NVARCHAR(MAX),
    @Hours INT,
    @Rate DECIMAL(18,2)
AS
BEGIN
    INSERT INTO ProjectServices (ProjectId, Description, Hours, Rate) VALUES (@ProjectId, @Description, @Hours, @Rate)
END

-- Get All Projects
CREATE PROCEDURE GetAllProjects
AS
BEGIN
    SELECT * FROM Projects
END

-- Get Project By Id
CREATE PROCEDURE GetProjectById
    @Id NVARCHAR(50)
AS
BEGIN
    SELECT * FROM Projects WHERE Id = @Id;
    SELECT TeamMemberId FROM ProjectTeamMembers WHERE ProjectId = @Id;
    SELECT * FROM ProjectServices WHERE ProjectId = @Id;
END

-- Update Project
CREATE PROCEDURE UpdateProject
    @Id NVARCHAR(50),
    @ProjectName NVARCHAR(255),
    @ClientId NVARCHAR(50),
    @ClientName NVARCHAR(255),
    @Description NVARCHAR(MAX),
    @StartDate DATE,
    @EndDate DATE,
    @FlatRate DECIMAL(18,2),
    @TotalHours INT,
    @Status NVARCHAR(50)
AS
BEGIN
    UPDATE Projects
    SET ProjectName = @ProjectName,
        ClientId = @ClientId,
        ClientName = @ClientName,
        Description = @Description,
        StartDate = @StartDate,
        EndDate = @EndDate,
        FlatRate = @FlatRate,
        TotalHours = @TotalHours,
        Status = @Status
    WHERE Id = @Id
END

-- Delete Project
CREATE PROCEDURE DeleteProject
    @Id NVARCHAR(50)
AS
BEGIN
    DELETE FROM ProjectServices WHERE ProjectId = @Id;
    DELETE FROM ProjectTeamMembers WHERE ProjectId = @Id;
    DELETE FROM Projects WHERE Id = @Id;
END





-- invoice table insert
