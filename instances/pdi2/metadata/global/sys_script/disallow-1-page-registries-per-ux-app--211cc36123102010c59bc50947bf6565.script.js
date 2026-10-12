(function executeRule(current, previous /*null when async*/) {
	function getAppConfigsInUse(currSysId) {
		var gr = new GlideRecord('sys_ux_page_registry');
		gr.addQuery('admin_panel_table', 'sys_ux_app_config');
		gr.addQuery('sys_id!='+currSysId);
		gr.query();
		var appConfigsAlreadyInUse = [];
		while (gr.next()) {
			var adminPanel = gr.getValue('admin_panel');
			var adminPanelSysIdString = adminPanel != null ? adminPanel.toString() : '';
			if (adminPanelSysIdString.length > 0)
				appConfigsAlreadyInUse.push(adminPanelSysIdString);

		}
		return appConfigsAlreadyInUse;
	}
	var adminPanel = current.admin_panel.toString();
	if (adminPanel.length > 0) {
		var appConfigsInUse = getAppConfigsInUse(current.sys_id);
		if (appConfigsInUse.indexOf(adminPanel) > -1) {
			gs.addErrorMessage(gs.getMessage('A record with the same UX App Configuration already exists. Please create a new UX App Configuration.'));
			current.setAbortAction(true);			
		}
	}
})(current, previous);
