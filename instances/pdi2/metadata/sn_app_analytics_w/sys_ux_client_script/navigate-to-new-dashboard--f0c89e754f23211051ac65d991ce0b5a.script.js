/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.emit('NAV_ITEM_SELECTED', {
        route: 'dashboards',
        title: 'New Dashboard',
        fields: {},
        reload: true,
        params: {
            sysId: event.payload.dashboardSysId,
            tabSysId: event.payload.tabSysId,
            edit: event.payload.editMode
        }
    });
}
