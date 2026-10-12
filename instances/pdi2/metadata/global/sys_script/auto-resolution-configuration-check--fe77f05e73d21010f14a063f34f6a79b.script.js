(function executeRule(current, previous /*null when async*/) {

	if (current.getValue('value') === 'true') 
		checkAutoResolutionConfig();
	else 
		disableAutoResolution();
	
	function checkAutoResolutionConfig() {
		var azConfigGr = new GlideRecord('sys_cs_auto_resolution_configuration');
		azConfigGr.addNotNullQuery('target_table_name'); 
		azConfigGr.query();
		
		if (azConfigGr.next()) {
			if (!azConfigGr.active) 
				gs.addInfoMessage(gs.getMessage('To use Auto-Resolution, be sure to select the Active option in the Auto-Resolution configuration record.'));
		}
		else {			
			current.setAbortAction(true);
			gs.addErrorMessage(gs.getMessage("Your configuration isn't complete. Verify that you've installed the required apps, then enable auto-resolution."));
		}
			
	}
	
	function disableAutoResolution() {
		var configGr = new GlideRecord('sys_cs_auto_resolution_configuration');
		configGr.setValue('active', false);
		configGr.updateMultiple();
	}

})(current, previous);
