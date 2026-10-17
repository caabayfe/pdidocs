function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === 'false') {
      return;
   }
	var selectedSvcVal = g_form.getValue('api');
	g_form.clearOptions('version');
	
	var svcInfo = g_scratchpad.svcOptionInfos[selectedSvcVal];
	var versions = svcInfo['versions'];
	var otherVersions = [];
	for (var i = 0; i < versions.length; i++) {
		var version = versions[i];
		var versionName = version['version'];
		if(versionName == 'latest')
			g_form.addOption('version', versionName, versionName,0);
		else
			otherVersions.push(versionName);
	}
	
	for (var j = 0; j < otherVersions.length; j++){
		g_form.addOption('version', otherVersions[j], otherVersions[j]);
	}
   
}
