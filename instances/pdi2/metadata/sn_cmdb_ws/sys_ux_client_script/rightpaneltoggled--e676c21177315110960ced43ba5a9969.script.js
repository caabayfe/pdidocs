function script({ api, event, helpers, imports }) {
	//rightPanelToggled script; fired after clicking the already selected view button again
	const {
		rightPanelIsCollapsedPrefName,
		rightPanelCurrentPositionPrefName,
		rightPanelMinWidthPositionPrefName,
		rightPanelMinWidthPositionMinPixels,
		rightPanelMinWidthPositionMinRatioNonCollapsed,
		rightPanelMinWidthPositionMinRatioCollapsed,
		rightPanelCollapsedPosition,
		buildUserPrefWithAppId
	} = imports["sn_cmdb_ws.unifiedMapUtils"]();

	var isHidden = event.payload.isHidden;
	const userPreferenceList = buildUserPrefWithAppId([rightPanelIsCollapsedPrefName, 
        rightPanelCurrentPositionPrefName, 
        rightPanelMinWidthPositionPrefName], api.context.app.appId);
	//first update state    
	api.setState('rightPanelIsCollapsed', isHidden);
	let newCurrentPosition = isHidden ? rightPanelCollapsedPosition : api.state.rightPanelNonCollapsedPosition;
	api.setState('rightPanelCurrentPosition', newCurrentPosition);
	let newMinWidth = JSON.stringify({
		minRatio: isHidden ? rightPanelMinWidthPositionMinRatioCollapsed : rightPanelMinWidthPositionMinRatioNonCollapsed,
		minPixels: rightPanelMinWidthPositionMinPixels
	});
	api.setState('rightPanelMinWidthPosition', newMinWidth);

	//update user prefs async for next page load/session
	api.data.save_user_prefs.execute({
		name: userPreferenceList[rightPanelIsCollapsedPrefName],
		value: isHidden
	});

	api.data.save_user_prefs.execute({
		name: userPreferenceList[rightPanelCurrentPositionPrefName],
		value: newCurrentPosition
	});

	api.data.save_user_prefs.execute({
		name: userPreferenceList[rightPanelMinWidthPositionPrefName],
		value: newMinWidth
	});
}
