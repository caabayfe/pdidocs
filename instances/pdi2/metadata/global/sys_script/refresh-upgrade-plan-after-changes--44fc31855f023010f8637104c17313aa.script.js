(function executeRule(current, previous /*null when async*/) {

	var upgradePlan = new GlideRecord('sys_upgrade_plan');
	if (upgradePlan.get(current.getValue('upgrade_plan'))) {
		upgradePlan.setValue('last_refreshed', gs.nowGlideDateTime());
		upgradePlan.update();
	}
})(current, previous);
