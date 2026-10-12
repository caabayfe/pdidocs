if (current.metric_type.isValidRecord() && !(new AssessmentUtils().domainsAreEqual(current.sys_domain, current.metric_type.sys_domain))) {
	gs.addErrorMessage(gs.getMessage('Incompatible domains for Category and Type - they must be in the same domain'));
	current.setAbortAction(true);
}
