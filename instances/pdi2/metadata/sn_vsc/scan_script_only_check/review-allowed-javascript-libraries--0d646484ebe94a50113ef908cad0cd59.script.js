(function (finding) {
	var gr = new GlideRecord('sys_js_content_provider_rule');
	gr.addEncodedQuery('action=allow^active=true');
	gr.query();
	while(gr.next()) {
		finding.setCurrentSource(gr);
		finding.setValue('finding_details', 'The library "' + gr.getValue('path') + '" has an "Allow" Content Proviver Rule defined and can still be accessed.');
		finding.increment();
	}
})(finding);
