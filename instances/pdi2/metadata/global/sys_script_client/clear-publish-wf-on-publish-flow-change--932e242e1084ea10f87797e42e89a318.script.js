function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
	if(!g_scratchpad.isKBWorkflowActive) return;

    g_form.clearValue('workflow');
    g_form.clearValue('retire_workflow');
    g_form.clearMessages();
    if (!g_form.getValue('kb_retire_flow')) {
        g_form.addInfoMessage(getMessage("To create or update a record, select a corresponding retire flow for the publish flow you selected."));
    }
}
