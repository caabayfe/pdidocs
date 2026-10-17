function populate() {
	var gDialog = new GlideDialogWindow("it_service_choose_levels_to_populate");
	gDialog.setTitle("Update with changes from CMDB");
	gDialog.setSize(600);
	gDialog.setPreference('focusTrap',true);
	gDialog.setPreference('sysparm_service_id', rowSysId);
	gDialog.setPreference('sysparm_is_convert_op', 'false');
	gDialog.setPreference('sysparm_is_update', 'true');
	gDialog.setPreference('sysparm_is_dynamic', 'false');
	gDialog.setPreference('sysparm_is_already_converted','true');
	gDialog.render();
	window.setTimeout(function(){
		document.getElementById('levels').focus();
	},100);
	
}
