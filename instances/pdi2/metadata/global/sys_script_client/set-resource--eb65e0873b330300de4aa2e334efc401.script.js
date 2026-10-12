function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }
	var selectedResourceVal = g_form.getValue('api_resource');
	g_form.clearOptions('api_resource');
	var apiName = g_form.getValue('api');
	var svcInfo = g_scratchpad.svcOptionInfos[apiName];
	var versions = svcInfo['versions'];
	var otherResources = [];
	for (var i = 0; i < versions.length; i++) {
		var version = versions[i];
		if(version['version'] == newValue){
			var resources = version['resources'];
			for (var j = 0; j < resources.length; j++) {
				var resource = resources[j];
				var route = resource['route'];
				var end_point = resource['method'] + ' ' + route;
				if(end_point == selectedResourceVal)
					g_form.addOption('api_resource', end_point, end_point,0);
				else
					otherResources.push(end_point);
			}
			break;
		}
	}
	for (var k = 0; k < otherResources.length; k++){
        g_form.addOption('api_resource', otherResources[k], otherResources[k]);
    }
   
}
