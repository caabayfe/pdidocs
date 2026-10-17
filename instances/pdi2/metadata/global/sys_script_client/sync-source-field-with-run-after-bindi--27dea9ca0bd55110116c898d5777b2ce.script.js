function onSubmit() {

    //Caution: when updating this script be sure to update also "Sync Source field with Run after binding" business rule

    var runAfterBindingEnabled = g_scratchpad.field_mapping_run_after_binding;
    if (!runAfterBindingEnabled)
        return true; // Allow submission if the post binding feature is disabled

    var fromFieldName = 'from_field';
    var fromFieldLabel = 'Source field';

    var mappingType = g_form.getValue('mapping_type');

    // DEF0395871: When mapping type is 'Advance mapping using script', we don't have 'Source field' hence no need of validation
    if (mappingType === '7')
        return true;

    // When mapping type is 'Map from reference table', ci field can be used
    // for joining on reference table. Matching alert field to join reference table is alert_field
    if (mappingType === '8') {
        fromFieldName = 'alert_field';
        fromFieldLabel = 'Matching alert field';
    }

    // Get submitted form values
    var runAfterBindingRule = g_form.getBooleanValue('run_after_binding');
    var fromFieldValue = g_form.getValue(fromFieldName);

    var cmdbCiPrefix = g_scratchpad.field_mapping_ci_prefix;
    var cmdbKeyValuePrefix = g_scratchpad.field_mapping_cmdb_key_value_prefix;

    // Extract the prefix from "From field", if exists
    var fromFieldPrefix = '';
    if (fromFieldValue.startsWith(cmdbCiPrefix))
        fromFieldPrefix = cmdbCiPrefix;
    else if (fromFieldValue.startsWith(cmdbKeyValuePrefix)) {
        fromFieldPrefix = cmdbKeyValuePrefix;
    }

    // Init message
    g_form.hideFieldMsg(fromFieldName, true);

    var msg;
    // If a prefix exists but the rule is not checked as "Run after binding"
    if (!runAfterBindingRule && fromFieldPrefix) {
        if (g_form.isFieldVisible('run_after_binding'))
            msg = new GwtMessage().getMessage("The 'Run after binding' checkbox must be checked when '{1}' contains the '{0}' prefix.", fromFieldPrefix, fromFieldLabel);
        else
            msg = new GwtMessage().getMessage("The '{0}' prefix is not supported for the selected mapping type.", fromFieldPrefix);
    } else if (runAfterBindingRule) {
        fromFieldValue = fromFieldValue.substring(fromFieldPrefix.length);

        // If the rule is checked as "Run after binding" but there is only a prefix, without a following field
        if (!fromFieldValue) {
            msg = new GwtMessage().getMessage("The '{0}' must include more than only a prefix when the 'Run after binding' checkbox is checked.", fromFieldLabel);
        }
    }

    if (msg) {
        g_form.showErrorBox(fromFieldName, msg, true);
        // Prevent submission
        return false;
    }

    // Allow submission
    return true;
}
