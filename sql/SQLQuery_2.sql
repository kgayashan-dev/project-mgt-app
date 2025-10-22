SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE OR ALTER PROCEDURE [dbo].[sp_AddInvoice]
    @InvoiceNo NVARCHAR(50),
    @PONumber NVARCHAR(50),
    @InvoiceDate DATE,
    @QuotationNo NVARCHAR(50),
    @Remarks NVARCHAR(MAX),
    @ClientID bigint,
    @SubTotal DECIMAL(18,2),
    @Tax DECIMAL(18,2),
    @Total DECIMAL(18,2),
    @Items ItemDetailsType READONLY -- TVP (Table-Valued Parameter)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION sp_AddInvoice
        INSERT INTO [project_pulse].[dbo].[Invoices] (InvoiceNo, PoNo, InvoiceDate, QuotationNo, Remarks,ClientID, Tax, InvoiceTotal)
        VALUES (@InvoiceNo, @PONumber, @InvoiceDate, @QuotationNo, @Remarks,@ClientID, @Tax, @Total);

        DECLARE @InvoiceId INT = SCOPE_IDENTITY();

        INSERT INTO InvoiceItems (InvoiceId, Description, Unit, Qty, Rate)
        SELECT @InvoiceId, Description, Unit, Qty, Rate FROM @Items;

        if @@TRANCOUNT>0
            COMMIT TRANSACTION sp_AddInvoice
    END TRY
    BEGIN CATCH
        if @@TRANCOUNT>0
            ROLLBACK TRANSACTION sp_AddInvoice;
        THROW;
    END CATCH
END
GO






SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[InvoiceItems](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[InvoiceId] [int] NULL,
	[Description] [nvarchar](200) NULL,
	[Unit] [nvarchar](20) NULL,
	[Qty] [int] NULL,
	[Rate] [decimal](18, 2) NULL,
	[Total]  AS ([Qty]*[Rate]) PERSISTED,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[InvoiceItems]  WITH CHECK ADD FOREIGN KEY([InvoiceId])
REFERENCES [dbo].[Invoices] ([Id])
ON DELETE CASCADE
GO

