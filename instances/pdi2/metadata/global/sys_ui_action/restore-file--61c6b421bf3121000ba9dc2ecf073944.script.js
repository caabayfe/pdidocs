function restoreFile() {
    var sysId = gel('sys_uniqueValue').value;
	var dd = new GlideModal("restore_file_dialog");
	dd.setTitle(new GwtMessage().getMessage('Confirmation'));
	dd.setPreference('sysparm_sys_id', sysId);
	dd.setWidth(350);
	dd.render();
}   
