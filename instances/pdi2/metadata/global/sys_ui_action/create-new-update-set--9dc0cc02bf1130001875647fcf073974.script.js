function doIt() {
	var sysId = typeof rowSysId == 'undefined' || rowSysId == null ? gel('sys_uniqueValue').value : rowSysId;
	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
	var dd = new dialogClass("create_update_set_dialog");
	dd.setTitle(new GwtMessage().getMessage('Create Update Set'));
	dd.setPreference('sysparm_sys_id', sysId);
	dd.setWidth(350);
	dd.render();
}
