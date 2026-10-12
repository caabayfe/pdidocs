/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
	if (event.elementId === 'quantity_input') {
		api.setState('tempQuantity',event.payload.value);
	}
}
