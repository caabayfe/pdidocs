function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue == '') {
      return;
   }

	g_form.clearMessages();
	var gr = new GlideRecord('asmt_metric_type');
	gr.get(g_form.getValue("assessment"));
	
	if (gr.schedule_period == 2 && gr.evaluation_method.toString() == 'survey')
		g_form.addInfoMessage('The schedule period is set to Only Once for the selected survey: ' + gr.name + '. No user can take this survey more than once');
}
