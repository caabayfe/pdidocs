/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const payload = {
        elementId: event.elementId,
        fields: {
            table: event.payload.item.table,
            sysId: event.payload.item.sysId
        }
    };
    api.emit('RECORD#NAV_ITEM_SELECTED', payload);
}
