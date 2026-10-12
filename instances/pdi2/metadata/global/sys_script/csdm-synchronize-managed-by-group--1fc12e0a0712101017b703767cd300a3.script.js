(function executeRule(current, previous /*null when async*/) {
	// If current changes and the changes are not ex: empty string -> null
	if (current.managed_by_group.changes() && !(JSUtil.nil(current.managed_by_group) && JSUtil.nil(previous.managed_by_group))) {
		gs.eventQueue("csdm.ciclass.modified", current, current.managed_by_group, previous.managed_by_group, "sn_csdm_tso_queue");
	}

})(current, previous);
