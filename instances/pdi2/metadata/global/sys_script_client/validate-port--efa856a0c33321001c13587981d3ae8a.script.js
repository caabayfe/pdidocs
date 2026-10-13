function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue == '') {
      return;
   }
	EndPointValidation.validatePort(newValue);
		
//	if(!EndPointValidation.validateNumber('url', newValue, 0, 65535))
//		g_form.showErrorBox('port','Port number should be between 0 and 65535');
//	else
//		g_form.hideErrorBox('port');
}
