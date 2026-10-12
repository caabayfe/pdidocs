function showConfirmDialog() {
	if (typeof rowSysId == 'undefined')
       sysId = gel('sys_uniqueValue').value;
    else
       sysId = rowSysId;
    
    var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
    var gdw = new dialogClass("load_remote_version_confirm");
    gdw.setTitle("Confirmation");
    gdw.setPreference('sysparm_sys_id', sysId);
	gdw.setPreference('focusTrap', true);
    gdw.setWidth(400);
    gdw.render();
}
