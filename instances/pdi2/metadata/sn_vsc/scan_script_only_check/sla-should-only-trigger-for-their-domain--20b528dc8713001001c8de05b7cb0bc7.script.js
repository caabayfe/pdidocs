(function(finding) {

	// Confirm if the domain is being used
	var testTable = new GlideRecord('domain');
	if (testTable.isValid()) {
		var grDmn = new GlideAggregate('contract_sla');
		grDmn.addAggregate('COUNT');
		grDmn.addEncodedQuery('active=true^start_conditionNOT LIKEdomain');
		grDmn.query();
		while (grDmn.next()) {
			finding.setCurrentSource(grDmn);
			finding.increment();
		}
	}


})(finding);
