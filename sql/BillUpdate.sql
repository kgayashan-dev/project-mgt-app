ALTER TABLE Bills
ADD 
    Remarks NVARCHAR(MAX) NULL,
    ImagePath NVARCHAR(500) NULL,
    ImageUrl NVARCHAR(500) NULL;


use project_pulse

SELECT * from Bills


SELECT Id, BillNumber, ImagePath, ImageUrl, Status, CompanyName 
FROM Bills 
WHERE Id = 'BIL0000001';

BIL0000001


-- First, upload a test image manually to your wwwroot/uploads/bills/ folder
-- Copy any image file and rename it to: BILL-1765531614949-137_test.jpg

-- Then update the database:
CREATE PROCEDURE [dbo].[sp_UpdateBillImagePath]
    @Id NVARCHAR(50),
    @ImagePath NVARCHAR(500),
    @ImageUrl NVARCHAR(500)
AS
BEGIN
    UPDATE Bills
    SET ImagePath = @ImagePath,
        ImageUrl = @ImageUrl
    WHERE Id = @Id;
END

BIL0000001