function onLoad() {
    if (g_form.getValue('search_engine') == 'zing') {
        var ga = new GlideAjax('WorkspaceSearchConfigurationService');
        ga.addParam("sysparm_name", "getWorkspacesBySearchAppConfigID");
        ga.addParam("sysparm_sac_id", g_form.getUniqueValue());
        ga.getXMLAnswer(function(answer) {
            var workspacesUsingThisSAC = JSON.parse(answer).map(function(workspace) {
                return workspace.name;
            });
            if (workspacesUsingThisSAC.length > 0) {
                var linkedWorkspaces = workspacesUsingThisSAC.join(', ');
                var fieldMessage = formatMessage(getMessage('This field is not used by workspaces and global search that use Zing. Use the sys_aw_global_search_config table to set the suggestions limit for any of the following: {0}'), linkedWorkspaces);
                g_form.showFieldMsg('suggestions_to_show_limit', fieldMessage);
            }
        });
    }
}
