(function (finding) {
	var gr = new GlideRecord('sys_schema_attribute_m2m');
	gr.addEncodedQuery('attribute=195bb0b3eb321100d4360c505206fe02^value=false^sys_updated_by!=system');
	gr.query();
	while(gr.next()) {
		var field = gr.schema.name + '.' + gr.schema.element;
		finding.setCurrentSource(gr);
		finding.setValue('finding_details', 'The field "' + field + '" has HTML Sanitization disabled and may lead to '
			+ ' cross-site scripting (XSS) risks.'
		);
		finding.increment();
	}
})(finding);
