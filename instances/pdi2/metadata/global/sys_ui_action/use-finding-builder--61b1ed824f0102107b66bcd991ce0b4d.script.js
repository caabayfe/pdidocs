function redirectToRuleBasedPatternBuilder() {
    var projectProcessId = '';
    var findingType = '';
    var findingId = -1;
    var tableName = g_form.getTableName();

    switch (tableName) {
        case 'promin_finding_def':
            if (!g_form.getValue('project')) {
                projectProcessId = g_form.getValue('process_def');
                findingType = 'process';
            } else {
                projectProcessId = g_form.getValue('project');
                findingType = 'project';
            }
            if (!g_form.isNewRecord()) {
                findingId = g_form.getUniqueValue();
            }
            break;
        case 'promin_project':
            projectProcessId = g_form.getUniqueValue();
            findingType = 'project';
            break;
        case 'promin_process_def':
            projectProcessId = g_form.getUniqueValue();
            findingType = 'process';
            break;
    }

    var url = '';
    if (findingId !== -1) {
        url = "now/experience/promin/rule-based-finding-setup/" + findingType.toUpperCase() + "/" + projectProcessId + "/params/finding-def-id/" + findingId;
    } else {
        url = "now/experience/promin/rule-based-finding-setup/" + findingType.toUpperCase() + "/" + projectProcessId;
    }
    g_navigation.open(url, "_blank");
}
