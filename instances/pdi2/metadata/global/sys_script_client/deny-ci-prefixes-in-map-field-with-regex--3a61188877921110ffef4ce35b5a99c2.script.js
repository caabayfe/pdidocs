function onSubmit() {
	
	//Caution: when updating this script be sure to update also "Validate Inputs" business rule

    var selectedMappingTypeValue = g_form.getValue('mapping_type');
    var selectedMappingTypeName = g_form.getOption('mapping_type', selectedMappingTypeValue).innerText || '';

    // Mapping type 5 is 'Map field using regex'
	// In this mapping type source fields may be only fields from additional info
	// no ci prefixes are allowed
    if (selectedMappingTypeValue !== '5') {
        return true;
    }

    var invalidFromFieldPrefix = '';
    var fromFieldValue = g_form.getValue('from_field');

    var cmdbCiPrefix = g_scratchpad.field_mapping_ci_prefix;
    var cmdbKeyValuePrefix = g_scratchpad.field_mapping_cmdb_key_value_prefix;

    if (fromFieldValue.startsWith(cmdbCiPrefix)) {
        invalidFromFieldPrefix = cmdbCiPrefix;
    } else if (fromFieldValue.startsWith(cmdbKeyValuePrefix)) {
        invalidFromFieldPrefix = cmdbKeyValuePrefix;
    }

    if (invalidFromFieldPrefix) {
        var msg = new GwtMessage().getMessage("Can't use '{0}' prefix in 'Source field' for mapping type '{1}'", invalidFromFieldPrefix, selectedMappingTypeName);
        g_form.showErrorBox('from_field', msg, true);

        // Prevent submission
        return false;
    }

    // Allow submission
    return true;

}
