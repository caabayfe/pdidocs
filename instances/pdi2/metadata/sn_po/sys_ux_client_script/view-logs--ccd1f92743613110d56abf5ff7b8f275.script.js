/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    helpers.modal.close("[component-id$='remine-findings']");
    api.emit('NAV_ITEM_SELECTED', {
        "redirect": true,
        "route": "simplelist",
        "fields": {
            "table": "promin_log"
        },
        "params": {
            "query": `project=${api.context.props.projectId}^model_def_version=${api.state.projectData.versionId}`,
            "listTitle": "Mining Logs",
        }
    });
}
