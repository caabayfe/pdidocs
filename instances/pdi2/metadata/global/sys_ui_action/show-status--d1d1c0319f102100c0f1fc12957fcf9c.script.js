function popDialog() {
    
	if (typeof rowSysId == 'undefined')
		sysId = gel('sys_uniqueValue').value;
	else
		sysId = rowSysId;
	
	var dd = new GlideDialogWindow("hierarchical_progress_viewer", false, "40em", "10em");
	dd.setTitle("Status");
	dd.setPreference('sysparm_renderer_execution_id', sysId);
    dd.render();
}
