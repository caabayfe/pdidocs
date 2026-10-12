function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === oldValue)
        return;

    setTargetDocumentTable(newValue, oldValue);
}

/**
 * Auto-populates target_document_table based on action type
 * Clears target_document when type changes to prevent stale references
 */
function setTargetDocumentTable(newType, oldType) {
    var TABLE_MAPPING = {
        'flow_action': 'sys_hub_action_type_definition',
        'subflow': 'sys_hub_flow',
        'scripted_rest_resource': 'sys_ws_operation'
    };

    if (TABLE_MAPPING[newType])
        g_form.setValue('target_document_table', TABLE_MAPPING[newType]);
    else
        g_form.clearValue('target_document_table');

     //By the time we reach this line, we are sure that newType !== oldType
     //So not adding this condition (oldType && newType !== oldType), instead just checking for oldValue
    if (oldType)
        g_form.clearValue('target_document');
}
