(function executeRule(current, previous) {
	var isLegacyUpdated = current.install_status.changes() || current.substatus.changes();
	var isLCUpdated = current.life_cycle_stage.changes() || current.life_cycle_stage_status.changes();
	if (String(current.operation()) === 'insert' || (String(current.operation()) === 'update' && (isLegacyUpdated || isLCUpdated))) {
		var lcUtil = new global.LifeCycleUtil();
		var updateSource = global.AssetUtils.getSourceOfAssetUpdate(current);
		var callingTable = current.sys_class_name + '';
		if (updateSource === AssetUtils.ASSET_UPDATE_SOURCE.IBI) {
			lcUtil.updateFromCSDM(callingTable, current);
		} else {
			global.AssetUtils.syncAssetLegacyAndCSDMOnPlugin(current, callingTable, isLegacyUpdated, isLCUpdated);
		}
	}
	current.init_install_status = current.getValue('install_status');
	current.init_substatus = current.getValue('substatus');
	current.init_lc_stage = current.getValue('life_cycle_stage');
	current.init_lc_stage_status = current.getValue('life_cycle_stage_status');
}(current, previous));
