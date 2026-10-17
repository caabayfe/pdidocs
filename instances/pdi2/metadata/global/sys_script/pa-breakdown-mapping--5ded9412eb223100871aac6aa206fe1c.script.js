function onAfter(current, previous) {
	var mapping = new GlideRecord('pa_breakdown_mappings');
	mapping.addQuery('breakdown', current.sys_id);
	mapping.addQuery('facts_table', current.facts_table);
	mapping.query();
	if (!mapping.next()) {
		mapping = new GlideRecord('pa_breakdown_mappings');
		mapping.initialize();
		mapping.setValue('breakdown', current.sys_id);
		mapping.setValue('facts_table', current.facts_table);
		mapping.setValue('scripted', current.scripted);
		mapping.setValue('field', current.field);
		mapping.setValue('script', current.script);
		mapping.setValue('sys_domain', current.sys_domain);
		if (current.sys_domain_path)
			mapping.setValue('sys_domain_path', current.sys_domain_path);
		mapping.insert();
	}
	
	var cur = new GlideRecord('pa_breakdowns');
	cur.addQuery('sys_id', current.sys_id);
	cur.query();
	cur.next();
	cur.facts_table = '';
	cur.scripted = false;
	cur.field = '';
	cur.script = '';
	cur.update();
}
