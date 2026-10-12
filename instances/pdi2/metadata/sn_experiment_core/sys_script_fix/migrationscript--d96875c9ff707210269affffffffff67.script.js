gs.info("Migration started");
var migration = new sn_experiment_core.MigrationService();
migration.migrateAllData(); 
gs.info("Migration Completed successfully");
