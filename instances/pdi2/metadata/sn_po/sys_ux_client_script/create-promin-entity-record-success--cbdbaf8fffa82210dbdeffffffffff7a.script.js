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

    const entity = event.payload.data.output.data.GlideRecord_Mutation.insert_promin_project_entity;
    const entityId = entity?.sys_id?.value;
    const activityPayloadList = [];
    const processConfig = api.state.processConfig;

    if (entityId && processConfig && processConfig.perspectiveConfig) {
        const {
            controlFlow,
            resourceGroup
        } = processConfig.perspectiveConfig;

        if (controlFlow?.includeInNewProject) {
            activityPayloadList.push({
                "entity": entityId,
                "display_name": "",
                "type": "DEFAULT",
                "field": controlFlow.fieldName,
                "activity_of_interest": false,
                "track_change": false,
                "field_display_values": "",
                "field_values": "",
                "choose_values": false,
                "change_name": "",
                "attached_entity": null,
                "include_empty_start_node": false
            });
        }

        if (resourceGroup?.includeInNewProject) {
            activityPayloadList.push({
                "entity": entityId,
                "display_name": "",
                "type": "DEFAULT",
                "field": resourceGroup.fieldName,
                "activity_of_interest": false,
                "track_change": false,
                "field_display_values": "",
                "field_values": "",
                "choose_values": false,
                "change_name": "",
                "attached_entity": null,
                "include_empty_start_node": false
            });
        }
    }

    if (activityPayloadList.length) {
        api.data.create_multiple_promin_activities.execute({
            activityPayload: JSON.stringify(activityPayloadList)
        });
    } else {
        if (api.state.exit) {
           helpers.navigate.to("process-models", {}, { projectId: api.state.projectId }, true);
        }else{
            helpers.navigate.to("promin_project", {
                projectId: api.state.projectId,
                stage: 'scope-your-analysis'
            }, null, true);
        }
        helpers.timing.setTimeout(() => {
            api.emit('SCREEN_STATUS_CHANGED', {
                status: 'closed'
            });
        }, 200);
    }
}
