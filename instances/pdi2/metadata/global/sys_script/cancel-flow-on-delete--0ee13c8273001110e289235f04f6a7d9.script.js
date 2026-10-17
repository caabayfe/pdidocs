(function executeRule(current, previous /*null when async*/) {

	new TaskSLAFlow(current).cancel();

})(current, previous);
