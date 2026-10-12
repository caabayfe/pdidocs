/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.emit('NAV_ITEM_SELECTED', {
                "redirect": true,
                "route": "simplelist",
                "fields": {
                    "table": "promin_log"
                },
                "params": {
                    "query": `project=${event.payload.projectId}^model_def_version=${event.payload.versionId}`,
                    "listTitle": "Mining Logs",
        }
    });
}
