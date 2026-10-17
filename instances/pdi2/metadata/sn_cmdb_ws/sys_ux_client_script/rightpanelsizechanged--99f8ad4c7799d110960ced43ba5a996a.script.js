function script({ api, event, helpers, imports }) {
	//rightPanelSizeChanged script; fired after user moves the panel sizing handle
	const {
		rightPanelNonCollapsedPositionPrefName,
		rightPanelCollapsedPosition,
		rightPanelCurrentPositionPrefName,
		buildUserPrefWithAppId
	} = imports["sn_cmdb_ws.unifiedMapUtils"]();
    const userPreferenceList = buildUserPrefWithAppId([rightPanelNonCollapsedPositionPrefName, 
		rightPanelCurrentPositionPrefName], api.context.app.appId);
	var dividerPosition = parseFloat(event.payload.dividerPosition);
	var incomingPosition = parseFloat(dividerPosition !== null && typeof dividerPosition !== 'undefined' ? dividerPosition.toString() : dividerPosition);
	let newCurrentPosition = parseFloat(api.state.rightPanelIsCollapsed ? rightPanelCollapsedPosition : incomingPosition);
	
    //only save if it's not the same position for NonCollapsedPosition
	if (!api.state.rightPanelIsCollapsed 
    && incomingPosition !== parseFloat(api.data.get_user_prefs.output[userPreferenceList[rightPanelNonCollapsedPositionPrefName]])) {
		api.setState('rightPanelNonCollapsedPosition', incomingPosition);
		api.data.save_user_prefs.execute({
			name: userPreferenceList[rightPanelNonCollapsedPositionPrefName],
			value: incomingPosition
		});
	}

    //only save if it's not the same position for currentPosition
    if (newCurrentPosition !== parseFloat(api.data.get_user_prefs.output[userPreferenceList[rightPanelCurrentPositionPrefName]])) {
        api.data.save_user_prefs.execute({
            name: userPreferenceList[rightPanelCurrentPositionPrefName],
            value: newCurrentPosition
        });
    }
}
