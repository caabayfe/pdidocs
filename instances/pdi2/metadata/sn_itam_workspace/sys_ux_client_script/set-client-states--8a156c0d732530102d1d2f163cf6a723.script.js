/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    var value = event.payload.value;
    if(event.elementId === 'stockroom_select')
        api.setState('currentStockroom', value);
    else if(event.elementId === 'substate_select')
        api.setState('substate', value);
}
