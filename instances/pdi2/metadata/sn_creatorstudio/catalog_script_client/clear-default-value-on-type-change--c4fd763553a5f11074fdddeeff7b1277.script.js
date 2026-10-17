function onChange(control, oldValue, newValue, isLoading) {
   if (isLoading) {
      return;
   }

   //Type appropriate comment here, and begin script below
	var defaultValueDetails = g_form.getValue('default_value_details');
	try {
		defaultValueDetails = JSON.parse(defaultValueDetails);
	} catch (error){
		defaultValueDetails = {
			defaultValue: {}
		};
	}
	defaultValueDetails.defaultValue.value = '';
	defaultValueDetails.defaultValue.displayValue = '';
	g_form.setValue('default_value_details', JSON.stringify(defaultValueDetails));
	g_form.setReadOnly('default_value_details', false);   
}
