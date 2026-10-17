/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
	const {getPayload} = imports['sn_sow_inc.SowParWidgetsDrilldowns']();	
    const payload = getPayload(event);	
	payload.targetRoute = "current";
	api.emit('NAV_ITEM_SELECTED', payload);
}
