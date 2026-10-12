function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (newValue === '') {
      return;
   }

	var buttonGR = new GlideRecord('sys_sg_button');
	buttonGR.addQuery('sys_id', g_form.getValue('button'));
	buttonGR.query();
	if (buttonGR.next() && buttonGR.getValue('context') === 'record') {
		g_form.addOption("default_value_type", "source_field", "Source field");
	}
	else {
		g_form.removeOption("default_value_type", "source_field");
	}
}
