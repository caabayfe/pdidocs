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
    if (eventName == "empty-state-assign-sda-role-clicked") {
        blockcontext.selectedTab = "1";
        await aceUtils.setContext(blockcontext);
    } else if (eventName == "tab-selected") {
        blockcontext.selectedTab = eventPayload.selectedTabIndex;
        await aceUtils.setContext(blockcontext);
    }
}
