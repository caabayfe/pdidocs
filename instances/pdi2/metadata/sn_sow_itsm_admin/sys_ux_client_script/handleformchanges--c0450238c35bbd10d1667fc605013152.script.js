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
    //Following import statement is boiler-plate code for ACE client scripts. Please do not manipulate the next line.
    const aceUtils = imports["sn_ace.ACEClientScriptUtils"](api, helpers);

    const {
        eventName,
        eventPayload
    } = event.payload;
    //state variables --> aceContents, blockcontext
    var blockcontext = await aceUtils.getContext();
    var isTaskUpdate = false;
    //Default Client Scripts to handle updates to aceContents and blockcontext should be in App Shell
    if (eventName == "SOW_ADMIN_CENTER_GFORM_DATA_FETCH_SUCCESS") {
        if (eventPayload.table === "comm_plan_definition") {
            blockcontext.planGForm = eventPayload.gform;
            blockcontext.isPlanFormLoading = false;
            blockcontext.showPlanFormCustomFields = true;
            blockcontext.isPlanFormCustomFieldsReadOnly = !eventPayload.isEditable;
            blockcontext.isPlanFormSaveButtonEnabled = !blockcontext.isPlanFormCustomFieldsReadOnly;
        } else if (eventPayload.table === "comm_task_definition") {
            blockcontext.taskGForm = eventPayload.gform;
            blockcontext.isTaskFormLoading = false;
            blockcontext.showTaskFormCustomFields = true;
            blockcontext.isTaskFormCustomFieldsReadOnly = !eventPayload.isEditable;
            blockcontext.isTaskFormSaveButtonEnabled = !blockcontext.isTaskFormCustomFieldsReadOnly;
        }
        await aceUtils.setContext(blockcontext);
    } else if (eventName == "SOW_ADMIN_CENTER_GFORM_SAVED") {
        if (eventPayload.table === "comm_plan_definition") {
            await aceUtils.refreshContentBlock("data_block_3");
            blockcontext = await aceUtils.getContext();
            let msgs = {
                "items": []
            };
            if (blockcontext.showPlanUpdatedAlert == true) {
                let message = await helpers.translate('Plan updated!');
                msgs.items.push({
                    "id": "success-msg",
                    "action": {
                        "type": "dismiss"
                    },
                    "content": message,
                    "status": "positive",
                    "icon": "info-circle-outline",
                });
                api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', msgs);
            }
            await aceUtils.refreshContentBlock("data_block_1");
        } else if (eventPayload.table === "comm_task_definition") {
            let msgs = {
                "items": []
            };
            if (blockcontext.taskSysId == "-1") {
                blockcontext.isTaskUpdate = false;
                let taskSysId = eventPayload.sysId;
                blockcontext.taskSysId = taskSysId;
                await aceUtils.setContext(blockcontext);
                aceUtils.dismissModal("abfb-8d50-bbb9aa-538d-99b98c8b");
                await aceUtils.refreshContentBlock("data_block_2");

                blockcontext = await aceUtils.getContext();
                if (blockcontext.showTaskCreatedAlert == true) {
                    let message = await helpers.translate('Task created!');
                    msgs.items.push({
                        "id": "success-msg",
                        "action": {
                            "type": "dismiss"
                        },
                        "content": message,
                        "status": "positive",
                        "icon": "info-circle-outline",
                    });
                    api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', msgs);
                }

                await aceUtils.refreshContentBlock("data_block_14");
            } else {
                blockcontext.isTaskUpdate = true;
                await aceUtils.setContext(blockcontext);
                aceUtils.dismissModal("abfb-8d50-bbb9aa-538d-99b98c8b");
                if (blockcontext.taskChannelsModified) {
                    await aceUtils.refreshContentBlock("data_block_12")
                    await aceUtils.refreshContentBlock("data_block_2");
                    await aceUtils.refreshContentBlock("data_block_14");
                } else if (blockcontext.emailTemplateModified) {
                    await aceUtils.refreshContentBlock("data_block_13");
                } else {
                    await aceUtils.refreshContentBlock("data_block_16");
                }
                let message = await helpers.translate('Task updated!');
                msgs.items.push({
                    "id": "success-msg",
                    "action": {
                        "type": "dismiss"
                    },
                    "content": message,
                    "status": "positive",
                    "icon": "info-circle-outline",
                });
                api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', msgs);

            }
        }
    } else if (eventName == "SOW_ADMIN_CENTER_GFORM_SAVE_ATTEMPTED") {
        if (eventPayload.table === "comm_plan_definition") {
            blockcontext.triggerSave = "false";
        } else if (eventPayload.table === "comm_task_definition") {
            blockcontext.taskFormTriggerSave = "false";
        }
        await aceUtils.setContext(blockcontext);
    } else if (eventName == "recipient-selected") {
        blockcontext.selectedRecipientsList = eventPayload.value;
        blockcontext.audienceRequiredAlert = false;
        blockcontext.audienceRequiredAlertObj = [];
        await aceUtils.setContext(blockcontext);
    } else if (eventName == "comm-channel-type-selected") {
        blockcontext.selectedChannelInfo.selectedChannelType = eventPayload.value;
        blockcontext.selectedChannelInfo.channels = [];
        if (eventPayload.value == "update") {
            blockcontext.selectedChannelInfo.channelInfoMessage = [{
                "icon": "lightbulb-outline",
                "content": await helpers.translate("Multiple channels can be selected for updates")
            }];
            blockcontext.showChannelField = true;
            blockcontext.filteredChannels = blockcontext.channels.filter(function(channel) {
                return channel.classification == "update"
            });
        } else if (eventPayload.value == "bridge") {
            blockcontext.selectedChannelInfo.channelInfoMessage = [{
                "icon": "lightbulb-outline",
                "content": await helpers.translate("Only one channel can be selected for a bridge")
            }];
            blockcontext.showChannelField = true;
            blockcontext.showEmailTemplateField = false;
            blockcontext.emailTemplateModified = false;
            blockcontext.selectedChannelInfo.emailTemplate = null;
            blockcontext.filteredChannels = blockcontext.channels.filter(function(channel) {
                return channel.classification == "bridge"
            });
        } else {
            blockcontext.showChannelField = false;
            blockcontext.filteredChannels = []
        }
        await aceUtils.setContext(blockcontext);
    } else if (eventName == "channels-selected") {
        blockcontext.taskChannelsModified = true;
        if (blockcontext.selectedChannelInfo.channelInfoMessage.length > 1) {
            blockcontext.selectedChannelInfo.channelInfoMessage.pop();
        }
        if (blockcontext.selectedChannelInfo.selectedChannelType == "bridge" && eventPayload.value.length > 1) {
            eventPayload.value.shift();
        }
        blockcontext.selectedChannelInfo.channels = eventPayload.value;
        if (blockcontext.selectedChannelInfo.channels.some(function(channel) {
                return channel.id == "1513471e870013000e3dd61e36cb0bf2"; //e-mail
            })) {
            blockcontext.showEmailTemplateField = true;
        } else {
            blockcontext.showEmailTemplateField = false;
        }

        await aceUtils.setContext(blockcontext);
    } else if (eventName == "email-template-selected") {
        blockcontext.emailTemplateModified = true;
        blockcontext.selectedChannelInfo.emailTemplate = eventPayload.value;
        await aceUtils.setContext(blockcontext);
    }
}
