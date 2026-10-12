function reasonforCancelClone(){
	var cloud_details = g_form.getValue('cloud_details');
	cloud_details = JSON.parse(cloud_details);
	var options = cloud_details["cancel_clone_option"];
	var _dialog = new GlideDialogWindow('clone_cancel_popup');
	_dialog.setTitle('');
	_dialog.setPreference('options',options);
	_dialog.render();
}
