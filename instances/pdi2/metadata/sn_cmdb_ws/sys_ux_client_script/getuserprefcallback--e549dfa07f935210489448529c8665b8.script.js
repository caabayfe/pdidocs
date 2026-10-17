function script({ api, event, helpers, imports }) {
	//getUserPrefCallback called in properties controller when properties user preferences are fetched
	const { buildUserPrefWithAppId } = imports['sn_cmdb_ws.unifiedMapUtils']();
	const { USER_PREFERENCE } = imports["sn_cmdb_ws.unifiedMapPropertiesUtils"]();
	let EXTENDED_ATTRIBUTE_PREF_NAME = buildUserPrefWithAppId([USER_PREFERENCE.ADDITIONAL_ATTRIBUTES_EXPANDED], api.context.app.appId);
	let data = api.data.get_user_prefs?.output;
	api.setState("additionalAttributesExpanded", data ? data[EXTENDED_ATTRIBUTE_PREF_NAME[USER_PREFERENCE.ADDITIONAL_ATTRIBUTES_EXPANDED]]?.toLowerCase() === "true" : false);
}
