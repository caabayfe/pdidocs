(function (finding, current) {
	var gr = new GlideRecord('sys_security_acl');
	gr.addEncodedQuery('active=true^type=ui_page^name=' + current.name);
	gr.query();
	if(gr.getRowCount() == 0) {
		finding.setCurrentSource(current);
		finding.setValue('finding_details', 'The UI Page "' + current.name + '" does not have'
			+ ' a corresponding ACL and uses the default UI Page ACL. This may allow unexpected users to'
			+ ' access the UI Page.');
		finding.increment();
	}
})(finding, current);
