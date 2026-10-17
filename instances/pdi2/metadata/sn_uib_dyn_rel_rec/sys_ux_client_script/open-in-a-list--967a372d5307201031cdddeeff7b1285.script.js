/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({api, event, helpers, imports}) {
    let redirectPayload = {
        "redirect": true,
        "route":"simplelist",
        "targetRoute": "current",
        "title": api.state.selectedLabel,
        "fields": {
            "table": api.state.selectedTable
        },
       "params": {
            "listTitle": api.state.selectedLabel,
            "query": api.state.selectedFilter
        }
    };
    api.emit("NAV_ITEM_SELECTED", redirectPayload);
}
