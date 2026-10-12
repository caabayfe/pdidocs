function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }
	
	if(oldValue == newValue)
		return;
   //Type appropriate comment here, and begin script below
	// accept only numbers followed by .
	
	var hierarchyId = '' + g_form.getValue('hierarchy_id');
	var regEx = /^\d+(\.\d+)*$/;
	if (!regEx.test(newValue)) {
		g_form.setValue('hierarchy_id', '');
		g_form.showFieldMsg('hierarchy_id', getMessage('Enter a number with or without decimals. Ensure that a number follows the decimal point ( example 1.2.3.4 )'), 'error');
	}
}
