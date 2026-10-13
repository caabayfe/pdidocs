function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    var supportedFieldMappingTypesWithRunAfterBinding = {
        1: ' ', // Map field and transform value (single field)
        3: ' ', // Map field (copy field)
        4: ' ', // Map field and transform value using regex
        6: ' ', // Map field using regex
        7: ' ', // Advanced mapping using script
        8: ' ', // Map field from reference table
    };

    var defaultMessage = "{0}Use event field mappings rules to map values from specific fields to values in other fields.{2}Choose the mapping type for the mechanism used to change an event field value.{1}";

    // Mapping type choice list descriptions
    var singleFieldMessage = "{0}{2}Map field and transform value (Single field){3} - Mapping rule that transforms specific values from a single event field to another event field.{1}{4}";
    var constantFieldMessage = "{0}{2}Create or update field and set constant value (Constant){3} - Mapping rule that sets a constant value to a new field.{1}{4}";
    var copyFieldMessage = "{0}{2}Map field (Copy field){3} - Mapping rule that copies the exact value of a field to the specified mapped field.{1}{4}";
    var singleFieldRegexMessage = "{0}{2}Map field and transform value using regex{3} - Mapping rule that transforms a regular expression (regex) to a new value and maps it to a different field.{1}{4}";
    var copyFieldRegexMessage = "{0}{2}Map field using regex{3} - Mapping rule that copies the exact value of a regular expression (regex) to a new field.{1}{4}";
    var groupFieldRegexMessage = "{0}{2}Map field and copy value from regex group{3} - Mapping rule that copies the exact value of a regular expression (regex) group to a new field.{1}{4}";
    var advancedScriptMessage = "{0}{2}Advanced mapping using script{3} - Script to implement an advanced mapping rule.{1}{4}";
    var copyFieldFromReferenceTable = "{0}{2}Map field from reference table{3} - Mapping rule that copies the exact value of a reference table field to the specified mapped field.{1}{4}";

    // Run after binding descriptions
    var runAfterBindingMessage = "{0}When the flag 'Run after binding' is set to true the rule is executed after the CI binding phase.{1}{2}";
    var cmdbPrefixMessage = (newValue == '8') ? "EvtMgmtEventFieldMappingCiExplanationInFormForMapFromReferenceTable" : "EvtMgmtEventFieldMappingCiExplanationInForm";

    var mappingTypeToMessage = {
        '1': singleFieldMessage,
        '2': constantFieldMessage,
        '3': copyFieldMessage,
        '4': singleFieldRegexMessage,
        '5': copyFieldRegexMessage,
        '6': groupFieldRegexMessage,
        '7': advancedScriptMessage,
        '8': copyFieldFromReferenceTable
    };

    // Get translated messages
    var gwt = new GwtMessage();
    var translationKeys = [singleFieldMessage, constantFieldMessage, copyFieldMessage, singleFieldRegexMessage, copyFieldRegexMessage, groupFieldRegexMessage, advancedScriptMessage, copyFieldFromReferenceTable, runAfterBindingMessage, cmdbPrefixMessage, defaultMessage];
    var translationMap = gwt.getMessages(translationKeys);

    function getTranslatedMessageForMappingType(mappingTypeValue) {
        if (mappingTypeValue == '') {
            // Default message
            return gwt.format(translationMap[defaultMessage], '<span>', '</span>', '<br/>');
        }
        // Add mapping type description
        var message = gwt.format(translationMap[mappingTypeToMessage[newValue]], '<span>', '</span>', '<strong>', '</strong>', '<br/>');

        // Show the post binding explanation when the feature is enabled
        var isFieldMappingRunAfterBindingEnabled = g_scratchpad && (g_scratchpad.field_mapping_run_after_binding == "true");
        if (isFieldMappingRunAfterBindingEnabled) {
            // Show the post binding explanation if the mapping type support it.
            if (supportedFieldMappingTypesWithRunAfterBinding[newValue]) {
				if (newValue != '7') {
                	message += gwt.format(translationMap[runAfterBindingMessage], '<span>', '</span>', '<br/>');
                	// Don't show the cmdbPrefix if the mapping type is 'Advanced mapping using script'
                
                    var ciPrefix = g_scratchpad.field_mapping_ci_prefix;
                    var cmdbKeyValPrefix = g_scratchpad.field_mapping_cmdb_key_value_prefix;
                    message += gwt.format(translationMap[cmdbPrefixMessage], '<span>', '</span>', '<strong>', '</strong>', '<a href="/cmdb_key_value_list.do" target="_blank">', '</a>', ciPrefix, cmdbKeyValPrefix, '<br/>');
                }

            }
        }
        return message;
    }

    var messageElement = g_form.getFormElement().querySelector('#mappingTypeBanner');
    if (!messageElement)
        return;

    // Display message on load
    if (isLoading || newValue === '') {
        var currentValue = g_form.getValue('mapping_type');
        messageElement.innerHTML = getTranslatedMessageForMappingType(currentValue);
        return;
    }
    // Display message on change
    messageElement.innerHTML = getTranslatedMessageForMappingType(newValue);

}
