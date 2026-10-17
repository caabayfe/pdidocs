function script({ api, event, helpers, imports }) {
	//getUserPrefsCallback script; fired after userPrefsLookup data broker returns
	let prefs = api.data.get_user_prefs.output;
	if (!prefs || !Object.keys(prefs).length) {
		return;
	}
	const {
		rightPanelIsCollapsedPrefName,
		rightPanelNonCollapsedPositionPrefName,
		rightPanelCurrentPositionPrefName,
		rightPanelMinWidthPositionPrefName,
		rightPanelSelectedTabIndexPrefName,
		rightPanelSelectedTabIndexEditModePrefName,
		rightPanelAddCiToMapPanelMinWidthPositionPrefName,
		buildUserPrefWithAppId
	} = imports["sn_cmdb_ws.unifiedMapUtils"]();
	const userPreferenceList = buildUserPrefWithAppId([rightPanelIsCollapsedPrefName, 
		rightPanelNonCollapsedPositionPrefName,
		rightPanelCurrentPositionPrefName,
		rightPanelMinWidthPositionPrefName,
		rightPanelSelectedTabIndexPrefName,
		rightPanelSelectedTabIndexEditModePrefName,
		rightPanelAddCiToMapPanelMinWidthPositionPrefName], api.context.app.appId);
	var BOOLEAN = 'boolean';
	var STRING = 'string';
	var NUMBER = 'number';
	//var JSON = 'json';

	assignUserPref(userPreferenceList[rightPanelIsCollapsedPrefName], 'rightPanelIsCollapsed', BOOLEAN);
	assignUserPref(userPreferenceList[rightPanelNonCollapsedPositionPrefName], 'rightPanelNonCollapsedPosition', STRING);
	assignUserPref(userPreferenceList[rightPanelCurrentPositionPrefName], 'rightPanelCurrentPosition', STRING);
	
	//map is in edit mode 
	if (api.context.props.editMode) {
		// the default tab is add ci to map panel
		if(parseFloat(prefs[userPreferenceList[rightPanelSelectedTabIndexEditModePrefName]]) === 1){
			assignUserPref(userPreferenceList[rightPanelAddCiToMapPanelMinWidthPositionPrefName], 'rightPanelMinWidthPositionAddCiToMapPanel', STRING);
			assignUserPref(userPreferenceList[rightPanelAddCiToMapPanelMinWidthPositionPrefName], 'rightPanelMinWidthPosition', STRING);
		}
		assignUserPref(userPreferenceList[rightPanelSelectedTabIndexEditModePrefName], 'rightPanelSelectedTabIndexEditMode', NUMBER);
		assignUserPref(userPreferenceList[rightPanelSelectedTabIndexEditModePrefName], 'rightPanelSelectedTabIndex', NUMBER);
	} else {
		assignUserPref(userPreferenceList[rightPanelMinWidthPositionPrefName], 'rightPanelMinWidthPosition', STRING);
		assignUserPref(userPreferenceList[rightPanelSelectedTabIndexPrefName], 'rightPanelSelectedTabIndex', NUMBER);
	}
	
	function assignUserPref(prefName, clientStateName, type) {
		var pref = prefs[prefName];
		if (pref !== null && pref !== typeof pref !== 'undefined') {
			let value;
			switch (type) {
                // case 'json':
                //     value = JSON.parse(pref);
                // 	break;
				case NUMBER:
					value = parseFloat(pref);
					break;
				case BOOLEAN:
					value = pref.toString().toLowerCase() === 'true';
					break;
				case STRING:
					value = pref.toString();
					break;
				default:
					value = pref;
			}

			api.setState(clientStateName, value);
		}
	}
}
