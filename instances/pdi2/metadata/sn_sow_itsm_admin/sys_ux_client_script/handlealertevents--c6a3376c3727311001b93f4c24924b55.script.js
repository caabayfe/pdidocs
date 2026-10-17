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
    if (eventName == "dismiss-alert-clicked") {
        if (eventPayload.contentBlockId == "9044b3ac3727311001b93f4c24924b4b") {
            blockcontext.showCreateOrEditAlert = false;
            helpers.navigate.setRouteParams({'params': {'alert': ''}});
        } else if (eventPayload.contentBlockId == "1844b3ac3727311001b93f4c24924b4e") {
            blockcontext.showTaskCreatedAlert = false;
        } else if (eventPayload.contentBlockId == "9844f3ac3727311001b93f4c24924bd2") {
            blockcontext.showTaskUpdatedAlert = false;
        } else if (eventPayload.contentBlockId == "d044f3ac3727311001b93f4c24924bd5") {
            blockcontext.showCopyAlert = false;
        } else if (eventPayload.contentBlockId == "5444f3ac3727311001b93f4c24924bda") {
            blockcontext.showActivateAlert = false;
        } else if (eventPayload.contentBlockId == "1c44f3ac3727311001b93f4c24924bd7") {
            blockcontext.showDeleteAlert = false;
        } else if (eventPayload.contentBlockId == "9c44f3ac3727311001b93f4c24924bdc") {
            blockcontext.showDeactivateAlert = false;
        } else if (eventPayload.contentBlockId == "f1233c6d3733311091ea3f4c24924bed") {
            blockcontext.showPlanUpdatedAlert = false;
        }
        await aceUtils.setContext(blockcontext);
    }
}
