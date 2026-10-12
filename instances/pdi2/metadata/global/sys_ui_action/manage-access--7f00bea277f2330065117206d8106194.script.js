function openACL() {
    if (typeof g_form == 'undefined' && typeof g_sysId == 'undefined') {
        jslog('Unable to determine record sys_id');
        return;
    }

    var id = typeof g_sysId != 'undefined' ? g_sysId : g_form.getUniqueValue();

    var workspaceGa = new GlideAjax('WorkspaceAdminHelper');
    workspaceGa.addParam('sysparm_name', 'getWorkspaceAclId');
    workspaceGa.addParam('sysparm_workspace_id', id);
    workspaceGa.getXML(openResult);

    function openResult(response) {
        var aclId = response.responseXML.documentElement.getAttribute('answer');

        if (!aclId) {
            jslog('Unable to determine ACL record sys_id');
            return;
        }

        var url = '/sys_security_acl.do?sys_id=' + aclId;
        g_navigation.openPopup(url);
    }
}
