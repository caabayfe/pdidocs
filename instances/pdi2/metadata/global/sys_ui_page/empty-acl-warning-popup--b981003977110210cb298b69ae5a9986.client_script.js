function onOK() {
	var targetRoleID = gel('target_role_pick').value;
	var targetSAID = gel('target_security_attribute_pick').value;

	if (targetRoleID) {
		var ga = new GlideAjax('EmptyACLWarningPopupRoleInserter');
		ga.addParam('sysparm_name', 'insertRole');
		ga.addParam('sysparm_aclSysId', g_form.getUniqueValue());
		ga.addParam('sysparm_roleSysId', targetRoleID);
		ga.getXML(callback);
	}

	if (targetSAID) {
		g_form.setValue('local_or_existing', 'Existing');
		g_form.setValue('security_attribute', targetSAID);
	}

	GlideModal.get().destroy();
	return true;
}

function callback(response) {
	GlideList2.getByName('sys_security_acl.sys_security_acl_role.sys_security_acl').refresh();
}

function onCancel() {
	GlideModal.get().destroy();
	return false;
}

function clearErr() {
	var errMsgEl = $j("#err_message");
	errMsgEl.html("");
	errMsgEl.css("display", "none");
}
