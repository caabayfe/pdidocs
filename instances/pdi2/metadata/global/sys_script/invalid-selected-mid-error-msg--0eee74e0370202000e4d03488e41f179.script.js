(function executeRule(current, previous /*null when async*/) {

	if (current.mid_server.validated == 'false')
		gs.addErrorMessage(gs.getMessage("Selected MID server has not been validated and may not function as a data source"));

})(current, previous);
