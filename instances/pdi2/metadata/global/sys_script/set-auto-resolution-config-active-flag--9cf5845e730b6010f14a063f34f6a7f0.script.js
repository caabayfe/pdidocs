(function executeRule(current, previous /*null when async*/) {

	//when active flag is disabled on language configuration, check if there are any other active configurations if not disabled the active flag on corresponding configuration record

	var languageGr = new GlideRecord(AutoResolutionConstants.CONFIG_LANGUAGE_TABLE_NAME);
	if (!current.active) {
		languageGr.addQuery('configuration', current.configuration);
		languageGr.addQuery('sys_id', '!=', current.getUniqueValue());
		languageGr.addActiveQuery();
		languageGr.query();
			
		if (!languageGr.next()) {
			var configGr = new GlideRecord(AutoResolutionConstants.CONFIG_TABLE_NAME);
			configGr.get(current.configuration);
			if (configGr.active) {
				gs.addInfoMessage(gs.getMessage('Please set any language configuration record to active to enable Auto-Resolution configuration'));
				configGr.active = false;
				configGr.update();
			}		
		}
		return;
	}
	// After SD->Tokyo/Utah upgrade, ensure Agent Zero is inactive
	else if (current.capability.toString() === AutoResolutionConstants.ML_CAPBILITIES.AGENT_ZERO_WORKFLOW || current.capability.toString() === AutoResolutionConstants.ML_CAPBILITIES.LANGUAGEX) {
		languageGr.addQuery('configuration', current.configuration);
		languageGr.addQuery('capability', AutoResolutionConstants.ML_CAPBILITIES.AGENT_ZERO);
		languageGr.addActiveQuery();
		languageGr.query();
		
		if (languageGr.next()) {
			languageGr.active = false;
			languageGr.update();
		}
	}
})(current, previous);
