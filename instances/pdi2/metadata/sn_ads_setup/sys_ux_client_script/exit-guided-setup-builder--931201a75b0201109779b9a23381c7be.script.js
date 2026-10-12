/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if(event.payload.canCloseTab) {
        api.emit("NAV_ITEM_SELECTED", { 
            "external": { 
                "url": "now/adoptionservices/home/params/selectedTabIndex/1",
                "target": "_self" 
            }
        });
    }
}
