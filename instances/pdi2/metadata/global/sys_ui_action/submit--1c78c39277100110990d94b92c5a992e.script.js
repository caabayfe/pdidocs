function openRolePickerForClientCallableOrMobileCallableSI() {
    if ((g_form.getValue("client_callable") === "false" && g_form.getValue("mobile_callable") === "false")
		|| g_scratchpad.enable_acl_create_ux === "false") {
        gsftSubmit(null, g_form.getFormElement(), "sysverb_insert");
        return;
    }

    // We are here then a client callable or mobile callable script include is attempt to be created. Pick a role for ACL
    var qb_dialog = new GlideModal('acl_role_picker');
    qb_dialog.setTitle(getMessage('Select a user role'));
	var msg;
	if (g_form.getValue("client_callable") === "true")
		msg = getMessage('Select a user role for Access Control on this Client Callable Script Include');
	else if (g_form.getValue("mobile_callable") === "true")
		msg = getMessage('Select a user role for Access Control on this Mobile Callable Script Include');

    qb_dialog.setPreference('sysparm_role_picker_label', msg);
    qb_dialog.setPreference('sysparm_action_name', 'sysverb_insert');
    qb_dialog.render();
}
