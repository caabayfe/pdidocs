(function executeRule(current, previous /*null when async*/) {
	if (current.qb_evaluation_method)
		g_scratchpad.evaluation_method = current.getValue("qb_evaluation_method");
	else
		g_scratchpad.evaluation_method = current.getElement("metric_type.evaluation_method").toString();
	
	// Check if current user is the owner of current survey
	if ((current.metric_type.survey_owners+"").indexOf(gs.getUserID()) == -1)
		g_scratchpad.isOwner = false;
	else
		g_scratchpad.isOwner = true;
})(current, previous);
