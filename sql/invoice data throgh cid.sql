-- Stored Procedure: sp_GetInvoicesByClientId
CREATE or alter PROCEDURE [dbo].[sp_GetInvoicesByClientId]
    @ClientId NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        id AS InvoiceId,
        invoiceNo AS InvoiceNumber,
        InvoiceDate AS InvoiceDate,
        InvoiceDate AS InvoiceDate,
        ClientId AS ClientId,
        Subtotal AS Subtotal,
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

EXEC sp_GetInvoicesByClientId 'CID0000001'


