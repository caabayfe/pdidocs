function confirmRollback(){
	var cloud_details = g_form.getValue('cloud_details');
	cloud_details = JSON.parse(cloud_details);
	var options = cloud_details["rollback_clone_option"];
	var dialog = new GlideDialogWindow('clone_rollback_popup', false);
	dialog.setTitle(" ");
	dialog.setPreference('options',options);
	dialog.render(); 
}
