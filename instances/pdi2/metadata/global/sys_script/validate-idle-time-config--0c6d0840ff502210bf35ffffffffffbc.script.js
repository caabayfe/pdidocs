(function executeRule(current, previous /*null when async*/) {

	new global.ProminUtils().validateIdleTimeConfigForEntity(current.getValue("entity"));

})(current, previous);
