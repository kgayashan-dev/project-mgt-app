-- ALTER TABLE Invoices 
-- ADD DiscountPercentage DECIMAL(18,2) NULL,
--     DiscountAmount DECIMAL(18,2) NULL;

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[sp_AddInvoice]
    @Id NVARCHAR(50) = NULL,
    @InvoiceNo NVARCHAR(50),
    @BankAccId NVARCHAR(50),
    @companyId NVARCHAR(50),
    @DiscountPercentage DECIMAL(18,2) = 0,
    @DiscountAmount DECIMAL(18,2) = 0, -- Will be recalculated in backend
    @PoNo NVARCHAR(50) = NULL,
    @InvoiceDate DATETIME,
    @QuotationID NVARCHAR(50) = NULL,
    @Remarks NVARCHAR(500) = NULL,
    @ClientID NVARCHAR(50),
    @Subtotal DECIMAL(18,2) = 0, -- Will be recalculated in backend
    @Tax DECIMAL(18,2) = 0, -- Will be recalculated in backend
    @InvoiceTotal DECIMAL(18,2) = 0, -- Will be recalculated in backend
    @Items InvoiceItemDetailsType READONLY
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION

        IF NOT EXISTS(SELECT 1 FROM Clients WHERE id=@ClientID) 
            THROW 50001, 'Client ID does not exists.',1;
        IF NOT EXISTS(SELECT 1 FROM Quotations WHERE id=@QuotationID) 
            THROW 50002, 'Quotation does not exists.',1;
        IF NOT EXISTS(SELECT 1 FROM BankAccounts WHERE id=@BankAccId) 
            THROW 50003, 'Bank acc does not exists.',1;

        DECLARE @NewId NVARCHAR(50);
        
        -- Use provided ID or generate new one
        IF @Id IS NULL OR @Id = ''
        BEGIN
            SELECT @NewId = 'INV' + RIGHT('0000000' + CAST(ISNULL(MAX(CAST(SUBSTRING(Id, 4, LEN(Id)) AS INT)), 0) + 1 AS NVARCHAR(6)), 7)
            FROM Invoices;
        END
        ELSE
        BEGIN
            SET @NewId = @Id;
        END

        -- Validate that invoice number doesn't already exist
        IF EXISTS (SELECT 1 FROM Invoices WHERE InvoiceNo = @InvoiceNo)
        BEGIN
            RAISERROR('Invoice number already exists', 16, 1);
            RETURN;
        END
        
        -- BACKEND CALCULATIONS (Override frontend values)
        DECLARE @CalculatedSubtotal DECIMAL(18,2) = 0;
        DECLARE @CalculatedDiscountAmount DECIMAL(18,2) = 0;
        DECLARE @CalculatedTax DECIMAL(18,2) = 0;
        DECLARE @CalculatedInvoiceTotal DECIMAL(18,2) = 0;

        -- Calculate subtotal from items (sum of quantity * rate)
        SELECT @CalculatedSubtotal = SUM(Qty * Rate) FROM @Items;

        -- Calculate discount amount based on percentage
        SET @CalculatedDiscountAmount = (@CalculatedSubtotal * @DiscountPercentage) / 100;

        -- Calculate tax (using the tax percentage sent from frontend)
        DECLARE @TaxableAmount DECIMAL(18,2) = @CalculatedSubtotal - @CalculatedDiscountAmount;
        DECLARE @TaxPercentage DECIMAL(18,2) = @Tax; -- Use the tax percentage from parameter
        SET @CalculatedTax = (@TaxableAmount * @TaxPercentage) / 100;

        -- Calculate final invoice total
        SET @CalculatedInvoiceTotal = @CalculatedSubtotal - @CalculatedDiscountAmount + @CalculatedTax;

        -- Insert main invoice record with BACKEND-CALCULATED values
        INSERT INTO [dbo].[Invoices]
        (
            Id, InvoiceNo, BankAccId, companyId, DiscountPercentage, DiscountAmount, 
            PoNo, InvoiceDate, QuotationID, Remarks, ClientID, 
            Subtotal, Tax, InvoiceTotal
        )
        VALUES
        (
            @NewId, @InvoiceNo, @BankAccId, @companyId, 
            @DiscountPercentage, @CalculatedDiscountAmount, -- Use calculated discount
            @PoNo, @InvoiceDate, @QuotationID, @Remarks, @ClientID, 
            @CalculatedSubtotal, @CalculatedTax, @CalculatedInvoiceTotal -- Use calculated values
        );

        -- Insert invoice items WITHOUT Total column (let it be NULL)
        INSERT INTO InvoiceItems (InvoiceId, Description, Unit, Qty, Rate)
        SELECT 
            @NewId, 
            Description, 
            Unit, 
            Qty, 
            Rate
        FROM @Items;

        -- Return the generated ID (THIS IS CRITICAL - DON'T REMOVE)
        SELECT @NewId AS GeneratedInvoiceId;
        
        COMMIT TRANSACTION
            
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[sp_UpdateInvoice]
    @Id NVARCHAR(50),
    @InvoiceNo NVARCHAR(50),
    @BankAccId NVARCHAR(50) = NULL,
    @companyId NVARCHAR(50),
    @PoNo NVARCHAR(50) = NULL,
    @InvoiceDate DATETIME,
    @QuotationID NVARCHAR(50) = NULL,
    @Remarks NVARCHAR(500) = NULL,
    @ClientID NVARCHAR(50),
    @Subtotal DECIMAL(18,2) = 0, -- Will be recalculated
    @Tax DECIMAL(18,2) = 0, -- Will be recalculated
    @InvoiceTotal DECIMAL(18,2) = 0, -- Will be recalculated
    @Items InvoiceItemDetailsType READONLY
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION

        -- Validate Client exists
        IF NOT EXISTS (SELECT 1 FROM Clients WHERE Id = @ClientID) 
            THROW 50001, 'Client ID does not exist.', 1;
        
        -- Validate Quotation exists if provided
        IF @QuotationID IS NOT NULL AND NOT EXISTS (SELECT 1 FROM Quotations WHERE Id = @QuotationID) 
            THROW 50002, 'Quotation does not exist.', 1;
            
        -- Validate Bank Account exists if provided
        IF @BankAccId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM BankAccounts WHERE Id = @BankAccId) 
            THROW 50003, 'Bank account does not exist.', 1;

        -- Validate that invoice number doesn't already exist (excluding current invoice)
        IF EXISTS (SELECT 1 FROM Invoices WHERE InvoiceNo = @InvoiceNo AND Id != @Id)
        BEGIN
            THROW 50004, 'Invoice number already exists', 1;
        END
        
        -- BACKEND CALCULATIONS (Override frontend values)
        DECLARE @CalculatedSubtotal DECIMAL(18,2) = 0;
        DECLARE @CalculatedTax DECIMAL(18,2) = 0;
        DECLARE @CalculatedInvoiceTotal DECIMAL(18,2) = 0;

        -- Calculate subtotal from items
        SELECT @CalculatedSubtotal = SUM(Qty * Rate) FROM @Items;

        -- Get discount percentage from existing invoice to maintain consistency
        DECLARE @ExistingDiscountPercentage DECIMAL(18,2);
        SELECT @ExistingDiscountPercentage = ISNULL(DiscountPercentage, 0)
        FROM Invoices WHERE Id = @Id;

        -- Calculate discount amount
        DECLARE @CalculatedDiscountAmount DECIMAL(18,2) = (@CalculatedSubtotal * @ExistingDiscountPercentage) / 100;

        -- Calculate tax (using 15% tax rate for consistency)
        DECLARE @TaxableAmount DECIMAL(18,2) = @CalculatedSubtotal - @CalculatedDiscountAmount;
        DECLARE @TaxRate DECIMAL(18,2) = 15.0; -- Default 15% tax rate
        SET @CalculatedTax = (@TaxableAmount * @TaxRate) / 100;
        SET @CalculatedInvoiceTotal = @CalculatedSubtotal - @CalculatedDiscountAmount + @CalculatedTax;

        -- Update main invoice record with BACKEND-CALCULATED values
        UPDATE [dbo].[Invoices] 
        SET 
            InvoiceNo = @InvoiceNo,
            BankAccId = @BankAccId,
            PoNo = @PoNo,
            InvoiceDate = @InvoiceDate,
            companyId = @companyId,
            QuotationID = @QuotationID,
            Remarks = @Remarks,
            ClientID = @ClientID,
            Subtotal = @CalculatedSubtotal, -- Use calculated value
            Tax = @CalculatedTax, -- Use calculated value
            InvoiceTotal = @CalculatedInvoiceTotal -- Use calculated value
        WHERE Id = @Id;

        -- Delete existing items
        DELETE FROM InvoiceItems WHERE InvoiceId = @Id;

        -- Insert new items WITHOUT Total column (let it be NULL)
        INSERT INTO InvoiceItems (InvoiceId, Description, Unit, Qty, Rate)
        SELECT 
            @Id, 
            Description, 
            Unit, 
            Qty, 
            Rate
        FROM @Items;

        COMMIT TRANSACTION
            
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[sp_GetAllInvoices]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP 10
        i.Id, i.InvoiceNo, i.BankAccId, i.PoNo, i.InvoiceDate, i.companyId,
        i.DiscountPercentage, i.DiscountAmount,
        i.QuotationID, i.Remarks, i.ClientID, i.Subtotal, i.Tax, i.InvoiceTotal,
        ii.Id AS ItemId, ii.Description, ii.Unit, ii.Qty, ii.Rate,
        (ii.Qty * ii.Rate) AS Total,
        c.Name AS ClientName,
        ba.BankName, ba.AccountNumber
    FROM Invoices i
        LEFT JOIN InvoiceItems ii ON i.Id = ii.InvoiceId
        LEFT JOIN Clients c ON i.ClientID = c.Id
        LEFT JOIN BankAccounts ba ON i.BankAccId = ba.Id
    ORDER BY i.InvoiceDate DESC;
