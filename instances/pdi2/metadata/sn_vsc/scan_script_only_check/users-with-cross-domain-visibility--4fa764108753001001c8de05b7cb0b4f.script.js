(function(finding) {

	// Confirm if the domain is being used
	var testTable = new GlideRecord('domain');
	if (testTable.isValid()) {
		var grDmn = new GlideAggregate('sys_user_visibility');
		grDmn.addAggregate('COUNT');
		grDmn.addEncodedQuery('sys_domainNSAMEASuser.sys_domain');
		grDmn.query();
		grDmn.next();
		var intCount = parseInt(grDmn.getAggregate('COUNT'));
		if (intCount > 0) {
			finding.setCurrentSource(grDmn);
			finding.increment();
		}
	}

})(finding);
