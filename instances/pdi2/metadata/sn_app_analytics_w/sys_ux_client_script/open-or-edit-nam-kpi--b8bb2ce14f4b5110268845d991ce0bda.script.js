/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.emit('NAV_ITEM_SELECTED', {
        route: 'pa-new-model-kpi',
        title: 'Untitled - KPI',
        icon: 'kpi-outline',
        fields: {
            // sysId is undefined when user clicks "New" button on viz library
            sysId: event.payload.sysId == -1 ? 'new-kpi-' + Date.now() : event.payload.sysId
        }
    });
}
