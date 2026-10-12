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

    let updateScript;
    if (eventName === "update-button-clicked")
        updateScript = "update_system_property";
    if (eventName === "toggle-close-interaction-property") {
        updateScript = "update_close_int_prop";
        await aceUtils.setContext({
            ...blockcontext,
            closeInteractionProp: (blockcontext.closeInteractionProp === "false" ? "true" : "false")
        });
    }
    
    if (eventName === "toggle-hide-inbox-property") {
        updateScript = "update_hide_inbox_prop";
        await aceUtils.setContext({
            ...blockcontext,
            hideInboxProp: (blockcontext.hideInboxProp === "false" ? "true" : "false")
        });
    }
    
    if (eventName === "update-button-clicked" || eventName === "toggle-close-interaction-property" || eventName === "toggle-hide-inbox-property") {
        let successMessage = await helpers.translate("Configuration updated.");
        let errorMessage = await helpers.translate("Configuration failed to update! Please retry or contact support.");
        await aceUtils.refreshContentBlock(updateScript);
        blockcontext = await aceUtils.getContext();
        let msgs = {
            "items": []
        };
        if (blockcontext.updateResponse) {
            msgs.items.push({
                "id": "success-msg",
                "action": {
                    "type": "dismiss"
                },
                "content": successMessage,
                "status": "positive",
                "icon": "info-circle-outline"
            });

        } else {
            msgs.items.push({
                "id": "error-msg",
                "action": {
                    "type": "dismiss"
                },
                "status": 'critical',
                "icon": 'info-circle-outline',
                "content": errorMessage
            });
        }
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', msgs);

    }
}
