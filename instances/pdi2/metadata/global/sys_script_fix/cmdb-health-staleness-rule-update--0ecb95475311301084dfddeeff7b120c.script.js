(function() {
	if (pm.isZboot())
		return;
	var gr = new GlideRecord('sys_dictionary');
	var ALLOW_PUBLIC_ATTRIB = 'allow_public';
	gr.addQuery('name', 'cmdb_health_staleness_rule');
	gr.addQuery('element', 'applies_to');
	gr.query();

	while (gr.next()) {
		// If customer does not already have attribute then add
		if (!gr.getValue('attributes').includes(ALLOW_PUBLIC_ATTRIB)) {
			var attributesStr = gr.getValue('attributes');
			attributesStr = attributesStr + ',' + ALLOW_PUBLIC_ATTRIB + '=true';
			gr.setValue('attributes', attributesStr);
			gr.update();
		}
	}
})();
