(function executeCloneCleanup() {
    var tableName = 'sn_um_lastclone_summary';
	gs.info("Executing Clone Cleanup for table: " + tableName);

    // Delete all records from the table
    var grDelete = new GlideRecord(tableName);
    grDelete.query();
    while (grDelete.next()) {
        grDelete.deleteRecord();
    }

    var worker = new GlideScriptedHierarchicalWorker();
    worker.setProgressName("Upgrade Management - Get Current Instance Last Clone Details");
    worker.setScriptIncludeName("global.UpgradeManagementApiUtil");
    worker.setScriptIncludeMethod("getLastCloneSummary");
    worker.setSourceTable('sn_um_lastclone_summary');
    worker.setBackground(true); 
    worker.start(); 

    var progressId = worker.getProgressID();
	if (progressId) {
        gs.info("Progress worker started successfully with ID: " + progressId);
    } else {
        gs.warn("Failed to retrieve progress worker ID.");
    }
})();
