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
        var answer = api.data.tasks_search_1.output;
        if (answer.success) {
            var tableData = [];
            if (answer.content.order.length > 0) {
                helpers.modal.close("modal_gen_ai");

                for (var item of answer.content.order) {
                    var itemData = answer.content.data[item];
                    tableData.push({
                        "key": item,
                        "type": "default",
                        "isSelected": false,
                        "cells": {
                            "number": {
                                "value": itemData['number'],
                                "label": itemData['number']
                            },
                            "short_description": {
                                "value": itemData['short_description'],
                                "label": null
                            },
                            "description": {
                                "value": itemData['description'],
                                "label": null
                            },
                            "close_notes": {
                                "value": itemData['close_notes'],
                                "label": null
                            }
                        }
                    }, );
                }
                api.setState('searchResult', {
                    rows: tableData
                });
                helpers.modal.open("modal_multitask_selector");
            } else {
                if (api.state.genAiSourceRecordId != null && api.state.genAiSourceRecordId.trim().length > 0) {
                    if(api.state.canShowLanguagePicker){
                        helpers.modal.close('modal_gen_ai');
                        helpers.modal.open('knowledge_base_and_language_modal');
                        return;
                    }
                    console.log('Debug', 'No relevant tasks found');
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
                } else {
                    api.setState('searchResult', {
                        rows: tableData
                    });
                }
            }
            var selectedRows = api.state.selectedTasks;
            var resultRows = tableData;
            var filteredSelectedRows = {};
            for (var resultRow of resultRows) {
                if (selectedRows[resultRow.key])
                    filteredSelectedRows[resultRow.key] = selectedRows[resultRow.key];
            }
            api.setState('filteredSelectedTasks', filteredSelectedRows);
            var n = Object.keys(filteredSelectedRows).length;
            if (n == 0) {
                if (api.state.genAiSourceRecordId != null && api.state.genAiSourceRecordId.trim().length > 0) {
                    api.setState('multitaskOKButtonIsDisabled', false);
                    api.setState('multitaskOKButtonLabel', await helpers.translate("Continue without more tasks"));
                } else {
                    api.setState('multitaskOKButtonIsDisabled', true);
                    api.setState('multitaskOKButtonLabel', await helpers.translate('Continue with selected tasks'));
                }
            } else {
                api.setState('multitaskOKButtonLabel', await helpers.translate('Continue with selected tasks'));
                if (n > 5) {
                    api.setState('multitaskOKButtonIsDisabled', true);
                } else {
                    api.setState('multitaskOKButtonIsDisabled', false);
                }
            }
        } else {
            // Encountering error with search:
            // ? Stop the process and surface the error
            // ? Options to ignore and proceed with NowLLM
            if (answer.error) {
                console.log('Debug', 'Search error encountered', answer, event);
            }
        }
    } else {
        console.log('Debug', 'Search request failed', event);
    }
    api.setState('isSearchLoading', false);
}
