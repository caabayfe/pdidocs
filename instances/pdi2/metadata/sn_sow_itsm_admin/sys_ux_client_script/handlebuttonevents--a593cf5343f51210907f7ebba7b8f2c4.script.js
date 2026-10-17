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

    async function handleRoleAssignment(usersSelected, groupsSelected, refreshBlock) {
        await aceUtils.refreshContentBlock(refreshBlock);
        let message = null;
        if (usersSelected.length > 0 && groupsSelected.length == 0) {
            message = await helpers.translate("{0} new user(s) assigned the Service Desk Agent role", usersSelected.length);
        } else if (groupsSelected.length > 0 && usersSelected.length == 0) {
            message = await helpers.translate("{0} new group(s) assigned the Service Desk Agent role", groupsSelected.length);
        } else {
            message = await helpers.translate("{0} new group(s) and {1} new user(s) assigned the Service Desk Agent role", groupsSelected.length, usersSelected.length);
        }
        let msgs = {
            "items": []
        };
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
        await aceUtils.refreshContentBlock("fetch_users_and_groups_with_SDA_role");
    }

    if (eventName == "assign-sda-role-clicked") {
        await handleRoleAssignment(blockcontext.usersSelected, blockcontext.groupsSelected, "assign_sda_role");
        blockcontext = await aceUtils.getContext();
        blockcontext.selectedTab = "0";
        await aceUtils.setContext(blockcontext);
    } else if (eventName == "suggested-assign-sda-role-clicked") {
        await handleRoleAssignment(blockcontext.suggestedUsersSelected, blockcontext.suggestedGroupsSelected, "suggested_assign_sda_role");
        await aceUtils.refreshContentBlock("fetch_suggested_non_sda_users_and_groups");
        blockcontext = await aceUtils.getContext();
        blockcontext.selectedTab = "0";
        await aceUtils.setContext(blockcontext);
        blockcontext = await aceUtils.getContext();
        if(!blockcontext.isSuggestedTabVisible) {
            aceUtils.removeContentBlock("tab_set_item_144187729");
        }
    }
}
