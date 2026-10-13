gs.include('EvtMgmtAlertManagementMigrate');
gs.log("************* Starting migration of Alert Action Rule...");
var migrate = new EvtMgmtAlertManagementMigrate();
gs.log("Rule name: " + current.name);
migrate.migrateRule(current);
gs.log("************* Finishing migration.");
