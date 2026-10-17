(function process(env) {	
	var sysId = env.getArguments().sysId;
	
	function getPanelIdFromExperienceId(id) {
		var gr = new GlideRecordSecure('sys_ux_page_registry');
		if (gr.get(id)) {
			return gr.getValue('admin_panel');
		}
		return false;		
	}
	
	function getThemes(id) {
		var result = [];
		var gr = new GlideRecordSecure('sys_ux_theme');	
		gr.query();
		while (gr.next()) { 
			result.push({id: gr.getValue('sys_id'), label: gr.getValue('name')});	
		}
		return result;		
	}
	
	function getPrimaryTheme(id) {
		var gr = new GlideRecordSecure('m2m_app_config_theme');
		gr.addQuery('ux_app_configuration', id);
		gr.orderBy('order');
		gr.setLimit(1);		
		gr.query();		
		while (gr.next()) {
			return gr.getValue('theme');
		}	
	}
	
	var id = getPanelIdFromExperienceId(sysId);
	
	if (id) {
		return {
			panelSysId: id,
			primaryThemeId: getPrimaryTheme(id),
			themes: getThemes(id)
		};
	}
	
	return null;	
	
})(env);
