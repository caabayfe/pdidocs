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
        aceUtils.dismissModal("ce92-fe7d-ba9aaa-dd58-9989ff98");
    } else if (eventName == "modal-delete-clicked") {
        var message = await helpers.translate('The selected trigger rule(s) have been deleted');
        let msgs = {
            "items": []
        };
        await aceUtils.refreshContentBlock("data_block_1");
        await aceUtils.refreshContentBlock("data_block_2");
        aceUtils.dismissModal("ce92-fe7d-ba9aaa-dd58-9989ff98");
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
    } else if (eventName == "trigger-rule-copy-clicked") {
        var message = await helpers.translate('The selected trigger rule has been copied');
        let msgs = {
            "items": []
        };
        await aceUtils.refreshContentBlock("data_block_6");
        aceUtils.dismissModal("c2d9-9b3e-9a88a9-3ce6-b88aed89");
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
    } else if (eventName == "new-trigger-rule-name-inputted") {
        blockcontext.triggerRuleCopyName = eventPayload.fieldValue;
        await aceUtils.setContext(blockcontext);
    } else if (eventName == "dismiss-copy-modal") {
        aceUtils.dismissModal("c2d9-9b3e-9a88a9-3ce6-b88aed89");
    }
}
