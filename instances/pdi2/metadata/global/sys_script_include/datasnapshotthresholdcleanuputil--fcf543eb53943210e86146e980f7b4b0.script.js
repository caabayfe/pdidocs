var DatasnapshotThresholdCleanupUtil = Class.create();
DatasnapshotThresholdCleanupUtil.prototype = {
    BATCH_SIZE: 500,
    
    initialize: function(tableName) {
        this.tableName = tableName;
        this.logPrefix = '[' + tableName + ' Cleanup]';
    },
    
    /**
     * Main cleanup function - processes all orphaned records for the specified table
     */
    executeCleanup: function() {
        try {
            this._processThresholdsForCleanup();
            this._log(this.tableName + ' datasnapshot cleanup complete');
        } catch (ex) {
            this._log('Error during cleanup: ' + ex.message, true);
        }
    },
    
    /**
     * Get distinct (source_table, source_type) pairs and process each
     */
    _processThresholdsForCleanup: function() {
        var distinctSourcePairs = new GlideAggregate(this.tableName);
        distinctSourcePairs.groupBy('source_table');
        distinctSourcePairs.groupBy('source_type');
        distinctSourcePairs.query();
        
        while (distinctSourcePairs.next()) {
            var sourceTable = distinctSourcePairs.getValue('source_table');
            var sourceType = distinctSourcePairs.getValue('source_type');
            
            if (sourceTable && sourceType) {
                this._streamAndDeleteOrphans(sourceTable, sourceType);
            }
        }
    },
    
    /**
     * Stream records ordered by source_id, de-duplicate, and delete orphans in batches
     */
    _streamAndDeleteOrphans: function(sourceTable, sourceType) {
        var thresholdGr = new GlideRecord(this.tableName);
        thresholdGr.addQuery('source_type', sourceType);
        thresholdGr.addQuery('source_table', sourceTable);
        thresholdGr.orderBy('source_id');
        thresholdGr.query();
        
        var currentBatch = [];
        var lastSourceId = null;
        
        while (thresholdGr.next()) {
            var sourceId = thresholdGr.getValue('source_id');
            
            // Skip if empty or duplicate (de-duplication)
            if (!sourceId || sourceId === lastSourceId) {
                continue;
            }
            
            lastSourceId = sourceId;
            currentBatch.push(sourceId);
            
            // Process batch when it reaches BATCH_SIZE
            if (currentBatch.length >= this.BATCH_SIZE) {
                this._findAndDeleteOrphanedBatch(sourceTable, sourceType, currentBatch);
                currentBatch = [];
            }
        }
        
        // Process remaining items in the last batch
        if (currentBatch.length > 0) {
            this._findAndDeleteOrphanedBatch(sourceTable, sourceType, currentBatch);
        }
    },
    
    /**
     * Check existence in source table and delete orphaned records immediately
     */
    _findAndDeleteOrphanedBatch: function(sourceTable, sourceType, sourceIds) {
        if (!sourceIds || sourceIds.length === 0) {
            return;
        }
        
        var existingIds = {};
        var orphanedIds = [];
        
        // Check existence: Query source table to find which IDs exist
        var sourceGr = new GlideRecord(sourceTable);
        sourceGr.addQuery('sys_id', 'IN', sourceIds.join(','));
        sourceGr.query();
        
        // Build map of existing IDs
        while (sourceGr.next()) {
            existingIds[sourceGr.getUniqueValue()] = true;
        }
        
        // Find orphaned IDs by checking which ones are NOT in existingIds map
        for (var j = 0; j < sourceIds.length; j++) {
            if (!existingIds[sourceIds[j]]) {
                orphanedIds.push(sourceIds[j]);
            }
        }
        
        // Delete orphans if any found
        if (orphanedIds.length > 0) {
            try {
                var thresholdsToDelete = new GlideRecord(this.tableName);
                thresholdsToDelete.addQuery('source_type', sourceType);
                thresholdsToDelete.addQuery('source_table', sourceTable);
                thresholdsToDelete.addQuery('source_id', 'IN', orphanedIds.join(','));
                thresholdsToDelete.query();
                thresholdsToDelete.deleteMultiple();
            } catch (ex) {
                this._log('Failed to delete orphaned batch for (' + sourceTable + ', ' + sourceType + '): ' + ex.message, true);
            }
        }
    },
    
    /**
     * Log utility
     */
    _log: function(message, isError) {
        isError ? gs.error(this.logPrefix + ' ' + message) : gs.info(this.logPrefix + ' ' + message);
    },
    
    type: 'DatasnapshotThresholdCleanupUtil'
};
