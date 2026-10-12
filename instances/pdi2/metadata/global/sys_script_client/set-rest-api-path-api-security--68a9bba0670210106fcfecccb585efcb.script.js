function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	var selectedSvcVal = g_form.getValue('api');
	var otherSvcsNV = {};
	for (var svcName in g_scratchpad.svcOptionInfos) {
		var opVal = svcName;
		var servInfo = g_scratchpad.svcOptionInfos[svcName];
		var apiPath = servInfo['route'];
		//add selected svc first
		if (opVal == selectedSvcVal){
			g_form.setValue('api_path', apiPath);
		}	
	}
}
