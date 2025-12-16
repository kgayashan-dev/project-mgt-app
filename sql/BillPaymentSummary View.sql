
-- View for bill payment summary
CREATE or alter VIEW [dbo].[vw_BillPaymentSummary]
AS
SELECT 
    b.Id AS BillId,
    b.BillNumber,
    b.VendorId,
    b.GrandTotal AS BillTotal,
    ISNULL(SUM(p.Amount), 0) AS TotalPaid,
    b.GrandTotal - ISNULL(SUM(p.Amount), 0) AS RemainingBalance,
    CASE 
        WHEN ISNULL(SUM(p.Amount), 0) = 0 THEN 'Unpaid'
        WHEN ISNULL(SUM(p.Amount), 0) >= b.GrandTotal THEN 'Paid'
        ELSE 'Partially Paid'
    END AS PaymentStatus,
    COUNT(p.Id) AS NumberOfPayments
FROM Bills b
LEFT JOIN Payments p ON b.Id = p.ReferenceId 
    AND p.PaymentType = 'bill_payment'
    AND p.Status != 'Cancelled'
GROUP BY b.Id, b.BillNumber, b.VendorId, b.GrandTotal;
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

-- View for bill payment summary
CREATE or Alter VIEW [dbo].[vw_BillPaymentSummary]
AS
SELECT 
    b.Id AS BillId,
    b.BillNumber,
    b.VendorId,
    b.GrandTotal AS BillTotal,
    ISNULL(SUM(p.Amount), 0) AS TotalPaid,
    b.GrandTotal - ISNULL(SUM(p.Amount), 0) AS RemainingBalance,
    CASE 
        WHEN ISNULL(SUM(p.Amount), 0) = 0 THEN 'Unpaid'
        WHEN ISNULL(SUM(p.Amount), 0) >= b.GrandTotal THEN 'Paid'
        ELSE 'Partially Paid'
    END AS PaymentStatus,
    COUNT(p.Id) AS NumberOfPayments
FROM Bills b
LEFT JOIN Payments p ON b.Id = p.ReferenceId 
    AND p.PaymentType = 'bill_payment'
    AND p.Status != 'Cancelled'
GROUP BY b.Id, b.BillNumber, b.VendorId, b.GrandTotal;
GO


SELECT * FROM vw_InvoicePaymentSummary WHERE InvoiceId = 'INV000001';


EXEC [dbo].[sp_CreatePayment]
    @PaymentType = 'bill_payment',
    @ReferenceId = 'BIL0000001',
    @PaymentDate = '2024-01-20',
    @PaymentMethod = 'Bank Transfer',
    @Notes = 'Bill payment',
    @Amount = 300.00,
    @Status = 'Completed',
    @TransactionReference = 'TXN123457';

EXEC [dbo].[sp_CreatePayment]
    @PaymentType = 'invoice_payment',
    @ReferenceId = 'INV0000002',
    @PaymentDate = '2024-01-20',
    @PaymentMethod = 'Bank Transfer',
    @Notes = 'Invoice payment',
    @Amount = 500.00,
    @Status = 'Completed',
    @TransactionReference = 'TXN123456';



use project_pulse

SELECT * FROM Quotations
SELECT * FROM Invoices
