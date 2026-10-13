function onLoad() {
	if (!g_form.isNewRecord())
		return;
	
	var triggerID = g_form.getValue('trigger');
	if (!triggerID)
		return;
	
	var gr = new GlideRecord('sys_metric_trigger_level');
	gr.addQuery('trigger', triggerID);
	gr.orderByDesc('level');
	gr.setLimit(1);
	gr.query();
	if (gr.next())
		g_form.setValue('level', parseInt(gr.getValue('level')) + 1);
   
}
