/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    var value = event.payload.value;
    if (event.elementId === 'select_stockroom') {
        api.setState('stockroom',value);
    }
    if (event.elementId === 'input_quantity') {
        api.setState('quantity',value);
    }
    if (event.elementId === 'select_substate') {
        api.setState('substate',value);
    }
}
