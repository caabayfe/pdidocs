var gFormAlreadySubmitted = false;

function onSubmit() {
	//Type appropriate comment here, and begin script below
	if(!g_form.getActionName().startsWith('sysverb_update') && g_form.getActionName() != 'sysverb_insert')
		return true;

	var state = g_form.getValue('state');
	if (gFormAlreadySubmitted || state != 'complete' || !showWarning())
		return true;
		
	var inHierarchy = g_scratchpad.base_update_set_id == g_form.getUniqueValue();
	var ga = new GlideAjax('UpdateSetAjax');
	ga.addParam('sysparm_type', 'hasAppInstalls');
	ga.addParam('sysparm_us_sys_id', g_form.getUniqueValue());
	ga.addParam('sysparm_in_hierarchy', inHierarchy);
	ga.getXMLWait();
	var hasAppInstalls = ga.getAnswer();
	if (hasAppInstalls == 'false')
		return;

	var dialog = new GlideModal('complete_with_app_install_confirm');
	dialog.setTitle(new GwtMessage().getMessage('Confirm app install(s)'));
	dialog.setWidth(450);
	dialog.setPreference('onConfirm', onConfirm);
	dialog.setPreference('onCancel', onCancel);
	dialog.setPreference('us_sys_id', g_form.getUniqueValue());
	dialog.setPreference('in_hierarchy', inHierarchy);
	dialog.render();
	return false;
}

function showWarning() {
	var ga = new GlideAjax('UpdateSetAjax');
	ga.addParam('sysparm_type', 'showAppInstallWarning');
	ga.getXMLWait();
	return ga.getAnswer() == 'true';
}

function onConfirm() {
	gFormAlreadySubmitted = true;
	g_form.save();
}

function onCancel() {
	return false;
}
