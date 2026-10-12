(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	var table = current.getValue('table');
	var legacyFieldName = current.getValue('legacy_field_name');
	var legacyFieldValue = current.getValue('legacy_field_value');
	var legacySubfieldName = current.getValue('legacy_subfield_name');
	var legacySubfieldValue = current.getValue('legacy_subfield_value');
	
	var gr = new GlideRecord('life_cycle_mapping');
	gr.addQuery('table', table);
	gr.addQuery('legacy_field_name', legacyFieldName);
	gr.addQuery('legacy_field_value', legacyFieldValue);
	gr.addQuery('legacy_subfield_name', legacySubfieldName);
	gr.addQuery('legacy_subfield_value', legacySubfieldValue);
	gr.query();
	
	if (gr.next()) {
		if (current.sys_id != gr.getUniqueValue()) {
			gs.addErrorMessage(gs.getMessage("Cannot enter duplicate mapping record for same Table/Legacy Field:Value/Legacy Subfield:Value combination."));
			current.setAbortAction(true);
		}
	}

})(current, previous);
