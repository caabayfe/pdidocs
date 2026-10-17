if (isTCMFirstTimeInstall() && !GlidePluginManager.isUpgradeSystemBusy()) {
	gs.info("Fixing Default Email Recipient Field Value");
	
	// For fresh installation customer default email recipient field will be 'bcc'
	gs.setProperty('sn_comm_management.default_email_recipient_field', 'bcc');
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
