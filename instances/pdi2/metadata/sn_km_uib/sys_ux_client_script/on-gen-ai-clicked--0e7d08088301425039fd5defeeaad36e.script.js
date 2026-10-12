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
    if (api.state.genAiSourceRecordId) {
        api.setState('isSearchLoading', true);
        api.setState('multitaskOKButtonLabel', await helpers.translate("Continue without more tasks"));
    } else if (api.state.extraParams?.gapsSysIds?.length > 0) {
        var taskRecords = api.data.fetch_gaps_incident_sysids.results;
        if (taskRecords) {
            var sources = {};
            for (var i = 0; i < taskRecords.length; i++) {
                var taskSysId = taskRecords[i].task.value;
                var taskNumber = taskRecords[i].task.displayValue;
                sources[taskSysId] = {
                    "key": taskSysId,
                    "cells": {
                        "number": {
                            "value": taskNumber,
                            "label": taskNumber
                        }
                    }
                };
            }
            api.setState('filteredSelectedTasks', sources);
        }

        if(api.state.canShowLanguagePicker){
            helpers.modal.close("modal_gen_ai");
            helpers.modal.open('knowledge_base_and_language_modal');
        } else {
            api.setState('isGenAiGenerating', true);

            const timeoutMessage = await helpers.translate("There was a problem generating this article with AI (timed out). You can write it yourself now if you'd like.");

            const genAiTimeoutId = helpers.timing.setTimeout(function() {
                api.setState('isGenAiTimedOut', true);
                api.setState('isGenAiGenerating', false);
                api.emit("NOW_UXF_PAGE#REMOVE_NOTIFICATIONS", {
                    items: [{
                        id: "na_drafting"
                    }]
                });
                helpers.modal.close("modal_gen_ai");
                api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                    items: [{
                        id: "na_error",
                        status: "critical",
                        icon: "sn-sparkmoji-logo-outline",
                        content: timeoutMessage,
                        action: {
                            type: "dismiss"
                        }
                    }]
                });
            }, api.state.genAiTimeout);

            api.setState('genAiTimeoutId', genAiTimeoutId);
        }
    } else {
        helpers.modal.close("modal_gen_ai");
        helpers.modal.open("modal_multitask_selector");
        api.setState('multitaskOKButtonLabel', await helpers.translate("Continue with selected tasks"));
        api.setState('multitaskOKButtonIsDisabled', true);
    }
}
