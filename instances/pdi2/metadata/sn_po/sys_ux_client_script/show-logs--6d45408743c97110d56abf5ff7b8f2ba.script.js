/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    const title = await helpers.translate("Mining Logs");
    if (event.elementId === 'project_actions_dropdown') {
        api.emit('NAV_ITEM_SELECTED', {
            "redirect": true,
            "route": "simplelist",
            "fields": {
                "table": "promin_log"
            },
            "params": {
                "query": `project=${api.context.props.projectId}`,
                "listTitle": title,
            }
        });
        api.emit('NAV_ITEM_SELECTED', {
            "redirect": true,
            "route": "simplelist",
            "fields": {
                "table": "promin_log"
            },
            "params": {
                "query": `project=${api.context.props.projectId}`,
                "listTitle": title,
            }
        });
        return;
    }
    helpers.modal.close("[component-id$='mining_summary']");
    api.emit('NAV_ITEM_SELECTED', {
        "redirect": true,
        "route": "simplelist",
        "fields": {
            "table": "promin_log"
        },
        "params": {
            "query": `project=${api.context.props.projectId}^model_def_version=${api.state.projectData.versionId}`,
            "listTitle": title,
        }
    });
}
