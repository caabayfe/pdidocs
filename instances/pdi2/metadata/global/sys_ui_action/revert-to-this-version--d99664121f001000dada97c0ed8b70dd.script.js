function showConfirmDialog() {
    if (typeof rowSysId == 'undefined')
       sysId = gel('sys_uniqueValue').value;
    else
       sysId = rowSysId;

	var gr = new GlideRecord("sys_sync_history_version");
    gr.addQuery("version", sysId);
	gr.addQuery("state", "collision");
	gr.query();
	if (gr.next()) {
		alert(getMessage("Your update version entry cannot be reverted because it is in the Collision state. Resolve the collision first."));
		return;
	}
	
    var gdw = new GlideModal("revert_update_version_confirm", true, 300);
    gdw.setTitle("Revert");
    gdw.setPreference('sysparm_sys_id', sysId);
    gdw.setPreference('focusTrap', true);
    gdw.render();
}
