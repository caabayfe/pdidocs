/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const title = await helpers.translate("Add Permissions");
    api.emit('NAV_ITEM_SELECTED', {
                "redirect": true,
                "route": "simplelist",
                "fields": {
                    "table": "promin_permission"
                },
                "params": {
                    "query": `project=${api.context.props.projectId}`,
                    "listTitle": title,
                    "listView": "Default view",
                    "views": "Default view",
            }
    });
}
