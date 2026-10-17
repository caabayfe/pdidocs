function onChange(control, oldValue, newValue, isLoading, isTemplate) {

	var loadExisting = false;
	if (isLoading && oldValue !== '') {
		// Loading a form
		loadExisting = true;
		g_scratchpad.isAutoCalculating = true;
	}
	
	// Grab the legacy field name
	var legacyFieldName = g_form.getValue('legacy_field_name');
	if (loadExisting) {
		legacyFieldName = oldValue;
	}

	// Grab the table name
	var tableName = g_form.getValue('table');
	var ga = new GlideAjax('GetChoices'); //Call script include to escape text
	ga.addParam('sysparm_name','getChoiceOptions');
	ga.addParam('sysparm_table_name', tableName);
	ga.addParam('sysparm_field_name', legacyFieldName);
	ga.addParam('sysparm_fetch_subfield', true);
	ga.getXML(parseChoices);
	
	function parseChoices(response) {
		var answer = response.responseXML.documentElement.getAttribute("answer");
		var result = JSON.parse(answer);
		if (result == null)
			return;

		var existingFieldValue =  g_form.getValue('legacy_field_value');
		
		g_form.clearOptions('legacy_field_value');
		for (var i = 0; i < result.choices.length; i++) {
			g_form.addOption('legacy_field_value', '' + result.choices[i].value, result.choices[i].label);
		}
		
		if (loadExisting) {
			g_form.setValue('legacy_field_value', existingFieldValue);
		}
		
		// Also handle subfield
		if (result.subFields.length > 0) {
			
			// Revert readonly flag
			g_form.setReadOnly('legacy_subfield_name', false);
			g_form.setReadOnly('legacy_subfield_value', false);
			
			var existingSubfieldName =  g_form.getValue('legacy_subfield_name');
			
			g_form.clearOptions('legacy_subfield_name');
			g_form.addOption('legacy_subfield_name', '', '--None--');
			for (var j = 0; j < result.subFields.length; j++) {
				g_form.addOption('legacy_subfield_name', result.subFields[j].value, result.subFields[j].label);
			}
			
			if (loadExisting) {
				g_scratchpad.isAutoCalculating = false;
				g_form.setValue('legacy_subfield_name', existingSubfieldName);
			} 
		} else {
			g_form.clearOptions('legacy_subfield_name');
			g_form.clearOptions('legacy_subfield_value');
			g_form.setReadOnly('legacy_subfield_name', true);
			g_form.setReadOnly('legacy_subfield_value', true);
		}
	}	
}
