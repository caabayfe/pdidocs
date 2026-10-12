function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (newValue === '') {
      return;
   }

	if(newValue == 'screen'){
		g_form.removeOption("default_value_type", "source_field");
	}
   else{
	var buttonGR = new GlideRecord('sys_sg_button');
	buttonGR.addQuery('sys_id', g_form.getValue('button'));
	buttonGR.query();
	var view = g_form.getValue('sysparm_view') || 'default';
	if (buttonGR.next() && buttonGR.getValue('context') === 'record') {
		g_form.addOption("default_value_type", "source_field", "Source field");
	} else if(view !== 'mobile_studio') {
		g_form.removeOption("default_value_type", "source_field");
	}
   }
}
