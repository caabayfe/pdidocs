function onAfter(current, previous) {
	var edHelper = new ExportDefinitionHelper();
	var viewSysId = edHelper.createViewED(current.sys_id, current.table_name, current.field_list);
	current.view = viewSysId;
	current.update();
}
