(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	var util = new AisGeniusResultUtil();
	if (current.getValue('genius_result_configuration'))
		util.createOrUpdateGRAByConfiguration(current.getValue('genius_result_configuration'));
	if (current.genius_result_configuration.changes() && previous.getValue('genius_result_configuration'))
		util.createOrUpdateGRAByConfiguration(previous.getValue('genius_result_configuration'));

})(current, previous);
