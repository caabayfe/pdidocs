function script({ api, event, helpers, imports }) {
	//extendedPropAccordianItemExpanded fired when accordian item is expanded on properties panel for extended props
	const { buildUserPrefWithAppId } = imports["sn_cmdb_ws.unifiedMapUtils"]();
	const { USER_PREFERENCE } = imports["sn_cmdb_ws.unifiedMapPropertiesUtils"]();
	api.setState("additionalAttributesExpanded", event.payload.value);
	let userPreferenceList = buildUserPrefWithAppId([USER_PREFERENCE.ADDITIONAL_ATTRIBUTES_EXPANDED], api.context.app.appId);
	//Update new preference
	api.data.save_user_prefs.execute({
		name: userPreferenceList[USER_PREFERENCE.ADDITIONAL_ATTRIBUTES_EXPANDED],
		value: event.payload.value
	});
}
