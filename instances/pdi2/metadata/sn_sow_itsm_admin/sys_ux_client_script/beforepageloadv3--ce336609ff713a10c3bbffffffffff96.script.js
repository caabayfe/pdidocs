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
    blockcontext.translatedStrings.sdaPageCollapsedSubtitle = await helpers.translate("Add the Service Desk Manager role to groups and users in your ServiceNow instance.");
    blockcontext.translatedStrings.sdaPageExpandedSubtitle = await helpers.translate("The Service Desk Manager role extends the capabilities of the standard Service Desk Agent role by granting elevated privileges to delete or close incidents, and manage the addition or removal of users from relevant group memberships, enabling efficient team");
    blockcontext.eligibleAddButtonLabel = await helpers.translate("Add");
    blockcontext.groupsSelected = [];
    blockcontext.usersSelected = [];
    blockcontext.selectedTab="0";
    blockcontext.showReadMoreButton = true;
    await aceUtils.setContext(blockContext, "v3");
    await aceUtils.setContentBlocks(eventPayload.contentTree, "v3");
    await aceUtils.setContext(eventPayload.blockContext, "v3");
    await aceUtils.setContentBlocks(eventPayload.contentTree, "v3");
}
