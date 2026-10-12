(function executeRule(current, previous /*null when async*/) {
	var globalPlaybookExperience = '98e09a560f2200102920c912d4767e1a';
	// TODO: change these collection ids once they are settled
	var globalScreenCollection = '51ddfb5ac3113010948404186e40dd09';
	var customScreenCollection = '671efb5ac3113010948404186e40dd5e';
	g_scratchpad.activity_ui_page = current.getValue('playbook_experience') === globalPlaybookExperience ? globalScreenCollection : customScreenCollection;	
	g_scratchpad.activity_ui_screen = current.screen;
	g_scratchpad.activity_ui_macroponent = current.macroponent;
	g_scratchpad.activity_ui_sys_ux_app_routes = [];
	
	if(current.macroponent) {
		var sysUXAppRoutesGr = new GlideRecord("sys_ux_app_route");
		sysUXAppRoutesGr.addQuery("parent_macroponent", current.macroponent);
		sysUXAppRoutesGr.query();

		while(sysUXAppRoutesGr.next()) {
			g_scratchpad.activity_ui_sys_ux_app_routes.push(sysUXAppRoutesGr.getUniqueValue());
		}
	}
	
	
})(current, previous);
