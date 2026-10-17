(function executeRule(current, previous /*null when async*/) {
	// When update the "active" field of a resource configuration, we should update all corresponding filter configurations as well if exist.
	var searchResConfigSysId = current.getValue("cxs_search_res_config");
	var searchContextSysId = current.getValue("cxs_context_config");
	
	var grUiConfigBase = new GlideRecord("cxs_ui_config_base");
	grUiConfigBase.addQuery("cxs_context_config", searchContextSysId);
	grUiConfigBase.query();
	while (grUiConfigBase.next()) {
		// Get all filter configurations
		var grFilterConfig = new GlideRecord("cxs_table_fltr_config");
		grFilterConfig.addQuery("cxs_table_config", grUiConfigBase.getUniqueValue());
		grFilterConfig.query();
		while (grFilterConfig.next()) {
			var searchResConfig = grFilterConfig.getValue("cxs_search_res_config");
			if (searchResConfigSysId === searchResConfig) {
				grFilterConfig.setValue("active", current.getValue("active"));
				grFilterConfig.update();
				gs.log("Updated a Filter Configuration because its related Resource Configuration has been changed from Search Context.");
			}
		}
	}
	
})(current, previous);
