(function executeRule(current, previous /*null when async*/) {
	var reportGR = new GlideRecord('sys_report');
	if (! reportGR.isValid()) {
		gs.addErrorMessage(gs.getMessage('There is something wrong with the report table'));
		current.setAbortAction(true);
	}
	reportGR.setWorkflow(false);
	if (! reportGR.get(current.report)) {
		gs.addErrorMessage(gs.getMessage('This report does not exist'));
		current.setAbortAction(true);
	}
	if (! reportGR.canWrite()) {
		gs.addErrorMessage(gs.getMessage('You do not have permission to access the report'));
		current.setAbortAction(true);
	}
})(current, previous);
