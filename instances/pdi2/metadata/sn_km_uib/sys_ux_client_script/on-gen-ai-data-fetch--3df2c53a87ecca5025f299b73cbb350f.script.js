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
    if (event.name === "DATA_FETCH_SUCCEEDED") {
        if (api.state.selectedLanguage) {
            const languageTimeout = await helpers.timing.setTimeout(function() {
                api.emit('GEN_AI_SET_FIELD', {
                    fieldName: 'language',
                    value: api.state.selectedLanguage
                });
            }, 2500);
        }
        if (api.state.isGenAiTimedOut) {
            // TODO: send Gen AI feedback = Ignored
            return;
        }
        var output = api.data.generate_article_content_with_gen_ai_1.output;

        if (output.success) {
            if (output.isAsync) {
                api.setState('asyncResponseId', output.content);
                api.setState('subscribeAsyncResponse', true);
            } else {
                api.setState('isGenAiGenerating', false);
                helpers.timing.clearTimeout(api.state.genAiTimeoutId);
                var response = output.content;
                if (response.success) {
                    for (var key in response.fields) {
                        api.emit('GEN_AI_SET_FIELD', {
                            fieldName: key,
                            value: response.fields[key]
                        });
                    }
                    var selectedRecord = api.state.genAiSourceRecordId;
                    if (!selectedRecord && api.state.filteredSelectedTasks) {
                        selectedRecord = Object.keys(api.state.filteredSelectedTasks)[0];
                    }
                    function getTaskNumber() {
                        const task = api.state.filteredSelectedTasks?.[selectedRecord];
                        return task?.cells?.number?.value || api.state.taskNumber;
                    }

                    var taskNumber = getTaskNumber();

                    var content = await helpers.translate("Article successfully generated from the following record(s): {0}. Check AI-generated content for accuracy.", taskNumber);

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

                    api.setState('telemetryPayload', {
                        event_key: 'taskList',
                        targetTableSysId: api.data.record.sysId,
                        selectedRecords: [selectedRecord]
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

                } else {
                    api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                        items: [{
                            id: "na_error",
                            status: "critical",
                            icon: "sn-sparkmoji-logo-outline",
                            content: response.errorMessage,
                            action: {
                                type: "dismiss"
                            }
                        }]
                    });
                }
                api.emit("NOW_UXF_PAGE#REMOVE_NOTIFICATIONS", {
                    items: [{
                        id: "na_drafting"
                    }]
                });
                helpers.modal.close("modal_gen_ai");
            }
        } else {
            // This branch of code should be empty since the "generate" databroker will be executed immediately on load
            // Therefore, common ending script for both DATA_FETCH_SUCCEEDED and DATA_FETCH_FAILED must be manually repeated,
            //  should not be put at the end of the script out side the outer most if else statement
        }
    } else {
        api.setState('isGenAiGenerating', false);
        helpers.timing.clearTimeout(api.state.genAiTimeoutId);

        if (api.state.isGenAiTimedOut) {
            return;
        }

        api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
            items: [{
                id: "na_error",
                status: "critical",
                icon: "sn-sparkmoji-logo-outline",
                content: await helpers.translate("There was a problem generating this article with AI. You can write it yourself now if you'd like."),
                action: {
                    type: "dismiss"
                }
            }]
        });

        api.emit("NOW_UXF_PAGE#REMOVE_NOTIFICATIONS", {
            items: [{
                id: "na_drafting"
            }]
        });
        helpers.modal.close("modal_gen_ai");
    }
}
