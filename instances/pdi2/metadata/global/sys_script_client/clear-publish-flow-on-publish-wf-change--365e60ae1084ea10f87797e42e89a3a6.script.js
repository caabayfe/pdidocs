function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
	if(!g_scratchpad.isKBWorkflowActive) return;

    g_form.clearValue('kb_publish_flow');
    g_form.clearValue('kb_retire_flow');
    g_form.clearMessages();
    if (!g_form.getValue('retire_workflow')) {
        g_form.addInfoMessage(getMessage("To create or update a record, select a corresponding retire workflow for the publish workflow you selected."));
    }
}
