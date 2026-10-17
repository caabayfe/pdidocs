function getAvailableViewsForForm(referencedTable) {
	var views = ['Default view'];
	['sys_ui_form', 'sys_ui_section'].forEach(function(tableName) {
		var ga = new GlideAggregate(tableName);
		ga.addQuery('view.name', 'NOT IN', views);
		ga.addQuery('name', referencedTable);
		ga.addAggregate('COUNT');
		ga.groupBy('view');
		ga.query();
		while (ga.next())
			views.push(ga.view.name.toString());
	});
	return views.slice(1);
}
