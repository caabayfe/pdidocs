function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading)
      return;
	
   if (newValue == ''){
	   g_form.setValue('metric', '');
	   return;
   }
	
	var metricID = g_form.getValue('metric');
	
	if (metricID == '')
		return;
	
	// retrieve the metric record
	var grMetric = new GlideRecord('sys_metric');
	grMetric.get(g_form.getValue('metric'));
	
	var grTable = new GlideRecord('sys_db_object');
	grTable.get(newValue);
	
	if (grTable.getValue('name') != grMetric.getValue('name'))
		g_form.setValue('metric', '');
}
