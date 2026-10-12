(function executeRule(current, previous /*null when async*/) {

	var upgradePlanGr = new GlideRecord('sys_upgrade_plan');
	upgradePlanGr.addQuery('target_version', current.target_version);
	upgradePlanGr.addQuery('active', true);
	upgradePlanGr.addQuery('sys_id', '!=', current.sys_id);
	upgradePlanGr.query();
	if (upgradePlanGr.next()) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("Only one active upgrade plan may exist for a given target version."));
	}

})(current, previous);
