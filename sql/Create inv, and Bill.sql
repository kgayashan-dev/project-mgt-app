SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE [dbo].[sp_CreatePayment]
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
        DECLARE @BillGrandTotal DECIMAL(18,2);
        DECLARE @BillAmountDue DECIMAL(18,2);
        DECLARE @TotalPaid DECIMAL(18,2);
        DECLARE @RemainingBalance DECIMAL(18,2);
        DECLARE @ErrorMessage NVARCHAR(1000);
        DECLARE @GeneratedPaymentId NVARCHAR(50);
        DECLARE @NewTotalPaid DECIMAL(18,2);
        DECLARE @NewRemainingBalance DECIMAL(18,2);
        DECLARE @InvoiceStatus NVARCHAR(20);
        DECLARE @BillStatus NVARCHAR(20);

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

            -- Calculate new totals
            SET @NewTotalPaid = @TotalPaid + @Amount;
            SET @NewRemainingBalance = @RemainingBalance - @Amount;

            -- Determine new invoice status
            IF @NewTotalPaid >= @InvoiceTotal
                SET @InvoiceStatus = 'Paid'  -- Fully paid
            ELSE IF @NewTotalPaid > 0
                SET @InvoiceStatus = 'Partial'  -- Partially paid
            ELSE
                SET @InvoiceStatus = 'Unpaid';  -- No payments

            -- Update invoice status if payment is not cancelled
            IF @Status != 'Cancelled'
            BEGIN
                UPDATE Invoices 
                SET Status = @InvoiceStatus
                WHERE Id = @ReferenceId;
            END
            
            -- Set BillStatus to NULL for invoice payments
            SET @BillStatus = NULL;
        END

        -- Validation for bill payments
        IF @PaymentType = 'bill_payment'
        BEGIN
            -- Get bill GRAND TOTAL (original bill amount) and current amount due
            SELECT 
                @BillGrandTotal = GrandTotal,  -- Original total amount
                @BillAmountDue = ISNULL(AmountDue, GrandTotal)  -- Current remaining amount
            FROM Bills 
            WHERE Id = @ReferenceId;

            IF @BillGrandTotal IS NULL
                THROW 50004, 'Bill not found.', 1;

            -- Calculate total already paid for this bill
            SELECT @TotalPaid = ISNULL(SUM(Amount), 0)
            FROM Payments 
            WHERE ReferenceId = @ReferenceId 
            AND PaymentType = 'bill_payment'
            AND Status != 'Cancelled';

            -- Calculate remaining balance based on GRAND TOTAL
            SET @RemainingBalance = @BillGrandTotal - @TotalPaid;
            
            -- Validate payment amount doesn't exceed remaining balance
            IF @Amount > @RemainingBalance
            BEGIN
                SET @ErrorMessage = 'Payment amount exceeds bill balance. ' +
                    'Bill Total: ' + CAST(@BillGrandTotal AS NVARCHAR(20)) + 
                    ', Already Paid: ' + CAST(@TotalPaid AS NVARCHAR(20)) +
                    ', Remaining Balance: ' + CAST(@RemainingBalance AS NVARCHAR(20)) +
                    ', Payment Amount: ' + CAST(@Amount AS NVARCHAR(20));
                THROW 50005, @ErrorMessage, 1;
            END

            -- Calculate new totals
            SET @NewTotalPaid = @TotalPaid + @Amount;
            SET @NewRemainingBalance = @RemainingBalance - @Amount;  -- Based on GrandTotal

            -- Determine new bill status
            IF @NewTotalPaid >= @BillGrandTotal
                SET @BillStatus = 'Paid'  -- Fully paid
            ELSE IF @NewTotalPaid > 0
                SET @BillStatus = 'Partial'  -- Partially paid
            ELSE
                SET @BillStatus = 'Unpaid';  -- No payments

            -- Update bill status and amount due if payment is not cancelled
            IF @Status != 'Cancelled'
            BEGIN
                UPDATE Bills 
                SET 
                    Status = @BillStatus,
                    AmountDue = @NewRemainingBalance,
                    TotalOutstanding = @NewRemainingBalance
                WHERE Id = @ReferenceId;
            END
            
            -- Set InvoiceStatus to NULL for bill payments
            SET @InvoiceStatus = NULL;
        END

        -- Generate the next payment ID in PMT0000001 format
        DECLARE @NewPaymentNumber INT;
        
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
                WHEN @PaymentType = 'bill_payment' THEN ISNULL(@BillGrandTotal, 0)
                ELSE 0 
            END AS ReferenceTotal,
            @NewTotalPaid AS NewTotalPaid,
            @NewRemainingBalance AS NewRemainingBalance,
            @InvoiceStatus AS InvoiceNewStatus,
            @BillStatus AS BillNewStatus,
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

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE OR ALTER PROCEDURE [dbo].[sp_UpdatePayment]
    @Id NVARCHAR(50),
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

        DECLARE @OldAmount DECIMAL(18,2);
        DECLARE @OldStatus NVARCHAR(20);
        DECLARE @OldReferenceId NVARCHAR(50);
        DECLARE @OldPaymentType NVARCHAR(20);
        DECLARE @InvoiceTotal DECIMAL(18,2);
        DECLARE @BillGrandTotal DECIMAL(18,2);
        DECLARE @BillAmountDue DECIMAL(18,2);
        DECLARE @TotalPaid DECIMAL(18,2);
        DECLARE @RemainingBalance DECIMAL(18,2);
        DECLARE @ErrorMessage NVARCHAR(1000);
        DECLARE @NewTotalPaid DECIMAL(18,2);
        DECLARE @NewRemainingBalance DECIMAL(18,2);
        DECLARE @InvoiceStatus NVARCHAR(20);
        DECLARE @BillStatus NVARCHAR(20);

        -- Get old payment details before update
        SELECT 
            @OldAmount = Amount,
            @OldStatus = Status,
            @OldReferenceId = ReferenceId,
            @OldPaymentType = PaymentType
        FROM Payments 
        WHERE Id = @Id;

        -- Check if payment exists
        IF @OldAmount IS NULL
            THROW 50001, 'Payment with the specified ID does not exist.', 1;

        -- Validate if ReferenceId exists in Bills or Invoices
        IF NOT EXISTS (
            SELECT 1 FROM Bills WHERE Id = @ReferenceId
            UNION ALL
            SELECT 1 FROM Invoices WHERE Id = @ReferenceId
        ) 
        THROW 50002, 'Bill or Invoice with the specified ID does not exist.', 1;

        -- Validation for invoice payments
        IF @PaymentType = 'invoice_payment'
        BEGIN
            -- Get invoice total
            SELECT @InvoiceTotal = InvoiceTotal 
            FROM Invoices 
            WHERE Id = @ReferenceId;

            IF @InvoiceTotal IS NULL
                THROW 50004, 'Invoice not found.', 1;

            -- Calculate total already paid for this invoice (excluding current payment)
            SELECT @TotalPaid = ISNULL(SUM(Amount), 0)
            FROM Payments 
            WHERE ReferenceId = @ReferenceId 
            AND PaymentType = 'invoice_payment'
            AND Status != 'Cancelled'
            AND Id != @Id;

            -- Calculate remaining balance
            SET @RemainingBalance = @InvoiceTotal - @TotalPaid;

            -- If payment is being uncancelled or amount changed, validate
            IF (@Status != 'Cancelled' AND @OldStatus = 'Cancelled') OR 
               (@Amount != @OldAmount AND @Status != 'Cancelled' AND @OldStatus != 'Cancelled')
            BEGIN
                -- Validate payment amount doesn't exceed remaining balance
                IF @Amount > @RemainingBalance
                BEGIN
                    SET @ErrorMessage = 'Payment amount exceeds invoice balance. ' +
                        'Invoice Total: ' + CAST(@InvoiceTotal AS NVARCHAR(20)) + 
                        ', Already Paid: ' + CAST(@TotalPaid AS NVARCHAR(20)) +
                        ', Remaining Balance: ' + CAST(@RemainingBalance AS NVARCHAR(20)) +
                        ', Payment Amount: ' + CAST(@Amount AS NVARCHAR(20));
                    THROW 50005, @ErrorMessage, 1;
                END
            END
            
            -- Calculate new totals
            SET @NewTotalPaid = @TotalPaid + CASE 
                WHEN @Status != 'Cancelled' THEN @Amount 
                ELSE 0 
            END;
            
            SET @NewRemainingBalance = @InvoiceTotal - @NewTotalPaid;
            
            -- Determine new invoice status
            IF @NewTotalPaid >= @InvoiceTotal
                SET @InvoiceStatus = 'Paid'  -- Fully paid
            ELSE IF @NewTotalPaid > 0
                SET @InvoiceStatus = 'Partial'  -- Partially paid
            ELSE
                SET @InvoiceStatus = 'Unpaid';  -- No payments

            -- Update invoice status if payment affects the total
            IF @Status != 'Cancelled' OR @OldStatus != 'Cancelled' OR @Amount != @OldAmount
            BEGIN
                UPDATE Invoices 
                SET Status = @InvoiceStatus
                WHERE Id = @ReferenceId;
            END
            
            -- Set BillStatus to NULL for invoice payments
            SET @BillStatus = NULL;
        END

        -- Validation for bill payments
        IF @PaymentType = 'bill_payment'
        BEGIN
            -- Get bill GRAND TOTAL (original bill amount) and current amount due
            SELECT 
                @BillGrandTotal = GrandTotal,  -- Original total amount
                @BillAmountDue = ISNULL(AmountDue, GrandTotal)  -- Current remaining amount
            FROM Bills 
            WHERE Id = @ReferenceId;

            IF @BillGrandTotal IS NULL
                THROW 50006, 'Bill not found.', 1;

            -- Calculate total already paid for this bill (excluding current payment)
            SELECT @TotalPaid = ISNULL(SUM(Amount), 0)
            FROM Payments 
            WHERE ReferenceId = @ReferenceId 
            AND PaymentType = 'bill_payment'
            AND Status != 'Cancelled'
            AND Id != @Id;

            -- Calculate remaining balance based on GRAND TOTAL
            SET @RemainingBalance = @BillGrandTotal - @TotalPaid;

            -- If payment is being uncancelled or amount changed, validate
            IF (@Status != 'Cancelled' AND @OldStatus = 'Cancelled') OR 
               (@Amount != @OldAmount AND @Status != 'Cancelled' AND @OldStatus != 'Cancelled')
            BEGIN
                -- Validate payment amount doesn't exceed remaining balance
                IF @Amount > @RemainingBalance
                BEGIN
                    SET @ErrorMessage = 'Payment amount exceeds bill balance. ' +
                        'Bill Total: ' + CAST(@BillGrandTotal AS NVARCHAR(20)) + 
                        ', Already Paid: ' + CAST(@TotalPaid AS NVARCHAR(20)) +
                        ', Remaining Balance: ' + CAST(@RemainingBalance AS NVARCHAR(20)) +
                        ', Payment Amount: ' + CAST(@Amount AS NVARCHAR(20));
                    THROW 50007, @ErrorMessage, 1;
                END
            END
            
            -- Calculate new totals
            SET @NewTotalPaid = @TotalPaid + CASE 
                WHEN @Status != 'Cancelled' THEN @Amount 
                ELSE 0 
            END;
            
            SET @NewRemainingBalance = @BillGrandTotal - @NewTotalPaid;
            
            -- Determine new bill status
            IF @NewTotalPaid >= @BillGrandTotal
                SET @BillStatus = 'Paid'  -- Fully paid
            ELSE IF @NewTotalPaid > 0
                SET @BillStatus = 'Partial'  -- Partially paid
            ELSE
                SET @BillStatus = 'Unpaid';  -- No payments

            -- Update bill status and amount due if payment affects the total
            IF @Status != 'Cancelled' OR @OldStatus != 'Cancelled' OR @Amount != @OldAmount
            BEGIN
                UPDATE Bills 
                SET 
                    Status = @BillStatus,
                    AmountDue = @NewRemainingBalance,
                    TotalOutstanding = @NewRemainingBalance
                WHERE Id = @ReferenceId;
            END
            
            -- Set InvoiceStatus to NULL for bill payments
            SET @InvoiceStatus = NULL;
        END

        -- Update the payment record
        UPDATE Payments 
        SET 
            PaymentType = @PaymentType,
            ReferenceId = @ReferenceId,
            PaymentDate = @PaymentDate,
            PaymentMethod = @PaymentMethod,
            Notes = @Notes,
            Amount = @Amount,
            Status = @Status,
            TransactionReference = @TransactionReference,
            UpdateAt = GETUTCDATE()
        WHERE Id = @Id;

        -- Return updated payment details with balance information
        SELECT 
            @Id AS UpdatedPaymentId,
            CASE 
                WHEN @PaymentType = 'invoice_payment' THEN @InvoiceTotal
                WHEN @PaymentType = 'bill_payment' THEN @BillGrandTotal
                ELSE 0 
            END AS ReferenceTotal,
            @NewTotalPaid AS NewTotalPaid,
            @NewRemainingBalance AS NewRemainingBalance,
            @InvoiceStatus AS InvoiceNewStatus,
            @BillStatus AS BillNewStatus,
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
-- SELECT * from Bills
-- SELECT * from Invoices

delete from Payments
delete from Invoices
delete from Bills

SELECT * from Bills
SELECT * from Payments


select * from Expenses

SELECT * from Invoices
SELECT * from Vendors

-- SELECT * FROM Payments
-- WHERE PaymentType='bill_payment';

-- ALTER TABLE Invoices DROP COLUMN PaidAmount
-- VEN000001