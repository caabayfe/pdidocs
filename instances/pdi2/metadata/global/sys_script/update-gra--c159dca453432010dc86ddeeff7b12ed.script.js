(function executeRule(current, previous /*null when async*/) {

	// update GRA with primary and secondary model
	new AisGeniusResultUtil().updateGRABySolutionName(current.getValue('solution_name'));

})(current, previous);
