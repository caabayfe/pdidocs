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
    var blockcontext = await aceUtils.getContext();
    //state variables --> aceContents, blockcontext
    //Default Client Scripts to handle updates to aceContents and blockcontext should be in App Shell
    if (eventName == "list-wrapped-action-clicked") {
        let actionId = eventPayload.wrappedAction;

        if (actionId == "ASSIGN_MI_ROLE_BUTTON_CLICKED") {
            var userSysIds = blockcontext.selectedRecords_UsersList = eventPayload.wrappedPayload.sysIds;
            var userCount = userSysIds.split(",").length;
            var message = await helpers.translate("{0} new user(s) assigned the Major Incident Manager role", [userCount]);
            await aceUtils.setContext(blockcontext);
            await aceUtils.refreshContentBlock('data_block_3');
            await aceUtils.refreshContentBlock('data_block_1');
            blockcontext = await aceUtils.getContext();
            let msgs = {
                "items": []
            };
            if (blockcontext.showAlert == "true") {
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
        }
    } else if (eventName == "open-record") {
        let recordURL = "now/sow-admin/record/" + eventPayload.table + "/" + eventPayload.sys_id;
        helpers.navigate.to(null, null, null, false, false, null, {
            url: recordURL
        });
    } else if (eventName == "refresh-list") {
        await aceUtils.refreshContentBlock('data_block_1');
    }
}
