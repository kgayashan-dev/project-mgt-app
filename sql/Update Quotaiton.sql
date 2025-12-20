SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- Update quotation stored procedure
ALTER PROCEDURE [dbo].[sp_UpdateQuotation]
    @Id NVARCHAR(50),
    @QuotationNumber NVARCHAR(50),
    @QuotationDate DATETIME,
    @ClientId NVARCHAR(50), -- Changed from ClientName to ClientId
    @CompanyId NVARCHAR(50), -- Added CompanyId parameter
    @DiscountPercentage DECIMAL(18,2) = 0,
    @DiscountAmount DECIMAL(18,2) = 0,
    @Subtotal DECIMAL(18,2) = 0,
    @Tax DECIMAL(18,2) = 0, -- Changed from TotalTax to Tax (percentage)
    @QuotationTotal DECIMAL(18,2) = 0, -- Changed from GrandTotal to match Add procedure
    @Terms NVARCHAR(MAX) = NULL, -- Added Terms parameter (changed from Notes)
    @Items QuotationItemDetailsType READONLY
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;

        -- Validate client exists
        IF NOT EXISTS(SELECT 1 FROM Clients WHERE id = @ClientId) 
            THROW 50001, 'Client ID does not exist.', 1;
            
        -- Validate company exists
        IF NOT EXISTS(SELECT 1 FROM CompanyData WHERE id = @CompanyId) 
            THROW 50002, 'Company ID does not exist.', 1;

        -- Validate that quotation number doesn't already exist (excluding current quotation)
        IF EXISTS (SELECT 1 FROM Quotations WHERE QuotationNumber = @QuotationNumber AND Id != @Id)
        BEGIN
            RAISERROR('Quotation number already exists', 16, 1);
            RETURN;
        END
        
        -- BACKEND CALCULATIONS (same as Add procedure)
        DECLARE @CalculatedSubtotal DECIMAL(18,2) = 0;
        DECLARE @CalculatedDiscountAmount DECIMAL(18,2) = 0;
        DECLARE @CalculatedTax DECIMAL(18,2) = 0;
        DECLARE @CalculatedQuotationTotal DECIMAL(18,2) = 0;

        -- Calculate subtotal from items
        SELECT @CalculatedSubtotal = SUM(Qty * Rate) FROM @Items;

        -- Calculate discount amount
        SET @CalculatedDiscountAmount = (@CalculatedSubtotal * @DiscountPercentage) / 100;

        -- Calculate tax
        DECLARE @TaxableAmount DECIMAL(18,2) = @CalculatedSubtotal - @CalculatedDiscountAmount;
        DECLARE @TaxPercentage DECIMAL(18,2) = @Tax;
        SET @CalculatedTax = (@TaxableAmount * @TaxPercentage) / 100;

        -- Calculate final quotation total
        SET @CalculatedQuotationTotal = @CalculatedSubtotal - @CalculatedDiscountAmount + @CalculatedTax;

        -- Update main quotation record
        UPDATE [dbo].[Quotations] SET
            QuotationNumber = @QuotationNumber,
            QuotationDate = @QuotationDate,
            ClientId = @ClientId,
            CompanyId = @CompanyId,
            DiscountPercentage = @DiscountPercentage,
            DiscountAmount = @CalculatedDiscountAmount, -- Use calculated amount
            Subtotal = @CalculatedSubtotal, -- Use calculated subtotal
            TaxPercentage = @Tax,
            TotalTax = @CalculatedTax, -- Use calculated tax
            GrandTotal = @CalculatedQuotationTotal, -- Use calculated total
            Terms = @Terms,
            ModifiedDate = GETDATE() -- Added modified date
        WHERE Id = @Id;

        -- Check if any rows were updated
        IF @@ROWCOUNT = 0
        BEGIN
            RAISERROR('Quotation not found', 16, 1);
            RETURN;
        END

        -- Delete existing quotation items
        DELETE FROM QuotationItem WHERE QuotationId = @Id;
        
        -- Insert new quotation items
        INSERT INTO QuotationItem (QuotationId, Description, Unit, Qty, Rate)
        SELECT 
            @Id, 
            Description, 
            Unit, 
            Qty, 
            Rate
        FROM @Items;

        SELECT 'Quotation updated successfully.' AS Message;
        
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO