-- ============================================
-- 1. Main PNL Calculation Procedure
-- ============================================
CREATE OR ALTER PROCEDURE sp_CalculatePnL
    @StartDate DATETIME,
    @EndDate DATETIME
AS
BEGIN
    SET NOCOUNT ON;
    
    CREATE TABLE #PnLResults (
        Category NVARCHAR(50),
        SubCategory NVARCHAR(100),
        Amount DECIMAL(18,2),
        Reference NVARCHAR(100),
        Description NVARCHAR(500),
        ClientVendor NVARCHAR(200),
        TransactionDate DATETIME
    );
    -- REVENUE: Paid invoices
    INSERT INTO #PnLResults
    SELECT 
        'Revenue', 
        'Invoice', 
        i.InvoiceTotal,
        i.InvoiceNo,
        'Invoice Payment',
        ISNULL(ccd.ClientName, 'Unknown'),
        i.InvoiceDate
    FROM Invoice i
    LEFT JOIN CompanyClientDetails ccd ON i.ClientID = ccd.ClientID
    WHERE i.InvoiceDate BETWEEN @StartDate AND @EndDate
    AND i.Status = 'Paid';
    
    -- REVENUE: Income table
    INSERT INTO #PnLResults
    SELECT 
        'Revenue', 
        'Other Income', 
        inc.Amount,
        ISNULL(inc.TransactionReference, inc.Id),
        ISNULL(inc.Notes, 'Other Income'),
        '',
        inc.IncomeDate
    FROM Income inc
    WHERE inc.IncomeDate BETWEEN @StartDate AND @EndDate
    AND inc.Status = 'received';
    
    -- REVENUE: Completed projects
    INSERT INTO #PnLResults
    SELECT 
        'Revenue', 
        'Project', 
        p.FlatRate,
        p.Id,
        'Project Revenue',
        ISNULL(c.Name, 'Unknown Client'),
        p.EndDate
    FROM Project p
    LEFT JOIN Client c ON p.ClientId = c.Id
    WHERE p.EndDate BETWEEN @StartDate AND @EndDate
    AND p.Status = 'Completed';
    
    -- COGS: Bills with COGS categories
    INSERT INTO #PnLResults
    SELECT 
        'COGS', 
        'Materials/Services', 
        bi.Total,
        b.BillNumber,
        bi.Description,
        b.CompanyName,
        b.IssueDate
    FROM Bill b
    INNER JOIN BillItem bi ON b.Id = bi.BillId
    LEFT JOIN Category cat ON bi.CategoryID = cat.CategoryId
    WHERE b.IssueDate BETWEEN @StartDate AND @EndDate
    AND (cat.CatDescription LIKE '%COGS%' OR cat.CatDescription LIKE '%Material%');
    
    -- EXPENSES: Expenses table
    INSERT INTO #PnLResults
    SELECT 
        'Expense', 
        'Expense', 
        e.GrandTotal,
        e.Id,
        'Expense',
        ISNULL(m.MerchantName, e.Merchant),
        e.Date
    FROM Expense e
    LEFT JOIN Merchant m ON e.Merchant = m.MerchantId
    WHERE e.Date BETWEEN @StartDate AND @EndDate;
    
    -- EXPENSES: Bills (non-COGS)
    INSERT INTO #PnLResults
    SELECT 
        'Expense', 
        'Bill', 
        b.GrandTotal,
        b.BillNumber,
        'Bill Payment',
        b.CompanyName,
        b.IssueDate
    FROM Bill b
    WHERE b.IssueDate BETWEEN @StartDate AND @EndDate
    AND NOT EXISTS (
        SELECT 1 FROM BillItem bi 
        LEFT JOIN Category cat ON bi.CategoryID = cat.CategoryId
        WHERE bi.BillId = b.Id
        AND (cat.CatDescription LIKE '%COGS%' OR cat.CatDescription LIKE '%Material%')
    );
    
    -- TAX: Tax payments
    INSERT INTO #PnLResults
    SELECT 
        'Tax', 
        'Tax Payment', 
        p.Amount,
        ISNULL(p.TransactionReference, p.Id),
        ISNULL(p.Notes, 'Tax Payment'),
        '',
        p.PaymentDate
    FROM Payment p
    WHERE p.PaymentDate BETWEEN @StartDate AND @EndDate
    AND p.PaymentType = 'Tax';
    
    -- Return detailed results
    SELECT * FROM #PnLResults ORDER BY Category, TransactionDate;
    
    -- Return summary
    SELECT 
        ISNULL(SUM(CASE WHEN Category = 'Revenue' THEN Amount ELSE 0 END), 0) as TotalRevenue,
        ISNULL(SUM(CASE WHEN Category = 'COGS' THEN Amount ELSE 0 END), 0) as TotalCOGS,
        ISNULL(SUM(CASE WHEN Category = 'Expense' THEN Amount ELSE 0 END), 0) as TotalExpenses,
        ISNULL(SUM(CASE WHEN Category = 'Tax' THEN Amount ELSE 0 END), 0) as TotalTax
    FROM #PnLResults;
    
    DROP TABLE #PnLResults;
END
GO

-- ============================================
-- 2. PNL History (Monthly)
-- ============================================
CREATE OR ALTER PROCEDURE sp_GetPnLHistory
    @Months INT = 12
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @StartDate DATE = DATEADD(MONTH, -@Months, DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1));
    
    CREATE TABLE #MonthlyPnL (
        PeriodName NVARCHAR(20),
        PeriodStart DATE,
        PeriodEnd DATE,
        Revenue DECIMAL(18,2),
        Expenses DECIMAL(18,2),
        Profit DECIMAL(18,2)
    );
    
    DECLARE @Counter INT = 0;
    
    WHILE @Counter < @Months
    BEGIN
        DECLARE @MonthStart DATE = DATEADD(MONTH, @Counter, @StartDate);
        DECLARE @MonthEnd DATE = EOMONTH(@MonthStart);
        
        -- Revenue calculation
        DECLARE @MonthRevenue DECIMAL(18,2) = 0;
        
        -- Invoices
        SELECT @MonthRevenue = @MonthRevenue + ISNULL(SUM(InvoiceTotal), 0)
        FROM Invoice 
        WHERE InvoiceDate BETWEEN @MonthStart AND @MonthEnd
        AND Status = 'Paid';
        
        -- Income
        SELECT @MonthRevenue = @MonthRevenue + ISNULL(SUM(Amount), 0)
        FROM Income 
        WHERE IncomeDate BETWEEN @MonthStart AND @MonthEnd
        AND Status = 'received';
        
        -- Projects
        SELECT @MonthRevenue = @MonthRevenue + ISNULL(SUM(FlatRate), 0)
        FROM Project 
        WHERE EndDate BETWEEN @MonthStart AND @MonthEnd
        AND Status = 'Completed';
        
        -- Expenses calculation
        DECLARE @MonthExpenses DECIMAL(18,2) = 0;
        
        -- Expenses table
        SELECT @MonthExpenses = @MonthExpenses + ISNULL(SUM(GrandTotal), 0)
        FROM Expense 
        WHERE Date BETWEEN @MonthStart AND @MonthEnd;
        
        -- Bills
        SELECT @MonthExpenses = @MonthExpenses + ISNULL(SUM(GrandTotal), 0)
        FROM Bill 
        WHERE IssueDate BETWEEN @MonthStart AND @MonthEnd;
        
        -- Tax payments
        SELECT @MonthExpenses = @MonthExpenses + ISNULL(SUM(Amount), 0)
        FROM Payment 
        WHERE PaymentDate BETWEEN @MonthStart AND @MonthEnd
        AND PaymentType = 'Tax';
        
        INSERT INTO #MonthlyPnL VALUES (
            FORMAT(@MonthStart, 'MMM yyyy'),
            @MonthStart,
            @MonthEnd,
            @MonthRevenue,
            @MonthExpenses,
            @MonthRevenue - @MonthExpenses
        );
        
        SET @Counter = @Counter + 1;
    END
    
    SELECT * FROM #MonthlyPnL ORDER BY PeriodStart;
    DROP TABLE #MonthlyPnL;
END
GO

