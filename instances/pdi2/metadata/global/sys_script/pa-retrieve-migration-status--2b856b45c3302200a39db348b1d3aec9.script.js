(function executeRule(current, previous /*null when async*/) {
	g_scratchpad.is_migration_running = SNC.PAMigrator.isMigrationJobRunning();
	g_scratchpad.migration_warning_msg = SNC.PAMigrator.getDataCollectorMigrationRunningMessage();
})(current, previous);
