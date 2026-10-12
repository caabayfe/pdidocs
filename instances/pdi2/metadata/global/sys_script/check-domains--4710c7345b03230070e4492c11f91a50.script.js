(function executeRule(current, previous /*null when async*/) {
	var cmdbCi = current.cmdb_ci;
	var serviceOffering = current.service_offering;
	if (serviceOffering)
		serviceOffering = serviceOffering.getED().getLabel();
	else
		cmdbCi = cmdbCi.getED().getLabel();
	var item = serviceOffering || cmdbCi;
	var serviceCommitmentLabel = current.service_commitment.getED().getLabel();
	gs.addErrorMessage(gs.getMessage('The domains of the {0} and the {1} must be the same.', [serviceCommitmentLabel, item]));
	current.setAbortAction(true);
})(current, previous);
