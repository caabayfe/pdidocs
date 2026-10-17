(function executeRule(current, previous /*null when async*/) {

	var cloneRestService = new CloneRestService();
	cloneRestService.scheduleClone(current);

})(current, previous);
