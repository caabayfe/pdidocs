function transform(input) {
    // Initialize logger for this data broker
    const logger = EFLogger.forClass('EFUndoIgnoreTransform');

    const transformStartTime = new GlideDateTime().getNumericValue();
    logger.debug('Transform started with input: ' + JSON.stringify(input));
    
    // Declare variables first
    let totalErrorsUpdated = 0;
    let totalErrorsFailed = 0;
    const failedErrorSysIds = [];
    
    // Helper: Update a single error record from ignored to open
    function updateErrorState(errorRecordGr, errorSysId) {
        const currentErrorState = errorRecordGr.getValue('state');

        if (currentErrorState !== 'ignored') {
            totalErrorsFailed++;
            failedErrorSysIds.push(errorSysId);
            logger.debug('Skipped error ' + errorSysId + ' - current state is: ' + currentErrorState);
            return false;
        }

        errorRecordGr.setValue('state', 'open');

        if (errorRecordGr.update()) {
            totalErrorsUpdated++;
            logger.debug('Updated error ' + errorSysId + ' from ignored to open');
            return true;
        } else {
            totalErrorsFailed++;
            failedErrorSysIds.push(errorSysId);
            logger.warn('Failed to update error ' + errorSysId);
            return false;
        }
    }

    // Helper: Build success response
    function buildSuccessResponse(mode, totalRequested) {
        const transformEndTime = new GlideDateTime().getNumericValue();

        return {
            success: true,
            message: 'Updated ' + totalErrorsUpdated + ' error(s) from ignored to open' +
                (mode === 'all_rows' ? ' (all rows)' : ''),
            updated_count: totalErrorsUpdated,
            failed_count: totalErrorsFailed,
            failed_ids: failedErrorSysIds,
            total_requested: totalRequested,
            mode: mode,
            timestamp: new GlideDateTime().getValue(),
            execution_time_ms: transformEndTime - transformStartTime
        };
    }

    // Helper: Build error response
    function buildErrorResponse(errorMessage) {
        return {
            success: false,
            error: errorMessage,
            updated_count: 0,
            failed_count: 0,
            timestamp: new GlideDateTime().getValue()
        };
    }

    try {
        const isAllRowsSelected = input.allRowSelected || false;
        const errorFilterEncodedQuery = input.encodedErrorQuery || '';
        const selectedErrorSysIds = input.sys_ids || [];

        // Handle "all rows selected" scenario - bulk update using updateMultiple
        if (isAllRowsSelected) {
            if (!errorFilterEncodedQuery) {
                logger.warn('Missing encodedErrorQuery when allRowSelected is true');
                return buildErrorResponse('encodedErrorQuery is required when allRowSelected is true');
            }

            // First, get the count of records that match the query
            const countGr = new GlideAggregate('sys_error');
            countGr.addEncodedQuery(errorFilterEncodedQuery);
            countGr.addQuery('state', 'ignored');
            countGr.addAggregate('COUNT');
            countGr.query();
            
            let matchingRecordCount = 0;
            if (countGr.next()) {
                matchingRecordCount = parseInt(countGr.getAggregate('COUNT')) || 0;
            }

            // Perform the bulk update
            const errorRecordGr = new GlideRecord('sys_error');
            errorRecordGr.addEncodedQuery(errorFilterEncodedQuery);
            errorRecordGr.addQuery('state', 'ignored');
            errorRecordGr.setValue('state', 'open');
            errorRecordGr.updateMultiple();
            
            totalErrorsUpdated = matchingRecordCount;
            
            logger.debug('Bulk updated ' + matchingRecordCount + ' errors from ignored to open using updateMultiple()');

            return {
                success: true,
                message: 'Updated ' + matchingRecordCount + ' error(s) from ignored to open (all rows)',
                updated_count: matchingRecordCount,
                failed_count: 0,
                mode: 'all_rows',
                timestamp: new GlideDateTime().getValue(),
                execution_time_ms: new GlideDateTime().getNumericValue() - transformStartTime
            };
        }

        // Handle individual row selection scenario
        if (!selectedErrorSysIds || !Array.isArray(selectedErrorSysIds)) {
            return buildErrorResponse('sys_ids parameter is required and must be an array when allRowSelected is false');
        }

        if (selectedErrorSysIds.length === 0) {
            return {
                success: true,
                message: 'No errors to update',
                updated_count: 0,
                failed_count: 0,
                timestamp: new GlideDateTime().getValue()
            };
        }

        // Process each selected error record individually
        logger.debug('Processing ' + selectedErrorSysIds.length + ' individual error records');
        selectedErrorSysIds.forEach(function(errorSysId) {
            const errorRecordGr = new GlideRecord('sys_error');

            if (errorRecordGr.get(errorSysId)) {
                updateErrorState(errorRecordGr, errorSysId);
            } else {
                totalErrorsFailed++;
                failedErrorSysIds.push(errorSysId);
                logger.warn('Error record not found: ' + errorSysId);
            }
        });

        return buildSuccessResponse('individual_rows', selectedErrorSysIds.length);

    } catch (error) {
        const errorEndTime = new GlideDateTime().getNumericValue();

        logger.error('Error in transform: ' + error.toString());

        return {
            success: false,
            error: error.toString(),
            updated_count: 0,
            failed_count: 0,
            timestamp: new GlideDateTime().getValue(),
            execution_time_ms: errorEndTime - transformStartTime
        };
    }
}
