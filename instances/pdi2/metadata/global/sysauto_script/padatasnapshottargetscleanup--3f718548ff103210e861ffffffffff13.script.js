
(function executeCleanup() {
    var TARGET_TABLE = 'target_definition';
    var BATCH_SIZE = 500;
    var LOG_PREFIX = '[Target Datasnapshot Cleanup]';

    function processTargetsForCleanup() {
        // Get distinct (source_table, source_type) pairs from target_definition
        var distinctSourcePairs = new GlideAggregate(TARGET_TABLE);
        distinctSourcePairs.groupBy('source_table');
        distinctSourcePairs.groupBy('source_type');
        distinctSourcePairs.query();

        while (distinctSourcePairs.next()) {
            var sourceTable = distinctSourcePairs.getValue('source_table');
            var sourceType = distinctSourcePairs.getValue('source_type');

            if (sourceTable && sourceType) {
                // Stream target_definition ordered by source_id, de-duplicate, and process in batches
                // Delete batch of orphans
                streamAndDeleteOrphans(sourceTable, sourceType);
            }
        }
    }

    function streamAndDeleteOrphans(sourceTable, sourceType) {
        // Stream target_definition ordered by source_id
        var targetGr = new GlideRecord(TARGET_TABLE);
        targetGr.addQuery('source_type', sourceType);
        targetGr.addQuery('source_table', sourceTable);
        targetGr.orderBy('source_id');
        targetGr.query();

        var currentBatch = [];
        var lastSourceId = null;

        while (targetGr.next()) {
            var sourceId = targetGr.getValue('source_id');
            
            // Skip if empty or duplicate (de-duplication)
            if (!sourceId || sourceId === lastSourceId) {
                continue;
            }
            
            lastSourceId = sourceId;
            currentBatch.push(sourceId);

            // Process batch when it reaches BATCH_SIZE
            if (currentBatch.length >= BATCH_SIZE) {
                findAndDeleteOrphanedBatch(sourceTable, sourceType, currentBatch);
                currentBatch = []; // Reset batch
            }
        }

        // Process remaining items in the last batch
        if (currentBatch.length > 0) {
            findAndDeleteOrphanedBatch(sourceTable, sourceType, currentBatch);
        }
    }

    function findAndDeleteOrphanedBatch(sourceTable, sourceType, sourceIds) {
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
                var targetsToDelete = new GlideRecord(TARGET_TABLE);
                targetsToDelete.addQuery('source_type', sourceType);
                targetsToDelete.addQuery('source_table', sourceTable);
                targetsToDelete.addQuery('source_id', 'IN', orphanedIds.join(','));
                targetsToDelete.query();
                targetsToDelete.deleteMultiple();
            } catch (ex) {
                log('Failed to delete orphaned batch for (' + sourceTable + ', ' + sourceType + '): ' + ex.message, true);
            }
        }
    }



    function log(message, isError) {
        isError ? gs.error(LOG_PREFIX + ' ' + message) : gs.info(LOG_PREFIX + ' ' + message);
    }

    try {
        processTargetsForCleanup();
        log('Target datasnapshot cleanup complete');
    } catch (ex) {
        log('Error during target cleanup: ' + ex.message, true);
    }
})();
