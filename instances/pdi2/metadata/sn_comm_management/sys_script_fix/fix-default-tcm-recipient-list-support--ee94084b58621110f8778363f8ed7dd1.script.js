if (isTCMFirstTimeInstall() && !GlidePluginManager.isUpgradeSystemBusy()) {
	gs.info("Fixing Default Email Recipient List support on Task communication management");
	
	// For fresh installation customer default email recipient list support will be 'true'
	gs.setProperty('sn_comm_management.email_client_recipient_items_enabled', true);
}

/*
 * Returns 'true' on Task communication management plugin installation, 'false' on repair.
 */
function isTCMFirstTimeInstall() {
	var upgradeHistoryGr = new GlideRecord('sys_upgrade_history');
	upgradeHistoryGr.addQuery('to_version','com.snc.task_communication_management');
	upgradeHistoryGr.setLimit(2);
	upgradeHistoryGr.query();
	return upgradeHistoryGr.getRowCount() == 1;
}
