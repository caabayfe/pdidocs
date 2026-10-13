(function executeRule(current, previous /*null when async*/) {

	if(!current.timeline){
		current.timeline = new sn_major_inc_mgmt.ConsolidatedIncidentTimeline().getTimeline(current);
	}

})(current, previous);
