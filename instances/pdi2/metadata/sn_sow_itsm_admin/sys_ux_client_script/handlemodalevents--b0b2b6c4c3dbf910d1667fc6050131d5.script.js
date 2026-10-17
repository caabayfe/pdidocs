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
    if (eventName == "dismiss-modal") {
        aceUtils.dismissModal("abfb-8d50-bbb9aa-538d-99b98c8b");
    } else if (eventName == "modal-save-clicked") {
        if (blockcontext.selectedChannelInfo.selectedChannelType != "none" && blockcontext.selectedChannelInfo.channels.length == 0) {
            if (blockcontext.selectedChannelInfo.channelInfoMessage.length < 2) {
                blockcontext.selectedChannelInfo.channelInfoMessage.push({
                    "icon": "circle-exclamation-outline",
                    "content": await helpers.translate("Channels is required"),
                    "status": "critical"
                });
            }
            blockcontext.taskGForm.validateFormAsync();
            await aceUtils.setContext(blockcontext);
            return;
        }
        blockcontext.taskFormTriggerSave = "true";
        await aceUtils.setContext(blockcontext);
    } else if (eventName == "delete-task-modal-delete-clicked") {
        var message = await helpers.translate('The selected task definition(s) have been deleted');
        let msgs = {
            "items": []
        };
        await aceUtils.refreshContentBlock("data_block_5");
        await aceUtils.refreshContentBlock("data_block_14");
        aceUtils.dismissModal("3d7b-62c4-babb99-cb37-988915b9");

        blockcontext = await aceUtils.getContext();
        if (blockcontext.showDeleteAlert == true) {
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
    } else if (eventName == "copy-task-clicked") {
        var message = await helpers.translate('The selected task definition has been copied');
        let msgs = {
            "items": []
        };
        await aceUtils.refreshContentBlock("data_block_6");
        aceUtils.dismissModal("fe78-7028-9ba9ab-339b-bbb8e498");
        blockcontext = await aceUtils.getContext();

        if (blockcontext.showCopyAlert == true) {
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
    } else if (eventName == "dismiss-delete-task-modal") {
        aceUtils.dismissModal("3d7b-62c4-babb99-cb37-988915b9");
    } else if (eventName == "dismiss-copy-task-modal") {
        aceUtils.dismissModal("fe78-7028-9ba9ab-339b-bbb8e498");
    }
}
