/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var policyPayload = event.payload.cellContext.cell.componentProps.id;
    api.setState('policyPayload', policyPayload);
    api.emit('NAV_ITEM_SELECTED', {
        route: 'view-policy-details',
        params: {
            payload: policyPayload
        },
    });
}
