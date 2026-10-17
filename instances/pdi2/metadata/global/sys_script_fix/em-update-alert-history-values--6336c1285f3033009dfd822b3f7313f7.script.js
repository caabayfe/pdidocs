gs.info("EM - Update Alert History values: started.");
//Column "Open" get "true" value by default. See table definition.
// Set false value for column "open" in case the alert state is "Closed".
var updateOpenColumnGr = new GlideMultipleUpdate("em_alert_history");
updateOpenColumnGr.addQuery("state", "Closed");
updateOpenColumnGr.setValue("open", false);
updateOpenColumnGr.execute();
updateOpenColumnGr.close();


//Column "state_cleared" get "false" value by default. See table definition.
// Set false value for column "state_cleared" in case the alert Severity is one of the member in array.
var updateStateClearedColumnGr = new GlideMultipleUpdate("em_alert_history");
updateStateClearedColumnGr.addQuery("severity", "0");
updateStateClearedColumnGr.setValue("state_cleared", true);
updateStateClearedColumnGr.execute();
updateStateClearedColumnGr.close();
gs.info("EM - Update Alert History values: Done.");
