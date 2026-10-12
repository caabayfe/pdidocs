(function executeRule(current, previous /*null when async*/) {
	var newName = '' + current.name;
	var midSysId = '' + current.sys_id;
	
	syncNameInConfig();
	syncMidSettingsName();
	
	function syncNameInConfig() { 
		// retrieve mid config: 'name'
		var configGr = new GlideRecord('ecc_agent_config');
		configGr.addQuery('ecc_agent', midSysId);
		configGr.addQuery('param_name', 'name');
		configGr.setLimit(1);
		configGr.query();
	
		if (!configGr.next() || configGr.value == newName) // then the config hasn't been sync'd for the first time yet; quit
			return;
	
		// if the config property is different than the MID's name field, update it
		configGr.value = newName;
		configGr.update(); // this will trigger the business rule that syncs config from instance to mid
	}

	function syncMidSettingsName() {
		var settingsUtil = new MidSettingsUtil();
		var oldSettingsFileName = settingsUtil.getMidSettingsFileName(previous.name + '');
		var newSettingsFileName = settingsUtil.getMidSettingsFileName(newName + '');
		
		// update settings json file name if it is available
		var settingsGr  = new GlideRecord('agent_file');
		settingsGr.addQuery('mid_server', midSysId);
		settingsGr.addQuery('name', oldSettingsFileName);
		settingsGr.query();
		
		if (!settingsGr.next())
			return;
    
		settingsGr.name = newSettingsFileName;
		settingsGr.update();
		
		//update the attachment file name
		var attachmentGr = new GlideRecord('sys_attachment');
		attachmentGr.addQuery('file_name', oldSettingsFileName);
		attachmentGr.addQuery('table_name', 'agent_file');
		attachmentGr.addQuery('table_sys_id', '' + settingsGr.sys_id);
		attachmentGr.query();
		
		if(!attachmentGr.next()) 
			return;
	
		attachmentGr.file_name = newSettingsFileName;
		attachmentGr.update();
	}

})(current, previous);

(function() {
	
})();
