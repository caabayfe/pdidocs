(function executeRule(current, previous /*null when async*/) {

	global.AutoResolutionAPI.createTrainingCompletedEvent(current.getValue("solution_name"), current.getValue("version"));

})(current, previous);
