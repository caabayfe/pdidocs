function deleteApplicationAndFiles() {
    var sysId = typeof rowSysId == 'undefined' ? g_form.getUniqueValue() : rowSysId;

	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
	var dd = new dialogClass("delete_app_dialog");
	dd.setTitle(new GwtMessage().getMessage('Confirmation'));
	dd.setPreference('sysparm_sys_id', sysId);
	dd.setWidth(450);
	dd.render();
}
