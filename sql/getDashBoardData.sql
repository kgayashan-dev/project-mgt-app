SELECT COUNT(id) from Invoices where [Status]=''
SELECT COUNT(Id) from Clients
SELECT * from Projects


SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Invoices';
SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Projects';
SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Clients';



GO


CREATE or alter PROCEDURE [dbo].[sp_GetDashboardData]
AS
BEGIN
    SET NOCOUNT ON;

    -- Total Active Clients Count
    DECLARE @TotalClients INT;
    SELECT @TotalClients = COUNT(*) 
    FROM Clients 
    WHERE IsActive = 1;

    -- Outstanding Invoices Count and Total Amount
    DECLARE @OutstandingInvoicesCount INT;
    DECLARE @OutstandingAmount DECIMAL(18,2);
    
    SELECT 
        @OutstandingInvoicesCount = COUNT(*),
        @OutstandingAmount = SUM(InvoiceTotal - ISNULL(PaidAmount, 0))
    FROM Invoices 
    WHERE Status IN ('Draft', 'Partial', 'Overdue')
      AND (InvoiceTotal - ISNULL(PaidAmount, 0)) > 0;

    -- Active Projects Count
    DECLARE @ActiveProjects INT;
    SELECT @ActiveProjects = COUNT(*) 
    FROM Projects 
    WHERE IsActive = 1 
      AND Status IN ('Active', 'Completed')
      AND (EndDate IS NULL OR EndDate >= GETDATE());

    -- Recent Invoices Count (last 30 days)
    DECLARE @RecentInvoices INT;
    SELECT @RecentInvoices = COUNT(*) 
    FROM Invoices 
    WHERE CreatedDate >= DATEADD(day, -30, GETDATE());

    DECLARE @PaidInvoices INT;
    SELECT @PaidInvoices = COUNT(*)
    FROM Invoices WHERE Status = 'Paid'



    -- Return all in one row
    SELECT 
        ISNULL(@TotalClients, 0) AS TotalClients,
        ISNULL(@OutstandingInvoicesCount, 0) AS OutstandingInvoicesCount,
        ISNULL(@OutstandingAmount, 0) AS OutstandingAmount,
        ISNULL(@ActiveProjects, 0) AS ActiveProjects,
        ISNULL(@RecentInvoices, 0) AS RecentInvoices,
        ISNULL(@PaidInvoices, 0) AS PaidInvoices;
END

EXEC sp_GetDashboardData