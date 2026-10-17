function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	
	if (isLoading || newValue === '' || g_scratchpad.isAutoCalculating === true) {
		return;
	}	
 
	var loadExisting = false;
	if (oldValue === newValue) {
		// Loading a form
		loadExisting = true;
	}	
	
	// Grab the legacy subfield value
	var existingSubfieldValue = g_form.getValue('legacy_subfield_value');
	
	if (!loadExisting)
		g_form.clearOptions('legacy_subfield_value');	
	
	var legacySubfieldName = g_form.getValue('legacy_subfield_name'); 
	
	if (legacySubfieldName) {
		
		var legacyFieldValue = g_form.getValue('legacy_field_value');
		
		// Grab the table name
		var tableName = g_form.getValue('table');
		var ga = new GlideAjax('GetChoices'); //Call script include to escape text
		ga.addParam('sysparm_name','getChoiceOptions');
		ga.addParam('sysparm_table_name', tableName);
		ga.addParam('sysparm_field_name', legacySubfieldName);
		ga.addParam('sysparm_fetch_subfield', false);
		ga.addParam('sysparm_dependent_value', legacyFieldValue );
		ga.getXML(parseChoices);
		
		function parseChoices(response) {
			g_form.addOption('legacy_subfield_value', "", getMessage("-- None --"));
			var answer = response.responseXML.documentElement.getAttribute("answer");
			var result = JSON.parse(answer);
			for (var i = 0; i < result.choices.length; i++) {
				g_form.addOption('legacy_subfield_value', result.choices[i].value, result.choices[i].label);
			}
			
			if (loadExisting) { 
				g_form.setValue('legacy_subfield_value', existingSubfieldValue);
			} 
		}
   }
}
