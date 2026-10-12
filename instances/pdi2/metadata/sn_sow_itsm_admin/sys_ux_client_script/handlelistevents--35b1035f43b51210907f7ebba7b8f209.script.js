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
    if (eventName == "user-selected") {
        blockcontext.usersSelected = eventPayload.selectedRecords;
        let eligibleSelectedCount = blockcontext.usersSelected.length + blockcontext.groupsSelected.length;
        blockcontext.eligibleAddButtonLabel = await helpers.translate("Add ({0})", [eligibleSelectedCount]);
        aceUtils.setContext(blockcontext);
    } else if (eventName == "group-selected") {
        blockcontext.groupsSelected = eventPayload.selectedRecords;
        let eligibleSelectedCount = blockcontext.usersSelected.length + blockcontext.groupsSelected.length;
        blockcontext.eligibleAddButtonLabel = await helpers.translate("Add ({0})", [eligibleSelectedCount]);
        aceUtils.setContext(blockcontext);
    } else if (eventName == "suggested-user-selected") {
        blockcontext.suggestedUsersSelected = eventPayload.selectedRecords;
        let suggestedSelectedCount = blockcontext.suggestedUsersSelected.length + blockcontext.suggestedGroupsSelected.length;
        blockcontext.suggestedAddButtonLabel = suggestedSelectedCount > 0 ? await helpers.translate("Add ({0})", [suggestedSelectedCount]) : await helpers.translate("Add");
        aceUtils.setContext(blockcontext);
    } else if (eventName == "suggested-group-selected") {
        blockcontext.suggestedGroupsSelected = eventPayload.selectedRecords;
        let suggestedSelectedCount = blockcontext.suggestedUsersSelected.length + blockcontext.suggestedGroupsSelected.length;
        blockcontext.suggestedAddButtonLabel = suggestedSelectedCount > 0 ? await helpers.translate("Add ({0})", [suggestedSelectedCount]) : await helpers.translate("Add");
        aceUtils.setContext(blockcontext);
    } else if (eventName == "list-refresh-requested") {
        aceUtils.refreshContentBlock("fetch_users_and_groups_with_SDA_role");
    } else if (eventName == "open-record") {
        let recordURL = "now/sow-admin/record/" + eventPayload.table + "/" + eventPayload.sys_id;
        helpers.navigate.to(null, null, null, false, false, null, {
            url: recordURL
        });
    }
}