END
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[sp_GetInvoiceById]
    @Id NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        i.Id, i.InvoiceNo, i.BankAccId, i.PoNo, i.InvoiceDate, i.companyId,
        i.DiscountPercentage, i.DiscountAmount,
        i.QuotationID, i.Remarks, i.ClientID, i.Subtotal, i.Tax, i.InvoiceTotal,
        ii.Id AS ItemId, ii.Description, ii.Unit, ii.Qty, ii.Rate,
        (ii.Qty * ii.Rate) AS Total,
        c.Name AS ClientName,
        ba.BankName, ba.AccountNumber
    FROM Invoices i
        LEFT JOIN InvoiceItems ii ON i.Id = ii.InvoiceId
        LEFT JOIN Clients c ON i.ClientID = c.Id
        LEFT JOIN BankAccounts ba ON i.BankAccId = ba.Id
    WHERE i.Id = @Id
    ORDER BY ii.Id;
END
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[sp_GetInvoiceByNumber]
    @InvoiceNo NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        i.Id,
        i.InvoiceNo,
        i.PoNo,
        i.InvoiceDate,
        i.QuotationID,
         i.BankAccId,
        i.companyId,
        i.DiscountPercentage,
        i.DiscountAmount,
        i.Remarks,
        i.ClientID,
        i.Subtotal,
        i.Tax,
        i.InvoiceTotal,
        i.CreatedDate,
        i.Status,
        ii.Id AS ItemId,
        ii.Description,
        ii.Unit,
        ii.Qty,
        ii.Rate,
        ii.Total
    FROM Invoices i
        LEFT JOIN InvoiceItems ii ON i.Id = ii.InvoiceId
    WHERE i.InvoiceNo = @InvoiceNo
    ORDER BY ii.Id;
END
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[sp_GetInvoicesByClientId]
    @ClientId NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        id AS InvoiceId,
        invoiceNo AS InvoiceNumber,
        InvoiceDate AS InvoiceDate,
        ClientId AS ClientId,
        Subtotal AS Subtotal,
        companyId as CompanyId,
        DiscountPercentage,
        DiscountAmount,
        Tax AS TaxAmount,
        InvoiceTotal AS TotalAmount,
        CreatedDate AS CreatedAt,
        Status AS Status,
        Remarks AS Remarks
    FROM Invoices
    WHERE ClientId = @ClientId
    ORDER BY CreatedDate DESC;
END
GO


select * from Invoices where InvoiceNo = 'INV5'