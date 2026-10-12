function onDisplay(current, g_scratchpad) {
	var svcInfos = getSeviceInfos();
	if (svcInfos.length > 0) {
		g_scratchpad.svcOptionInfos = buildSvcOptionInfos(svcInfos);
	} else {
		gs.addErrorMessage("Failed to retrieve list of REST APIs");
	}
}

/*
 *  Builds info object to populate 'rest_api' field options.
 *  svcOptionInfo :-
 *
 *  Eg. 'Table API' : {'scripted': false,
 *                     'sys_id':  sys_id value from doc service.
 *                     'route': route value from doc service.
 *                    }
 */
function buildSvcOptionInfos(svcInfos) {
	var svcOptionInfos = {};
	
	for (var idx in svcInfos) {
		var opInfo = {};
		opInfo.scripted = svcInfos[idx].isScripted();
		opInfo.route = svcInfos[idx].getRoute();
		opInfo.sysId = svcInfos[idx].getSysId();
		svcOptionInfos[svcInfos[idx].getServiceName()] = opInfo;
	}
	return svcOptionInfos;
}

function getSeviceInfos() {
	var sr = new sn_ws.ServicesRetriever();
	return sr.getServices("", false);
}
