function onSubmit() {
	var gr = new GlideRecord("sys_security_machine_identity_access_control");
	gr.addQuery("internal_name", getInternalName());
	gr.query();
	if (!gr.next())
		return true;
	if (!isActionInsert(g_form.getActionName()) && gr.sys_id == g_form.getUniqueValue())
		return true;
	g_form.addErrorMessage(getMessage("Machine Identity Access Control with the same name and scope already exists. To proceed, change name or scope."));
	return false;
}

// Check if any the action is some form of insert
function isActionInsert(action) {
    return (action == 'sysverb_insert' || action == 'sysverb_insert_and_stay' || action == 'sys_security_acl_insert_with_roles');
}

function getInternalName() {
	var scope = g_form.getValue("sys_scope");
	if (!scope)
		scope = 'global';
	var internalName = g_form.getValue("name");
	if (internalName) {
		internalName = internalName.replace(/\s+/g, '_');
		return scope + '_' + internalName;
	}
	return '';
}
