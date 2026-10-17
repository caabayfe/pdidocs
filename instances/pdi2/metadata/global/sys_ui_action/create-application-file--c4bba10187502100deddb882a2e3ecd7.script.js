function popAddMetadataDialog() {	
  	var dialog = new GlideModal('add_selected_metadata_link_dialog');
    dialog.setTitle(new GwtMessage().getMessage('Create Application File from Record'));
	dialog.setPreference('current_table', g_list.getTableName());
	dialog.setPreference('sys_id_list', g_list.getChecked());
	dialog.render();
}
