function onLoad() {
    if (g_scratchpad.versioning.enabled && (g_form.getValue('workflow_state') == 'published')) {
        var editableFieldsMap = g_scratchpad.versioning.editableFieldsMap;
        if (editableFieldsMap && editableFieldsMap.hasOwnProperty('attachments'))
            g_form.enableAttachments();
    }
}
