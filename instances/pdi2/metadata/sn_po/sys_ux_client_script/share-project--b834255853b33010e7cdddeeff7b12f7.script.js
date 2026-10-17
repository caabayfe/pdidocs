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
    const {
        id: modelDefinitionId
    } = api.state.header_data.raw.scheduleModel.modelDefinition;

    api.emit('NAV_ITEM_SELECTED', {
        "redirect": true,
        "route": "simple-list",
        "fields": {
            "table": "promin_permission"
        },
        "params": {
            "query": `model_def.sys_id=${modelDefinitionId}`,
            "listTitle": "Permissions"
        }
    });

}
