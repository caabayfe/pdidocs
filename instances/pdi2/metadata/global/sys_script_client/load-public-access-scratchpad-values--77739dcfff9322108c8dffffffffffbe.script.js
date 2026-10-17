function onLoad() {
    // Use g_scratchpad instead of window for storing values
    g_scratchpad.publicAccessOldValue = g_form.getValue('public_access');
    g_scratchpad.publicAccessConfirmed = false;

    // labels that are shared across public access confirmation modal and banner
    g_scratchpad.LEARN_MORE_LINK = getMessage('<a href="/api/now/v1/context_doc_url/public-access-playbooks" target="_blank">Learn More</a>');
    g_scratchpad.RUN_AS_WARNING_FLOWS = getMessage("Warning: This activity's automation will execute as a dedicated Playbook Automation Runner user with limited access. For any additional access, use the 'Run with Roles' feature in Flow Designer.");
    // could concat, but just in case space between sentences doesn't get translated, duplicating the whole thing.
    g_scratchpad.RUN_AS_WARNING_ACTIONS = getMessage("Warning: This activity's automation will execute as a dedicated Playbook Automation Runner user with limited access. For any additional access, use the 'Run with Roles' feature in Flow Designer. Flow Actions can be wrapped in a subflow.");
}
