(function executeRule(current, previous /*null when async*/) {
	var catDomain = current.metric_category.sys_domain;
	var userDomain = current.user.sys_domain;
	//user can be in other domains if category is in global domain
	if (new AssessmentUtils().domainIsGlobal(catDomain) || catDomain == userDomain)
		current.sys_domain = catDomain;
	else {
		gs.addErrorMessage(gs.getMessage('Incompatible domains for Category and User'));
		current.setAbortAction(true);
	}
})(current, previous);
