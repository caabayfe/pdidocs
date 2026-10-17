(function executeRule(current, previous /*null when async*/) {
	if (sn_bc.GlideBusinessCalendarUtil.isLegacySchedule(current.sys_class_name)) {
		current.is_legacy_schedule = true;
		return;
	}

	current.is_legacy_schedule = false;

})(current, previous);
