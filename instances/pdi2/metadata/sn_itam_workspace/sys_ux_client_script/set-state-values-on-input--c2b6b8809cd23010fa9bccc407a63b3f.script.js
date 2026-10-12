/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    if (event.elementId === 'substateSelect') {
        api.setState('substate', event.payload.value);
    } else if (event.elementId === 'assetFunctionSelect') {
        api.setState('assetFunction', event.payload.value);
    } else if (event.elementId === 'qtyInput') {
        api.setState('quantity', event.payload.value);
    }
}
