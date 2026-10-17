(function() {
	var triggerDefinition = new GlideRecord("sys_hub_trigger_definition");
	triggerDefinition.query();
	while (triggerDefinition.next()) {
		if (!triggerDefinition.isValidField("active") || triggerDefinition.getValue("active") == "true")
			continue;
		triggerDefinition.setValue("active", "true");
		triggerDefinition.update();
	}
}());
