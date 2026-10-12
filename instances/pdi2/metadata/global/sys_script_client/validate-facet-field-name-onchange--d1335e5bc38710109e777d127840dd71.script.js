function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
		return;
	}
	//Get Search Profile sys_id
	var config_id = g_form.getValue('search_context_config');	
	var gr = new GlideRecord('sys_search_context_config');
	gr.get(config_id);
	var profile_id = gr.search_profile;

	//Call script includes to check if valid Facet Field name
	var ga = new GlideAjax('ValidateFacets');
	ga.addParam('sysparm_name', 'validate_facet_field');
	ga.addParam('sysparm_facet_field', newValue);
	ga.addParam('sysparm_search_profile', profile_id);
	ga.getXMLAnswer(updateField);
	
	function updateField (answer) {
		g_form.removeDecoration('ais_facet_name', 'icon-check-circle', 'Valid','color-green');
		var answerList = answer.split(":");
		if (answerList[0] === "table_error") {
			g_form.showErrorBox('ais_facet_name', nowapi.g_i18n.format("{p1}: \"{p2}\". {p3}", {p1: getMessage("Invalid Table name"), p2: answerList.length > 1 ? answerList[1] : "", p3: getMessage("Please ensure that the table is defined in the current search profile's search sources.") }));
		}
		else if (answerList[0] === "field_error") {
			g_form.showErrorBox('ais_facet_name', nowapi.g_i18n.format("{p1}: \"{p2}\". {p3}: \"{p4}\"", {p1: getMessage("Invalid Field name"), p2: answerList.length > 2 ? answerList[2] : "", p3: getMessage("Please ensure that the field is defined in the supplied table"), p4: answerList.length > 1 ? answerList[1] : ""}));
		}
		else if (answerList[0] === "string_error") {
			g_form.showErrorBox('ais_facet_name', getMessage("Invalid Format. Please ensure the Facet Field is in the format: '[table name].[field name]' such as 'sys_user.name'"));
		}
		else if (answerList[0] === "inconsistent_field_types") {
			g_form.showErrorBox('ais_facet_name', getMessage("Inconsistent field types. Please ensure the Facet Fields have same type"));
		}
		else {
			g_form.addDecoration('ais_facet_name', 'icon-check-circle', 'Valid','color-green');
		}
	}
	
   
}
