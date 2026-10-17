(function executeRule(current, previous /*null when async*/) {
	
	var util = new AisGeniusResultUtil();
	if (current.operation() == 'update' && current.profile.changes() && previous.profile)
		util.createOrUpdateGRAByProfile(previous.profile);
	util.createOrUpdateGRAByProfile(current.profile);
	
})(current, previous);
