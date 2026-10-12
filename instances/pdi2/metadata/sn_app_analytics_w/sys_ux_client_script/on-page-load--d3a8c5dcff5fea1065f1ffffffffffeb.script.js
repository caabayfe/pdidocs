/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (api &&
        api.context &&
        api.context.app &&
        api.context.app.appId == "08c73d60537101100834ddeeff7b1287") {
            
        api.emit("NAV_ITEM_SELECTED", {
            route: "pages",
            params: {
                filter: null,
                library: "scheduled-exports"
            }
        });
    }
}
