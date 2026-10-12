function deleteFromList() {	
	var dmdelete = new GlideRecord('sys_dm_delete');
	dmdelete.initialize();
	dmdelete.table = g_list.getTableName();
	dmdelete.condition = "sys_idIN" + g_list.getChecked();
    	var sysId = dmdelete.insert();

	g_navigation.open('sys_dm_delete.do?sys_id=' + sysId);
}
