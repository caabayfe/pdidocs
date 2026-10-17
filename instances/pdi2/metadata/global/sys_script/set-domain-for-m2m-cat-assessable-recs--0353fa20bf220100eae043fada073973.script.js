(function executeRule(current, previous /*null when async*/) {
	var catDomain = current.category.sys_domain;
	var assessableDomain = current.assessment_record.sys_domain;
	//if metric type is non global, assessable record domain must be same as metric type domain
	if (new AssessmentUtils().domainIsGlobal(catDomain) || catDomain == assessableDomain)
		current.sys_domain = assessableDomain;
	else {
		gs.addErrorMessage(gs.getMessage('Incompatible domains for Category and Assessable Record'));
		current.setAbortAction(true);
	}
})(current, previous);
