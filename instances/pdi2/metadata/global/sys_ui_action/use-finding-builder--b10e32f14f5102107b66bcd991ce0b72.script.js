function redirectToPatternBuilder() {
    var projectProcessId = '';
    var findingId = -1;
    var tableName = g_form.getTableName();
    if (tableName === 'promin_automated_finding') {
        if (!g_form.getValue('project')) {
            projectProcessId = g_form.getValue('process_def');
        } else {
            projectProcessId = g_form.getValue('project');
        }
        if (!g_form.isNewRecord()) {
            findingId = g_form.getUniqueValue();
        }
    } else if (tableName === 'promin_project') {
        projectProcessId = g_form.getUniqueValue();
    } else {
        projectProcessId = g_form.getUniqueValue();
    }
    var url = '';
    if (findingId === -1) {
        url = "now/experience/promin/configure-finding-pattern/" + projectProcessId + "/params/pattern-name/";
    } else {
        url = "now/experience/promin/configure-finding-pattern/" + projectProcessId + "/params/finding-id/" + findingId;
    }

    g_navigation.open(url, "_blank");
}
