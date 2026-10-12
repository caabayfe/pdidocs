var MlClusterDetailPurgeUtil = Class.create();

(function() {
    var tables = {
        ML_SOLUTION: 'ml_solution',
        ML_CLUSTER_DETAIL: 'ml_cluster_detail',
        ML_CLUSTER_DETAIL_PURGE_AUDIT: 'ml_cluster_detail_purge_audit'
    };

    var column_names = {
        SYS_ID: 'sys_id',
        REC_SYS_ID: 'rec_sys_id',
        REC_TABLE: 'rec_table',
        ACTIVE: 'active',
        SYS_CREATED_ON: 'sys_created_on',
        SOLUTION: 'solution',
        LAST_PROCESSED_RECORD_TIME: 'last_processed_record_time',
        TABLE: 'table',
        NUM_SCANS_COMPLETE: 'num_scans_complete'
    };

    var MAX_ML_CLUSTER_DETAIL_PURGE_COUNT = 500000;
    var MAX_BATCH_SIZE = 100000;

    MlClusterDetailPurgeUtil.prototype = {
        initialize: function() {},

        purgeDeletedSolutionRecords: function() {
            var mlClusterDetailGa = new GlideAggregate(tables.ML_CLUSTER_DETAIL);
            mlClusterDetailGa.groupBy(column_names.SOLUTION);
            mlClusterDetailGa.addAggregate('COUNT', column_names.SOLUTION);
            mlClusterDetailGa.query();

            var mlClusterDetailPurgedCount = 0;
            var totalTimeTaken = 0;

            while (mlClusterDetailGa.next()) {
                var solution_id = mlClusterDetailGa.getValue(column_names.SOLUTION);
                var mlSolutiongGr = new GlideRecord(tables.ML_SOLUTION);
                mlSolutiongGr.addQuery(column_names.SYS_ID, solution_id);
                mlSolutiongGr.query();
                if (!mlSolutiongGr.next()) {
                    var start = new Date().getTime();
                    var mlClusterDetailPurgedCountPerSolution = 0;

                    var mlClusterDetailGr = new GlideRecord(tables.ML_CLUSTER_DETAIL);
                    mlClusterDetailGr.addQuery(column_names.SOLUTION, solution_id);
                    mlClusterDetailGr.addQuery(column_names.ACTIVE, true);
                    mlClusterDetailGr.setLimit(MAX_BATCH_SIZE);
                    mlClusterDetailGr.query();
                    while (mlClusterDetailGr.next()) {
                        mlClusterDetailGr.setValue(column_names.ACTIVE, false);
                        mlClusterDetailGr.update();
                        mlClusterDetailPurgedCountPerSolution++;
                    }
                    var end = new Date().getTime();
                    var time = end - start;
                    totalTimeTaken += time;
                    gs.log('Total number of purged records for deleted solution ' + solution_id + ': ' + mlClusterDetailPurgedCountPerSolution);
                    gs.log('Time taken to purge ML Cluster Detail records related to ' + solution_id + ' : ' + time + 'ms');
                    mlClusterDetailPurgedCount += mlClusterDetailPurgedCountPerSolution;
                }
            }
            gs.log('Total number of purged records for all deleted solutions: ' + mlClusterDetailPurgedCount);
            gs.log('Total time taken to purge ML Cluster Detail records for all deleted solutions: ' + totalTimeTaken + "ms");
        },

        executePurge: function() {

            var totalMlClusterDetailPurgedCount = 0;
            var totalTimeTaken = 0;
            var mlSolutionGa = new GlideAggregate(tables.ML_SOLUTION);
            mlSolutionGa.addEncodedQuery('capability=clustering_trainer^ORcapability=workflow_clustering_trainer');
            mlSolutionGa.orderBy(column_names.SYS_CREATED_ON);
            mlSolutionGa.groupBy(column_names.SYS_ID);
            mlSolutionGa.query();
            while (mlSolutionGa.next() && totalMlClusterDetailPurgedCount < MAX_ML_CLUSTER_DETAIL_PURGE_COUNT) {
                var start = new Date().getTime();
                var mlClusterDetailPurgedCount = 0;
                var mlClusterDetailRetainedCount = 0;
                var solutionSysId = mlSolutionGa.getUniqueValue();
                var solutionSysCreatedOn = mlSolutionGa.getValue(column_names.SYS_CREATED_ON);

                // Fetch Last processed record time from Ml Cluster Detail Audit table
                var lastProcessedRecordTime = mlSolutionGa.getValue(column_names.SYS_CREATED_ON);
                var mlClusterDetailPurgeAuditGr = new GlideRecord(tables.ML_CLUSTER_DETAIL_PURGE_AUDIT);
                mlClusterDetailPurgeAuditGr.addQuery(column_names.SOLUTION, solutionSysId);
                mlClusterDetailPurgeAuditGr.query();
                if (mlClusterDetailPurgeAuditGr.next()) {
                    lastProcessedRecordTime = mlClusterDetailPurgeAuditGr.getValue(column_names.LAST_PROCESSED_RECORD_TIME);
                    gs.log('ML Cluster Detail Purge audit record for solution id: ' + solutionSysId + ' found with last processed time: ' + lastProcessedRecordTime);
                } else {
                    var mlClusterDetailPurgeAuditGrNewEntry = new GlideRecord(tables.ML_CLUSTER_DETAIL_PURGE_AUDIT);
                    mlClusterDetailPurgeAuditGrNewEntry.setValue(column_names.SOLUTION, solutionSysId);
                    mlClusterDetailPurgeAuditGrNewEntry.setValue(column_names.LAST_PROCESSED_RECORD_TIME, lastProcessedRecordTime);
                    mlClusterDetailPurgeAuditGrNewEntry.insert();
                    gs.log('New record in ML Cluster Detail Purge audit for solution id: ' + solutionSysId + ' has been created');
                }

                // For this record look for ml_cluster_detail records
                // and then check if those ml_cluster_detail records have a valid reference
                var performedPurging = false;
                var mlClusterDetailGr = new GlideRecord(tables.ML_CLUSTER_DETAIL);
                mlClusterDetailGr.addEncodedQuery('solution=' + solutionSysId + '^active=true^sys_created_on>' + lastProcessedRecordTime);
                // mlClusterDetailGr.orderBy(column_names.SYS_CREATED_ON);
                mlClusterDetailGr.setLimit(MAX_BATCH_SIZE);
                mlClusterDetailGr.query();
                while (mlClusterDetailGr.next() && totalMlClusterDetailPurgedCount < MAX_ML_CLUSTER_DETAIL_PURGE_COUNT) {
                    performedPurging = true;
                    var targetTableGr = new GlideRecord(mlClusterDetailGr.getValue(column_names.REC_TABLE));
                    targetTableGr.addQuery(column_names.SYS_ID, mlClusterDetailGr.getValue(column_names.REC_SYS_ID));
                    targetTableGr.query();

                    // If the record doesn't exist in the target table then we set active to false.
                    if (!targetTableGr.next()) {
                        mlClusterDetailGr.setValue(column_names.ACTIVE, false);
                        mlClusterDetailGr.update();
                        mlClusterDetailPurgedCount++;
                        totalMlClusterDetailPurgedCount++;
                    } else {
                        mlClusterDetailRetainedCount++;
                    }
                    lastProcessedRecordTime = mlClusterDetailGr.getValue(column_names.SYS_CREATED_ON);
                }
                mlClusterDetailPurgeAuditGr = new GlideRecord(tables.ML_CLUSTER_DETAIL_PURGE_AUDIT);
                mlClusterDetailPurgeAuditGr.addQuery(column_names.SOLUTION, solutionSysId);
                mlClusterDetailPurgeAuditGr.query();
                if (mlClusterDetailPurgeAuditGr.next()) {
                    if (performedPurging) {
                        // Purging is done
                        // Update the last Processed Record time for the solution in Ml Cluster Detail Purge Audit table.
                        mlClusterDetailPurgeAuditGr.setValue(column_names.LAST_PROCESSED_RECORD_TIME, lastProcessedRecordTime);
                        mlClusterDetailPurgeAuditGr.update();
                        gs.log('ML Cluster Detail Purge audit last processed record time for solution id: ' + solutionSysId + ' has been updated to ' + lastProcessedRecordTime);
                    } else {
                        // Purging is not done
                        if (totalMlClusterDetailPurgedCount < MAX_ML_CLUSTER_DETAIL_PURGE_COUNT) {
                            if (mlClusterDetailRetainedCount == 0) {
                                gs.info("No ML Cluster Detail records found for solution id: " + solutionSysId);
                            }
                            // Reset the purge job only when we exhausted searching ML Cluster Detail table.
                            // This avoids reset when we dont purge based on Max Cluster Detail Purge count.
                            mlClusterDetailPurgeAuditGr.setValue(column_names.LAST_PROCESSED_RECORD_TIME, solutionSysCreatedOn);
                            var numberOfScansComplete = mlClusterDetailPurgeAuditGr.getValue(column_names.NUM_SCANS_COMPLETE);
                            numberOfScansComplete = parseInt(numberOfScansComplete) + 1;
                            mlClusterDetailPurgeAuditGr.setValue(column_names.NUM_SCANS_COMPLETE, numberOfScansComplete);
                            mlClusterDetailPurgeAuditGr.update();
                            gs.log('ML Cluster Detail Purge job reset for solution id: ' + solutionSysId);
                        }
                    }
                }

                gs.log('ML Cluster Detail records purged for ' + solutionSysId + ' : ' + mlClusterDetailPurgedCount + '\n' + 'ML Cluster Detail records retained for ' + solutionSysId + ' : ' + mlClusterDetailRetainedCount);
                var end = new Date().getTime();
                var time = end - start;
                totalTimeTaken += time;
                gs.log('Time taken to purge ML Cluster Detail records related to ' + solutionSysId + ' : ' + time + 'ms');
                gs.sleep(1000);
            }
            gs.log('Total ML Cluster Detail records purged: ' + totalMlClusterDetailPurgedCount);
            gs.log('Total time taken to purge ML Cluster Detail records: ' + totalTimeTaken + "ms");
        },

        type: 'MlClusterDetailPurgeUtil'
    };
})();
