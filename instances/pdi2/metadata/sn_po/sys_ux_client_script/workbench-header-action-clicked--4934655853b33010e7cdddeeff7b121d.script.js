/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const {
        item
    } = event.payload;
    const {
        id: modelDefinitionId,
        domain
    } = api.state.header_data.raw.scheduleModel.modelDefinition;
    switch (item.id) {

        case 'create-initiative':
            const {
                getNewCIMFormPayload
            } = imports["global.prominUtils"]();
            
            api.emit("NAV_ITEM_SELECTED", getNewCIMFormPayload({
                modelDefinitionId,
                domain
            }));
            break;

        case 'edit-versions':
            api.emit('NAV_ITEM_SELECTED', {
                "redirect": true,
                "route": "simple-list",
                "fields": {
                    "table": "promin_model_def_version"
                },
                "params": {
                    "query": `model_def.sys_id=${modelDefinitionId}`,
                    "listTitle": "Edit Versions",
                    "listView": "Workspace"
                }
            });
    }
}
