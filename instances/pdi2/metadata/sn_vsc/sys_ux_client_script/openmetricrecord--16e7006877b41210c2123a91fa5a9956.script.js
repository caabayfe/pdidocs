/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (event.payload != undefined) {
        var targetUrl = '/now/security-center-configuration/record/' + event.payload.table + '/' + event.payload.sys_id;
        api.emit('NAV_ITEM_SELECTED', {
            external: {
                url: targetUrl,
                "target": "_self"
            }
        });
    }
}
