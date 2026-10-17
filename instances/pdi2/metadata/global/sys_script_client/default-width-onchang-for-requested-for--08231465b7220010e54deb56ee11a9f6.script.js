function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }
	if(g_form.getValue('type') == '31' && g_form.getOption('variable_width', '')) 
		g_form.getOption('variable_width', '').text = new GwtMessage().getMessage('System Default Width ({0}) %', g_scratchpad.variable_width_props.requested_for);
   
}
