function onLoad() {
	var selectedSvcVal = g_form.getValue('api');
	g_form.clearOptions('api');
	
	if(!selectedSvcVal)
		g_form.addOption('api', "", "-- Select REST API --", 0);
	var otherSvcsNV = {};
	for (var svcName in g_scratchpad.svcOptionInfos) {
		var opVal = svcName;
		var opName = getOpName(g_scratchpad.svcOptionInfos[svcName]);
		//add selected svc first.
		if (opVal == selectedSvcVal){
			g_form.addOption('api', opVal, opVal, 0);
			g_form.setValue('api_path', opName);
		}	
		else
			otherSvcsNV[opVal] = opVal;
	}
	for (var key in otherSvcsNV) {
		g_form.addOption('api', otherSvcsNV[key], key);
	}
}

function getOpValue(svcInfo) {
	if (svcInfo['scripted'])
		return svcInfo['sysId'];
	else
		return svcInfo['route'];
}

function getOpName(svcInfo){
	return svcInfo['route'];
}
