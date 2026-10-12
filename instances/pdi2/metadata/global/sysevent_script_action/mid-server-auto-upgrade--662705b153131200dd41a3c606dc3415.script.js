gs.info('Auto upgrading all MID Servers');

var mm = new MIDServerManage();
var historyWithoutNotification = MIDUpgradeHistoryUtil.getHistoryWithoutNotification();

var gr = new GlideRecord('ecc_agent');
gr.query();

while (gr.next()) {
	
	// add upgrade notification stage if needed
	if (MIDUpgradeHistoryUtil.midSupportsUpgradeStages(gr.getValue('version')) 
			&& historyWithoutNotification)
		addMidUpgradeNotification(gr.getUniqueValue(), historyWithoutNotification);
	
	mm.autoUpgrade(gr.getValue('name'));
}



function addMidUpgradeNotification(midSysId, hSysId) {
	var gr = new GlideRecord('ecc_agent_upgrade_history_stage');
	gr.initialize();
	gr.setValue('stage', 'UpgradeNotification');
	gr.setValue('state', 'InProgress');
	gr.setValue('upgrade_history', hSysId);
	gr.setValue('mid_server', midSysId);
	gr.insert();
}
