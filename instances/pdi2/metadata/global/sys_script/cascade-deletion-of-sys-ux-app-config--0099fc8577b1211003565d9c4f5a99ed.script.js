(function executeRule(current, previous /*null when async*/) {
	var adminPanelGR = new GlideRecord(current.admin_panel_table.toString());
	adminPanelGR.addQuery('sys_id',current.admin_panel.toString());
	adminPanelGR.query();
	if(adminPanelGR.next()){
		adminPanelGR.deleteRecord();
	}
})(current, previous);
