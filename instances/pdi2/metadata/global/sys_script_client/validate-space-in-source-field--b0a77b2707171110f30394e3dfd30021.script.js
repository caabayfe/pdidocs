function onSubmit() {

    //Caution: when updating this script be sure to update also "Validate Inputs" business rule

    var selectedMappingTypeValue = g_form.getValue('mapping_type');
    // Mapping type 2 is 'Create or update field and set constant value (Constant) ', type 7 is 'Advanced mapping using script'
    // In "Constant" mapping type there is no source field
    // in "Advanced script" source and target fields are not relevant 
    if (selectedMappingTypeValue == '2' || selectedMappingTypeValue == '7') {
        return true;
    }

    var fromField = 'from_field';
    var fromFieldLabel = 'Source field';

    // When mapping type is 'Map field from reference table', CI field will be present in 'Matching alert field'. 
    if (selectedMappingTypeValue == '8') {
        fromField = 'alert_field';
        fromFieldLabel = 'Matching alert field';
    }

    var valueToCheck = g_form.getValue(fromField);
    var cmdbKeyValuePrefix = g_scratchpad.field_mapping_cmdb_key_value_prefix;

    var sourceFieldStartsWithCmdbKeyValuePrefix = (cmdbKeyValuePrefix) && valueToCheck.startsWith(cmdbKeyValuePrefix);

    if (!sourceFieldStartsWithCmdbKeyValuePrefix && (valueToCheck.includes(' .') || valueToCheck.includes('. '))) {
        var msg = new GwtMessage().getMessage("'{0}' cannot contain space", [fromFieldLabel]);
        g_form.showErrorBox(fromField, msg, true);
        // Prevent submission
        return false;
    }
    return true;
}
