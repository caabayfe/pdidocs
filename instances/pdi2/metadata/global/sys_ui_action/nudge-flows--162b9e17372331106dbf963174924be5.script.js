function popUpDialog() {
	var dialog = new GlideModal('nudge_selected_flows_modal');
	dialog.setTitle(getMessage('Nudge flows'));
	dialog.setPreference('current_table', g_list.getTableName());
	dialog.setPreference('sys_id_list', getNudgeableRecords());
	dialog.render();
}

function getNudgeableRecords(){
	var sys_id_list = g_list.getChecked();
	var nudgeableList = [];
	var grContext = new GlideRecord('sys_flow_context');
	grContext.addQuery('sys_id', 'IN', sys_id_list);
	grContext.addQuery('state', 'IN', 'WAITING,PRESUMED_INTERRUPTED');
	grContext.setLimit(20);
	grContext.query();
	while(grContext.next()){
		nudgeableList.push(grContext.sys_id);
	}
	return nudgeableList.toString();
}
