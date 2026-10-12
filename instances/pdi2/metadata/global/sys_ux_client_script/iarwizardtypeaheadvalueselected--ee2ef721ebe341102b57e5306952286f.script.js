/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const val = JSON.stringify({
	    selectedItems: event.payload.value,
    });
 
    api.emit('MACROPONENT_VALUE_CHANGED', {
            value: event.payload.value.length > 0 ? val : ""
    });
}
