(function executeRule(current, previous) {
	var ECC_AGENT_UPGRADE_HISTORY_STAGE = 'ecc_agent_upgrade_history_stage';
	var midSysId = current.getUniqueValue();
	var newVersion = (gs.getProperty('mid.version'));
	var overrideVersion = gs.getProperty('mid.version.override');
	if (overrideVersion)
		newVersion = overrideVersion;

	
	//TODO: Update the condition to support the pinned version MID Servers
	if (current.version != newVersion)
		return;
	
	var gr = new GlideRecord(ECC_AGENT_UPGRADE_HISTORY_STAGE);
	gr.addQuery('mid_server', midSysId);
	gr.addQuery('stage', 'CopyBinaryFiles');
	gr.addQuery('state', 'InProgress');
	gr.orderByDesc('sys_created_on');
	gr.query();
	
	if (gr.next()) {
		gr.setValue('state', 'Completed');
		gr.update();
		
		var upGr = new GlideRecord(ECC_AGENT_UPGRADE_HISTORY_STAGE);
		upGr.initialize();
		upGr.setValue('stage','MidUpgraded');
		upGr.setValue('state', 'Completed');
		upGr.setValue('mid_server', midSysId);
		upGr.setValue('upgrade_history', gr.getValue('upgrade_history'));
		upGr.insert();
		
		// resolve any open MID Server issue records for upgrade
		MIDServerUtil.resolveExistingIssues(midSysId, 'Upgrade');
	}
})(current, previous);
