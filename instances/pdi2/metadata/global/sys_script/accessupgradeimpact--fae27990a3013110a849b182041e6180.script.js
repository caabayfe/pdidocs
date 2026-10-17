(function executeRule(current, previous /*null when async*/ ) {
	g_scratchpad.shouldShowUpgradeConfirmationDialog = new sn_uit.UpgradeImpactTracker().accessUpgradeImpact(current);
})(current, previous);
