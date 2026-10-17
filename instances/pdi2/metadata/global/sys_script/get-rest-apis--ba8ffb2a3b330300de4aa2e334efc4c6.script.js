(function executeRule(current, previous) {
	var svcInfos = getSeviceInfos();
	if (svcInfos.length > 0) {
		g_scratchpad.svcOptionInfos = buildSvcOptionInfos(svcInfos);
	} else {
		gs.addErrorMessage("Failed to retrieve list of REST APIs");
	}

})(current, previous);

function buildSvcOptionInfos(svcInfos) {
	var svcOptionInfos = {};
	
	for (var idx in svcInfos) {
		var opInfo = {};
		opInfo.scripted = svcInfos[idx].isScripted();
		opInfo.route = svcInfos[idx].getRoute();
		opInfo.sysId = svcInfos[idx].getSysId();
		//get all versions and their respective resources
		var svcVersions = svcInfos[idx].getVersions();
		opInfo.versions = getVersions(svcVersions);
		svcOptionInfos[svcInfos[idx].getServiceName()] = opInfo;
	}
	return svcOptionInfos;
}

function getSeviceInfos() {
	var sr = new sn_ws.ServicesRetriever();
	return sr.getServices("", false);
}

function getVersions(versions) {
	var versionInfos = [];
	for (var i = 0; i < versions.length; i++) {
		var resources = versions[i].getResources();
		var resInfos = [];
		//get all resources for each version
		for(var j = 0; j < resources.length; j++){
			var resInfo = {};
			resInfo.method = resources[j].getHTTPMethod();
			resInfo.route = resources[j].getRoute();
			resInfos.push(resInfo);
		}
		var versionInfo = {};
		versionInfo.version = versions[i].getVersion();
		versionInfo.resources = resInfos;
		versionInfos.push(versionInfo);
	}
	return versionInfos;
}
