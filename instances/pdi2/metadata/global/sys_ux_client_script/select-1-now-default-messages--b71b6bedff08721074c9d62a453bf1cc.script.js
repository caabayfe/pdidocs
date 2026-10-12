/**
	* @param {params} params
	* @param {api} params.api
	* @param {TransformApiHelpers} params.helpers
	*/
function evaluateProperty({api, helpers}) {
	let alert = [];
	let data = api.data.get_auth_scopes_and_api_for_oauth_entity_1.output;
	let useraccountScope = data ? data.useraccountScope : "";
	let isUseraccountScope = api.item.value.selectedScope == useraccountScope;
	if(isUseraccountScope) {
		alert.push({
			"content": api.state.translatedMessages["useraccountScopeSelected"],
			"icon": "circle-exclamation-outline",
			"status": "warning"
		});
	}
	
	return alert;
}
