(function executeRule(current, previous) {
	var GLOBAL_PLAYBOOK_EXPERIENCE_ID = "98e09a560f2200102920c912d4767e1a";
	var GLOBAL_ACTIVITY_UI_SCREEN_COLLECTION = "89ddbb5ac3113010948404186e40dd1d";
	var CUSTOM_ACTIVITY_UI_SCREEN_COLLECTION = "5b1efb5ac3113010948404186e40dd54";
	var BLANK_PLAYBOOK_ACTIVITY_UI = "ecf7ce28ff313010667053ea793bf126";
	var RECORD_EXPERIENCE_TYPE = "e12af577871333003058d1a936cb0ba4";
	var generatedExperienceProperties = null;
	
	// if no ui_template is set, populate with Blank Playbook Activity UI 
	if(!current.ui_template || !current.ui_template.screen || !current.ui_template.screen.macroponent)
		current.ui_template = BLANK_PLAYBOOK_ACTIVITY_UI;
	
	// The UI Template type is blank
	var uiTemplateTypeIsBlank = !(current.ui_template && current.ui_template.experience_type);
	// The Activity UI type is Record
	var activityUITypeIsRecord = current.experience_type.toString() === RECORD_EXPERIENCE_TYPE;
	// The Activity UI type does match the UI Template type
	var activityUITypeMatchesUITemplateType = current.ui_template && (current.experience_type.toString() === current.ui_template.experience_type.toString());
	
	var warnForDifferingExperienceTypes = !uiTemplateTypeIsBlank && !activityUITypeMatchesUITemplateType;
	if (warnForDifferingExperienceTypes) {
		gs.addInfoMessage(gs.getMessage("The selected UI Template has a different Experience Type than you selected. Please ensure all expected properties exist in your Activity UI experience properties"));
	}

	// generate new experience properties if experience type is NOT record and
	// ui_template experience type does not match the current experience type
	if(!(activityUITypeMatchesUITemplateType || (activityUITypeIsRecord && uiTemplateTypeIsBlank)))
		generatedExperienceProperties = generateExperienceProperties(current.experience_type);
    
	var newActivityUIMacroponent = new GlideRecord("sys_ux_macroponent");
    newActivityUIMacroponent.get(current.ui_template.screen.macroponent);
	newActivityUIMacroponent.name = current.name;
	
	// if generated experience properties exist, add them to the props of the macroponent
	if(generatedExperienceProperties)
		newActivityUIMacroponent.props = JSON.stringify([generatedExperienceProperties]);
	
	newActivityUIMacroponent.setValue('sys_policy', null);
	newActivityUIMacroponent.insert();
	
	var newActivityUIVariant = new GlideRecord("sys_ux_screen");
	newActivityUIVariant.get(current.ui_template.screen);
	newActivityUIVariant.macroponent = newActivityUIMacroponent.getUniqueValue();
	newActivityUIVariant.active = false;
	
	// if generated experience properties exist, delete them from the sys_ux_screen
	if(generatedExperienceProperties) {
		var macroponentConfig = JSON.parse(newActivityUIVariant.macroponent_config);
		delete macroponentConfig.experienceProperties;
		newActivityUIVariant.macroponent_config = JSON.stringify(macroponentConfig);
	}
	
	if(current.playbook_experience == GLOBAL_PLAYBOOK_EXPERIENCE_ID) {
		newActivityUIVariant.name = current.name;
		newActivityUIVariant.screen_type = GLOBAL_ACTIVITY_UI_SCREEN_COLLECTION;
	} else {
		newActivityUIVariant.name = current.playbook_experience.name + " - " + current.name;
		newActivityUIVariant.screen_type = CUSTOM_ACTIVITY_UI_SCREEN_COLLECTION;
	}
	
	newActivityUIVariant.setValue('sys_policy', null);
	current.screen = newActivityUIVariant.insert();
	current.macroponent = newActivityUIMacroponent.getUniqueValue();
	
	var variantClientScript = new GlideRecord("sys_ux_client_script");
	variantClientScript.addQuery("macroponent", current.ui_template.screen.macroponent);
	variantClientScript.query();
	
	if (!variantClientScript.hasNext())
		return;
	
	var clientScriptIdMap = {};	
	while (variantClientScript.next()) {
		variantClientScript.macroponent = newActivityUIMacroponent.getUniqueValue();
		var existingClientScriptId = variantClientScript.getUniqueValue();
		variantClientScript.setValue('sys_policy', null);
		var newClientScriptId = variantClientScript.insert();
		clientScriptIdMap[existingClientScriptId] = newClientScriptId;
	}
	
	var finalActivityUIMacroponent = new GlideRecord('sys_ux_macroponent');
	finalActivityUIMacroponent.get(newActivityUIMacroponent.getUniqueValue());
	var finalInternalEventMappings = finalActivityUIMacroponent.getValue('internal_event_mappings');
	var finalData = finalActivityUIMacroponent.getValue('data');
	var finalComposition = finalActivityUIMacroponent.getValue('composition');
	for (var existingId in clientScriptIdMap) {
		var newId = clientScriptIdMap[existingId];
		var regex = new RegExp(existingId, 'g');
		finalInternalEventMappings = finalInternalEventMappings.replace(regex, newId);
		finalData = finalData.replace(regex, newId);
		finalComposition = finalComposition.replace(regex, newId);
	}
	finalActivityUIMacroponent.setValue('internal_event_mappings', finalInternalEventMappings);
	finalActivityUIMacroponent.setValue('data', finalData);
	finalActivityUIMacroponent.setValue('composition', finalComposition);
	finalActivityUIMacroponent.update();
})(current, previous);

function generateExperienceProperties(experienceType) {

	var experiencePropertyRecord = new GlideRecord("sys_pd_activity_type_prop");
	experiencePropertyRecord.addQuery("model", experienceType);
	experiencePropertyRecord.query();

	var experienceProperties = {
		name: "experienceProperties",
		label: "Experience properties",
		description: "Collection of properties for the Activity UI based on the Experience Type",
		fieldType: "json",
		valueType: "object",
		typeMetadata: {
			schema: {
				type: "object",
				properties: {}
			}
		},
		defaultValue: {},
		selectable: false,
		mandatory: false,
		readOnly: false
	};


	while (experiencePropertyRecord.next()) {
		var getElement = experiencePropertyRecord.getValue("element");
		var getDefaultValue = experiencePropertyRecord.getValue("default_value") || "";
		var getLabel = experiencePropertyRecord.getValue("label") || "";
		var getInternalType = experiencePropertyRecord.getValue("internal_type") || "string";
		var getReference = experiencePropertyRecord.getValue("reference") || null;

		experienceProperties.typeMetadata.schema.properties[getElement] = {
			type: "object",
			properties: {
				value: {
					type: "string"
				},
				elementData: {
					type: "object",
					properties: {
						type: {
							type: "string"
						}
					}
				}
			}
		};

		experienceProperties.defaultValue[getElement] = { 
			value: getDefaultValue,
			elementData : {
				type: getInternalType
			} 
		};
		
		if(getInternalType !== "string") {
			experienceProperties.defaultValue[getElement].displayValue = getDefaultValue;
			experienceProperties.typeMetadata.schema.properties[getElement].properties.displayValue = {type: "string"};	
		}
		
		if(getInternalType === "reference") {
			experienceProperties.defaultValue[getElement].elementData.reference = getReference;
			experienceProperties.typeMetadata.schema.properties[getElement].properties.elementData.properties.reference = {type: "string"};
		}
	}

	return experienceProperties;
}
