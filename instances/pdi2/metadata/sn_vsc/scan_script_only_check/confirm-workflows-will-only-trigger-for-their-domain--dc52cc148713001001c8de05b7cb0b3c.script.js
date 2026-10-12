(function(finding) {
	var testTable = new GlideRecord('domain');
	if (testTable.isValid()) {

		var grDmn = new GlideRecord('wf_workflow_version');
		grDmn.addEncodedQuery('published%3Dtrue%5EconditionNOT%20LIKEdomain');
		grDmn.query();
		while (grDmn.next()) {
			finding.setCurrentSource(grDmn);
			finding.increment();
		}

	}
})(finding);
