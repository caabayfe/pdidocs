function deleteApplicationAndFiles() {
    var sysId = typeof rowSysId == 'undefined' ? g_form.getUniqueValue() : rowSysId;
    
	g_i18n.getMessage('Confirmation', function(msg) {
		var dd = new GlideModal("delete_app_dialog", false, 450);
		dd.setTitle(msg);
		dd.setPreference('sysparm_sys_id', sysId);
		dd.render();
	});
}   
