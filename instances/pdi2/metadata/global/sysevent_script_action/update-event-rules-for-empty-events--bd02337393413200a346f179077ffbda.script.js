var erm = new SNC.EventRuleManager();
erm.checkAndUpdateEmptyEventsPerRule(current.sys_id, current.event_class); //event_class is the source

// update 'em_event_rule_calculation' flag to true
var gr = new GlideRecord("em_event_rule_calculation");
gr.addQuery("name", "empty_events_calculation");
gr.query();
if (gr.next()) {
	gr.setValue("value", "0");
	gr.update();
}
