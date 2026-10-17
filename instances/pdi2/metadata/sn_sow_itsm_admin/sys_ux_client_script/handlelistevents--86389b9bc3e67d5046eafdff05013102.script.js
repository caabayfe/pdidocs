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
            helpers.navigate.to("mi-trigger-rule", {
                triggerRuleSysId: -1
            });
        } else if (actionId == "SOW_ADMIN_CENTER_LIST#DELETE_BUTTON_CLICKED") {
            aceUtils.openModal("ce92-fe7d-ba9aaa-dd58-9989ff98");
        } else if (actionId == "SOW_ADMIN_CENTER_LIST#ACTIVATE_BUTTON_CLICKED") {
            await aceUtils.refreshContentBlock("data_block_3");
            let message = await helpers.translate("The selected trigger rule(s) have been activated");
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
            await aceUtils.refreshContentBlock("data_block_4");
            let message = await helpers.translate("The selected trigger rule(s) have been deactivated");
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
            await aceUtils.refreshContentBlock("data_block_5");
            aceUtils.openModal("c2d9-9b3e-9a88a9-3ce6-b88aed89");
        }
    } else if (eventName == "trigger-rule-ref-clicked") {
        if (eventPayload.table == "major_incident_trigger_rule") {
            helpers.navigate.to("mi-trigger-rule", {
                triggerRuleSysId: eventPayload.sys_id
            })
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
