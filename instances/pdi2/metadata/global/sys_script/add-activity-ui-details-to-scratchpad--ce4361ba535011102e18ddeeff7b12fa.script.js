(function executeRule(current, previous /*null when async*/) {
	var globalPlaybookExperience = '98e09a560f2200102920c912d4767e1a';
	// TODO: change these collection ids once they are settled
	var globalScreenCollection = '51ddfb5ac3113010948404186e40dd09';
	var customScreenCollection = '671efb5ac3113010948404186e40dd5e';
	var defaultActivityUISysID = current.getValue('default_activity_ui');
	var defaultActivityRecord = new GlideRecord('sys_playbook_experience_activity_ui');
	defaultActivityRecord.get(defaultActivityUISysID);
	
	g_scratchpad.activity_ui_page = defaultActivityRecord.getValue('playbook_experience') === globalPlaybookExperience ? globalScreenCollection : customScreenCollection;	
	g_scratchpad.activity_ui_screen = defaultActivityRecord.screen;
	g_scratchpad.activity_ui_macroponent = defaultActivityRecord.macroponent;
	g_scratchpad.activity_ui_sys_ux_app_routes = [];
	
	if(current.macroponent) {
		var sysUXAppRoutesGr = new GlideRecord("sys_ux_app_route");
		sysUXAppRoutesGr.addQuery("parent_macroponent", defaultActivityRecord.macroponent);
		sysUXAppRoutesGr.query();

		while(sysUXAppRoutesGr.next()) {
			g_scratchpad.activity_ui_sys_ux_app_routes.push(sysUXAppRoutesGr.getUniqueValue());
		}
	}
	
	
})(current, previous);
