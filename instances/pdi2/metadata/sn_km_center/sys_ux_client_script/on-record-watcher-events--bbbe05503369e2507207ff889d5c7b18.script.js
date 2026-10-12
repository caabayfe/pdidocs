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
    if (event.name === 'RECORD_WATCHER#MESSAGE_RECEIVED') {
        if (api.state.isGenAiTimedOut) {
            // TODO: send Gen AI feedback = Ignored
            return;
        }

        api.setState('isGenAiGenerating', false);
        helpers.timing.clearTimeout(api.state.genAiTimeoutId);
        var response = JSON.parse(event.payload.data.record.gen_ai_response.value);
        for (var key in response.outputFields) {
            api.emit('GEN_AI_SET_FIELD', {
                fieldName: key,
                value: response.outputFields[key]
            });
        }
        api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
            items: [{
                id: "na_drafted",
                status: "moderate",
                icon: "sn-sparkmoji-logo-outline",
                content: await helpers.translate("This article was drafted by AI. Be sure to review it for accuracy before saving."),
                action: {
                    type: "dismiss"
                }
            }]
        });
        api.setState('isGenAiGenerated', true);
        api.emit("NOW_UXF_PAGE#REMOVE_NOTIFICATIONS", {
            items: [{
                id: "na_drafting"
            }]
        });
        helpers.modal.close("modal_gen_ai");
        var selectedRecords = [];
        if (api.state.genAiSourceRecordId != null && api.state.genAiSourceRecordId.trim().length > 0) {
            selectedRecords.push(api.state.genAiSourceRecordId);
        }
        if (api.state.filteredSelectedTasks) {
            for (var id in api.state.filteredSelectedTasks) {
                selectedRecords.push(id);
            }
        }
        api.setState('telemetryPayload', {
            event_key: 'taskList',
            targetTableSysId: api.data.record.sysId,
            selectedRecords: selectedRecords
        });
        api.setState('isTelemetryExecuting', true);
    }
    
}
