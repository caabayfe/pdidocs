if (!(new AssessmentUtils().domainsAreEqual(current.sys_domain, current.category.sys_domain))) {
	gs.addErrorMessage(gs.getMessage('Incompatible domains for Category and Metric - they must be in the same domain'));
	current.setAbortAction(true);
}
