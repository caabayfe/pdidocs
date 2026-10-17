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
        aceUtils.dismissModal("f96e-ba4e-9bba9b-2eba-a98b988b");
    } else if (eventName == "modal-delete-clicked") {
        var message = await helpers.translate('The selected plan definition(s) have been deleted');
        let msgs = {
            "items": []
        };
        await aceUtils.refreshContentBlock("data_block_3");
        await aceUtils.refreshContentBlock("data_block_1");
        aceUtils.dismissModal("f96e-ba4e-9bba9b-2eba-a98b988b");
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
    } else if (eventName == "new-plan-name-inputted") {
        blockcontext.planCopyName = eventPayload.fieldValue;
        await aceUtils.setContext(blockcontext);
    } else if (eventName == "copy-tasks-toggled") {
        blockcontext.copyTasksChecked = eventPayload.value;
    } else if (eventName == "comm-plan-copy-clicked") {
        var message = await helpers.translate('The selected plan definition has been copied');
        let msgs = {
            "items": []
        };
        aceUtils.dismissModal("4c30-5255-aaaaa8-d4ce-a989969a");
        await aceUtils.refreshContentBlock("data_block_2");
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
    } else if (eventName == "comm-plan-cancel-clicked") {
        aceUtils.dismissModal("4c30-5255-aaaaa8-d4ce-a989969a");
    }
}
