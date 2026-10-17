function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }

	g_form.setDisplay('security_attribute.condition', true);
	g_form.setValue('security_attribute.condition', '');
	if (newValue == 'Local') {
		g_form.setMandatory('security_attribute', false);
		g_form.setDisplay('security_attribute', false);
		g_form.setDisplay('security_attribute.condition', true);
		// comment out setReadOnly() until DEF0367293 fix is provided
		// g_form.setReadOnly('security_attribute.condition', false);
	} else if (newValue == 'Existing') {
		g_form.setMandatory('security_attribute', true);
		g_form.setDisplay('security_attribute', true);
		g_form.setValue('security_attribute', '');
		g_form.setDisplay('security_attribute.condition', false);
		// comment out setReadOnly() until DEF0367293 fix is provided
		// g_form.setReadOnly('security_attribute.condition', true);
	}
}
