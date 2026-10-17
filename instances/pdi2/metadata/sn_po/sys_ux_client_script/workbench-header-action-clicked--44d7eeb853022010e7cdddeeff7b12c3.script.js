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
        projectId,
        domain
    } = api.state.header_data.raw.scheduleModel.project;
    const {
        getNewCIMFormPayload,
        getWindowObject
    } = imports["global.prominUtils"]();

    switch (item.id) {
        case 'create-cim':
            api.emit("NAV_ITEM_SELECTED", getNewCIMFormPayload({
                modelDefinitionId: projectId,
                domain
            }));
            break;

        case 'edit-versions':
            api.emit('NAV_ITEM_SELECTED', {
                "redirect": true,
                "route": "simplelist",
                "fields": {
                    "table": "promin_model_def_version"
                },
                "params": {
                    "query": `project=${projectId}`,
                    "listTitle": "Edit Versions",
                    "listView": "Workspace"
                }
            });
            break;
        case 'edit-project':
            helpers.navigate.to("promin_project", {
            projectId: projectId,
            stage: 'overview'
        }, null, true);
            break;
        case 'new-coe':
            api.emit("NAV_ITEM_SELECTED", {
                "redirect": true,
                "route": "record",
                "fields": {
                    "table": "sn_ac_automation_request",
                    "sysId": "-1"
                },
                "params": {
                    "query": `source_table=promin_project^source_record=${projectId}^intake_source=process_opt`,
                    "selectedTabIndex": "0"
                }
            });
    }
}
