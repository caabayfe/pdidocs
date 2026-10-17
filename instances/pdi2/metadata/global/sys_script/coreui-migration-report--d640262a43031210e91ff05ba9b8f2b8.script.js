// Creates a par_coreui_migration_bridge_widget record for newly created report
    (function executeRule(current, previous /*null when async*/) {
      var unifiedAnalyticsEnabled = gs.getProperty('com.glide.par.unified_analytics.enabled', 'false') === 'true';
      if (unifiedAnalyticsEnabled) {
        var migrator = new SNC.MigrationServiceScriptable();
        migrator.migrateReportForced(current.sys_id, true, false);
      }
})(current, previous);
