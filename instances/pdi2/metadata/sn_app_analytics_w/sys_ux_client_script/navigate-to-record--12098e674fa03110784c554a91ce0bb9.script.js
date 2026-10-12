/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
        api.emit('NAV_ITEM_SELECTED', {
        route: 'record',
        title: event.payload.row.displayValue.value,
        fields: {
            table: event.payload.table,
            sysId: event.payload.row.sys_id.value
        }
    });
}
