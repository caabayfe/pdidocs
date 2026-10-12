(function executeRule(current, previous /*null when async*/) {
	
	var util = new AisGeniusResultUtil();
	if (current.trigger_condition == 'intent')
		util.createOrUpdateGRAByConfiguration(current.getUniqueValue());
	if (previous.trigger_condition == 'intent')
		util.createOrUpdateGRAByConfiguration(previous.getUniqueValue());
	
})(current, previous);
