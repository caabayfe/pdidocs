//This job monitors the virtual alerts for tag-based groups feature's activation and for tag-based rules it changes the value of 
//the generate_virtual_alerts column in the em_alert_correlation_rule table to be true 
//if the feature is enabled or to false otherwise.

var script = new EvtMgmtMigrateTagBasedCorrelationRules();
script.migrate();
