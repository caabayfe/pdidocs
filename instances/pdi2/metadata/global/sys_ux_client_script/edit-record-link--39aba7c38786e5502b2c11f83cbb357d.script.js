/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (event.payload.recordTable === 'sys_cs_auto_resolution_simulation_configuration') {
        api.setState('hideAlert', true);
        api.emit('NAV_ITEM_SELECTED', {
            'route': 'simulation',
            'fields': {
                'simPage': 'details',
            },
            'params': {
                'simRecordId': event.payload.sys_id
            },
        });
    }
}
