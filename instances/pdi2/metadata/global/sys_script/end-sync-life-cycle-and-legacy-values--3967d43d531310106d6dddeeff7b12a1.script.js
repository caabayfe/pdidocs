(function executeRule(current, previous /* null when async */) {
	var isLegacyUpdated = (current.getValue('install_status') !== String(current.init_install_status))
      || (current.getValue('substatus') !== String(current.init_substatus));
	var isLCUpdated = (current.getValue('life_cycle_stage') !== String(current.init_lc_stage))
      || (current.getValue('life_cycle_stage_status') !== String(current.init_lc_stage_status));

	var noneUpdated = !(isLegacyUpdated || isLCUpdated);
	if (noneUpdated) {
		return;
	}
	global.AssetUtils.syncAssetLegacyAndCSDMOnPlugin(current, String(current.sys_class_name),
		isLegacyUpdated, isLCUpdated);
}(current, previous));
