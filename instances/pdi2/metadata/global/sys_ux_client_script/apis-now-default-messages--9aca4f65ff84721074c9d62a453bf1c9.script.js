/**
	* @param {params} params
	* @param {api} params.api
	* @param {TransformApiHelpers} params.helpers
	*/
function evaluateProperty({api, helpers}) {
	let alert = [];
	let data = api.data.get_auth_scopes_and_api_for_oauth_entity_1.output;
	if (data == undefined)
		return;

	let useraccountScope = data ? data.useraccountScope : "";
	let notUseraccountScope = (api.item.value.selectedScope != "") && (api.item.value.selectedScope != useraccountScope);
	if(notUseraccountScope && api.item.value.selectedAPIs.length == 0) {
		alert.push({
			"content": api.state.translatedMessages["noAPIsAssociatedWarning"],
			"icon": "circle-exclamation-outline",
			"status": "critical"
		});
	}
	
	return alert;
}
