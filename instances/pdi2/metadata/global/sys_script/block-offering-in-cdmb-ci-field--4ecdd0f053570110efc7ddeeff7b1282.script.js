(function executeRule(current, previous /*null when async*/) {
	var offering = current.service_offering.getED().getLabel();
	var cmdbCi = current.cmdb_ci.getED().getLabel();
	gs.addErrorMessage(gs.getMessage('Adding an {0} in the {1} field is not allowed. Please use the {0} field instead.', [offering, cmdbCi]));
	current.setAbortAction(true);
})(current, previous);
