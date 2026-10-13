function onSubmit() {
    // Notice there is a supporting business rule as fallback in case this client script is bypassed.
	var selectedMappingTypeValue = g_form.getValue('mapping_type');
	// Mapping type 7 is 'advanced script', so target field validation is not relevant there
    if (selectedMappingTypeValue == '7') {
        return true;
    }
	
    var toFieldValue = g_form.getValue('to_field');

	if (!(toFieldValue) || (toFieldValue == "additional_info")){
		var msg = new GwtMessage().getMessage("Invalid value '{0}' in 'Target field'", toFieldValue);
        g_form.showErrorBox('to_field', msg, true);
		// Prevent submission
        return false;
	}

	var addInfoPrefix = g_scratchpad.field_mapping_add_info_prefix;
	var cmdbCiPrefix = g_scratchpad.field_mapping_ci_prefix;
	var cmdbKeyValuePrefix = g_scratchpad.field_mapping_cmdb_key_value_prefix;

	var notValidPrefixes = [addInfoPrefix, cmdbCiPrefix, cmdbKeyValuePrefix];
	
    for (var i = 0; i < notValidPrefixes.length; i++) {
        var prefix = notValidPrefixes[i];
        if ((prefix) && toFieldValue.startsWith(prefix)) {
            var msg = new GwtMessage().getMessage("Can't use '{0}' prefix in 'Target field'", prefix);
            g_form.showErrorBox('to_field', msg, true);
			
			// Prevent submission
            return false;
        }
    }
    // Allow submission
    return true;
}
