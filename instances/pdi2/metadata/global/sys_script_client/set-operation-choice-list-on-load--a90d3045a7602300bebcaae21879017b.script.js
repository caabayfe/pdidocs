function onLoad() {
    g_scratchpad.setOperationChoices = function(targetType) {
        g_form.clearOptions('operation');
        g_form.addOption('operation', '', 'None');

        if (targetType == 1 && g_form.getValue('target_scope') == 'global') {
            g_form.addOption('operation', 'read', 'Read');
        } else if (targetType == 1) { // Table
            g_form.addOption('operation', 'delete', 'Delete');
            g_form.addOption('operation', 'read', 'Read');
            g_form.addOption('operation', 'write', 'Write');
            g_form.addOption('operation', 'create', 'Create');
        } else if (targetType == 2) { // Script Include
            g_form.addOption('operation', 'execute', 'Execute API');
        } else if (targetType == 3) { // Scope (Normally hidden, but these are the permitted operations)
            g_form.addOption('operation', 'delete', 'Delete');
            g_form.addOption('operation', 'read', 'Read');
            g_form.addOption('operation', 'write', 'Write');
            g_form.addOption('operation', 'create', 'Create');
        } else if (targetType == 4) { // Event
            g_form.addOption('operation', 'write', 'Write');
        } else if (targetType == 5) { // Column
            g_form.addOption('operation', 'read', 'Read');
            g_form.addOption('operation', 'write', 'Write');
        }
    };

    var choice = g_form.getValue('operation');
    g_scratchpad.setOperationChoices(g_form.getValue('target_type'));
    g_form.setValue('operation', choice);
}
