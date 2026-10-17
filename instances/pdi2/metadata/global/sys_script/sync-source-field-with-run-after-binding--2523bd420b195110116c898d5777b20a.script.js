(function executeRule(current, previous /*null when async*/ ) {
    if (!current || current.isActionAborted()) return;

    /**
		Verifies that:
        1. CI prefixes are not exist when the rule is not "Run after binding"
		2. If the is "Run after binding" and there are prefixes then there a non - empty key / field name was provided
		
		* Violations in any of the above cancels the form submission.
		* Notice that there's also a Client Script for the same purpose.
    **/

    var eventRuleUtil = new EventRuleUtil();

    // If the feature is disabled then don't prevent using CI prefixes
    var isRunAfterBindingEnabled = eventRuleUtil.isFieldMappingRunAfterBindingEnabled();
    if (!isRunAfterBindingEnabled)
        return;

    // The mapping type 'Script' has no 'Source field' therefore the check is irrelevant
    if (current.getValue('mapping_type') == "7")
        return;

    // The mapping type 'Map field using regex' is using only additional info fields therefore the check is irrelevant
    if (current.getValue('mapping_type') == "5")
        return;


    // Get the field mapping's "Run after binding value" and "From field" value
    var runAfterBindingCheckboxValue = current.getValue('run_after_binding');

    var fromFieldName = 'from_field';
    var fromFieldLabel = 'Source field';

    // When mapping type is 'Map field from reference table', we need to look 'alert_field' value 
    // for CI prefixes instead of 'from_field'
    if (current.getValue('mapping_type') == "8") {
        fromFieldName = 'alert_field';
        fromFieldLabel = 'Matching alert field';
    }

    var fromFieldValue = current.getValue(fromFieldName);
    var fromFieldObj = eventRuleUtil.getFieldMappingFromFieldObject(fromFieldValue);

    var cmdbCiPrefix = eventRuleUtil.getFieldMappingFromFieldCmdbCiPrefix();
    var cmdbKeyValuePrefix = eventRuleUtil.getFieldMappingFromFieldCmdbKeyValuePrefix();

    // Extract the prefix from "From field" or "Alert field", if exists
    var fromFieldPrefix;

    switch (fromFieldObj.prefix) {
        case cmdbCiPrefix:
            fromFieldPrefix = cmdbCiPrefix;
            break;
        case cmdbKeyValuePrefix:
            fromFieldPrefix = cmdbKeyValuePrefix;
            break;
        default:
            fromFieldPrefix = '';
    }

    // Abort action if the rule is not a "Run after binding" rule but it contains a CI prefix
    if (runAfterBindingCheckboxValue == "0" && fromFieldPrefix) {
        gs.addErrorMessage(gs.getMessage("The 'Run after binding' checkbox must be checked when '{1}' contains the '{0}' prefix.", [fromFieldPrefix, fromFieldLabel]));
        current.setAbortAction(true);
    }

    // If the field value is left empty after the prefix is removed from it then abort action
    if (runAfterBindingCheckboxValue == "1" && !fromFieldObj.field) {
        current.setAbortAction(true);
        gs.addErrorMessage(gs.getMessage("The '{0}' must include more than only a prefix when the 'Run after binding' checkbox is checked.", [fromFieldLabel, fromFieldObj.prefix]));
    }
})(current, previous);
