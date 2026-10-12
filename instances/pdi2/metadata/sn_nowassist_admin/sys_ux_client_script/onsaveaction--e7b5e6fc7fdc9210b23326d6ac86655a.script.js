/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    
    var filterDetails = api.state.currFilter;
    switch (event.elementId) {
        case 'filter_name':
            filterDetails.name = event.payload.value || event.payload.fieldValue;
            break;
        case 'filter_description':
            filterDetails.description = event.payload.value || event.payload.fieldValue;
            break;
        case 'filter_group_priority':
            filterDetails.filterGroupOrder = event.payload.value || event.payload.fieldValue;
            break;
    }

    var payload;
    if (filterDetails.name && filterDetails.description && filterDetails.filterGroupOrder) {
        payload = {
            name: 'getStarted',
            validation: 'success',
            action_type: 'update',
            data: filterDetails,
            skipServerCall: false
        };
    } else {
        payload = {
            name: 'getStarted',
            validation: 'failure',
            action_type: 'update',
            data: filterDetails,
            skipServerCall: false
        };
    };
    api.emit('ACE_ACTION_PERFORMED', {
        eventName: 'ACE_GUIDEDX_ITEM_UPDATED',
        eventPayload: payload
    });

}
