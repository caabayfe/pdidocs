function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || !newValue || newValue === '') {
		return;
	}
    var widgetSysId = g_form.getUniqueValue();
	var gr = new GlideRecord('pa_widget_elements');
 	gr.addQuery('widget', widgetSysId);
    gr.query();
	if (gr.next()) {
		g_form.clearValue('breakdown');
		g_form.showFieldMsg('breakdown', getMessage('You can not change the breakdown if you have elements selected for the breakdown. Please remove them first. (If you do not see the list check the Manual Elements checkbox)'), 'warning');
	}
}
