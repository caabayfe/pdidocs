function onLoad() {
	var selectedAPI = g_form.getValue('api');
	g_form.clearOptions('api');
	
	if(!selectedAPI)
		g_form.addOption('api', "", "-- Select SOAP API --", 0);

	var otherAPIs = {};
	var apiInfos = g_scratchpad.SOAPAPIInfos;
	for (var svcName in apiInfos) {
		var opVal = svcName;
		if (opVal == selectedAPI){
			g_form.addOption('api', opVal, opVal, 0);
		}	
		else
			otherAPIs[opVal] = opVal;
	}
	for (var key in otherAPIs) {
		g_form.addOption('api', otherAPIs[key], key);
	} 
}
