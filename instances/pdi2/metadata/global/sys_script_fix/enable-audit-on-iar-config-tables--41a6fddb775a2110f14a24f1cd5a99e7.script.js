var tablesList = ["sys_cs_auto_resolution_configuration",
				"sys_cs_auto_resolution_configuration_language",
				"sys_cs_auto_resolution_intent_topic_map",
				"sys_cs_auto_resolution_reminder",
				"sys_cs_auto_resolution_response_channel",
				"sys_cs_auto_resolution_simulation_configuration"];
enabledAudit();

function enabledAudit() {
	gs.info("Executing IAR fix script: Starting enabling audit on IAR config tables " + tablesList);
	var gr = new GlideRecord('sys_dictionary');
	gr.addQuery('name', 'IN', tablesList);
	gr.addQuery('internal_type', 'collection');
	gr.addQuery("audit", false);

	gr.setValue("audit", true);
	gr.updateMultiple();
	gs.info("Executing IAR fix script: Ending enabling audit on IAR config tables");
}
