function script({ api, event, helpers, imports }) {
	//tabChanged script; fired after user selects a different tab on the right
	const { rightPanelSelectedTabIndexPrefName, rightPanelSelectedTabIndexEditModePrefName, buildUserPrefWithAppId } = imports["sn_cmdb_ws.unifiedMapUtils"]();
	var newTab = parseInt(event.payload.newTab);
	if (typeof newTab === 'undefined') return;
	const tabPref = buildUserPrefWithAppId([rightPanelSelectedTabIndexPrefName], api.context.app.appId);
	//exit if same tab; have to do this additional conditional check here 
	// since UX Formulae can't use square brackets in Vancouver to reference dynamic prop name

	//If the new tab is add ci to map panel
	if (api.context.props.editMode && newTab === 1) {
		api.setState('prevPanelWidthPosition', api.state.rightPanelMinWidthPosition);
		api.setState('rightPanelMinWidthPosition', api.state.rightPanelMinWidthPositionAddCiToMapPanel);
	} else if (api.state.prevPanelWidthPosition) {
		api.setState('rightPanelMinWidthPosition', api.state.prevPanelWidthPosition);
		api.setState('prevPanelWidthPosition', null);
	}
	const selectedTabPref = api.context.props.editMode
		? tabPref[rightPanelSelectedTabIndexEditModePrefName]
		: tabPref[rightPanelSelectedTabIndexPrefName];

	if (newTab === parseInt(api.data.get_user_prefs.output[selectedTabPref]))
		return;

	api.setState('rightPanelSelectedTabIndex', newTab);

	api.data.save_user_prefs.execute({
		name: api.context.props.editMode ? tabPref[rightPanelSelectedTabIndexEditModePrefName] : tabPref[rightPanelSelectedTabIndexPrefName],
		value: newTab
	});

	//handle tab switch when tabs are closed since it'll automatically open it so we need to
	// 1) adjust the position of the sizing handle, 
	// 2) set the side panel to false for isCollapsed, 
	// 3) set the minWidth
	//skip on initial page load since setting the last used tab would normally open it, but they want to retain the collapsed state
	if (api.state.rightPanelIsCollapsed) {
		const {
			rightPanelIsCollapsedPrefName,
			rightPanelCurrentPositionPrefName,
			rightPanelMinWidthPositionPrefName,
			rightPanelMinWidthPositionMinPixels,
			rightPanelMinWidthPositionMinRatioNonCollapsed
		} = imports["sn_cmdb_ws.unifiedMapUtils"]();
		const panelPrefList = buildUserPrefWithAppId([rightPanelIsCollapsedPrefName,
			rightPanelCurrentPositionPrefName,
			rightPanelMinWidthPositionPrefName], api.context.app.appId);
		//first update state
		api.setState('rightPanelIsCollapsed', false);
		let newCurrentPosition = api.state.rightPanelNonCollapsedPosition;
		api.setState('rightPanelCurrentPosition', newCurrentPosition);
		let newMinWidth = JSON.stringify({
			minRatio: rightPanelMinWidthPositionMinRatioNonCollapsed,
			minPixels: rightPanelMinWidthPositionMinPixels
		});
		api.setState('rightPanelMinWidthPosition', newMinWidth);

		//update user prefs async for next page load/session
		api.data.save_user_prefs.execute({
			name: panelPrefList[rightPanelIsCollapsedPrefName],
			value: false
		});

		api.data.save_user_prefs.execute({
			name: panelPrefList[rightPanelCurrentPositionPrefName],
			value: newCurrentPosition
		});

		api.data.save_user_prefs.execute({
			name: panelPrefList[rightPanelMinWidthPositionPrefName],
			value: newMinWidth
		});
	}
}
