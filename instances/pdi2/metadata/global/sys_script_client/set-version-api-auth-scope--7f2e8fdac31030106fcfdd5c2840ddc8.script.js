function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (newValue === '') {
		return;
	}
	var selectedVersionVal = g_form.getValue('version');
	g_form.clearOptions('version');
	
	var svcInfo = g_scratchpad.svcOptionInfos[newValue];
	var versions = svcInfo['versions'];
	var otherVersions = [];
	for (var i = 0; i < versions.length; i++) {
		var version = versions[i];
		var versionName = version['version'];
		if(versionName == selectedVersionVal )
			g_form.addOption('version', versionName, versionName,0);
		else
			otherVersions.push(versionName);
	}
	
	for (var j = 0; j < otherVersions.length; j++){
		g_form.addOption('version', otherVersions[j], otherVersions[j]);
	}
}
