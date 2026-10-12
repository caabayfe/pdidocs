(function refineQuery(current, parent) {

	var version = [];
	var gr = new GlideRecord('std_change_producer_version');
	gr.addQuery('std_change_producer', parent.getUniqueValue());
	gr.query();
	while (gr.next()) {
		version.push(gr.getUniqueValue());
	}
	current.addQuery('std_change_producer_version', 'IN', version.join(','));

})(current, parent);
