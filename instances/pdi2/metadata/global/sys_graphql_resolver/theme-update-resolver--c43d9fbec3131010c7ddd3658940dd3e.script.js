(function process(env) {	
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
	
	function recordCount(id) {
		var gr = new GlideRecordSecure('m2m_app_config_theme');
		gr.addQuery('ux_app_configuration', id);
		gr.query();
		if (gr.next()) {
			return gr.getRowCount();
		}		
	}
	
	function getLowerOrderRecord(id) {
		var gr = new GlideRecordSecure('m2m_app_config_theme');
		gr.addQuery('ux_app_configuration', id);
		gr.orderBy('order');
		gr.setLimit(1);		
		gr.query();	
		if (gr.next()) {
			return gr;
		}
		
		return false;
	}
	
	function findThemeRecord(panelSysId, themeSysId) {
		var gr = new GlideRecordSecure('m2m_app_config_theme');
		gr.addQuery('ux_app_configuration', panelSysId);
		gr.addQuery('theme', themeSysId);	
		gr.query();		
		if (gr.next()) {
			return gr;
		}
		
		return false;
	}
	
	function addPrimaryTheme(panelSysId, themeSysId) {
		var gr = new GlideRecordSecure('m2m_app_config_theme');
		gr.initialize();
		gr.ux_app_configuration = panelSysId;
		gr.theme = themeSysId;
		gr.order = 0;
		return gr.insert();
	}
	
	function sortRecords(panelSysId, id) {
		var gr = new GlideRecordSecure('m2m_app_config_theme');
		gr.addQuery('ux_app_configuration', panelSysId);
		gr.addQuery('sys_id', '!=', id);
		gr.orderBy('order');		
		gr.query();	
		var count = 0;
		while (gr.next()) {	
			count = count + 100;
			gr.order = count;
			gr.update();						
		}
	}
	
	function updatePrimaryTheme(panelSysId, themeSysId) {
		var count = recordCount(panelSysId);
		var lowerRecord = getLowerOrderRecord(panelSysId);			
		if (lowerRecord && lowerRecord.ux_app_configuration == panelSysId && lowerRecord.theme == themeSysId) {
			return lowerRecord.theme;
		}
		
		var themeRecord = findThemeRecord(panelSysId, themeSysId);
		
		var sysId;
		if (themeRecord) {
			themeRecord.order = 0;
			themeRecord.update();
			sysId = themeRecord.sys_id;
		} else {
			if (lowerRecord && count == 1) {
				lowerRecord.theme = themeSysId;
				lowerRecord.order = 0;
				lowerRecord.update();
				sysId = lowerRecord.sys_id;
			} else {
				sysId = addPrimaryTheme(panelSysId, themeSysId);
			}			
		}
		
		if (count > 1 && sysId) {
			sortRecords(panelSysId, sysId);
		}
				
		return themeSysId;											
	}
	
	var id = getPanelIdFromExperienceId(env.getArguments().sysId);
	
	if (id) {
		return {
			panelSysId: id,
			primaryThemeId: updatePrimaryTheme(id, env.getArguments().primaryThemeId),
			themes: getThemes(id)
		};
	}
	
	return null;	
	
})(env);
