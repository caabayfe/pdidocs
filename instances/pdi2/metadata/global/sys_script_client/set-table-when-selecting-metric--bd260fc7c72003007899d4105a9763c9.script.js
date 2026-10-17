function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	// don't change the table if the metric was removed
	if (newValue == '')
		return;

	// don't change the table when loading unless it's empty, then set the proper value
	if (isLoading && g_form.getValue('metric_table') != '')
		return;
	
	// retrieve the table record
	var grMetric = new GlideRecord('sys_metric');
	grMetric.get(newValue);
	
	var grTable = new GlideRecord('sys_db_object');
	grTable.addQuery('name', grMetric.name);
	grTable.query();
	if (grTable.next() && g_form.getValue('metric_table') != grTable.sys_id) 
		g_form.setValue('metric_table', grTable.sys_id); 
}
