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
    //Default Client Scripts to handle updates to aceContents and blockcontext should be in App Shell
    var blockcontext = await aceUtils.getContext();
    if (eventName == "update-playbook-sys-property") {
        if (eventPayload.action.label.toUpperCase().indexOf("VIEW") !== -1) {
            api.emit('NAV_ITEM_SELECTED', {
                external: {
                    url: eventPayload.item.viewDetailsUrl,
                    target: '_blank'
                }
            });
        } else {
            const sysId = eventPayload.item.sysId;
            blockcontext.mimPlaybookSysId = sysId;
            await aceUtils.setContext(blockcontext);
            let failureMessage = await helpers.translate("Failed to assign {0} playbook to MIM,please try again later",[eventPayload.item.label]);
            let message = await helpers.translate(" playbook assigned to MIM");
            await aceUtils.refreshContentBlock('update_playbook_sys_property');
            await aceUtils.refreshContentBlock('get_playbooks_data');
            blockcontext = await aceUtils.getContext();
            let msgs = {
                "items": []
            };
            if (blockcontext.updateStatus) {
                let indexValue = -1;
                if (sysId)
                    indexValue = blockcontext.playbookObjects.findIndex(obj => obj.sysId === sysId);
                if (indexValue > -1)
                    blockcontext.playbookObjects.splice(indexValue, 1);
                if (blockcontext.playbookObjects.length == 0)
                    blockcontext.hideRecommendContent = false;
                blockcontext.mimPlaybookSysId = "";
                blockcontext.selectedTab = "0";
                await aceUtils.setContext(blockcontext);

                msgs.items.push({
                    "id": "success-msg",
                    "action": {
                        "type": "dismiss"
                    },
                    "content": eventPayload.item.label + message,
                    "status": "positive",
                    "icon": "info-circle-outline",
                });
            } else {
                msgs.items.push({
                    "id": "failure-msg",
                    "action": {
                        "type": "dismiss"
                    },
                    "content": failureMessage,
                    "status": "critical",
                    "icon": "info-circle-outline",
                });

            }
            api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', msgs);
        }
    }
}
