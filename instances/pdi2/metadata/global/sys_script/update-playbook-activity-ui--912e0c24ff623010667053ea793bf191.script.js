(function executeRule(current, previous /*null when async*/) {
	var RECORD_ACTIVITY_TYPE = 'e12af577871333003058d1a936cb0ba4';
	var EXPERIENCE_TYPE = "experience_type";
	var DEPRECATED = "(DEPRECATED)";
	var model = current.model;
	var currentOperation = current.operation();
	
	var element = current.getValue("element");
	var defaultValue = current.getValue("default_value") || "";
	var label = current.getValue("label") || "";
	var internalReference = current.getValue("internal_type") || "string";
	var reference = current.getValue("reference") || null;
	
	var defaultValueProps = {
		value: defaultValue,
		elementData: {
			type: internalReference
		}
	};
	
	var schemaStructure = {
		"type": "object",
		"properties": {
			"value": {
				"type": "string"
			},
			"elementData": {
				"type": "object",
				"properties": {
					"type": {
						"type": "string"
					}
				}
			}
		}
	};
	
	if(internalReference !== "string") {
		defaultValueProps.displayValue = defaultValue;
		schemaStructure.properties.displayValue = {type: "string"};
	}
	
	if(internalReference === "reference") {
		defaultValueProps.elementData.reference = reference;
		schemaStructure.properties.elementData.properties.reference = {type: "string"};
	}
	
	if(currentOperation === "delete")
		defaultValueProps.label = label + " " + DEPRECATED;
	
	if(currentOperation === "update") {
		var previousDefaultValue = previous.getValue("default_value") || "";
		defaultValueProps.value = previousDefaultValue;
		defaultValueProps.displayValue = previousDefaultValue;
	}
	
	var activityUIGlideRecord = new GlideRecord("sys_playbook_experience_activity_ui");
	var activityUIGlideRecordQuery = activityUIGlideRecord.addQuery(EXPERIENCE_TYPE, model);
	// if model is Record also query for all Blank and Default Activity UIs for update
	if(model.toString() === RECORD_ACTIVITY_TYPE)
		activityUIGlideRecordQuery.addOrCondition(EXPERIENCE_TYPE, "");
	activityUIGlideRecord.query();
	
	while(activityUIGlideRecord.next()) {
		
		// Defensive check to make sure we have valid macroponent props
		var macroponentProps = JSON.parse((activityUIGlideRecord.macroponent && activityUIGlideRecord.macroponent.props).trim() || "[]")[0];
		
		// if macroponentProps are not found then skip iteration
		if(!macroponentProps) 
			continue;
		
		macroponentProps.typeMetadata.schema.properties[element] = schemaStructure;
		macroponentProps.defaultValue[element] = defaultValueProps;

		var sysUXMacroponentGlideRecord = new GlideRecord("sys_ux_macroponent");
		sysUXMacroponentGlideRecord.get(activityUIGlideRecord.macroponent);
		sysUXMacroponentGlideRecord.setValue("props", JSON.stringify([macroponentProps]));
		sysUXMacroponentGlideRecord.update();

		var screenMacroponentConfig = JSON.parse(activityUIGlideRecord.screen && activityUIGlideRecord.screen.macroponent_config);
		
		if(screenMacroponentConfig.experienceProperties && screenMacroponentConfig.experienceProperties.value)
			screenMacroponentConfig.experienceProperties.value[element] = defaultValueProps;
		
	
		var sysUXScreenGlideRecord = new GlideRecord("sys_ux_screen");
		sysUXScreenGlideRecord.get(activityUIGlideRecord.screen);
		sysUXScreenGlideRecord.setValue("macroponent_config", JSON.stringify(screenMacroponentConfig));
		sysUXScreenGlideRecord.update();
	}
	

})(current, previous);
