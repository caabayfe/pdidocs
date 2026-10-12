function popAddUpdatesetDialog() {
	var dialog = new GlideModal('cancel_selected_flow_link_dialog_ui16');
    dialog.setTitle(getMessage('Cancel flows'));
	dialog.setPreference('current_table', g_list.getTableName());
	dialog.setPreference('sys_id_list', getCancellableRecords());
	dialog.render();
}

function getCancellableRecords(){
	var sys_id_list = g_list.getChecked();
	var cancellableList = [];
	var grContext = new GlideRecord('sys_flow_context');
	grContext.addQuery('state', 'NOT IN', 'COMPLETE,ERROR,CANCELLED');
	grContext.addQuery('sys_id', 'IN', sys_id_list);
	grContext.setLimit(100);
	grContext.query();
	while(grContext.next()){
		cancellableList.push(grContext.sys_id);
	}
	return cancellableList.toString();
}
