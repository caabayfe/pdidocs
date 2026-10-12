/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.emit('NAV_ITEM_SELECTED', {
        external: {
            'url': '/' + event.payload.recordTable + '.do?sys_id=' + event.payload.sys_id
        }
    });
}
