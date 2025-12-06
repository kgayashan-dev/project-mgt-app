SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER  PROCEDURE [dbo].[sp_CreatePayment]
    @PaymentType NVARCHAR(20),
    @ReferenceId NVARCHAR(50),
    @PaymentDate DATETIME,
    @PaymentMethod NVARCHAR(50) = NULL,
    @Notes NVARCHAR(500) = NULL,
    @Amount DECIMAL(18,2),
    @Status NVARCHAR(20),
    @TransactionReference NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;

        DECLARE @InvoiceTotal DECIMAL(18,2);
        DECLARE @BillTotal DECIMAL(18,2);
        DECLARE @TotalPaid DECIMAL(18,2);
        DECLARE @RemainingBalance DECIMAL(18,2);
        DECLARE @ErrorMessage NVARCHAR(1000);

        -- Validate if ReferenceId exists in Bills or Invoices
        IF NOT EXISTS (
            SELECT 1 FROM Bills WHERE Id = @ReferenceId
            UNION ALL
            SELECT 1 FROM Invoices WHERE Id = @ReferenceId
        ) 
        THROW 50001, 'Bill or Invoice with the specified ID does not exist.', 1;

        -- Validation for invoice payments
        IF @PaymentType = 'invoice_payment'
        BEGIN
            -- Get invoice total
            SELECT @InvoiceTotal = InvoiceTotal 
            FROM Invoices 
            WHERE Id = @ReferenceId;

            IF @InvoiceTotal IS NULL
                THROW 50002, 'Invoice not found.', 1;

            -- Calculate total already paid for this invoice
            SELECT @TotalPaid = ISNULL(SUM(Amount), 0)
            FROM Payments 
            WHERE ReferenceId = @ReferenceId 
            AND PaymentType = 'invoice_payment'
            AND Status != 'Cancelled';

            -- Calculate remaining balance
            SET @RemainingBalance = @InvoiceTotal - @TotalPaid;

            -- Validate payment amount doesn't exceed remaining balance
            IF @Amount > @RemainingBalance
            BEGIN
                SET @ErrorMessage = 'Payment amount exceeds invoice balance. ' +
                    'Invoice Total: ' + CAST(@InvoiceTotal AS NVARCHAR(20)) + 
                    ', Already Paid: ' + CAST(@TotalPaid AS NVARCHAR(20)) +
                    ', Remaining Balance: ' + CAST(@RemainingBalance AS NVARCHAR(20)) +
                    ', Payment Amount: ' + CAST(@Amount AS NVARCHAR(20));
                THROW 50003, @ErrorMessage, 1;
            END
        END

        -- Validation for bill payments
        IF @PaymentType = 'bill_payment'
        BEGIN
            -- Get bill total (assuming GrandTotal or AmountDue column exists)
            SELECT @BillTotal = ISNULL(GrandTotal, AmountDue)
            FROM Bills 
            WHERE Id = @ReferenceId;

            IF @BillTotal IS NULL
                THROW 50004, 'Bill not found.', 1;

            -- Calculate total already paid for this bill
            SELECT @TotalPaid = ISNULL(SUM(Amount), 0)
            FROM Payments 
            WHERE ReferenceId = @ReferenceId 
            AND PaymentType = 'bill_payment'
            AND Status != 'Cancelled';

            -- Calculate remaining balance
            SET @RemainingBalance = @BillTotal - @TotalPaid;

            -- Validate payment amount doesn't exceed remaining balance
            IF @Amount > @RemainingBalance
            BEGIN
                SET @ErrorMessage = 'Payment amount exceeds bill balance. ' +
                    'Bill Total: ' + CAST(@BillTotal AS NVARCHAR(20)) + 
                    ', Already Paid: ' + CAST(@TotalPaid AS NVARCHAR(20)) +
                    ', Remaining Balance: ' + CAST(@RemainingBalance AS NVARCHAR(20)) +
                    ', Payment Amount: ' + CAST(@Amount AS NVARCHAR(20));
                THROW 50005, @ErrorMessage, 1;
            END
        END

        -- Generate the next payment ID in PMT0000001 format
        DECLARE @NewPaymentNumber INT;
        DECLARE @GeneratedPaymentId NVARCHAR(50);
        
        -- Get the maximum existing payment number and increment
        SELECT @NewPaymentNumber = ISNULL(MAX(CAST(REPLACE(Id, 'PMT', '') AS INT)), 0) + 1
        FROM Payments
        WHERE Id LIKE 'PMT%' AND ISNUMERIC(REPLACE(Id, 'PMT', '')) = 1;
        
        SET @GeneratedPaymentId = 'PMT' + RIGHT('0000000' + CAST(@NewPaymentNumber AS NVARCHAR(10)), 7);
        
        -- Insert the payment
        INSERT INTO Payments (
            Id, PaymentType, ReferenceId, PaymentDate, 
            PaymentMethod, Notes, Amount, Status, TransactionReference, CreatedAt
        )
        VALUES (
            @GeneratedPaymentId, @PaymentType, @ReferenceId, @PaymentDate,
            @PaymentMethod, @Notes, @Amount, @Status, @TransactionReference, GETUTCDATE()
        );
        
        -- Return the generated payment ID with balance information
        SELECT 
            @GeneratedPaymentId AS GeneratedPaymentId,
            CASE 
                WHEN @PaymentType = 'invoice_payment' THEN ISNULL(@InvoiceTotal, 0)
                WHEN @PaymentType = 'bill_payment' THEN ISNULL(@BillTotal, 0)
                ELSE 0 
            END AS ReferenceTotal,
            ISNULL(@TotalPaid, 0) + @Amount AS NewTotalPaid,
            ISNULL(@RemainingBalance, 0) - @Amount AS NewRemainingBalance,
            @PaymentType AS PaymentType;
        
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        THROW;
    END CATCH
END
GO


-- View for invoice payment summary
CREATE VIEW [dbo].[vw_InvoicePaymentSummary]
AS
SELECT 
    i.Id AS InvoiceId,
    i.InvoiceNo,
    i.ClientID,
    i.InvoiceTotal,
    ISNULL(SUM(p.Amount), 0) AS TotalPaid,
    i.InvoiceTotal - ISNULL(SUM(p.Amount), 0) AS RemainingBalance,
    CASE 
        WHEN ISNULL(SUM(p.Amount), 0) = 0 THEN 'Unpaid'
        WHEN ISNULL(SUM(p.Amount), 0) >= i.InvoiceTotal THEN 'Paid'
        ELSE 'Partially Paid'
    END AS PaymentStatus,
    COUNT(p.Id) AS NumberOfPayments
FROM Invoices i
LEFT JOIN Payments p ON i.Id = p.ReferenceId 
    AND p.PaymentType = 'invoice_payment'
    AND p.Status != 'Cancelled'
GROUP BY i.Id, i.InvoiceNo, i.ClientID, i.InvoiceTotal;
GO
