if ('true' == gs.getProperty("glide.db.clone.rollback_allowed", true)) {
  gs.print("Scheduling drop backup tables task");
  new SncScheduleDropBackupTablesTask().run();
} else
  gs.print("Rollback is disabled - skipping scheduling backup tables (they are dropped immediately)");
