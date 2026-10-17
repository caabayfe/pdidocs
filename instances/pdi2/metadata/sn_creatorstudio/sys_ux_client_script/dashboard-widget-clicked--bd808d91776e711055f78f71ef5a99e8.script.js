/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
	const {getPayload} = imports['sn_app_analytics_w.ParWidgetsDrilldowns']();	
    const payload = getPayload(event);	
	api.emit('NAV_ITEM_SELECTED', payload);
}