-- ============================================
-- 3. PNL Summary (Current vs Previous Month)
-- ============================================
CREATE OR ALTER PROCEDURE sp_GetPnLSummary
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @CurrentMonthStart DATE = DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1);
    DECLARE @CurrentMonthEnd DATE = GETDATE();
    DECLARE @PreviousMonthStart DATE = DATEADD(MONTH, -1, @CurrentMonthStart);
    DECLARE @PreviousMonthEnd DATE = DATEADD(DAY, -1, @CurrentMonthStart);
    
    -- Current month revenue
    DECLARE @CurrentRevenue DECIMAL(18,2) = 0;
    
    SELECT @CurrentRevenue = @CurrentRevenue + ISNULL(SUM(InvoiceTotal), 0)
    FROM Invoice 
    WHERE InvoiceDate BETWEEN @CurrentMonthStart AND @CurrentMonthEnd
    AND Status = 'Paid';
    
    SELECT @CurrentRevenue = @CurrentRevenue + ISNULL(SUM(Amount), 0)
    FROM Income 
    WHERE IncomeDate BETWEEN @CurrentMonthStart AND @CurrentMonthEnd
    AND Status = 'received';
    
    SELECT @CurrentRevenue = @CurrentRevenue + ISNULL(SUM(FlatRate), 0)
    FROM Project 
    WHERE EndDate BETWEEN @CurrentMonthStart AND @CurrentMonthEnd
    AND Status = 'Completed';
    
    -- Current month expenses
    DECLARE @CurrentExpenses DECIMAL(18,2) = 0;
    
    SELECT @CurrentExpenses = @CurrentExpenses + ISNULL(SUM(GrandTotal), 0)
    FROM Expense 
    WHERE Date BETWEEN @CurrentMonthStart AND @CurrentMonthEnd;
    
    SELECT @CurrentExpenses = @CurrentExpenses + ISNULL(SUM(GrandTotal), 0)
    FROM Bill 
    WHERE IssueDate BETWEEN @CurrentMonthStart AND @CurrentMonthEnd;
    
    SELECT @CurrentExpenses = @CurrentExpenses + ISNULL(SUM(Amount), 0)
    FROM Payment 
    WHERE PaymentDate BETWEEN @CurrentMonthStart AND @CurrentMonthEnd
    AND PaymentType = 'Tax';
    
    DECLARE @CurrentProfit DECIMAL(18,2) = @CurrentRevenue - @CurrentExpenses;
    
    -- Previous month revenue
    DECLARE @PreviousRevenue DECIMAL(18,2) = 0;
    
    SELECT @PreviousRevenue = @PreviousRevenue + ISNULL(SUM(InvoiceTotal), 0)
    FROM Invoice 
    WHERE InvoiceDate BETWEEN @PreviousMonthStart AND @PreviousMonthEnd
    AND Status = 'Paid';
    
    SELECT @PreviousRevenue = @PreviousRevenue + ISNULL(SUM(Amount), 0)
    FROM Income 
    WHERE IncomeDate BETWEEN @PreviousMonthStart AND @PreviousMonthEnd
    AND Status = 'received';
    
    SELECT @PreviousRevenue = @PreviousRevenue + ISNULL(SUM(FlatRate), 0)
    FROM Project 
    WHERE EndDate BETWEEN @PreviousMonthStart AND @PreviousMonthEnd
    AND Status = 'Completed';
    
    -- Previous month expenses
    DECLARE @PreviousExpenses DECIMAL(18,2) = 0;
    
    SELECT @PreviousExpenses = @PreviousExpenses + ISNULL(SUM(GrandTotal), 0)
    FROM Expense 
    WHERE Date BETWEEN @PreviousMonthStart AND @PreviousMonthEnd;
    
    SELECT @PreviousExpenses = @PreviousExpenses + ISNULL(SUM(GrandTotal), 0)
    FROM Bill 
    WHERE IssueDate BETWEEN @PreviousMonthStart AND @PreviousMonthEnd;
    
    SELECT @PreviousExpenses = @PreviousExpenses + ISNULL(SUM(Amount), 0)
    FROM Payment 
    WHERE PaymentDate BETWEEN @PreviousMonthStart AND @PreviousMonthEnd
    AND PaymentType = 'Tax';
    
    DECLARE @PreviousProfit DECIMAL(18,2) = @PreviousRevenue - @PreviousExpenses;
    
    -- Growth calculations
    DECLARE @RevenueGrowth DECIMAL(18,2) = 
        CASE 
            WHEN @PreviousRevenue > 0 
            THEN ROUND(((@CurrentRevenue - @PreviousRevenue) / @PreviousRevenue) * 100, 2)
            WHEN @CurrentRevenue > 0 THEN 100
            ELSE 0 
        END;
    
    DECLARE @ProfitGrowth DECIMAL(18,2) = 
        CASE 
            WHEN @PreviousProfit > 0 
            THEN ROUND(((@CurrentProfit - @PreviousProfit) / @PreviousProfit) * 100, 2)
            WHEN @CurrentProfit > 0 THEN 100
            ELSE 0 
        END;
    
    -- Return summary
    SELECT 
        @CurrentRevenue as CurrentMonthRevenue,
        @CurrentProfit as CurrentMonthProfit,
        @PreviousRevenue as PreviousMonthRevenue,
        @PreviousProfit as PreviousMonthProfit,
        @RevenueGrowth as RevenueGrowth,
        @ProfitGrowth as ProfitGrowth;
