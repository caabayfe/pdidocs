/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
let recordInfo = event.context.item.value;
    let sysId = recordInfo.sysId;
    let table = recordInfo.table;
    
    let customPayload = {
        "route": 'record',
        "targetRoute": null,
        "fields": {
            table: table,
            sysId: sysId
        },
        "params": {
            selectedTabIndex: 0
        },
        "redirect": true,
        "passiveNavigation": null,
        "title": null,
        "multiInstField": null,
        "external": null
    };
    api.emit('NAV_ITEM_SELECTED', customPayload);
}
