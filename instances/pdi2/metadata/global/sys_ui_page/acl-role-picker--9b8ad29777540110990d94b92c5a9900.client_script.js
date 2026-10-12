function onOK() {
    var targetACLRoleID = gel('target_acl_role_pick').value;
    if (!targetACLRoleID) {
        var errMsgEl = $j("#err_message");
        errMsgEl.html("${gs.getMessage('Select a valid user role to auto create Access Control')}");
        errMsgEl.css("display", "block");
        return false;
    }

    addHidden(g_form.getFormElement(), 'sysparm_acl_role_pick', targetACLRoleID);
    gsftSubmit(null, g_form.getFormElement(), GlideModal.get().getPreference('sysparm_action_name'));
    return true;
}

function clearErr() {
    var errMsgEl = $j("#err_message");
    errMsgEl.html("");
    errMsgEl.css("display", "none");
}
