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
    //Use this client scrip for beforePage load actions. Use aceUtils Methods, blockContext and contentTree.
    const {
        eventName,
        eventPayload
    } = event.payload;
    let blockContext = eventPayload.blockContext;
    blockContext.translatedStrings.sdaPageCollapsedSubtitle = await helpers.translate("Add the Service Desk Agent role to groups and users in your ServiceNow instance.");
    blockContext.translatedStrings.sdaPageExpandedSubtitle = await helpers.translate("Service Desk Agents play a crucial role in managing incidents, fulfilling service requests, and providing user support. Their job is to ensure efficient IT service delivery, keeping user satisfaction and operational efficiency at the forefront. They handle a variety of tasks to maintain a smooth IT environment.");
    blockContext.eligibleAddButtonLabel = await helpers.translate("Add");
    blockContext.groupsSelected = [];
    blockContext.usersSelected = [];
    blockContext.selectedTab="0";
    blockContext.showReadMoreButton = true;
    await aceUtils.setContext(blockContext, "v3");
    await aceUtils.setContentBlocks(eventPayload.contentTree, "v3");
    //Add your code from here
}
