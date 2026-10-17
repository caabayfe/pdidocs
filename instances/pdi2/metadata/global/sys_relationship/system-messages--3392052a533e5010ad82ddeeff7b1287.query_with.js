(function refineQuery(current, parent) {
	
	var sys_prop_arr = [];
	var m2m = new GlideRecord('sys_properties_category_m2m');
	m2m.addQuery('category.name', 'Chat System Messages');
	m2m.query();
	
	while (m2m.next()) {
		sys_prop_arr.push(m2m.property.name);
	}
	
	current.addQuery('name', 'IN', sys_prop_arr);

})(current, parent);
