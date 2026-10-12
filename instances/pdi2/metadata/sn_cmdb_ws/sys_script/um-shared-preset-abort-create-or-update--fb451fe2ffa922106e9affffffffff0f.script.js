(function executeRule(current, previous /*null when async*/) {

	//Constants
	var SHARED_PRESET_TABLE_NAME = 'sn_cmdb_ws_unified_map_shared_preset';
	var MAX_SHARED_PRESET_PROP_NAME = 'unifiedmap.max_shared_presets';
	var CONFIG_IDENTIFIER_ID = 'config_identifier_id';

	//Name should be unique for the specified workspace configuration
	var grDuplicate = new GlideRecord(SHARED_PRESET_TABLE_NAME);
	grDuplicate.addQuery('name', 'CONTAINS', current.name);
	grDuplicate.addQuery(CONFIG_IDENTIFIER_ID, current.config_identifier_id);
	grDuplicate.addQuery("sys_id", "!=", current.sys_id);
	grDuplicate.addQuery("active", true);
	grDuplicate.query();
	while(grDuplicate.next()) {
		if(grDuplicate.name.toLowerCase() === current.name.toLowerCase()) {
			current.setAbortAction(true);
			gs.addErrorMessage(gs.getMessage('That name already exists in this workspace. Try a different name.'));
			return;
		}

	}

	//Reached the max number of configured shared preset
	if(current.operation() == 'insert') {
		var configUtil = new CmdbWsConfigUtils();
		var propList = configUtil.getApplicationConfigProp({
			properties: [MAX_SHARED_PRESET_PROP_NAME],
			appId: "",
			configId: current.config_identifier_id});
		var maxSharedPreset = Number(propList[MAX_SHARED_PRESET_PROP_NAME]);
		if (!maxSharedPreset) {
			maxSharedPreset = 20;
		}
		var grCount = new GlideRecord(SHARED_PRESET_TABLE_NAME);
		grCount.addQuery(CONFIG_IDENTIFIER_ID, current.config_identifier_id);
		grCount.addQuery("active", true);
		grCount.query();
		if (grCount.next() && Number(grCount.getRowCount()) >= maxSharedPreset) {
			current.setAbortAction(true);
			gs.addErrorMessage(gs.getMessage('You cannot add a shared preset because the maximum number of presets already exist.'));
			return;
		}
	}


})(current, previous);
