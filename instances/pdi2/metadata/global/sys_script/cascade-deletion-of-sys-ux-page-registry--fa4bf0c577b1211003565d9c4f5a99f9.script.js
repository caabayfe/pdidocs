(function executeRule(current, previous /*null when async*/) {
	var pageRegistryGR = new GlideRecord('sys_ux_page_registry');
	pageRegistryGR.addQuery('admin_panel',current.getUniqueValue());
	pageRegistryGR.addQuery('admin_panel_table', current.getTableName());
	pageRegistryGR.query();
	if(pageRegistryGR.next()){
		pageRegistryGR.deleteRecord();
	}
})(current, previous);
