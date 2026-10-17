function transform(input) {
	var output = {};
	var settingsGr = new GlideRecord('sn_sow_cfg_stg');
	settingsGr.addActiveQuery();
	settingsGr.addQuery('group', input.config_group_sys_id);
	settingsGr.query();
	while(settingsGr.next()) {
		output[settingsGr.key] = settingsGr.getValue('value') == "true";
	}
	output["enableAIWorkers"] = gs.getProperty('sn_aia.enable_ai_workers', false);
	return output;
}
