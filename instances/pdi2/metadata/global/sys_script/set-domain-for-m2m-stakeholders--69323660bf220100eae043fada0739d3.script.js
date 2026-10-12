(function executeRule(current, previous /*null when async*/) {
	var catUserDomain = current.category_user.sys_domain;
	var asmtRecDomain = current.assessment_record.sys_domain;

	// If category user's domain is global, use domain of assessable record
	if (new AssessmentUtils().domainIsGlobal(catUserDomain)){
		var grc = new GlideRecord("asmt_assessable_record");
		var user =new GlideRecord('sys_user');
		user.get(current.category_user.user);
		grc.addDomainQuery(user);
		grc.addQuery("source_id",current.assessment_record.source_id+'');
		grc.addQuery("sys_id",current.assessment_record+'');
		grc.query();
		//only if assessable record is visible for the user
		if (!grc.next()) {
			gs.addErrorMessage(gs.getMessage('Incompatible domains for Category User and Assessable Record'));
			current.setAbortAction(true);
		}
		current.sys_domain = asmtRecDomain;
	}
	else if (catUserDomain == asmtRecDomain)
		current.sys_domain = asmtRecDomain;
	else {
		gs.addErrorMessage(gs.getMessage('Incompatible domains for Category User and Assessable Record'));
		current.setAbortAction(true);
	}
})(current, previous);
