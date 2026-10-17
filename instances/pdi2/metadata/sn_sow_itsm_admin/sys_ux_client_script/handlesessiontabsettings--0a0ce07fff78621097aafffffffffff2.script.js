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
    let successMessage = await helpers.translate("Session-Tab details saved successfully.");
    let errorMessage = await helpers.translate("Session-Tab details failed to save! Please retry or contact support.");

    let updateScript;
    let updateTimer = false;

    if (eventName === "session-tab-enabled-toggle") {
        await aceUtils.setContext({
            ...blockcontext,
            isSessionTabEnabled: (blockcontext.isSessionTabEnabled === false ? true : false)
        });
    }
    if (eventName === "warning_typeahead_selected_item_set") {
        if (eventPayload.item.value && blockcontext.firstColorThreshold !== eventPayload.item.value)
            updateTimer = true;
        await aceUtils.setContext({
            ...blockcontext,
            firstColorThreshold: eventPayload.item.value,
            firstSelectedItem: eventPayload.value
        });

        if ((eventPayload.item.value === blockcontext.secondColorThreshold) || (eventPayload.item.value > blockcontext.secondColorThreshold)) {
            updateTimer = false;
            api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                items: [{
                    id: "alert3",
                    status: "critical",
                    icon: "exclamation-triangle-outline",
                    content: "Critical SLA cannot be less or equal to Warning SLA",
                    action: {
                        type: "dismiss"
                    }
                }]
            });
        } else {
            api.emit("NOW_UXF_PAGE#REMOVE_NOTIFICATIONS", {
                items: [{
                    id: "alert3"
                }]
            });
        }
    }

    if (eventName === "critical_typeahead_selected_item_set") {
        if (eventPayload.item.value && blockcontext.secondColorThreshold !== eventPayload.item.value)
            updateTimer = true;
        await aceUtils.setContext({
            ...blockcontext,
            secondColorThreshold: eventPayload.item.value,
            secondSelectedItem: eventPayload.value
        });

        if ((eventPayload.item.value === blockcontext.firstColorThreshold) || (eventPayload.item.value < blockcontext.firstColorThreshold)) {
            updateTimer = false;
            api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
                items: [{
                    id: "alert3",
                    status: "critical",
                    icon: "exclamation-triangle-outline",
                    content: "Critical SLA cannot be less or equal to Warning SLA",
                    action: {
                        type: "dismiss"
                    }
                }]
            });
        } else {
            api.emit("NOW_UXF_PAGE#REMOVE_NOTIFICATIONS", {
                items: [{
                    id: "alert3"
                }]
            });
        }
    }

    if (eventName === "session-tab-enabled-toggle" || updateTimer) {

        updateScript = 'save_session_tab_settings';
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
