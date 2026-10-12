function openWorkspace() {
    if (typeof g_form == 'undefined' && typeof g_sysId == 'undefined') {
        jslog('Unable to determine record sys_id');
        return;
    }

    var id = typeof g_sysId != 'undefined' ? g_sysId : g_form.getUniqueValue();

    var workspaceGa = new GlideAjax('WorkspaceAdminHelper');
    workspaceGa.addParam('sysparm_name', 'getWorkspaceUrl');
    workspaceGa.addParam('sysparm_workspace_id', id);
    workspaceGa.getXML(openResult);

    function openResult(response) {
        var url = response.responseXML.documentElement.getAttribute('answer');
        if (!url)
            return;

        g_navigation.openPopup(url);
    }
}
