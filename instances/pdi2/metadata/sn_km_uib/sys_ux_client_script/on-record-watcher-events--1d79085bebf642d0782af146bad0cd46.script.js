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
        var record = event.payload.data.record;
        var response = JSON.parse(record.gen_ai_response.value);
        if(record.task_ids){
            var taskArr = record.task_ids.value.split(',');
            var offensiveSrcErrorMsg = await helpers.translate("AI detected content that may be harmful or offensive while processing this request. Your organization has chosen to block the output.");
            var isOffensiveSrc = api.state.genAiSourceRecordId && !(taskArr.includes(api.state.genAiSourceRecordId));
        }
        if(response.success == false || isOffensiveSrc){
           api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                items: [{
                    id: "na_error",
                    status: "critical",
                    icon: "sn-sparkmoji-logo-outline",
                    content: response.errorMessage || offensiveSrcErrorMsg,
                    action: {
                        type: "dismiss"
                    }
                }]
            });
            api.setState('isGenAiGenerated', false);
            helpers.modal.close("modal_gen_ai");
            return;
        }
        for (var key in response.outputFields) {
            api.emit('GEN_AI_SET_FIELD', {
                fieldName: key,
                value: response.outputFields[key]
            });
        }

        var taskNumbers = "";
        taskArr.forEach(function(task, idx){
            if(!api.state.filteredSelectedTasks[task]){
                taskNumbers = taskNumbers + api.state.taskNumber;
            }else{
                taskNumbers = taskNumbers + api.state.filteredSelectedTasks[task].cells.number.value; 
            }
            if(idx < taskArr.length - 1){
                taskNumbers += ", ";
            }
        });

        var content = await helpers.translate("Article successfully generated from the following record(s): {0}. Check AI-generated content for accuracy.", taskNumbers);

        
        api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
            items: [{
                id: "na_drafted",
                status: "ai",
                icon: "sn-sparkmoji-logo-outline",
                content: {
                    type: "html",
                    value: content
                },
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
            selectedRecords: taskArr
        });
        api.setState('isTelemetryExecuting', true);

        helpers.timing.setTimeout(function() {
            api.setState('telemetryPayload', {
            event_key: 'isGeneratedFromCustomTemplateFramework',
            targetTableSysId: api.data.record.sysId,
            sourceTable: api.state.sourceTable,
            targetTable: api.state.targetTable
        });
         api.setState('isTelemetryExecuting', true);    
        }, 1000);

    }
    
}
