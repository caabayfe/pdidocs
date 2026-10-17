/**
 * @class EFDataManager
 * @classdesc Manages data operations for the Error Framework
 */
class EFDataManager {

    /**
     * Updates inactive errors to 'inactive' state using efficient batch processing
     * @param {number} inactiveDays - Number of days without new instances to be considered inactive (default from config)
     * @param {number} batchSize - Number of records to process in each batch (default from config)
     * @param {string} sourceAppSysId - Optional sys_id of the source application to scope processing to
     * @returns {Object} Results of the operation
     */
    static markErrorsAsInactive(inactiveDays, batchSize, sourceAppSysId) {
        if (!inactiveDays || !batchSize) {
            var cleanup = EFErrorUtil.getConfigProp(sourceAppSysId, EFConstants.CONFIG_PROPERTIES.CLEANUP);
            if (!inactiveDays)
                inactiveDays = cleanup.inactiveDays || 30;
            if (!batchSize)
                batchSize = cleanup.batchSize || 10000;
        }

        var result = {
            totalProcessed: 0,
            markedInactive: 0,
            batches: 0,
            errors: 0
        };

        try {
            var cutoffDate = new GlideDateTime();
            cutoffDate.addDaysUTC(-inactiveDays);
            var cutoffDateStr = cutoffDate.getValue();

            // Get records needing update
            var inactiveErrorsGr = new GlideRecord(EFConstants.TABLES.ERROR);
            inactiveErrorsGr.addQuery('state', 'IN', EFDataManager.VALID_ACTIVE_STATES);
            inactiveErrorsGr.addQuery('sys_updated_on', '<=', cutoffDateStr);
            if (sourceAppSysId)
                inactiveErrorsGr.addQuery(EFConstants.ERROR_FIELDS.APPLICATION, sourceAppSysId);
            inactiveErrorsGr.query();
            
            var totalRecords = inactiveErrorsGr.getRowCount();
            result.totalProcessed = totalRecords;
            
            if (totalRecords > 0) {
                EFDataManager.logger.debug("Found " + totalRecords + " inactive errors to process");
                
                // If total count is small enough, process in a single batch
                if (totalRecords <= batchSize) {
                    inactiveErrorsGr.setValue('state', EFConstants.ERROR_STATES.INACTIVE);
                    inactiveErrorsGr.setValue('sys_updated_on', new GlideDateTime());
                    inactiveErrorsGr.updateMultiple();
                    
                    result.markedInactive = totalRecords;
                    result.batches = 1;
                    
                    EFDataManager.logger.debug("Processed all " + totalRecords + " records in a single batch");
                } else {
                    // For larger datasets, we'll process in batches
                    var currentTime = new GlideDateTime();
                    var batchCount = 0;
                    var processedCount = 0;
                    var batchSysIDs = [];
                    
                    // Process records and collect sys_ids in batches
                    while (inactiveErrorsGr.next()) {
                        batchSysIDs.push(inactiveErrorsGr.getValue('sys_id'));
                        
                        // When we reach batch size or the end of records, process the batch
                        if (batchSysIDs.length >= batchSize || processedCount + batchSysIDs.length >= totalRecords) {
                            batchCount++;
                            
                            // Create a new query with the collected sys_ids
                            var batchGr = new GlideRecord(EFConstants.TABLES.ERROR);
                            batchGr.addQuery('sys_id', 'IN', batchSysIDs);
                            batchGr.query();
                            
                            if (batchGr.getRowCount() > 0) {
                                batchGr.setValue('state', EFConstants.ERROR_STATES.INACTIVE);
                                batchGr.setValue('sys_updated_on', currentTime);
                                batchGr.updateMultiple();
                                
                                processedCount += batchSysIDs.length;
                                
                                EFDataManager.logger.debug("Batch " + batchCount + ": Processed " + batchSysIDs.length + 
                                    " records. Total marked inactive so far: " + processedCount + "/" + totalRecords);
                                
                                // Reset the batch array for next batch
                                batchSysIDs = [];
                            }
                        }
                    }
                    
                    result.markedInactive = processedCount;
                    result.batches = batchCount;
                }
                
                EFDataManager.logger.debug("Inactive error processing complete. Processed " + result.batches + 
                    " batches. Marked " + result.markedInactive + " errors as inactive.");
            } else
                EFDataManager.logger.debug("No inactive errors found to process");
            
        } catch (e) {
            EFDataManager.logger.error("Error in markErrorsAsInactive: " + e);
            result.errors++;
        }
        
        return result;
    }
}

EFDataManager.VALID_ACTIVE_STATES = [
    EFConstants.ERROR_STATES.OPEN,
    EFConstants.ERROR_STATES.IN_PROGRESS
];

EFDataManager.logger = EFLogger.forClass('EFDataManager');