END
GO

-- ============================================
-- 4. PNL Overview (Dashboard)
-- ============================================
CREATE OR ALTER PROCEDURE sp_GetPnLOverview
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @Today DATE = GETDATE();
    DECLARE @MonthStart DATE = DATEFROMPARTS(YEAR(@Today), MONTH(@Today), 1);
    DECLARE @YearStart DATE = DATEFROMPARTS(YEAR(@Today), 1, 1);
    
    -- Current Month Revenue
    DECLARE @CurrentMonthRevenue DECIMAL(18,2) = 0;
    
    SELECT @CurrentMonthRevenue = @CurrentMonthRevenue + ISNULL(SUM(InvoiceTotal), 0)
    FROM Invoice 
    WHERE InvoiceDate BETWEEN @MonthStart AND @Today
    AND Status = 'Paid';
    
    SELECT @CurrentMonthRevenue = @CurrentMonthRevenue + ISNULL(SUM(Amount), 0)
    FROM Income 
    WHERE IncomeDate BETWEEN @MonthStart AND @Today
    AND Status = 'received';
    
    SELECT @CurrentMonthRevenue = @CurrentMonthRevenue + ISNULL(SUM(FlatRate), 0)
    FROM Project 
    WHERE EndDate BETWEEN @MonthStart AND @Today
    AND Status = 'Completed';
    
    -- Current Month Expenses
    DECLARE @CurrentMonthExpenses DECIMAL(18,2) = 0;
    
    SELECT @CurrentMonthExpenses = @CurrentMonthExpenses + ISNULL(SUM(GrandTotal), 0)
    FROM Expense 
    WHERE Date BETWEEN @MonthStart AND @Today;
    
    SELECT @CurrentMonthExpenses = @CurrentMonthExpenses + ISNULL(SUM(GrandTotal), 0)
    FROM Bill 
    WHERE IssueDate BETWEEN @MonthStart AND @Today;
    
    SELECT @CurrentMonthExpenses = @CurrentMonthExpenses + ISNULL(SUM(Amount), 0)
    FROM Payment 
    WHERE PaymentDate BETWEEN @MonthStart AND @Today
    AND PaymentType = 'Tax';
    
    DECLARE @CurrentMonthProfit DECIMAL(18,2) = @CurrentMonthRevenue - @CurrentMonthExpenses;
    
    -- Year to Date Revenue
    DECLARE @YearRevenue DECIMAL(18,2) = 0;
    
    SELECT @YearRevenue = @YearRevenue + ISNULL(SUM(InvoiceTotal), 0)
    FROM Invoice 
    WHERE InvoiceDate BETWEEN @YearStart AND @Today
    AND Status = 'Paid';
    
    SELECT @YearRevenue = @YearRevenue + ISNULL(SUM(Amount), 0)
    FROM Income 
    WHERE IncomeDate BETWEEN @YearStart AND @Today
    AND Status = 'received';
    
    SELECT @YearRevenue = @YearRevenue + ISNULL(SUM(FlatRate), 0)
    FROM Project 
    WHERE EndDate BETWEEN @YearStart AND @Today
    AND Status = 'Completed';
    
    -- Year to Date Expenses
    DECLARE @YearExpenses DECIMAL(18,2) = 0;
    
    SELECT @YearExpenses = @YearExpenses + ISNULL(SUM(GrandTotal), 0)
    FROM Expense 
    WHERE Date BETWEEN @YearStart AND @Today;
    
    SELECT @YearExpenses = @YearExpenses + ISNULL(SUM(GrandTotal), 0)
    FROM Bill 
    WHERE IssueDate BETWEEN @YearStart AND @Today;
    
    SELECT @YearExpenses = @YearExpenses + ISNULL(SUM(Amount), 0)
    FROM Payment 
    WHERE PaymentDate BETWEEN @YearStart AND @Today
    AND PaymentType = 'Tax';
    
    DECLARE @YearProfit DECIMAL(18,2) = @YearRevenue - @YearExpenses;
    
    -- Outstanding Invoices
    DECLARE @OutstandingInvoices DECIMAL(18,2);
    SELECT @OutstandingInvoices = ISNULL(SUM(InvoiceTotal), 0)
    FROM Invoice 
    WHERE Status IN ('Pending', 'Overdue');
    
    -- Return results
    SELECT 
        @CurrentMonthRevenue as CurrentMonthRevenue,
        @CurrentMonthExpenses as CurrentMonthExpenses,
        @CurrentMonthProfit as CurrentMonthProfit,
        @YearRevenue as YearToDateRevenue,
        @YearExpenses as YearToDateExpenses,
        @YearProfit as YearToDateProfit,
        @OutstandingInvoices as OutstandingInvoices;
