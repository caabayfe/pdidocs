function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading) {
        return;
    }

    var mcpServer = g_form.getValue('mcp_server');
    var restrictedModeOptIn = true;

    var gr = new GlideRecord('auth_server_connection');
    gr.addQuery('resource', mcpServer);
    gr.setLimit(1);
    gr.query();
    if (gr.next()) {
        restrictedModeOptIn = gr.restricted_mode_opt_in.toString() === 'true';
    }

    var decision_before = g_form.getValue('decision_type');
    g_form.clearOptions('decision_type');
    if (restrictedModeOptIn) {
        g_form.addOption('decision_type', 'allow', 'Allow If');
        g_form.addOption('decision_type', 'deny_unless', 'Deny Unless');
        g_form.setValue('decision_type', decision_before);
    } else {
        g_form.addOption('decision_type', 'deny_unless', 'Deny Unless');
        if (decision_before === 'allow') {
            g_form.setValue('decision_type', 'deny_unless');
        }
    }

}
