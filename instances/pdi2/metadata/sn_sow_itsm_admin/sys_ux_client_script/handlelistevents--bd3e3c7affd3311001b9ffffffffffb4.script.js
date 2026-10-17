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
    //Default Client Scripts to handle updates to aceContents and blockcontext should be in App Shell
    if (eventName == "list-wrapped-action-clicked") {
        let msgs = {
            "items": []
        };
        let actionId = eventPayload.wrappedAction;
        if (actionId == "CREATE_NEW_RECORD") {
            blockcontext.taskSysId = "-1";
            blockcontext.taskName = "";
            blockcontext.selectedChannelInfo = {
                emailTemplate: null,
                channelInfoMessage: [],
                channels: [],
                selectedChannelType: "none"
            }
            blockcontext.filteredChannels = [];
            blockcontext.showChannelField = false;
            blockcontext.showTaskCreateSubtitle = true;
            blockcontext.showTaskUpdateSubtitle = false;
            blockcontext.showEmailTemplateField = false;
            await aceUtils.setContext(blockcontext);
            aceUtils.openModal("abfb-8d50-bbb9aa-538d-99b98c8b");
        } else if (actionId == "SOW_ADMIN_CENTER_LIST#DELETE_BUTTON_CLICKED") {
            aceUtils.openModal("3d7b-62c4-babb99-cb37-988915b9");
        } else if (actionId == "SOW_ADMIN_CENTER_LIST#ACTIVATE_BUTTON_CLICKED") {
            await aceUtils.refreshContentBlock("data_block_7");
            let message = await helpers.translate("The selected task definition(s) have been activated");
            blockcontext = await aceUtils.getContext();
            if (blockcontext.showActivateAlert == true) {
                msgs.items.push({
                    "id": "success-msg",
                    "action": {
                        "type": "dismiss"
                    },
                    "content": message,
                    "status": "positive",
                    "icon": "info-circle-outline",
                });
            }
            api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', msgs);
        } else if (actionId == "SOW_ADMIN_CENTER_LIST#DEACTIVATE_BUTTON_CLICKED") {
            await aceUtils.refreshContentBlock("data_block_8");
            let message = await helpers.translate("The selected task definition(s) have been deactivated");
            blockcontext = await aceUtils.getContext();
            if (blockcontext.showDeactivateAlert == true) {
                msgs.items.push({
                    "id": "success-msg",
                    "action": {
                        "type": "dismiss"
                    },
                    "content": message,
                    "status": "positive",
                    "icon": "info-circle-outline",
                });
            }
            api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', msgs);
        } else if (actionId == "SOW_ADMIN_CENTER_LIST#COPY_BUTTON_CLICKED") {
            await aceUtils.refreshContentBlock("data_block_11");
            aceUtils.openModal("fe78-7028-9ba9ab-339b-bbb8e498");
        }
    } else if (eventName == "task-def-ref-clicked") {
        blockcontext.taskSysId = eventPayload.row.sys_id.value;
        blockcontext.taskName = eventPayload.row.displayValue.value;
        blockcontext.showTaskCreateSubtitle = false;
        blockcontext.showTaskUpdateSubtitle = true;
        await aceUtils.setContext(blockcontext);
        await aceUtils.refreshContentBlock("data_block_9")
        if (eventPayload.table == "comm_task_definition") {
            aceUtils.openModal("abfb-8d50-bbb9aa-538d-99b98c8b");
        } else if (eventPayload.table == "comm_plan_definition") {
            let recordURL = "now/sow-admin/mim-setup-communications-update-plan" + "/" + eventPayload.sys_id;
            helpers.navigate.to(null, null, null, false, false, null, {
                url: recordURL
            });
        } else {
            let recordURL = "now/sow-admin/record/" + eventPayload.table + "/" + eventPayload.sys_id;
            helpers.navigate.to(null, null, null, false, false, null, {
                url: recordURL
            });

        }

    } else if (eventName == "list-row-selected") {
        blockcontext.selectedRecords = eventPayload.selectedRecords;
        await aceUtils.setContext(blockcontext);
    }
}