END
GO

-- ============================================
-- 5. Category Breakdown
-- ============================================
CREATE OR ALTER PROCEDURE sp_GetPnLByCategory
    @StartDate DATETIME,
    @EndDate DATETIME
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Revenue by client
    SELECT 
        'Revenue' as Type,
        ISNULL(ccd.ClientName, 'Unknown Client') as Category,
        SUM(i.InvoiceTotal) as Amount
    FROM Invoice i
    LEFT JOIN CompanyClientDetails ccd ON i.ClientID = ccd.ClientID
    WHERE i.InvoiceDate BETWEEN @StartDate AND @EndDate
    AND i.Status = 'Paid'
    GROUP BY ccd.ClientName
    
    UNION ALL
    
    -- Project revenue
    SELECT 
        'Revenue' as Type,
        'Projects' as Category,
        SUM(p.FlatRate) as Amount
    FROM Project p
    WHERE p.EndDate BETWEEN @StartDate AND @EndDate
    AND p.Status = 'Completed'
    
    UNION ALL
    
    -- Other income
    SELECT 
        'Revenue' as Type,
        'Other Income' as Category,
        SUM(inc.Amount) as Amount
    FROM Income inc
    WHERE inc.IncomeDate BETWEEN @StartDate AND @EndDate
    AND inc.Status = 'received'
    
    UNION ALL
    
    -- COGS
    SELECT 
        'COGS' as Type,
        ISNULL(cat.CatDescription, 'Uncategorized') as Category,
        SUM(bi.Total) as Amount
    FROM Bill b
    INNER JOIN BillItem bi ON b.Id = bi.BillId
    LEFT JOIN Category cat ON bi.CategoryID = cat.CategoryId
    WHERE b.IssueDate BETWEEN @StartDate AND @EndDate
    AND (cat.CatDescription LIKE '%COGS%' OR cat.CatDescription LIKE '%Material%')
    GROUP BY cat.CatDescription
    
    UNION ALL
    
    -- Expenses by category
    SELECT 
        'Expense' as Type,
        ISNULL(cat.CatDescription, 'Uncategorized') as Category,
        SUM(e.GrandTotal) as Amount
    FROM Expense e
    LEFT JOIN Category cat ON e.CategoryId = cat.CategoryId
    WHERE e.Date BETWEEN @StartDate AND @EndDate
    GROUP BY cat.CatDescription
    
    UNION ALL
    
    -- Bills by vendor
    SELECT 
        'Expense' as Type,
        b.CompanyName as Category,
        SUM(b.GrandTotal) as Amount
    FROM Bill b
    WHERE b.IssueDate BETWEEN @StartDate AND @EndDate
    AND NOT EXISTS (
        SELECT 1 FROM BillItem bi 
        LEFT JOIN Category cat ON bi.CategoryID = cat.CategoryId
        WHERE bi.BillId = b.Id
        AND (cat.CatDescription LIKE '%COGS%' OR cat.CatDescription LIKE '%Material%')
    )
    GROUP BY b.CompanyName
    
    UNION ALL
    
    -- Tax payments
    SELECT 
        'Tax' as Type,
        'Tax Payments' as Category,
        SUM(p.Amount) as Amount
    FROM Payment p
    WHERE p.PaymentDate BETWEEN @StartDate AND @EndDate
    AND p.PaymentType = 'Tax'
    
    ORDER BY Type, Amount DESC;
END
GO