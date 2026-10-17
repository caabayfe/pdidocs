(function calculatedFieldValue(current) {
	var gr = new GlideRecord('cmdb_ci');
	var discovery_source = '';
	if(gr.get(current.duplicate_ci)) {
		discovery_source = gr.getValue('discovery_source');
	}
	return discovery_source;
})(current);
