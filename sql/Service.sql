-- Stored Procedure: Create Service





CREATE or ALTER PROCEDURE [dbo].[sp_CreateService]
    @Id NVARCHAR(50) = NULL,
    @ProjectId NVARCHAR(50),
    @ServiceName NVARCHAR(100),
    @Description NVARCHAR(MAX) = NULL,
    @HourlyRate DECIMAL(18,2) = 0,
    @EstimatedHours INT = 0,
    @ActualHours INT = 0,
    @StartDate DATETIME2,
    @EndDate DATETIME2,
    @Status NVARCHAR(20) = 'Active'
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @NewId NVARCHAR(50);

    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Generate Service ID in SER000001 format when empty string or NULL is provided
        IF @Id IS NULL OR @Id = ''
        BEGIN
            SELECT @NewId = 'SER' + RIGHT('0000000' + CAST(ISNULL(MAX(CAST(SUBSTRING(Id, 4, LEN(Id)) AS INT)), 0) + 1 AS NVARCHAR(7)), 7)
            FROM Services;
        END
        ELSE
        BEGIN
            SET @NewId = @Id;
        END

        -- Insert into Services table
        INSERT INTO Services (Id, ProjectId, ServiceName, Description, HourlyRate, EstimatedHours, ActualHours, StartDate, EndDate, Status)
        VALUES (@NewId, @ProjectId, @ServiceName, @Description, @HourlyRate, @EstimatedHours, @ActualHours, @StartDate, @EndDate, @Status);

        COMMIT TRANSACTION;
        
        SELECT @NewId AS GeneratedServiceId;
        
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

-- Stored Procedure: Get All Services
CREATE or ALTER  PROCEDURE [dbo].[sp_GetAllServices]
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        Id, ProjectId, ServiceName, Description, HourlyRate, EstimatedHours, ActualHours,
        StartDate, EndDate, Status, CreatedDate, ModifiedDate
    FROM Services 
    WHERE IsActive = 1
    ORDER BY StartDate DESC, ServiceName;
END
GO

-- Stored Procedure: Get Service By ID
CREATE or ALTER  PROCEDURE [dbo].[sp_GetServiceById]
    @Id NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        Id, ProjectId, ServiceName, Description, HourlyRate, EstimatedHours, ActualHours,
        StartDate, EndDate, Status, CreatedDate, ModifiedDate
    FROM Services 
    WHERE Id = @Id AND IsActive = 1;
END
GO

-- Stored Procedure: Get Services By Project
CREATE or ALTER  PROCEDURE [dbo].[sp_GetServicesByProject]
    @ProjectId NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        Id, ProjectId, ServiceName, Description, HourlyRate, EstimatedHours, ActualHours,
        StartDate, EndDate, Status, CreatedDate, ModifiedDate
    FROM Services 
    WHERE ProjectId = @ProjectId AND IsActive = 1
    ORDER BY StartDate DESC, ServiceName;
END
GO

-- Stored Procedure: Get Services By Status
CREATE or ALTER  PROCEDURE [dbo].[sp_GetServicesByStatus]
    @Status NVARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        Id, ProjectId, ServiceName, Description, HourlyRate, EstimatedHours, ActualHours,
        StartDate, EndDate, Status, CreatedDate, ModifiedDate
    FROM Services 
    WHERE Status = @Status AND IsActive = 1
    ORDER BY StartDate DESC, ServiceName;
END
GO

-- Stored Procedure: Update Service
CREATE or ALTER PROCEDURE [dbo].[sp_UpdateService]
    @Id NVARCHAR(50),
    @ProjectId NVARCHAR(50),
    @ServiceName NVARCHAR(100),
    @Description NVARCHAR(MAX) = NULL,
    @HourlyRate DECIMAL(18,2) = 0,
    @EstimatedHours INT = 0,
    @ActualHours INT = 0,
    @StartDate DATETIME2,
    @EndDate DATETIME2,
    @Status NVARCHAR(20) = 'Active'
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Update Service
        UPDATE Services 
        SET 
            ProjectId = @ProjectId,
            ServiceName = @ServiceName,
            Description = @Description,
            HourlyRate = @HourlyRate,
            EstimatedHours = @EstimatedHours,
            ActualHours = @ActualHours,
            StartDate = @StartDate,
            EndDate = @EndDate,
            Status = @Status,
            ModifiedDate = GETUTCDATE()
        WHERE Id = @Id AND IsActive = 1;

        COMMIT TRANSACTION;
        
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

-- Stored Procedure: Delete Service (Soft Delete)
CREATE or ALTER PROCEDURE [dbo].[sp_DeleteService]
    @Id NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Soft delete the service
        UPDATE Services 
        SET IsActive = 0, ModifiedDate = GETUTCDATE()
        WHERE Id = @Id AND IsActive = 1;

        COMMIT TRANSACTION;
        
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

-- Stored Procedure: Search Services
CREATE or ALTER PROCEDURE [dbo].[sp_SearchServices]
    @SearchTerm NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        Id, ProjectId, ServiceName, Description, HourlyRate, EstimatedHours, ActualHours,
        StartDate, EndDate, Status, CreatedDate, ModifiedDate
    FROM Services
    WHERE IsActive = 1
        AND (ServiceName LIKE '%' + @SearchTerm + '%'
        OR Description LIKE '%' + @SearchTerm + '%'
        OR ProjectId LIKE '%' + @SearchTerm + '%')
    ORDER BY StartDate DESC, ServiceName;
END
GO