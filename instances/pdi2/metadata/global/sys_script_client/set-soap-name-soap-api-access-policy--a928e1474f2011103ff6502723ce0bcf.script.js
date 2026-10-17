function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }

  	var selectedSvcVal = g_form.getValue('api');
	for (var apiName in g_scratchpad.SOAPAPIInfos) {
		var opVal = apiName;
		var apiInfo = g_scratchpad.SOAPAPIInfos[apiName];
		var apiScopedName = apiInfo['apiscopedName'];

		if (opVal == selectedSvcVal){
			g_form.setValue('soap_api_name', apiScopedName);
		}	
	} 
}
