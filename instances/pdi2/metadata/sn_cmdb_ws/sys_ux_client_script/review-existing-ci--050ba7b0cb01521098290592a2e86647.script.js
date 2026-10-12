/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
	let {
		identifyCiExistingCiClass : table,
		identifyCiExstingSysId : sysId
	} = api.state;
	
	helpers.navigate.to('record', { table, sysId}, null, null, null, "current");
	helpers.modal.close('identify_ci_modal');
}
