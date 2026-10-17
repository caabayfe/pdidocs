function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (newValue === "true") {
        var sourceType = g_form.getValue('source_type');
        var warningText = getMessage('This activity is allowed to be used in Playbooks with public access. Please ensure that the activity and all corresponding data access is safe to use within an unauthenticated public use case.');
        var runAsWarning = (sourceType === "sys_hub_action_type_definition" ? g_scratchpad.RUN_AS_WARNING_ACTIONS : g_scratchpad.RUN_AS_WARNING_FLOWS);
        var fullMessage = warningText + "<br/><br/>" + runAsWarning + "<br/><br/>" + g_scratchpad.LEARN_MORE_LINK;
        g_form.addInfoMessage(fullMessage);
    } else {
        // this will clear all info messages, not just this one. clearing a specific message is currently unsupported.
        // this is okay for now. may need to update in the future.
        g_form.clearMessages();
    }
}
