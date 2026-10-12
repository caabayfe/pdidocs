/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
	api.setState('predefinedFilterType', event.payload.item.id);
	api.emit('CONTENT_UPDATED', {
		params: {
			filter: event.payload.item.id
		}
	});
}
