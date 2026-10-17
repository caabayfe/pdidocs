function onLoad() {
	if (g_form.isNewRecord()) return;
	var sortField = g_form.getValue('ais_field_name');
	
	// get search profile
	var configID = g_form.getValue('search_context_config');	
	var gr = new GlideRecord('sys_search_context_config');
	gr.get(configID);
	var profileID = gr.search_profile;
	
	// call our to check field validity
	var ga = new GlideAjax('ValidateSortOption');
	ga.addParam('sysparm_name', 'validateSortField');
	ga.addParam('sysparm_sort_field', sortField);
	ga.addParam('sysparm_search_profile', profileID);
	ga.getXMLAnswer(updateField);
	
	function updateField (answer) {
		g_form.removeDecoration('ais_field_name', 'icon-check-circle', 'Valid','color-green');
		if (answer === "table_error") {
			g_form.showErrorBox('ais_field_name', nowapi.g_i18n.format("{p1}: \"{p2}\". {p3}", {p1: getMessage("Invalid Table name"), p2: newValue.split('.')[0], p3: getMessage("Please ensure that the table is defined in the current search profile's search sources.") }));
		} else if (answer === "field_error") {
			g_form.showErrorBox('ais_field_name', nowapi.g_i18n.format("{p1}: \"{p2}\". {p3}: \"{p4}\"", {p1: getMessage("Invalid Field name"), p2: newValue.split('.')[1], p3: getMessage("Please ensure that the field is defined in the supplied table"), p4:  newValue.split('.')[0]}));
		} else if (answer === "string_error") {
			g_form.showErrorBox('ais_field_name', getMessage("Invalid Format. This is neither a supported common field nor a table field. Please ensure the Sort Field is in the format: '[table name].[field name]' such as 'sys_user.name'"));
		} else if (answer === "no_index") {
			g_form.showErrorBox('ais_field_name', getMessage("Field is not indexed by AI Search. Please check the Field Mappings in the Indexed Source."));
		} else if (answer === "type_error") {
			g_form.showErrorBox('ais_field_name', getMessage("Field is not sortable. Please use a field with type string, number, or date."));
		} else if (answer === "disallowed_field") {
			g_form.showErrorBox('ais_field_name', getMessage("Field is not sortable. This field is excluded from sorting, likely due to its length or complexity."));
		} else {
			g_form.addDecoration('ais_field_name', 'icon-check-circle', 'Valid','color-green');
		}
	}
}
