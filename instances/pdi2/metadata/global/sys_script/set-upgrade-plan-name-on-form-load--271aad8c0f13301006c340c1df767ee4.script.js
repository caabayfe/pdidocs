(function executeRule(current, previous /*null when async*/) {

	var releaseVersion = GlidePropertiesDB.get('glide.war');
	var upgradePlan = new GlideRecord('sys_upgrade_plan');
	if (upgradePlan.get('target_version', releaseVersion))
		current.upgrade_plan = upgradePlan.getUniqueValue();

})(current, previous);
