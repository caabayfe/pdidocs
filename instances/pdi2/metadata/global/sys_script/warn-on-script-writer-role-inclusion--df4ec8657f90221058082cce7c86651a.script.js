(function executeRule(current, previous /*null when async*/ ) {
    var scriptWriterRoleSysId = "af99d5310be312105bf96e1ef777b2b4";

    // Skip the warning for the script writer role itself
    if (current.sys_id == scriptWriterRoleSysId) {
        return;
    }

    var includedRoles = new SNC.RoleManagementAPI().findAllContainedRolesForRole(current.sys_id);
    var isScriptWriterRoleIncluded = includedRoles.contains(scriptWriterRoleSysId);

    if (isScriptWriterRoleIncluded) {
        g_scratchpad.showScriptWriterRoleInclusionWarning = true;
        g_scratchpad.scriptWriterRoleInclusionWarningMsg = gs.getMessage(
            'This role contains the snc_required_script_writer_permission role, which does not block users from running scripts. It is recommended to remove this role and assign it to users via groups instead of role inheritance.'
        );
    }
})(current, previous);
