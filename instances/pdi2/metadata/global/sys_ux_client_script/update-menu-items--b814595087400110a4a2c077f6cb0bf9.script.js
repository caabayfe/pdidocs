/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const menu_items = api.data.get_menu_items.results.map(function(item, index) {
        return {
            "payload": {
                index: index,
                ...item
            }
        };
    });
    api.setState("menu_items", menu_items);
}
