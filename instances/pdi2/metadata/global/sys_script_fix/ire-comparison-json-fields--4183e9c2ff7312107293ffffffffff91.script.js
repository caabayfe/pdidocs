var g = new GlideRecord('sys_dictionary');
g.addQuery('name', 'IN', ['cmdb_ire_output_comparison','cmdb_ire_output_comparison_item']);
g.addQuery('internal_type', 'compressed');
g.query();
while(g.next()) {
	g.setValue('internal_type', 'json');
	g.update();
}
